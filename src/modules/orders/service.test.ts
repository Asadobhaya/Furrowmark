import { describe, it, expect, beforeAll } from "vitest";
import { getMigratorDb } from "../database";
import { users } from "../database/schema";
import {
  categories,
  brands,
  products,
  variants,
  suppliers,
  batches,
} from "../catalog/schema";
import { CartService } from "../cart/service";
import { OrderService } from "./service";
import { hashPassword } from "../auth/crypto";
import { eq } from "drizzle-orm";

describe("Order Service & 14-State Transition Engine", () => {
  let customerId: string;
  let staffId: string;
  let testVariantId: string;
  let testBatchId: string;

  beforeAll(async () => {
    const { db } = getMigratorDb();

    const pw = await hashPassword("CustomerPass1234!");
    const [c] = await db
      .insert(users)
      .values({
        email: `order_cust_${Date.now()}@furrowmark.test`,
        passwordHash: pw,
        role: "customer",
      })
      .returning();
    customerId = c!.id;

    const [s] = await db
      .insert(users)
      .values({
        email: `order_staff_${Date.now()}@furrowmark.test`,
        passwordHash: pw,
        role: "staff",
      })
      .returning();
    staffId = s!.id;

    const [cat] = await db
      .insert(categories)
      .values({
        name: "Order Pesticides",
        slug: `order-pesticides-${Date.now()}`,
      })
      .returning();

    const [brand] = await db
      .insert(brands)
      .values({
        name: `Order Brand ${Date.now()}`,
      })
      .returning();

    const [prod] = await db
      .insert(products)
      .values({
        name: "Order Emamectin",
        slug: `order-emamectin-${Date.now()}`,
        class: "pesticide",
        status: "published",
        description: "Insecticide test pack",
        countryOfOrigin: "Pakistan",
        authoredBy: staffId,
        categoryId: cat!.id,
        brandId: brand!.id,
      })
      .returning();

    const [v] = await db
      .insert(variants)
      .values({
        productId: prod!.id,
        sku: `ORD-EMA-${Date.now()}`,
        packSize: "250ml",
        packSizeValue: 250,
        packSizeUnit: "ml",
        priceMinor: 220000, // 2,200.00 PKR
        currency: "PKR",
      })
      .returning();
    testVariantId = v!.id;

    const [sup] = await db
      .insert(suppliers)
      .values({
        name: `Order Supplier ${Date.now()}`,
      })
      .returning();

    const [b] = await db
      .insert(batches)
      .values({
        variantId: testVariantId,
        supplierId: sup!.id,
        lotNumber: `ORD-LOT-${Date.now()}`,
        manufacturedOn: new Date(Date.now() - 30 * 86400000),
        expiresOn: new Date(Date.now() + 180 * 86400000),
        receivedQuantity: 20,
        onHand: 20,
        reserved: 0,
        quarantined: 0,
        status: "available",
      })
      .returning();
    testBatchId = b!.id;
  });

  it("creates order from cart and captures immutable snapshots and FEFO allocations", async () => {
    const { id: cartId } = await CartService.getOrCreateCart({
      userId: customerId,
    });
    await CartService.addItem({
      cartId,
      variantId: testVariantId,
      quantity: 2,
    });

    const order = await OrderService.createOrderFromCart({
      cartId,
      userId: customerId,
      customerEmail: "farmer@furrowmark.test",
      customerPhone: "+923001234567",
      shippingAddress: {
        city: "Multan",
        district: "Multan",
        line: "Farm House #4",
      },
      billingAddress: {
        city: "Multan",
        district: "Multan",
        line: "Farm House #4",
      },
      paymentMethod: "advance_payment",
    });

    expect(order.id).toBeDefined();
    expect(order.publicRef).toMatch(/^FM-\d{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(order.initialState).toBe("pending_payment");
    expect(order.totalMinor).toBe(440000); // 2 * 220,000

    // Verify batch stock was reserved
    const { db } = getMigratorDb();
    const [b] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, testBatchId));
    expect(b!.reserved).toBe(2);

    // Verify order details and timeline
    const details = await OrderService.getOrderDetails(order.id);
    expect(details.lines.length).toBe(1);
    expect(details.lines[0]?.quantity).toBe(2);
    expect(details.events.length).toBe(1);
    expect(details.events[0]?.toState).toBe("pending_payment");
  });

  it("executes legal transition flow: pending_payment -> paid -> processing -> packed -> shipped -> delivered", async () => {
    const { id: cartId } = await CartService.getOrCreateCart({
      userId: customerId,
    });
    await CartService.addItem({
      cartId,
      variantId: testVariantId,
      quantity: 1,
    });

    const order = await OrderService.createOrderFromCart({
      cartId,
      userId: customerId,
      customerEmail: "grower@furrowmark.test",
      customerPhone: "+923001234568",
      shippingAddress: { city: "Sahiwal" },
      billingAddress: { city: "Sahiwal" },
      paymentMethod: "advance_payment",
    });

    // 1. Gateway verified payment
    await OrderService.transitionOrderState({
      orderId: order.id,
      toState: "paid",
      actorType: "staff",
      reason: "Advance payment manually verified",
    });

    // 2. Staff starts processing
    await OrderService.transitionOrderState({
      orderId: order.id,
      toState: "processing",
      actorType: "staff",
      actorId: staffId,
      reason: "Sent to warehouse for picking",
    });

    // 3. Staff packs items
    await OrderService.transitionOrderState({
      orderId: order.id,
      toState: "packed",
      actorType: "staff",
      actorId: staffId,
      reason: "Items sealed in secure parcel",
    });

    // 4. Carrier picks up
    await OrderService.transitionOrderState({
      orderId: order.id,
      toState: "shipped",
      actorType: "staff",
      actorId: staffId,
      reason: "Handed over to carrier courier",
    });

    // 5. Delivery confirmed
    await OrderService.transitionOrderState({
      orderId: order.id,
      toState: "delivered",
      actorType: "system",
      reason: "Carrier delivery receipt confirmed",
    });

    const details = await OrderService.getOrderDetails(order.id);
    expect(details.order.state).toBe("delivered");
    expect(details.events.length).toBe(6);
  });

  it("rejects illegal transitions and enforces state machine integrity", async () => {
    const { id: cartId } = await CartService.getOrCreateCart({
      userId: customerId,
    });
    await CartService.addItem({
      cartId,
      variantId: testVariantId,
      quantity: 1,
    });

    const order = await OrderService.createOrderFromCart({
      cartId,
      userId: customerId,
      customerEmail: "grower2@furrowmark.test",
      customerPhone: "+923001234569",
      shippingAddress: { city: "Rahim Yar Khan" },
      billingAddress: { city: "Rahim Yar Khan" },
      paymentMethod: "advance_payment",
    });

    // Illegal: pending_payment directly to delivered
    await expect(
      OrderService.transitionOrderState({
        orderId: order.id,
        toState: "delivered",
        actorType: "staff",
      }),
    ).rejects.toThrow("Illegal order transition");

    // Illegal: pending_payment directly to shipped
    await expect(
      OrderService.transitionOrderState({
        orderId: order.id,
        toState: "shipped",
        actorType: "staff",
      }),
    ).rejects.toThrow("Illegal order transition");
  });

  it("releases stock reservations automatically when order is cancelled", async () => {
    const { id: cartId } = await CartService.getOrCreateCart({
      userId: customerId,
    });
    await CartService.addItem({
      cartId,
      variantId: testVariantId,
      quantity: 3,
    });

    const order = await OrderService.createOrderFromCart({
      cartId,
      userId: customerId,
      customerEmail: "farmer_cancel@furrowmark.test",
      customerPhone: "+923001234570",
      shippingAddress: { city: "Lahore" },
      billingAddress: { city: "Lahore" },
      paymentMethod: "cash_on_delivery",
      actorId: customerId,
    });

    const { db } = getMigratorDb();
    const [bBefore] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, testBatchId));
    const reservedBefore = bBefore!.reserved;

    // Customer cancels pending order
    await OrderService.transitionOrderState({
      orderId: order.id,
      toState: "cancelled",
      actorType: "customer",
      actorId: customerId,
      reason: "Customer changed mind",
    });

    const [bAfter] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, testBatchId));
    expect(bAfter!.reserved).toBe(reservedBefore - 3);

    const details = await OrderService.getOrderDetails(order.id);
    expect(details.order.state).toBe("cancelled");
  });
});
