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
  { slug: "agricultural-tools", label: "Tools & Sprayers" },
];

export default async function ProductList({ searchParams }: Props) {
  const { q, category } = await searchParams;
  const query = q ?? "";
  const activeCategory = category ?? "all";
  const products = await searchProducts(query, activeCategory);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Catalog Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Agricultural Inputs Catalog
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Certified authentic seeds, plant nutrition, crop protection, and spray machinery.
          </p>
        </div>

        {/* Responsive Search Form */}
        <form method="GET" action="/products" className="flex items-center gap-2 w-full md:w-auto">
          {activeCategory !== "all" && (
            <input type="hidden" name="category" value={activeCategory} />
          )}
          <div className="relative flex-1 md:w-72">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search formulation or brand..."
              className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
              aria-label="Search products"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition active:scale-95 shrink-0 shadow-2xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Filter Rail (Horizontally scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 shrink-0 border ${
                isSelected
                  ? "bg-emerald-800 text-white border-emerald-800 shadow-2xs"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Product Results */}
      {products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-900 font-bold text-base">
            No products found matching your search.
          </p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try searching for common chemical names like Coragen, Nativo, Urea, or browse our standard categories.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-block bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-emerald-800 transition shadow-2xs"
            >
              Reset Filters & View All
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="border border-gray-200/90 rounded-2xl p-3 sm:p-4 flex flex-col bg-white shadow-2xs hover:shadow-xs transition"
            >
              <Link href={`/products/${p.id}`} className="block mb-2 group">
                <div className="bg-gray-50/80 border border-gray-100 rounded-xl h-36 sm:h-44 flex items-center justify-center p-2 sm:p-3 mb-2 overflow-hidden">
                  <ProductImage
                    slug={p.slug}
                    className={p.className}
                    containerClass="h-32 sm:h-38 w-full group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 mb-1">
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {p.brandName}
                  </span>
                  <span className="truncate max-w-[80px] text-right">{p.categoryName}</span>
                </div>
                <h2
                  className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-emerald-800 line-clamp-2 leading-snug"
                  title={p.name}
                >
                  {p.name}
                </h2>
              </Link>

              <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <span className="text-[10px] text-gray-400 block">Starting from</span>
                  <span className="text-emerald-900 text-sm sm:text-base font-extrabold">
                    {formatPKR(p.startingPriceMinor)}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        p.totalAvailableStock > 0 ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    ></span>
                    <span
                      className={`text-[10px] font-semibold ${
                        p.totalAvailableStock > 0 ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {p.totalAvailableStock > 0
                        ? `${p.totalAvailableStock} in stock`
                        : "Out of Stock"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/products/${p.id}`}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs px-3 py-1.5 rounded-xl transition text-center active:scale-95 border border-emerald-200/60"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
