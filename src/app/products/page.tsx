export const dynamic = "force-dynamic";

import Link from "next/link";
import { searchProducts } from "@/modules/catalog/service";
import { formatPKR } from "../format";
import { ProductImage } from "../components/ProductImage";

export const metadata = {
  title: "Products & Agricultural Supplies Catalog | Furrowmark",
  description:
    "Explore certified hybrid seeds, basal fertilizers, plant protection agrochemicals, chelated micronutrients, and knapsack sprayers with verified batch tracking in Pakistan.",
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

const CATEGORIES = [
  { slug: "all", label: "All Products" },
  { slug: "seeds", label: "Seeds" },
  { slug: "fertilizers", label: "Fertilizers" },
  { slug: "plant-protection", label: "Plant Protection" },
  { slug: "nutrients-foliar", label: "Nutrients & Foliar" },
  { slug: "agricultural-tools", label: "Agricultural Tools" },
];

export default async function ProductList({ searchParams }: Props) {
  const { q, category } = await searchParams;
  const query = q ?? "";
  const activeCategory = category ?? "all";
  const products = await searchProducts(query, activeCategory);

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Agricultural Inputs Catalog
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Certified authentic seeds, plant nutrition, crop protection, and spray machinery.
          </p>
        </div>

        <form method="GET" className="flex items-center gap-2">
          {activeCategory !== "all" && (
            <input type="hidden" name="category" value={activeCategory} />
          )}
          <input
            name="q"
            defaultValue={query}
            placeholder="Search products or brands..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-60 md:w-72 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            aria-label="Search products"
          />
          <button
            type="submit"
            className="bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          const href =
            cat.slug === "all"
              ? query
                ? `/products?q=${encodeURIComponent(query)}`
                : "/products"
              : query
                ? `/products?category=${cat.slug}&q=${encodeURIComponent(query)}`
                : `/products?category=${cat.slug}`;

          return (
            <Link
              key={cat.slug}
              href={href}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                isSelected
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Product Results */}
      {products.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center space-y-3">
          <p className="text-gray-700 font-medium">
            No products found matching your filter criteria.
          </p>
          <Link
            href="/products"
            className="inline-block text-sm text-emerald-700 hover:underline font-medium"
          >
            View all products
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <li
              key={p.id}
              className="border border-gray-200 rounded-xl p-4 flex flex-col h-full bg-white shadow-sm hover:shadow-md transition"
            >
              <Link href={`/products/${p.id}`} className="block mb-3">
                <div className="bg-gray-50 border border-gray-100 rounded-lg h-52 flex items-center justify-center p-4 mb-3 overflow-hidden">
                  <ProductImage
                    slug={p.slug}
                    className={p.className}
                    containerClass="h-48 w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {p.brandName}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {p.categoryName}
                  </span>
                </div>
                <h2
                  className="text-base font-semibold text-gray-900 hover:text-emerald-700 line-clamp-2"
                  title={p.name}
                >
                  {p.name}
                </h2>
              </Link>

              <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 block">Starting from</span>
                  <span className="text-emerald-800 text-lg font-bold">
                    {formatPKR(p.startingPriceMinor)}
                  </span>
                  <span
                    className={`block text-[11px] font-medium mt-0.5 ${
                      p.totalAvailableStock > 0
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {p.totalAvailableStock > 0
                      ? `In Stock (${p.totalAvailableStock} packs)`
                      : "Out of Stock"}
                  </span>
                </div>
                <Link
                  href={`/products/${p.id}`}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-xs px-3 py-1.5 rounded-md transition"
                >
                  View Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
