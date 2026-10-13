export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderService } from "@/modules/orders/service";
import { RECEIVING_ACCOUNTS } from "@/modules/payments/accounts";
import { getCustomerSession } from "@/modules/web/session";
import { formatPKR } from "../../format";

const STATE_LABELS: Record<string, string> = {
  pending_payment: "Waiting for payment verification",
  awaiting_confirmation: "Waiting for confirmation",
  paid: "Payment verified",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCustomerSession();
  if (!session) redirect(`/login?next=/orders/${id}`);

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const details = await OrderService.getOrderDetails(id).catch(() => null);
  // Treat other customers' orders as not found.
  if (!details || details.order.userId !== session.userId) notFound();
  const { order, lines } = details;

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Order Confirmation</h1>
      <p className="mb-2">
        Thank you for your order! Your order number is{" "}
        <strong>{order.publicRef}</strong>.
      </p>
      <p className="mb-4">
        Status: <strong>{STATE_LABELS[order.state] ?? order.state}</strong>
      </p>

      {order.paymentMethod === "advance_payment" &&
        order.state === "pending_payment" && (
          <section className="border rounded p-4 mb-4 bg-gray-50 text-sm">
            <h2 className="font-medium mb-2">Complete your advance payment</h2>
            <p className="mb-2">
              Send <strong>{formatPKR(order.totalMinor)}</strong> to one of the
              accounts below and quote order <strong>{order.publicRef}</strong>.
              We verify payments manually.
            </p>
            <ul className="space-y-1">
              {RECEIVING_ACCOUNTS.map((acc) => (
                <li key={acc.id}>
                  <strong>{acc.label}</strong> - {acc.accountTitle} -{" "}
                  {acc.accountNumber}
                </li>
              ))}
            </ul>
          </section>
        )}

      {order.paymentMethod === "cash_on_delivery" && (
        <p className="mb-4 text-sm">
          Pay {formatPKR(order.totalMinor)} in cash when your order arrives.
        </p>
      )}

      <section className="border rounded p-4 mb-4">
        <h2 className="text-lg font-medium mb-2">Order Summary</h2>
        <ul className="space-y-2 mb-2">
          {lines.map((line) => (
            <li key={line.id} className="flex justify-between">
              <span>
                {line.productNameSnapshot} × {line.quantity}
              </span>
              <span>{formatPKR(line.totalMinor)}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPKR(order.totalMinor)}</span>
        </p>
      </section>

      <p className="mt-6">
        <Link href="/products" className="text-green-600 hover:underline">
          ← Continue Shopping
        </Link>
      </p>
    </main>
  );
}
