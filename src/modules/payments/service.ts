import crypto from "node:crypto";
import { eq, and } from "drizzle-orm";
import { getRuntimeDb } from "../database";
import {
  payments,
  refunds,
  orders,
  PaymentMethod,
  PaymentStatus,
} from "../commerce/schema";
import { OrderService } from "../orders/service";
import { PricingService } from "../pricing/service";
import { NotificationService } from "../notifications/service";
import { RECEIVING_ACCOUNTS } from "./accounts";

export interface CreateCheckoutParams {
  order: {
    id: string;
    publicRef: string;
    totalMinor: number;
    currency: string;
    customerEmail: string;
    customerPhone: string;
  };
  returnUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  provider: PaymentMethod;
  referenceToken?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  name: PaymentMethod;
  createCheckoutSession(
    params: CreateCheckoutParams,
  ): Promise<CheckoutSessionResult>;
  fetchPaymentStatus(referenceToken?: string): Promise<PaymentStatus>;
  processRefund(
    paymentId: string,
    amountMinor: number,
    reason: string,
  ): Promise<{ success: boolean; providerRefundId?: string; error?: string }>;
}

/**
 * Cash on Delivery payment adapter
 */
export class CashOnDeliveryPaymentProvider implements PaymentProvider {
  readonly name: PaymentMethod = "cash_on_delivery";

  async createCheckoutSession(
    params: CreateCheckoutParams,
  ): Promise<CheckoutSessionResult> {
    return {
      provider: "cash_on_delivery",
      referenceToken: `cod_${params.order.publicRef}`,
      metadata: {
        paymentType: "cash_on_delivery",
        orderRef: params.order.publicRef,
      },
    };
  }

  async fetchPaymentStatus(): Promise<PaymentStatus> {
    return "pending";
  }

  async processRefund(
    _paymentId: string,
    _amountMinor: number,
    _reason: string,
  ): Promise<{ success: boolean; providerRefundId?: string; error?: string }> {
    return {
      success: true,
      providerRefundId: `manual_cod_rf_${crypto.randomBytes(8).toString("hex")}`,
    };
  }
}

/**
 * Advance payment adapter: customer pays directly to the owner's Meezan Bank
 * or Easypaisa account; staff verify the payment manually.
 */
export class AdvancePaymentProvider implements PaymentProvider {
  readonly name: PaymentMethod = "advance_payment";

  async createCheckoutSession(
    params: CreateCheckoutParams,
  ): Promise<CheckoutSessionResult> {
    return {
      provider: "advance_payment",
      referenceToken: `adv_${params.order.publicRef}`,
      metadata: {
        paymentType: "advance_payment",
        orderRef: params.order.publicRef,
        amountMinor: params.order.totalMinor,
        currency: params.order.currency,
        accounts: RECEIVING_ACCOUNTS,
        instructions:
          "Send the exact amount to one of the accounts and quote the order reference. Staff will verify manually.",
      },
    };
  }

  async fetchPaymentStatus(): Promise<PaymentStatus> {
    return "pending";
  }

  async processRefund(
    _paymentId: string,
    _amountMinor: number,
    _reason: string,
  ): Promise<{ success: boolean; providerRefundId?: string; error?: string }> {
    return {
      success: true,
      providerRefundId: `manual_adv_rf_${crypto.randomBytes(8).toString("hex")}`,
    };
  }
}

/**
 * Central Payment Orchestrator
 */
export class PaymentService {
  private static providers: Map<PaymentMethod, PaymentProvider> = new Map<
    PaymentMethod,
    PaymentProvider
  >([
    ["cash_on_delivery", new CashOnDeliveryPaymentProvider()],
    ["advance_payment", new AdvancePaymentProvider()],
  ]);

  static getProvider(method: PaymentMethod): PaymentProvider {
    const provider = this.providers.get(method);
    if (!provider) {
      throw new Error(`Unsupported payment provider: ${method}`);
    }
    return provider;
  }

  /**
   * Initializes a payment record and returns payment instructions.
   */
  static async initiatePayment(
    orderId: string,
    returnUrl: string,
    cancelUrl: string,
  ): Promise<CheckoutSessionResult> {
    const details = await OrderService.getOrderDetails(orderId);
    const order = details.order;
    const provider = this.getProvider(order.paymentMethod as PaymentMethod);

    const session = await provider.createCheckoutSession({
      order: {
        id: order.id,
        publicRef: order.publicRef,
        totalMinor: order.totalMinor,
        currency: order.currency,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
      },
      returnUrl,
      cancelUrl,
    });

    const db = getRuntimeDb();
    await db.insert(payments).values({
      orderId: order.id,
      provider: order.paymentMethod,
      providerReference: session.referenceToken,
      amountMinor: order.totalMinor,
      currency: order.currency,
      status: "pending",
    });

    return session;
  }

