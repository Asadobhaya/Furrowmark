export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/modules/web/session";
import { getRuntimeDb } from "@/modules/database";
import { returnRequests } from "@/modules/returns/schema";
import { orders } from "@/modules/commerce/schema";
import { resolveReturnAction, staffLogoutAction } from "../../actions";
import Link from "next/link";
import { eq } from "drizzle-orm";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function StaffReturnsPage({ searchParams }: Props) {
  const staff = await requireStaffPermission("orders:read");
  if (!staff) redirect("/staff/login");
  const canProcess = !!(await requireStaffPermission("orders:process"));
  const { error } = await searchParams;

  const db = getRuntimeDb();
  const requests = await db
    .select({
      id: returnRequests.id,
      rmaNumber: returnRequests.rmaNumber,
      orderId: returnRequests.orderId,
      reason: returnRequests.reason,
      status: returnRequests.status,
      resolution: returnRequests.resolution,
      staffNotes: returnRequests.staffNotes,
      createdAt: returnRequests.createdAt,
      orderRef: orders.publicRef,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
    })
    .from(returnRequests)
    .innerJoin(orders, eq(returnRequests.orderId, orders.id))
    .orderBy(returnRequests.createdAt);

  return (
    <main className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            RMA Return Inspection & Quarantine
          </h1>
          <p className="text-sm text-gray-600">
            Process customer returns, enforce safety rules, and quarantine
            restock
          </p>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/staff/orders" className="text-sm underline">
            Orders
          </Link>
          <Link href="/staff/fulfilment" className="text-sm underline">
            Fulfilment
          </Link>
          <Link href="/staff/reports" className="text-sm underline">
            Reports
          </Link>
          <form action={staffLogoutAction}>
            <button type="submit" className="text-sm underline text-red-700">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 text-red-700 p-2 border border-red-200 bg-red-50 rounded"
        >
          {error}
        </p>
      )}

      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-gray-600">No RMA return requests logged.</p>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="border rounded p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-lg">{r.rmaNumber}</span>
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 uppercase">
                    {r.status}
                  </span>
                  <p className="text-sm text-gray-700">
                    Order: {r.orderRef} · Customer: {r.customerEmail}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Reason: {r.reason}
                  </p>
                  {r.resolution && (
                    <p className="text-xs font-semibold text-emerald-800 mt-1">
                      Resolution: {r.resolution}
                    </p>
                  )}
                  {r.staffNotes && (
                    <p className="text-xs text-gray-500 mt-1">
                      Notes: {r.staffNotes}
                    </p>
                  )}
                </div>

                {canProcess && r.status !== "closed" && (
                  <form
                    action={resolveReturnAction}
                    className="border-l pl-4 ml-4 space-y-2 text-xs"
                  >
                    <input type="hidden" name="returnRequestId" value={r.id} />
                    <div>
                      <label className="block font-medium">Resolution:</label>
                      <select
                        name="resolution"
                        className="border rounded px-1.5 py-1 w-full"
                      >
                        <option value="store_credit">Store Credit</option>
                        <option value="refund">Refund</option>
                        <option value="replacement">Replacement</option>
                        <option value="closed_no_action">
                          Close without action
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium">
                        Restock to Batch Quarantine?
                      </label>
                      <select
                        name="restockable"
                        className="border rounded px-1.5 py-1 w-full"
                      >
                        <option value="true">Yes - Move to quarantine</option>
                        <option value="false">No - Scrap / Damaged</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium">
                        Inspection Notes:
                      </label>
                      <input
                        type="text"
                        name="staffNotes"
                        placeholder="Seal condition verified..."
                        className="border rounded px-1.5 py-1 w-full"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-green-800 text-white px-3 py-1.5 rounded font-medium hover:bg-green-900 w-full"
                    >
                      Complete Inspection
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
