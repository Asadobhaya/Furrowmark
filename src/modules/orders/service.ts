import { eq, inArray } from "drizzle-orm";
import { getRuntimeDb, AppTransaction } from "../database";
import {
  orders,
  orderLines,
  orderLineAllocations,
  orderEvents,
  cartItems,
  OrderState,
  PaymentMethod,
} from "../commerce/schema";
import { InventoryService } from "../inventory/service";
import { CouponRule, TaxRule, ShippingRule } from "../pricing/service";
import { CartService } from "../cart/service";
import crypto from "node:crypto";

export interface CreateOrderParams {
  cartId: string;
  userId?: string | null;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Record<string, unknown>;
  billingAddress: Record<string, unknown>;
  paymentMethod: PaymentMethod;
  coupon?: CouponRule | null;
  taxRule?: TaxRule | null;
  shippingRule?: ShippingRule | null;
  currency?: string;
  actorId?: string | null;
}

export interface OrderTransitionParams {
  orderId: string;
  toState: OrderState;
  actorId?: string | null;
  actorType: "customer" | "staff" | "system" | "gateway";
  reason?: string | null;
  tx?: AppTransaction;
}

/**
 * Permitted transitions per architecture state machine diagram
 */
const VALID_TRANSITIONS: Record<OrderState, OrderState[]> = {
  pending_payment: ["paid", "cancelled"],
  awaiting_confirmation: ["processing", "cancelled"],
  paid: ["processing", "cancelled", "partially_refunded", "refunded"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["partially_refunded", "refunded"],
  cancelled: ["refunded"], // when paid order is refunded after cancellation
  partially_refunded: ["refunded"],
  refunded: [],
};

export class OrderService {
  /**
   * Generates a collision-resistant public order reference.
   * e.g. FM-2026-XXXX-XXXX
   */
  static generatePublicRef(): string {
    const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
    const year = new Date().getFullYear();
    return `FM-${year}-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}`;
  }

  /**
   * Creates an order from cart, executes atomic FEFO stock reservations,
   * creates immutable line and pricing snapshots, and appends the initial event.
   */
  static async createOrderFromCart(params: CreateOrderParams): Promise<{
    id: string;
    publicRef: string;
    totalMinor: number;
    initialState: OrderState;
  }> {
    const db = getRuntimeDb();

    // 1. Fetch live cart view
    const cartView = await CartService.getCartView({
      cartId: params.cartId,
      coupon: params.coupon,
      taxRule: params.taxRule,
      shippingRule: params.shippingRule,
    });

    if (cartView.items.length === 0) {
      throw new Error("Cannot checkout with an empty cart");
    }

    const publicRef = OrderService.generatePublicRef();
    const initialState: OrderState =
      params.paymentMethod === "advance_payment"
        ? "pending_payment"
        : "awaiting_confirmation";

    // 2. Perform checkout within transaction: allocate FEFO stock & write order
    return await db.transaction(async (tx) => {
      // FEFO allocation check for each variant
      const lineAllocations: {
        variantId: string;
        allocations: { batchId: string; quantity: number }[];
      }[] = [];

      const effectiveActorId = params.actorId ?? params.userId;
      if (!effectiveActorId) {
        throw new Error(
          "An actor ID or user ID is required for stock reservation",
        );
      }
      for (const item of cartView.items) {
        const batchAllocations = await InventoryService.allocateStockFEFO(
          item.variantId,
          item.quantity,
          {
            actorId: effectiveActorId,
            referenceId: publicRef,
            tx,
          },
        );
        lineAllocations.push({
          variantId: item.variantId,
          allocations: batchAllocations,
        });
      }

      // Insert Order head
      const [order] = await tx
        .insert(orders)
        .values({
          publicRef,
          userId: params.userId,
          customerEmail: params.customerEmail,
          customerPhone: params.customerPhone,
          shippingAddress: params.shippingAddress,
          billingAddress: params.billingAddress,
          state: initialState,
          paymentMethod: params.paymentMethod,
          currency: cartView.quote.currency,
          subtotalMinor: cartView.quote.subtotalMinor,
          discountMinor: cartView.quote.discountMinor,
          taxMinor: cartView.quote.taxMinor,
          shippingMinor: cartView.quote.shippingMinor,
          totalMinor: cartView.quote.totalMinor,
          pricingSnapshot: cartView.quote,
        })
        .returning();

      // Insert Order Lines and Batch Allocations
      for (const item of cartView.items) {
        const matchingQuoteLine = cartView.quote.lines.find(
          (l) => l.variantId === item.variantId,
        );

        const [line] = await tx
          .insert(orderLines)
          .values({
            orderId: order!.id,
            variantId: item.variantId,
            productNameSnapshot: item.name,
            variantSkuSnapshot: item.sku,
            unitPriceMinor: item.unitPriceMinor,
            quantity: item.quantity,
            taxMinor: matchingQuoteLine?.taxMinor ?? 0,
            totalMinor:
              matchingQuoteLine?.lineTotalMinor ?? item.lineSubtotalMinor,
          })
          .returning();

        const itemAllocations = lineAllocations.find(
          (a) => a.variantId === item.variantId,
        )?.allocations;

        if (itemAllocations) {
          for (const alloc of itemAllocations) {
            await tx.insert(orderLineAllocations).values({
              orderLineId: line!.id,
              batchId: alloc.batchId,
              quantity: alloc.quantity,
            });
          }
        }
      }

      // Append initial order event
      await tx.insert(orderEvents).values({
        orderId: order!.id,
        fromState: null,
        toState: initialState,
        actorId: params.actorId,
        actorType: params.userId ? "customer" : "system",
        reason: "Order created from cart",
      });

      // Clear cart items upon successful order creation
      await tx.delete(cartItems).where(eq(cartItems.cartId, params.cartId));

      return {
        id: order!.id,
        publicRef: order!.publicRef,
        totalMinor: order!.totalMinor,
        initialState,
      };
    });
  }

  /**
   * Transitions an order between states following the validated state machine.
   * If cancelled, automatically releases FEFO stock reservations.
   */
  static async transitionOrderState(
    params: OrderTransitionParams,
  ): Promise<void> {
    const runner = async (tx: AppTransaction) => {
      // 1. Fetch current order with row lock
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, params.orderId))
        .for("update");

      if (!order) {
        throw new Error("Order not found");
      }

      const currentState = order.state as OrderState;
      const allowedTargets = VALID_TRANSITIONS[currentState] ?? [];

      if (!allowedTargets.includes(params.toState)) {
        throw new Error(
          `Illegal order transition: cannot transition from '${currentState}' to '${params.toState}'`,
        );
      }

      // 2. Cancellation rule: Customer cancellation restricted after packing
      if (
        params.toState === "cancelled" &&
        params.actorType === "customer" &&
        (currentState === "packed" ||
          currentState === "shipped" ||
          currentState === "delivered")
      ) {
        throw new Error("Customer cannot cancel order once packed or shipped");
      }

      // 3. If cancelling, release reserved stock back into batches
      if (params.toState === "cancelled") {
        const lines = await tx
          .select()
          .from(orderLines)
          .where(eq(orderLines.orderId, order.id));

        const lineIds = lines.map((l: { id: string }) => l.id);
        if (lineIds.length > 0) {
          const allocations = await tx
            .select()
            .from(orderLineAllocations)
            .where(inArray(orderLineAllocations.orderLineId, lineIds));

          const releaseActorId = params.actorId ?? order.userId;
          if (!releaseActorId) {
            throw new Error(
              "An actor ID or user ID is required to cancel an order and release stock",
            );
          }
          for (const alloc of allocations) {
            await InventoryService.releaseStockReservation(
              alloc.batchId,
              alloc.quantity,
              `Order ${order.publicRef} cancelled: ${params.reason ?? "Customer/Staff cancellation"}`,
              releaseActorId,
              { tx },
            );
          }
        }
      }

      // 4. Update order state
      await tx
        .update(orders)
        .set({
          state: params.toState,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      // 5. Append immutable event log
      await tx.insert(orderEvents).values({
        orderId: order.id,
        fromState: currentState,
        toState: params.toState,
        actorId: params.actorId,
        actorType: params.actorType,
        reason: params.reason,
      });
    };

    if (params.tx) {
      await runner(params.tx);
    } else {
      const db = getRuntimeDb();
      await db.transaction(runner);
    }
  }

  /**
   * Fetches full order details including lines, allocations, and event timeline.
   */
  static async getOrderDetails(orderId: string) {
    const db = getRuntimeDb();

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order) {
      throw new Error("Order not found");
    }

    const lines = await db
      .select()
      .from(orderLines)
      .where(eq(orderLines.orderId, orderId));

    const events = await db
      .select()
      .from(orderEvents)
      .where(eq(orderEvents.orderId, orderId))
      .orderBy(orderEvents.createdAt);

    return {
      order,
      lines,
      events,
    };
  }
}
