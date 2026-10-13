export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { requireStaffPermission } from "@/modules/web/session";
import { listAllStaffProducts } from "@/modules/catalog/service";
import {
  createProductAction,
  updateProductStatusAction,
  deleteProductAction,
  staffLogoutAction,
} from "../../actions";
import { formatPKR } from "../../format";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function StaffProductsPage({ searchParams }: Props) {
  const staff = await requireStaffPermission("catalog:read");
  if (!staff) redirect("/staff/login");

  const canWrite = !!(await requireStaffPermission("catalog:write"));
  const { error } = await searchParams;
  const products = await listAllStaffProducts();

  const publishedCount = products.filter((p) => p.status === "published").length;
  const archivedCount = products.filter((p) => p.status === "archived").length;
  const draftCount = products.filter((p) => p.status === "draft").length;

  return (
    <main className="p-4 max-w-6xl mx-auto space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Product Catalog & Inventory</h1>
          <p className="text-sm text-gray-600">
            Add, update pricing, unpublish, or delete store products
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/staff/products"
            className="text-sm font-semibold text-green-700 underline"
          >
            Products
          </Link>
          <Link href="/staff/orders" className="text-sm underline">
            Orders
          </Link>
          <Link href="/staff/fulfilment" className="text-sm underline">
            Fulfilment
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
        <p role="alert" className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm">
          {error}
        </p>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="border rounded p-4 bg-white shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Total Products</span>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="border rounded p-4 bg-green-50 shadow-sm border-green-200">
          <span className="text-xs text-green-700 font-medium">Published (Live)</span>
          <p className="text-2xl font-bold text-green-800">{publishedCount}</p>
        </div>
        <div className="border rounded p-4 bg-yellow-50 shadow-sm border-yellow-200">
          <span className="text-xs text-yellow-700 font-medium">Drafts</span>
          <p className="text-2xl font-bold text-yellow-800">{draftCount}</p>
        </div>
        <div className="border rounded p-4 bg-gray-50 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Archived / Hidden</span>
          <p className="text-2xl font-bold text-gray-700">{archivedCount}</p>
        </div>
      </div>

      {/* Add New Product Section */}
      {canWrite && (
        <section className="border rounded p-6 bg-white shadow-sm space-y-4">
          <h2 className="text-lg font-bold">Add New Agricultural Product</h2>
          <form action={createProductAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Hybrid Cotton Seed BS-15"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agricultural Class *
              </label>
              <select
                name="className"
                required
                defaultValue="seed"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="seed">Seed</option>
                <option value="fertiliser">Fertiliser</option>
                <option value="nutrient">Nutrient</option>
                <option value="pesticide">Pesticide</option>
                <option value="tool">Tool</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                name="categoryName"
                required
                placeholder="e.g. Cotton Seeds, Fertilizers, Weedicides"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand / Manufacturer *
              </label>
              <input
                type="text"
                name="brandName"
                required
                placeholder="e.g. Engro, Syngenta, Bayer, FMC"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pack Size *
              </label>
              <input
                type="text"
                name="packSize"
                required
                placeholder="e.g. 10 kg Bag, 1 L Bottle, 50 kg Bag"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price in PKR *
              </label>
              <input
                type="number"
                name="priceMinor"
                required
                min={1}
                placeholder="e.g. 4500"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description & Agricultural Instructions *
              </label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="Details on crop suitability, soil types, application method, dosage, or registration number."
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Status
              </label>
              <select
                name="status"
                defaultValue="published"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="published">Published (Live in Store)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white rounded px-6 py-2 text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-800"
              >
                Add Product to Catalog
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Existing Products Table */}
      <section className="border rounded p-6 bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-bold">Existing Products ({products.length})</h2>
        {products.length === 0 ? (
          <p className="text-gray-500 text-sm">No products in the catalog yet. Use the form above to add your first item.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Pack & Price</th>
                  <th className="p-3">Status</th>
                  {canWrite && <th className="p-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => {
                  const firstVariant = p.variants[0];
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">
                        {p.name}
                        {firstVariant && (
                          <span className="block text-xs text-gray-500">
                            SKU: {firstVariant.sku}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-700">{p.categoryName}</td>
                      <td className="p-3 text-gray-700">{p.brandName}</td>
                      <td className="p-3 capitalize text-gray-700">{p.className}</td>
                      <td className="p-3">
                        {firstVariant ? (
                          <div>
                            <span className="font-semibold text-green-800">
                              {formatPKR(firstVariant.priceMinor)}
                            </span>
                            <span className="block text-xs text-gray-500">
                              {firstVariant.packSize}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No variant</span>
                        )}
                      </td>
                      <td className="p-3">
                        {p.status === "published" && (
                          <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800 font-semibold">
                            Published
                          </span>
                        )}
                        {p.status === "draft" && (
                          <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 font-semibold">
                            Draft
                          </span>
                        )}
                        {p.status === "archived" && (
                          <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 font-semibold">
                            Archived
                          </span>
                        )}
                      </td>
                      {canWrite && (
                        <td className="p-3 text-right space-x-2 whitespace-nowrap">
                          {p.status === "published" ? (
                            <form
                              action={updateProductStatusAction}
                              className="inline-block"
                            >
                              <input type="hidden" name="productId" value={p.id} />
                              <input type="hidden" name="status" value="archived" />
                              <button
                                type="submit"
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded border"
                              >
                                Unpublish
                              </button>
                            </form>
                          ) : (
                            <form
                              action={updateProductStatusAction}
                              className="inline-block"
                            >
                              <input type="hidden" name="productId" value={p.id} />
                              <input type="hidden" name="status" value="published" />
                              <button
                                type="submit"
                                className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded border border-green-300"
                              >
                                Publish
                              </button>
                            </form>
                          )}

                          <form
                            action={deleteProductAction}
                            className="inline-block"
                          >
                            <input type="hidden" name="productId" value={p.id} />
                            <button
                              type="submit"
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded border border-red-200"
                            >
                              Delete
                            </button>
                          </form>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
