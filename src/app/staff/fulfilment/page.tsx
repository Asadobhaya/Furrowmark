export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/modules/web/session";
import { getRuntimeDb } from "@/modules/database";
import { orders } from "@/modules/commerce/schema";
import { shipments } from "@/modules/fulfilment/schema";
import { inArray } from "drizzle-orm";
import {
  createOrderShipmentsAction,
  packShipmentAction,
  dispatchShipmentAction,
  deliverShipmentAction,
  staffLogoutAction,
} from "../../actions";
import Link from "next/link";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function StaffFulfilmentPage({ searchParams }: Props) {
  const staff = await requireStaffPermission("orders:read");
  if (!staff) redirect("/staff/login");
  const canProcess = !!(await requireStaffPermission("orders:process"));
  const { error } = await searchParams;

  const db = getRuntimeDb();
  // Fetch orders in processing or packed or shipped
  const activeOrders = await db
    .select()
    .from(orders)
    .where(inArray(orders.state, ["processing", "packed", "shipped"]))
    .orderBy(orders.createdAt);

  // Fetch all shipments for these orders
  const activeShipments = await db
    .select()
    .from(shipments)
    .orderBy(shipments.createdAt);

  return (
    <main className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Warehouse Fulfilment & Dispatch
          </h1>
          <p className="text-sm text-gray-600">
            Hazardous agrochemical parcel separation and courier tracking
          </p>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/staff/orders" className="text-sm underline">
            Orders
          </Link>
          <Link href="/staff/returns" className="text-sm underline">
            RMA Returns
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

      <div className="space-y-6">
        {activeOrders.length === 0 ? (
          <p className="text-gray-600">
            No active orders awaiting fulfillment.
          </p>
        ) : (
          activeOrders.map((ord) => {
            const ordShipments = activeShipments.filter(
              (s) => s.orderId === ord.id,
            );
            return (
              <div
                key={ord.id}
                className="border rounded p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-lg">{ord.publicRef}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 uppercase font-semibold">
                      {ord.state}
                    </span>
                    <p className="text-sm text-gray-700">
                      Customer: {ord.customerEmail} · {ord.customerPhone}
                    </p>
                  </div>
                  {canProcess && ordShipments.length === 0 && (
                    <form action={createOrderShipmentsAction}>
                      <input type="hidden" name="orderId" value={ord.id} />
                      <button
                        type="submit"
                        className="bg-green-800 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-900"
                      >
                        Generate Safe Parcels
                      </button>
                    </form>
                  )}
                </div>

                {ordShipments.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <h3 className="text-sm font-semibold mb-2">
                      Shipment Parcels
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ordShipments.map((shp) => (
                        <div
                          key={shp.id}
                          className="border rounded p-3 bg-gray-50 text-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between">
                              <span className="font-mono font-bold text-xs">
                                {shp.shipmentNumber}
                              </span>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                                  shp.parcelType === "hazardous_agrochemical"
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-blue-100 text-blue-900"
                                }`}
                              >
                                {shp.parcelType === "hazardous_agrochemical"
                                  ? "Hazardous Chemical"
                                  : "General Goods"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              Status:{" "}
                              <strong className="uppercase">
                                {shp.status}
                              </strong>
                            </p>
                            {shp.trackingNumber && (
                              <p className="text-xs mt-1">
                                Carrier: {shp.carrierName} · Tracking:{" "}
                                {shp.trackingNumber}
                              </p>
                            )}
                          </div>

                          {canProcess && (
                            <div className="mt-3 pt-2 border-t flex flex-wrap gap-2">
                              {shp.status === "pending" && (
                                <form action={packShipmentAction}>
                                  <input
                                    type="hidden"
                                    name="shipmentId"
                                    value={shp.id}
                                  />
                                  <button
                                    type="submit"
                                    className="bg-blue-700 text-white px-2 py-1 rounded text-xs hover:bg-blue-800"
                                  >
                                    Seal & Pack
                                  </button>
                                </form>
                              )}

                              {shp.status === "packed" && (
                                <form
                                  action={dispatchShipmentAction}
                                  className="flex gap-1"
                                >
                                  <input
                                    type="hidden"
                                    name="shipmentId"
                                    value={shp.id}
                                  />
                                  <input
                                    type="text"
                                    name="trackingNumber"
                                    placeholder="Courier tracking #"
                                    required
                                    className="border px-1.5 py-0.5 rounded text-xs w-32"
                                  />
                                  <button
                                    type="submit"
                                    className="bg-indigo-700 text-white px-2 py-1 rounded text-xs hover:bg-indigo-800"
                                  >
                                    Dispatch
                                  </button>
                                </form>
                              )}

                              {shp.status === "handed_to_carrier" && (
                                <form action={deliverShipmentAction}>
                                  <input
                                    type="hidden"
                                    name="shipmentId"
                                    value={shp.id}
                                  />
                                  <button
                                    type="submit"
                                    className="bg-emerald-700 text-white px-2 py-1 rounded text-xs hover:bg-emerald-800"
                                  >
                                    Confirm Delivered
                                  </button>
                                </form>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
