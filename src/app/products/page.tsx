export const dynamic = "force-dynamic";

import Link from "next/link";
import { searchProducts } from "@/modules/catalog/service";
import { formatPKR } from "../format";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ProductList({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q ?? "";
  const products = await searchProducts(query);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <form method="GET" className="mb-6">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search products…"
          className="border rounded px-2 py-1 w-64 focus:outline-none focus:ring-2 focus:ring-green-600"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="ml-2 bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-800"
        >
          Search
        </button>
      </form>
      {products.length === 0 && <p>No products found.</p>}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <li key={p.id} className="border border-gray-200 rounded-lg p-4 flex flex-col h-full bg-white shadow-sm hover:shadow-md transition">
            <Link href={`/products/${p.id}`} className="block mb-3">
              <div className="bg-gray-50 border border-gray-100 rounded-md h-48 flex items-center justify-center p-3 mb-3 overflow-hidden">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="max-h-full max-w-full object-contain hover:scale-105 transition duration-200"
                />
              </div>
              <h2 className="text-base font-semibold text-gray-900 mb-1 hover:text-green-700 line-clamp-2" title={p.name}>
                {p.name}
              </h2>
            </Link>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{p.brandName}</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded">{p.categoryName}</span>
            </div>
            <p className="text-green-800 text-lg font-bold mt-auto pt-2 border-t border-gray-100">
              From {formatPKR(p.startingPriceMinor)}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
