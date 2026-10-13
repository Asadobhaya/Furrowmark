export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/modules/web/session";
import { ReportingService } from "@/modules/reporting/service";
import { formatPKR } from "../../format";
import { staffLogoutAction } from "../../actions";
import Link from "next/link";

export default async function StaffReportsPage() {
  const staff = await requireStaffPermission("reports:read");
  if (!staff) redirect("/staff/login");

  const expiryReport = await ReportingService.getBatchExpiryReport(90);
  const pesticideRegister =
    await ReportingService.getPesticideRegulatoryRegister();
  const revenueSummary = await ReportingService.getRevenueSummary();

  return (
    <main className="p-4 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Operational & Regulatory Reports
          </h1>
          <p className="text-sm text-gray-600">
            Batch aging risk, pesticide regulatory register, and revenue
            reconciliation
          </p>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/staff/orders" className="text-sm underline">
            Orders
          </Link>
          <Link href="/staff/fulfilment" className="text-sm underline">
            Fulfilment
          </Link>
          <Link href="/staff/returns" className="text-sm underline">
            RMA Returns
          </Link>
          <form action={staffLogoutAction}>
            <button type="submit" className="text-sm underline text-red-700">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* 1. Revenue Ledger */}
      <section className="border rounded p-4 bg-white shadow-sm">
        <h2 className="text-lg font-bold mb-3">
          Revenue Ledger by Payment Method
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2">Payment Method</th>
                <th className="p-2">Orders</th>
                <th className="p-2">Subtotal</th>
                <th className="p-2">Tax</th>
                <th className="p-2">Shipping</th>
                <th className="p-2">Discounts</th>
                <th className="p-2 font-bold">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {revenueSummary.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                revenueSummary.map((r, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 font-medium capitalize">
                      {r.paymentMethod.replace(/_/g, " ")}
                    </td>
                    <td className="p-2">{r.orderCount}</td>
                    <td className="p-2">{formatPKR(r.subtotalMinor)}</td>
                    <td className="p-2">{formatPKR(r.taxMinor)}</td>
                    <td className="p-2">{formatPKR(r.shippingMinor)}</td>
                    <td className="p-2">{formatPKR(r.discountMinor)}</td>
                    <td className="p-2 font-bold text-green-900">
                      {formatPKR(r.totalRevenueMinor)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Batch Expiry & Quarantine Aging */}
      <section className="border rounded p-4 bg-white shadow-sm">
        <h2 className="text-lg font-bold mb-1">
          Batch Expiry & Quarantine Risk
        </h2>
        <p className="text-xs text-gray-600 mb-3">
          Batches nearing expiration (within 90 days) or quarantined
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2">Product / SKU</th>
                <th className="p-2">Lot #</th>
                <th className="p-2">Expiry Date</th>
                <th className="p-2">Days Left</th>
                <th className="p-2">On Hand</th>
                <th className="p-2">Quarantined</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {expiryReport.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    All inventory batches are within valid shelf-life bounds.
                  </td>
                </tr>
              ) : (
                expiryReport.map((b) => (
                  <tr key={b.batchId} className="border-b">
                    <td className="p-2 font-medium">
                      {b.productName} ({b.sku})
                    </td>
                    <td className="p-2 font-mono text-xs">{b.lotNumber}</td>
                    <td className="p-2">
                      {b.expiresOn.toLocaleDateString("en-PK")}
                    </td>
                    <td
                      className={`p-2 font-semibold ${
                        b.daysRemaining <= 30
                          ? "text-red-700"
                          : b.daysRemaining <= 60
                            ? "text-amber-700"
                            : "text-gray-700"
                      }`}
                    >
                      {b.daysRemaining} days
                    </td>
                    <td className="p-2">{b.onHand}</td>
                    <td className="p-2 font-semibold text-amber-800">
                      {b.quarantined}
                    </td>
                    <td className="p-2 uppercase text-xs">{b.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Statutory Pesticide Sales Register */}
      <section className="border rounded p-4 bg-white shadow-sm">
        <h2 className="text-lg font-bold mb-1">
          Statutory Pesticide Regulatory Sales Register
        </h2>
        <p className="text-xs text-gray-600 mb-3">
          Compliance ledger for agricultural authorities tracking pesticide
          purchases and batches
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2">Date</th>
                <th className="p-2">Order Ref</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Product Name</th>
                <th className="p-2">Lot #</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {pesticideRegister.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No pesticide sales recorded.
                  </td>
                </tr>
              ) : (
                pesticideRegister.map((p, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 text-xs">
                      {p.orderedAt.toLocaleDateString("en-PK")}
                    </td>
                    <td className="p-2 font-mono text-xs">{p.orderRef}</td>
                    <td className="p-2">
                      {p.customerPhone} ({p.customerEmail})
                    </td>
                    <td className="p-2 font-medium">{p.productName}</td>
                    <td className="p-2 font-mono text-xs">{p.lotNumber}</td>
                    <td className="p-2">{p.quantity}</td>
                    <td className="p-2">{formatPKR(p.totalMinor)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
