import { describe, it, expect, beforeAll } from "vitest";
import { eq } from "drizzle-orm";
import { getMigratorDb } from "../database";
import { users } from "../database/schema";
import {
  categories,
  brands,
  products,
  variants,
  batches,
  suppliers,
} from "../catalog/schema";
import { payments } from "../commerce/schema";
import { CartService } from "../cart/service";
import { OrderService } from "../orders/service";
import { PaymentService } from "./service";

describe("Payment Adapters, Manual Verification & Refund Integrity", () => {
  let customerId: string;
  let staffId: string;
  let testVariantId: string;

  beforeAll(async () => {
    const { db } = getMigratorDb();

    const [c] = await db
      .insert(users)
      .values({
        email: `pay_customer_${Date.now()}@furrowmark.test`,
        passwordHash: "hash_test",
        role: "customer",
      })
      .returning();
    customerId = c!.id;

    const [s] = await db
      .insert(users)
      .values({
        email: `pay_staff_${Date.now()}@furrowmark.test`,
        passwordHash: "hash_test",
        role: "staff",
      })
      .returning();
    staffId = s!.id;

    const [cat] = await db
      .insert(categories)
      .values({
        name: `Payment Category ${Date.now()}`,
        slug: `pay-cat-${Date.now()}`,
      })
      .returning();

    const [brand] = await db
      .insert(brands)
      .values({
        name: `Payment Brand ${Date.now()}`,
      })
      .returning();

    const [prod] = await db
      .insert(products)
      .values({
        name: "Payment Zinc Chelate",
        slug: `pay-zinc-${Date.now()}`,
        class: "nutrient",
        status: "published",
        description: "High purity zinc fertilizer",
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
        sku: `PAY-ZINC-${Date.now()}`,
        packSize: "1kg",
        packSizeValue: 1,
        packSizeUnit: "kg",
        priceMinor: 150000, // 1,500.00 PKR
        currency: "PKR",
      })
      .returning();
    testVariantId = v!.id;

    const [sup] = await db
      .insert(suppliers)
      .values({
        name: `Pay Supplier ${Date.now()}`,
      })
      .returning();

    await db.insert(batches).values({
      variantId: testVariantId,
      supplierId: sup!.id,
      lotNumber: `PAY-LOT-${Date.now()}`,
      manufacturedOn: new Date(Date.now() - 20 * 86400000),
      expiresOn: new Date(Date.now() + 200 * 86400000),
      receivedQuantity: 50,
      onHand: 50,
      reserved: 0,
      quarantined: 0,
      status: "available",
    });
  });

  it("manually confirms advance payment and transitions order to paid", async () => {
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
      customerEmail: "pay_test@furrowmark.test",
      customerPhone: "+923001234999",
      shippingAddress: { city: "Multan" },
      billingAddress: { city: "Multan" },
      paymentMethod: "advance_payment",
      actorId: customerId,
    });

    expect(order.initialState).toBe("pending_payment");

    await PaymentService.initiatePayment(
      order.id,
      "https://furrowmark.test/checkout/success",
      "https://furrowmark.test/checkout/cancel",
    );

    const result = await PaymentService.confirmManualPayment({
      orderId: order.id,
      actorId: staffId,
      transactionReference: "EP-123456",
    });
    expect(result.outcome).toBe("confirmed");

    const orderDetails = await OrderService.getOrderDetails(order.id);
    expect(orderDetails.order.state).toBe("paid");

    const { db } = getMigratorDb();
    const [paymentRecord] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id));
    expect(paymentRecord!.status).toBe("completed");
    expect(paymentRecord!.providerReference).toBe("EP-123456");

    const again = await PaymentService.confirmManualPayment({
      orderId: order.id,
      actorId: staffId,
    });
    expect(again.outcome).toBe("already_processed_state");
  });

  it("processes partial and full refunds with integer bounds enforcement", async () => {
    // 1. Create order and mark paid
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
      customerEmail: "refund_test@furrowmark.test",
      customerPhone: "+923001234999",
      shippingAddress: { city: "Faisalabad" },
      billingAddress: { city: "Faisalabad" },
      paymentMethod: "advance_payment",
      actorId: customerId,
    });

    const { db } = getMigratorDb();
    // Insert completed payment
    await db.insert(payments).values({
      orderId: order.id,
      provider: "advance_payment",
      providerReference: "adv_ref_completed",
      amountMinor: order.totalMinor,
      currency: "PKR",
      status: "completed",
    });

    await OrderService.transitionOrderState({
      orderId: order.id,
      toState: "paid",
      actorType: "gateway",
      reason: "Payment verified",
    });

    // 2. Reject excessive refund (> totalMinor)
    await expect(
      PaymentService.refundOrder({
        orderId: order.id,
        amountMinor: order.totalMinor + 100,
        reason: "Excessive refund test",
        actorId: staffId,
      }),
    ).rejects.toThrow("exceeds total paid amount");

    // 3. Process partial refund (half of total)
    const partialAmount = Math.floor(order.totalMinor / 2);
    const partialRefund = await PaymentService.refundOrder({
      orderId: order.id,
      amountMinor: partialAmount,
      reason: "Damaged packaging partial refund",
      actorId: staffId,
    });

    expect(partialRefund.newOrderState).toBe("partially_refunded");
    let details = await OrderService.getOrderDetails(order.id);
    expect(details.order.state).toBe("partially_refunded");

    // 4. Process remainder refund to reach full refund
    const remainingAmount = order.totalMinor - partialAmount;
    const fullRefund = await PaymentService.refundOrder({
      orderId: order.id,
      amountMinor: remainingAmount,
      reason: "Customer requested return remaining balance",
      actorId: staffId,
    });

    expect(fullRefund.newOrderState).toBe("refunded");
    details = await OrderService.getOrderDetails(order.id);
    expect(details.order.state).toBe("refunded");

    // 5. Subsequent refund rejected since 100% refunded
    await expect(
      PaymentService.refundOrder({
        orderId: order.id,
        amountMinor: 10,
        reason: "Over-refund attempt",
        actorId: staffId,
      }),
    ).rejects.toThrow("exceeds remaining refundable balance");
  });

  it("handles cash on delivery and advance payment workflows", async () => {
    const codProvider = PaymentService.getProvider("cash_on_delivery");
    const codSession = await codProvider.createCheckoutSession({
      order: {
        id: "cod-id",
        publicRef: "ORD-COD-01",
        totalMinor: 50000,
        currency: "PKR",
        customerEmail: "cod@furrowmark.test",
        customerPhone: "+923001234567",
      },
      returnUrl: "https://furrowmark.test/success",
      cancelUrl: "https://furrowmark.test/cancel",
    });
    expect(codSession.provider).toBe("cash_on_delivery");
    expect(codSession.referenceToken).toBe("cod_ORD-COD-01");
    expect(await codProvider.fetchPaymentStatus()).toBe("pending");

    const codRefund = await codProvider.processRefund(
      "pay_cod",
      50000,
      "Cash returned",
    );
    expect(codRefund.success).toBe(true);

    const advProvider = PaymentService.getProvider("advance_payment");
    const advSession = await advProvider.createCheckoutSession({
      order: {
        id: "adv-id",
        publicRef: "ORD-ADV-01",
        totalMinor: 80000,
        currency: "PKR",
        customerEmail: "adv@furrowmark.test",
        customerPhone: "+923001234568",
      },
      returnUrl: "https://furrowmark.test/success",
      cancelUrl: "https://furrowmark.test/cancel",
    });
    expect(advSession.provider).toBe("advance_payment");
    const accounts = advSession.metadata?.accounts as {
      id: string;
      accountNumber: string;
      accountTitle: string;
    }[];
    expect(accounts.map((a) => a.id)).toEqual(["meezan", "easypaisa"]);
    expect(accounts[0]!.accountNumber).toBe("03130115156301");
    expect(accounts[1]!.accountNumber).toBe("03004634494");
    expect(accounts.every((a) => a.accountTitle === "Muhammad Asad")).toBe(
      true,
    );
    expect(await advProvider.fetchPaymentStatus()).toBe("pending");
  });

  it("rejects removed gateway and bank transfer methods", () => {
    expect(() => PaymentService.getProvider("safepay" as never)).toThrow(
      "Unsupported payment provider",
    );
    expect(() => PaymentService.getProvider("bank_transfer" as never)).toThrow(
      "Unsupported payment provider",
    );
  });
});
