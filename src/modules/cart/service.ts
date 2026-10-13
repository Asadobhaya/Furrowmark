import { eq, and, sql } from "drizzle-orm";
import { getRuntimeDb } from "../database";
import { carts, cartItems } from "../commerce/schema";
import { variants, batches } from "../catalog/schema";
import {
  PricingService,
  PricingLineItem,
  OrderPricingQuote,
  CouponRule,
  TaxRule,
  ShippingRule,
} from "../pricing/service";

export interface CartItemDetail {
  id: string;
  variantId: string;
  name: string;
  sku: string;
  unitPriceMinor: number;
  quantity: number;
  lineSubtotalMinor: number;
  availableStock: number;
}

export interface CartView {
  id: string;
  userId?: string | null;
  items: CartItemDetail[];
  quote: OrderPricingQuote;
}

export class CartService {
  /**
   * Retrieves or creates a cart for a user or guest.
   */
  static async getOrCreateCart(params: {
    userId?: string | null;
    guestTokenHash?: string | null;
  }): Promise<{ id: string }> {
    const db = getRuntimeDb();

    if (params.userId) {
      const [existing] = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, params.userId));
      if (existing) {
        return { id: existing.id };
      }
      const [created] = await db
        .insert(carts)
        .values({
          userId: params.userId,
        })
        .returning();
      return { id: created!.id };
    }

    if (params.guestTokenHash) {
      const [existing] = await db
        .select()
        .from(carts)
        .where(eq(carts.guestTokenHash, params.guestTokenHash));
      if (existing) {
        return { id: existing.id };
      }
      const [created] = await db
        .insert(carts)
        .values({
          guestTokenHash: params.guestTokenHash,
        })
        .returning();
      return { id: created!.id };
    }

    throw new Error(
      "Must provide either userId or guestTokenHash to access cart",
    );
  }

  /**
   * Adds or updates an item in the cart.
   * Quantities are validated against available stock in active unexpired batches.
   */
  static async addItem(params: {
    cartId: string;
    variantId: string;
    quantity: number;
  }): Promise<void> {
    if (params.quantity <= 0 || !Number.isInteger(params.quantity)) {
      throw new Error("Quantity must be a positive integer");
    }

    const db = getRuntimeDb();

    // Verify variant exists and is active
    const [variant] = await db
      .select()
      .from(variants)
      .where(
        and(eq(variants.id, params.variantId), eq(variants.isActive, true)),
      );

    if (!variant) {
      throw new Error("Variant not found or inactive");
    }

    // Verify stock availability across batches
    const now = new Date();
    const batchRows = await db
      .select({
        available: sql<number>`SUM(on_hand - reserved - quarantined)`,
      })
      .from(batches)
      .where(
        and(
          eq(batches.variantId, params.variantId),
          eq(batches.status, "available"),
          sql`${batches.expiresOn} > ${now}`,
        ),
      );

    const availableStock = Number(batchRows[0]?.available ?? 0);

    // Check existing cart item quantity
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, params.cartId),
          eq(cartItems.variantId, params.variantId),
        ),
      );

    const targetQuantity = (existingItem?.quantity ?? 0) + params.quantity;

    if (targetQuantity > availableStock) {
      throw new Error(
        `Insufficient stock: requested total ${targetQuantity}, available ${availableStock}`,
      );
    }

    if (existingItem) {
      await db
        .update(cartItems)
        .set({
          quantity: targetQuantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      await db.insert(cartItems).values({
        cartId: params.cartId,
        variantId: params.variantId,
        quantity: params.quantity,
      });
    }
  }

  /**
   * Updates an item's exact quantity in the cart. If quantity is 0, removes it.
   */
  static async updateItemQuantity(params: {
    cartId: string;
    variantId: string;
    quantity: number;
  }): Promise<void> {
    const db = getRuntimeDb();

    if (params.quantity <= 0) {
      await db
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.cartId, params.cartId),
            eq(cartItems.variantId, params.variantId),
          ),
        );
      return;
    }

    if (!Number.isInteger(params.quantity)) {
      throw new Error("Quantity must be an integer");
    }

    // Check availability
    const now = new Date();
    const batchRows = await db
      .select({
        available: sql<number>`SUM(on_hand - reserved - quarantined)`,
      })
      .from(batches)
      .where(
        and(
          eq(batches.variantId, params.variantId),
          eq(batches.status, "available"),
          sql`${batches.expiresOn} > ${now}`,
        ),
      );

    const availableStock = Number(batchRows[0]?.available ?? 0);
    if (params.quantity > availableStock) {
      throw new Error(
        `Insufficient stock: requested ${params.quantity}, available ${availableStock}`,
      );
    }

    await db
      .update(cartItems)
      .set({
        quantity: params.quantity,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(cartItems.cartId, params.cartId),
          eq(cartItems.variantId, params.variantId),
        ),
      );
  }

  /**
   * Removes an item from the cart.
   */
  static async removeItem(cartId: string, variantId: string): Promise<void> {
    const db = getRuntimeDb();
    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)),
      );
  }

  /**
   * Merges a guest cart into a user's cart upon login.
   */
  static async mergeGuestCart(params: {
    guestTokenHash: string;
    userId: string;
  }): Promise<{ id: string }> {
    const db = getRuntimeDb();

    const [guestCart] = await db
      .select()
      .from(carts)
      .where(eq(carts.guestTokenHash, params.guestTokenHash));

    const userCart = await CartService.getOrCreateCart({
      userId: params.userId,
    });

    if (!guestCart) {
      return userCart;
    }

    const guestItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, guestCart.id));

    for (const item of guestItems) {
      // Add or merge into user cart
      const [existingUserItem] = await db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.cartId, userCart.id),
            eq(cartItems.variantId, item.variantId),
          ),
        );

      if (existingUserItem) {
        await db
          .update(cartItems)
          .set({
            quantity: existingUserItem.quantity + item.quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existingUserItem.id));
      } else {
        await db.insert(cartItems).values({
          cartId: userCart.id,
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }
    }

    // Delete guest cart after merge
    await db.delete(carts).where(eq(carts.id, guestCart.id));

    return userCart;
  }

  /**
   * Fetches full cart view with server-computed live pricing and stock validation.
   */
  static async getCartView(params: {
    cartId: string;
    coupon?: CouponRule | null;
    taxRule?: TaxRule | null;
    shippingRule?: ShippingRule | null;
  }): Promise<CartView> {
    const db = getRuntimeDb();

    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.id, params.cartId));

    if (!cart) {
      throw new Error("Cart not found");
    }

    const items = await db
      .select({
        id: cartItems.id,
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        sku: variants.sku,
        unitPriceMinor: variants.priceMinor,
        packSize: variants.packSize,
      })
      .from(cartItems)
      .innerJoin(variants, eq(cartItems.variantId, variants.id))
      .where(eq(cartItems.cartId, params.cartId));

    const pricingItems: PricingLineItem[] = [];
    const detailedItems: CartItemDetail[] = [];

    const now = new Date();

    for (const item of items) {
      // Check available stock
      const batchRows = await db
        .select({
          available: sql<number>`SUM(on_hand - reserved - quarantined)`,
        })
        .from(batches)
        .where(
          and(
            eq(batches.variantId, item.variantId),
            eq(batches.status, "available"),
            sql`${batches.expiresOn} > ${now}`,
          ),
        );

      const availableStock = Number(batchRows[0]?.available ?? 0);
      const lineSubtotal = item.unitPriceMinor * item.quantity;

      pricingItems.push({
        variantId: item.variantId,
        name: `Pack ${item.packSize}`,
        sku: item.sku,
        unitPriceMinor: item.unitPriceMinor,
        quantity: item.quantity,
      });

      detailedItems.push({
        id: item.id,
        variantId: item.variantId,
        name: `Pack ${item.packSize}`,
        sku: item.sku,
        unitPriceMinor: item.unitPriceMinor,
        quantity: item.quantity,
        lineSubtotalMinor: lineSubtotal,
        availableStock,
      });
    }

    const quote =
      pricingItems.length > 0
        ? PricingService.quoteOrderTotals({
            items: pricingItems,
            coupon: params.coupon,
            taxRule: params.taxRule,
            shippingRule: params.shippingRule,
          })
        : {
            currency: "PKR",
            lines: [],
            subtotalMinor: 0,
            discountMinor: 0,
            taxMinor: 0,
            taxInclusive: false,
            taxRateBp: 0,
            shippingMinor: 0,
            totalMinor: 0,
            calculatedAt: new Date().toISOString(),
          };

    return {
      id: cart.id,
      userId: cart.userId,
      items: detailedItems,
      quote,
    };
  }
}
