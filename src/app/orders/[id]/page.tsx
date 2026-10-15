export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderService } from "@/modules/orders/service";
import { RECEIVING_ACCOUNTS } from "@/modules/payments/accounts";
import { getCustomerSession } from "@/modules/web/session";
import { formatPKR } from "../../format";
import { CopyButton } from "../../components/CopyButton";

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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const whatsappNotifyUrl = `https://wa.me/923005534323?text=${encodeURIComponent(
    `Hello Furrowmark Multan Depot, I placed order ${order.publicRef} totaling ${formatPKR(
      order.totalMinor
    )}. Please confirm consignment dispatch.`
  )}`;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Top Success Banner */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
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

            <div className="pt-2">
              <a
                href={whatsappNotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition active:scale-95 shadow-2xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
                <span>WhatsApp Receipt Screenshot to Multan Depot Desk</span>
              </a>
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
