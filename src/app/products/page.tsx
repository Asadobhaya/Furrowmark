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
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <li key={p.id} className="border rounded p-4 flex flex-col h-full">
            <Link href={`/products/${p.id}`}>
              {/* Image placeholder - real packshot must be uploaded before publishing */}
              <div
                className="bg-gray-200 h-40 flex items-center justify-center mb-2"
                aria-hidden="true"
              >
                <span className="text-sm text-gray-600">Image required</span>
              </div>
              <h2 className="text-lg font-medium mb-1" title={p.name}>
                {p.name}
              </h2>
            </Link>
            <p className="text-sm text-gray-600">{p.brandName}</p>
            <p className="text-green-800 font-semibold mt-auto">
              From {formatPKR(p.startingPriceMinor)}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
