export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { listOrdersAwaitingStaff } from "@/modules/orders/queries";
import { requireStaffPermission } from "@/modules/web/session";
import {
  acceptCodOrderAction,
  confirmPaymentAction,
  staffLogoutAction,
} from "../../actions";
import { formatPKR } from "../../format";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function StaffOrdersPage({ searchParams }: Props) {
  const staff = await requireStaffPermission("orders:read");
  if (!staff) redirect("/staff/login");
  const canProcess = !!(await requireStaffPermission("orders:process"));
  const { error } = await searchParams;
  const pending = await listOrdersAwaitingStaff();

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">Orders awaiting action</h1>
        <form action={staffLogoutAction} className="ml-auto">
          <button type="submit" className="text-sm underline">
            Sign out
          </button>
        </form>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-red-700">
          {error}
        </p>
      )}
      {pending.length === 0 && <p>No orders are waiting.</p>}
      <ul className="space-y-4">
        {pending.map((o) => {
          const addr = o.shippingAddress as Record<string, string>;
          return (
            <li key={o.id} className="border rounded p-4">
              <p className="font-semibold">
                {o.publicRef} - {formatPKR(o.totalMinor)}
              </p>
              <p className="text-sm text-gray-700">
                {o.paymentMethod === "advance_payment"
                  ? "Advance payment (verify in Meezan / Easypaisa)"
                  : "Cash on Delivery"}{" "}
                · {o.createdAt.toLocaleString("en-PK")}
              </p>
              <p className="text-sm mt-1">
                {o.customerEmail} · {o.customerPhone}
              </p>
              <p className="text-sm">
                {[
                  addr.name,
                  addr.address,
                  addr.city,
                  addr.province,
                  addr.postalCode,
                  addr.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {canProcess && o.state === "pending_payment" && (
                <form
                  action={confirmPaymentAction}
                  className="mt-3 flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="orderId" value={o.id} />
                  <label className="text-sm">
                    Transaction ID
                    <input
                      type="text"
                      name="transactionReference"
                      defaultValue={
                        o.transactionReference?.startsWith("adv_")
                          ? ""
                          : (o.transactionReference ?? "")
                      }
                      className="ml-2 border rounded px-2 py-1"
                    />
                  </label>
                  <button
                    type="submit"
                    className="bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700"
                  >
                    Confirm payment received
                  </button>
                </form>
              )}

              {canProcess && o.state === "awaiting_confirmation" && (
                <form action={acceptCodOrderAction} className="mt-3">
                  <input type="hidden" name="orderId" value={o.id} />
                  <button
                    type="submit"
                    className="bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700"
                  >
                    Accept COD order
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
