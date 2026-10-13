import { desc, eq, inArray } from "drizzle-orm";
import { getRuntimeDb } from "../database";
import { orders, payments } from "../commerce/schema";

/** Orders waiting on staff action: unverified advance payments and unconfirmed COD orders. */
export async function listOrdersAwaitingStaff() {
  const db = getRuntimeDb();
  return db
    .select({
      id: orders.id,
      publicRef: orders.publicRef,
      state: orders.state,
      paymentMethod: orders.paymentMethod,
      totalMinor: orders.totalMinor,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      shippingAddress: orders.shippingAddress,
      createdAt: orders.createdAt,
      transactionReference: payments.providerReference,
    })
    .from(orders)
    .leftJoin(payments, eq(payments.orderId, orders.id))
    .where(inArray(orders.state, ["pending_payment", "awaiting_confirmation"]))
    .orderBy(desc(orders.createdAt));
}
