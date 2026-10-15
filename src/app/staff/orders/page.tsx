export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { listOrdersAwaitingStaff } from "@/modules/orders/queries";
import { requireStaffPermission } from "@/modules/web/session";
import {
  acceptCodOrderAction,
  confirmPaymentAction,
  staffLogoutAction,
} from "../../actions";
import { formatPKR } from "../../format";

export const metadata = {
  title: "Staff Orders Dashboard | Furrowmark",
  description: "Internal order processing and consignment dispatch desk.",
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function StaffOrdersPage({ searchParams }: Props) {
  const staff = await requireStaffPermission("orders:read");
  if (!staff) redirect("/staff/login");
  const canProcess = !!(await requireStaffPermission("orders:process"));
  const { error } = await searchParams;
  const pending = await listOrdersAwaitingStaff();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Header and Staff Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Multan Depot Dispatch Desk
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Review incoming advance bank transfers, verify transaction IDs, and confirm COD consignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <Link
            href="/staff/orders"
            className="bg-emerald-800 text-white px-3 py-1.5 rounded-xl shadow-2xs"
          >
            Orders Queue ({pending.length})
          </Link>
          <Link
            href="/staff/products"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl transition"
          >
            Inventory Batches
          </Link>
          <form action={staffLogoutAction}>
            <button
              type="submit"
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl transition font-semibold"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {pending.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-900 font-bold text-base">All orders are up to date</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No orders currently pending verification. Any new orders submitted by customers will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((o) => {
            const addr = (o.shippingAddress ?? {}) as Record<string, string>;
            return (
              <div
                key={o.id}
                className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm sm:text-base font-extrabold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {o.publicRef}
                    </span>
                    <span className="text-xs text-gray-500">
                      {o.createdAt.toLocaleString("en-PK")}
                    </span>
                  </div>
                  <div className="text-emerald-900 font-extrabold text-base sm:text-lg">
                    {formatPKR(o.totalMinor)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                      Customer & Contact
                    </span>
                    <p className="font-bold text-gray-900 mt-0.5">{addr.name || o.customerEmail}</p>
                    <p className="text-gray-600">{o.customerPhone || "No phone provided"}</p>
                    <p className="text-gray-500 text-xs">{o.customerEmail}</p>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                      Delivery Address
                    </span>
                    <p className="text-gray-700 mt-0.5">
                      {[addr.address, addr.city, addr.province, addr.postalCode, addr.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200/70 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-gray-800">
                      Payment Method:{" "}
                      {o.paymentMethod === "advance_payment"
                        ? "Advance Bank Transfer (Meezan / Easypaisa)"
                        : "Cash on Delivery (COD)"}
                    </span>
                    {o.transactionReference && (
                      <p className="text-gray-500 font-mono mt-0.5">
                        Trans Ref: {o.transactionReference}
                      </p>
                    )}
                  </div>

                  {canProcess && o.state === "pending_payment" && (
                    <form
                      action={confirmPaymentAction}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <input type="hidden" name="orderId" value={o.id} />
                      <input
                        type="text"
                        name="transactionReference"
                        placeholder="Verified Bank Ref"
                        defaultValue={
                          o.transactionReference?.startsWith("adv_")
                            ? ""
                            : (o.transactionReference ?? "")
                        }
                        className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-600 w-36 bg-white"
                      />
                      <button
                        type="submit"
                        className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition shadow-2xs"
                      >
                        Confirm Payment
                      </button>
                    </form>
                  )}

                  {canProcess && o.state === "awaiting_confirmation" && (
                    <form action={acceptCodOrderAction} className="w-full sm:w-auto">
                      <input type="hidden" name="orderId" value={o.id} />
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition shadow-2xs"
                      >
                        Accept & Dispatch COD Consignment
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
