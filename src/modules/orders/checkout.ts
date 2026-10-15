import { eq } from "drizzle-orm";
import { z } from "zod";
import { getRuntimeDb } from "../database";
import { users } from "../database/schema";
import { payments, paymentMethodEnum } from "../commerce/schema";
import { CartService } from "../cart/service";
import { OrderService } from "./service";
import { PaymentService } from "../payments/service";
import { NotificationService } from "../notifications/service";

export const CheckoutInputSchema = z
  .object({
    shipping: z.object({
      name: z.string().trim().min(1),
      address: z.string().trim().min(1),
      city: z.string().trim().min(1),
      province: z.string().trim().min(1),
      postalCode: z.string().trim().min(1),
      country: z.string().trim().min(1),
    }),
    phone: z.string().trim().min(7),
    method: z.enum(paymentMethodEnum),
    // Customer-supplied transaction ID for advance payments; staff verify manually.
    transactionReference: z.string().trim().optional(),
  })
  .refine((v) => v.method !== "advance_payment" || !!v.transactionReference, {
    message: "Transaction ID is required for advance payment",
    path: ["transactionReference"],
  });

export type CheckoutInput = z.infer<typeof CheckoutInputSchema>;

/**
 * Creates an order from the customer's cart and initialises its payment record.
 * Shared by the checkout server action and POST /api/orders.
 */
export async function placeOrder(userId: string, input: CheckoutInput) {
  const db = getRuntimeDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new Error("User not found");

  const { id: cartId } = await CartService.getOrCreateCart({ userId });

  const order = await OrderService.createOrderFromCart({
    cartId,
    userId,
    customerEmail: user.email,
    customerPhone: input.phone,
    shippingAddress: input.shipping,
    billingAddress: input.shipping,
    paymentMethod: input.method,
    actorId: userId,
  });

  const session = await PaymentService.initiatePayment(
    order.id,
    "/orders",
    "/cart",
  );

  if (input.method === "advance_payment" && input.transactionReference) {
    await db
      .update(payments)
      .set({
        providerReference: input.transactionReference,
        updatedAt: new Date(),
      })
      .where(eq(payments.orderId, order.id));
  }

  // Phase 5: Enqueue customer notification
  await NotificationService.enqueueNotification({
    channel: "email",
    recipient: user.email,
    templateId:
      input.method === "advance_payment"
        ? "order_created_advance"
        : "order_created_cod",
    context: {
      orderRef: order.publicRef,
      totalPkr: `PKR ${(order.totalMinor / 100).toFixed(2)}`,
      paymentMethod: input.method,
      transactionRef: input.transactionReference,
    },
  });

  // Enqueue instant notification to Owner on WhatsApp (+92 300 5534323 & +92 300 4634494)
  const fullDetails = await OrderService.getOrderDetails(order.id).catch(() => null);
  const itemsSummary =
    fullDetails?.lines
      ?.map(
        (l, idx) =>
          `${idx + 1}. ${l.productNameSnapshot} x ${l.quantity} = PKR ${(l.totalMinor / 100).toFixed(2)}`
      )
      .join("\n") ?? "";

  const shippingAddr = input.shipping;
  const addressFormatted = `${shippingAddr.address}, ${shippingAddr.city}, ${shippingAddr.province} (${shippingAddr.postalCode})`;

  for (const ownerPhone of ["+923005534323", "+923004634494"]) {
    await NotificationService.enqueueNotification({
      channel: "whatsapp",
      recipient: ownerPhone,
      templateId: "owner_order_alert",
      context: {
        orderRef: order.publicRef,
        customerName: shippingAddr.name,
        customerPhone: input.phone,
        deliveryAddress: addressFormatted,
        itemsSummary,
        totalPkr: `PKR ${(order.totalMinor / 100).toFixed(2)}`,
        paymentMethod:
          input.method === "advance_payment"
            ? "Advance Bank Transfer"
            : "Cash on Delivery",
        transactionRef: input.transactionReference,
      },
    }).catch(() => {
      // Non-blocking background enqueue
    });
  }

  return { ...order, paymentInstructions: session.metadata ?? null };
}
