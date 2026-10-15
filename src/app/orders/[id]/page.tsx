export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderService } from "@/modules/orders/service";
import { RECEIVING_ACCOUNTS } from "@/modules/payments/accounts";
import { getCustomerSession } from "@/modules/web/session";
import { formatPKR } from "../../format";
import { CopyButton } from "../../components/CopyButton";
import { OwnerWhatsAppNotifier } from "../../components/OwnerWhatsAppNotifier";

export const metadata = {
  title: "Order Confirmation | Furrowmark",
  description:
    "View your order status, summary, and secure advance payment receiving bank details.",
};

const STATE_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Awaiting Payment Verification", color: "bg-amber-100 text-amber-900 border-amber-300" },
  awaiting_confirmation: { label: "Awaiting Depot Confirmation", color: "bg-blue-100 text-blue-900 border-blue-300" },
  paid: { label: "Payment Verified", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  processing: { label: "Depot Processing", color: "bg-purple-100 text-purple-900 border-purple-300" },
  packed: { label: "Packed with Tamper Seals", color: "bg-indigo-100 text-indigo-900 border-indigo-300" },
  shipped: { label: "Dispatched via Goods Transport / Courier", color: "bg-cyan-100 text-cyan-900 border-cyan-300" },
  delivered: { label: "Consignment Delivered", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  cancelled: { label: "Order Cancelled", color: "bg-red-100 text-red-900 border-red-300" },
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const sParams = await searchParams;
  const isNewOrder = sParams?.new === "1";

  const session = await getCustomerSession();
  if (!session) redirect(`/login?next=/orders/${id}`);

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const details = await OrderService.getOrderDetails(id).catch(() => null);
  if (!details || details.order.userId !== session.userId) notFound();
  const { order, lines } = details;

  const stateInfo = STATE_LABELS[order.state] ?? {
    label: order.state,
    color: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const shipping = (order.shippingAddress ?? {}) as Record<string, string>;
  const buyerName = shipping.name || "Customer";
  const buyerPhone = order.customerPhone || shipping.phone || "N/A";
  const buyerAddress = [shipping.address, shipping.city, shipping.province, shipping.postalCode]
    .filter(Boolean)
    .join(", ");

  const itemsListText = lines
    .map(
      (l, idx) =>
        `${idx + 1}. ${l.productNameSnapshot}\n   Qty: ${l.quantity} pack(s) | Rate: ${formatPKR(
          l.unitPriceMinor
        )} | Total: ${formatPKR(l.totalMinor)}`
    )
    .join("\n");

  const paymentLabel =
    order.paymentMethod === "advance_payment"
      ? "Advance Bank Transfer"
      : "Cash on Delivery (COD)";

  const ownerWhatsAppData =
    `*NEW ORDER RECEIVED: ${order.publicRef}*\n` +
    `--------------------------------\n` +
    `*BUYER DETAILS:*\n` +
    `• Name: ${buyerName}\n` +
    `• Phone: ${buyerPhone}\n` +
    `• Email: ${order.customerEmail}\n` +
    `• Address: ${buyerAddress}\n` +
    `--------------------------------\n` +
    `*ORDERED PRODUCTS & QUANTITIES:*\n` +
    `${itemsListText}\n` +
    `--------------------------------\n` +
    `*PAYMENT & TOTAL:*\n` +
    `• Subtotal: ${formatPKR(order.subtotalMinor)}\n` +
    (order.shippingMinor > 0
      ? `• Shipping: ${formatPKR(order.shippingMinor)}\n`
      : `• Shipping: Free Delivery\n`) +
    `• Grand Total: ${formatPKR(order.totalMinor)}\n` +
    `• Payment Method: ${paymentLabel}\n` +
    `• Order Ref: ${order.publicRef}\n\n` +
    `Furrowmark Multan Depot - Basti Bair Wala, Mouza Mardan Pur, Multan`;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Instant Owner WhatsApp Dispatch Widget */}
      <OwnerWhatsAppNotifier
        orderRef={order.publicRef}
        message={ownerWhatsAppData}
        isNewOrder={isNewOrder}
        primaryPhone="923005534323"
        secondaryPhone="923004634494"
      />

      {/* Main Order Details Card */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Order Received
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Consignment logged into Multan depot FEFO dispatch queue.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-950 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              {order.publicRef}
            </span>
            <CopyButton textToCopy={order.publicRef} label="Copy Ref" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold text-gray-600">Current Consignment State:</span>
          <span className={`font-bold px-3 py-1 rounded-full border text-xs ${stateInfo.color}`}>
            {stateInfo.label}
          </span>
        </div>

        {/* Consignment Destination Details */}
        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm space-y-2">
          <h2 className="font-bold text-gray-900 border-b border-gray-200 pb-1.5">
            Consignment Delivery Destination
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
            <div>
              <span className="text-gray-500 block text-[11px]">Recipient Name:</span>
              <strong className="text-gray-900">{buyerName}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Contact Phone:</span>
              <strong className="text-gray-900">{buyerPhone}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-500 block text-[11px]">Delivery Address:</span>
              <span className="text-gray-900 font-medium">{buyerAddress}</span>
            </div>
          </div>
        </section>

        {/* Advance Bank Payment Directive */}
        {order.paymentMethod === "advance_payment" && order.state === "pending_payment" && (
          <div className="border border-amber-200 bg-amber-50/60 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-amber-950 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm sm:text-base text-amber-950">
                Complete Your Advance Bank Transfer
              </h2>
              <span className="font-extrabold text-base text-emerald-900">
                {formatPKR(order.totalMinor)}
              </span>
            </div>

            <p className="text-xs text-amber-900 leading-relaxed">
              Transfer <strong>{formatPKR(order.totalMinor)}</strong> to one of our verified business accounts below. Please mention reference <strong>{order.publicRef}</strong> in the transfer remarks.
            </p>

            <div className="space-y-2 pt-1">
              {RECEIVING_ACCOUNTS.map((acc) => (
                <div
                  key={acc.id}
                  className="bg-white border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">{acc.label}</span>
                    <span className="text-gray-500 text-[11px]">
                      Title: <strong>{acc.accountTitle}</strong> · Account / IBAN: <strong className="font-mono text-gray-900">{acc.accountNumber}</strong>
                    </span>
                  </div>
                  <CopyButton textToCopy={acc.accountNumber} label="Copy Account" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COD message */}
        {order.paymentMethod === "cash_on_delivery" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-center justify-between">
            <span>Cash on Delivery (COD) Selected</span>
            <span className="font-extrabold text-sm">{formatPKR(order.totalMinor)} payable upon arrival</span>
          </div>
        )}

        {/* Itemized Order Summary */}
        <section className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <h2 className="font-bold text-sm sm:text-base text-gray-900 border-b border-gray-100 pb-2">
            Itemized Order Consignment
          </h2>
          <ul className="divide-y divide-gray-100 text-xs sm:text-sm">
            {lines.map((line) => (
              <li key={line.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-900 block">
                    {line.productNameSnapshot}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Quantity: {line.quantity} pack(s)
                  </span>
                </div>
                <span className="font-bold text-emerald-900">
                  {formatPKR(line.totalMinor)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline font-bold text-sm sm:text-base">
            <span className="text-gray-900">Total Consignment Value</span>
            <span className="text-emerald-900 font-extrabold text-lg">
              {formatPKR(order.totalMinor)}
            </span>
          </div>
        </section>

        {/* Action Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs sm:text-sm">
          <Link
            href="/products"
            className="text-emerald-800 hover:text-emerald-900 font-semibold hover:underline"
          >
            ← Return to Products Catalog
          </Link>
          <Link
            href="/contact"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Need Help? Submit Support Ticket
          </Link>
        </div>
      </div>
    </main>
  );
}