  /**
   * Staff manually confirm that an advance payment arrived in the owner's
   * account. Transitions pending_payment -> paid atomically.
   */
  static async confirmManualPayment(params: {
    orderId: string;
    actorId?: string | null;
    transactionReference?: string;
  }): Promise<{ outcome: "confirmed" | "already_processed_state" }> {
    const db = getRuntimeDb();
    return await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, params.orderId))
        .for("update");

      if (!order) {
        throw new Error("Order not found");
      }
      if (order.paymentMethod !== "advance_payment") {
        throw new Error("Only advance payment orders need manual confirmation");
      }
      if (order.state !== "pending_payment") {
        return { outcome: "already_processed_state" as const };
      }

      await OrderService.transitionOrderState({
        orderId: order.id,
        toState: "paid",
        actorType: "staff",
        actorId: params.actorId,
        reason: `Advance payment manually verified${params.transactionReference ? ` (ref: ${params.transactionReference})` : ""}`,
        tx,
      });

      await tx
        .update(payments)
        .set({
          status: "completed",
          ...(params.transactionReference
            ? { providerReference: params.transactionReference }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(payments.orderId, order.id));

      // Phase 5: Enqueue payment confirmed notification
      await NotificationService.enqueueNotification({
        channel: "email",
        recipient: order.customerEmail,
        templateId: "payment_confirmed",
        context: {
          orderRef: order.publicRef,
          transactionRef: params.transactionReference,
        },
      });

      return { outcome: "confirmed" as const };
    });
  }

  /**
   * Executes a refund with integer upper-bound validation and ledger record.
   */
  static async refundOrder(params: {
    orderId: string;
    amountMinor: number;
    reason: string;
    actorId?: string | null;
  }): Promise<{ refundId: string; newOrderState: string }> {
    const db = getRuntimeDb();

    return await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, params.orderId))
        .for("update");

      if (!order) {
        throw new Error("Order not found");
      }

      // Existing refunds sum check
      const orderRefunds = await tx
        .select()
        .from(refunds)
        .where(eq(refunds.orderId, order.id));

      const priorRefundTotal = orderRefunds.reduce(
        (sum, r) => sum + r.amountMinor,
        0,
      );

      // Integer upper-bound verification
      const refundCheck = PricingService.validateRefundUpperBound({
        totalPaidMinor: order.totalMinor,
        priorRefundsTotalMinor: priorRefundTotal,
        requestedRefundMinor: params.amountMinor,
      });

      if (!refundCheck.valid) {
        throw new Error(refundCheck.error ?? "Invalid refund amount");
      }

      // Retrieve associated completed payment
      const [payment] = await tx
        .select()
        .from(payments)
        .where(
          and(eq(payments.orderId, order.id), eq(payments.status, "completed")),
        );

      if (!payment) {
        throw new Error("No completed payment found for order");
      }

      // Call payment provider refund adapter
      const provider = this.getProvider(order.paymentMethod as PaymentMethod);
      const gatewayRefund = await provider.processRefund(
        payment.id,
        params.amountMinor,
        params.reason,
      );

      if (!gatewayRefund.success) {
        throw new Error(
          `Gateway refund failed: ${gatewayRefund.error ?? "Unknown error"}`,
        );
      }

      // Record refund in table
      const [newRefund] = await tx
        .insert(refunds)
        .values({
          paymentId: payment.id,
          orderId: order.id,
          amountMinor: params.amountMinor,
          reason: params.reason,
          providerRefundId: gatewayRefund.providerRefundId,
        })
        .returning();

      // Determine target state
      const newTotalRefunded = priorRefundTotal + params.amountMinor;
      const targetState =
        newTotalRefunded === order.totalMinor
          ? "refunded"
          : "partially_refunded";

      await OrderService.transitionOrderState({
        orderId: order.id,
        toState: targetState,
        actorType: "staff",
        actorId: params.actorId,
        reason: `Refund of ${params.amountMinor} minor units processed: ${params.reason}`,
        tx,
      });

      return {
        refundId: newRefund!.id,
        newOrderState: targetState,
      };
    });
  }
}
