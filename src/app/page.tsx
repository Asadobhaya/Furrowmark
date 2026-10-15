export const dynamic = "force-dynamic";

import Link from "next/link";
import { searchProducts } from "@/modules/catalog/service";
import { formatPKR } from "./format";
import { ProductImage } from "./components/ProductImage";
import { Logo } from "./components/Logo";

export const metadata = {
  title: "Furrowmark | Licensed Agricultural Inputs & Agrochemicals Store",
  description:
    "Official Pakistani agricultural inputs store. Certified hybrid seeds, genuine pesticides, fertilizers, and farm machinery with Punjab dealer licensing and FEFO batch dispatch.",
};

const CATEGORY_CARDS = [
  {
    slug: "plant-protection",
    title: "Plant Protection",
    desc: "Virtako 0.6% GR, Coragen 20 SC, Amistar Top, and Bayer Nativo",
    bg: "bg-purple-50/70 border-purple-200 text-purple-950 hover:border-purple-300",
    badge: "DPP Regulated",
    itemCount: "4 Formulations",
  },
  {
    slug: "fertilizers",
    title: "Fertilizers & Basal",
    desc: "Sona Urea 46% N, Engro DAP 18-46-0, and Soluble SOP 0-0-50",
    bg: "bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:border-emerald-300",
    badge: "Direct Factory Bags",
    itemCount: "3 Products",
  },
  {
    slug: "seeds",
    title: "Certified Hybrid Seeds",
    desc: "Niab-878 Cotton, Pioneer 30T60 Corn, and Certified Akbar Wheat",
    bg: "bg-amber-50/70 border-amber-200 text-amber-950 hover:border-amber-300",
    badge: "FSC&RD Certified",
    itemCount: "3 Varieties",
  },
  {
    slug: "nutrients-foliar",
    title: "Nutrients & Foliar",
    desc: "Tara Nutrivex Zinc 33% and high-bioavailability micronutrients",
    bg: "bg-cyan-50/70 border-cyan-200 text-cyan-950 hover:border-cyan-300",
    badge: "Foliar & Fertigation",
    itemCount: "2 Formulations",
  },
  {
    slug: "agricultural-tools",
    title: "Agricultural Tools",
    desc: "16L knapsack sprayers, brass nozzles, and field equipment",
    bg: "bg-sky-50/70 border-sky-200 text-sky-950 hover:border-sky-300",
    badge: "Field Equipment",
    itemCount: "1 Model",
  },
];

export default async function HomePage() {
  const featured = await searchProducts("");

  return (
    <main className="space-y-8 sm:space-y-12 pb-8 sm:pb-12">
      {/* Hero Banner with Search & Direct Helpline */}
      <section className="bg-emerald-950 text-white pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900 shadow-inner">
        <div className="max-w-5xl mx-auto space-y-6 text-center flex flex-col items-center">
          {/* Official Enterprise Emblem & Logo */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-900/60 border border-emerald-800 shadow-md">
            <Logo size="lg" variant="light" />
          </div>

          {/* Regulatory Credentials Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-emerald-900/80 border border-emerald-700/60 px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Punjab Pesticide License: DEP/MLT-AGRO/2024-8841</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">FSC&RD Seed Reg: FSCRD-PB-5592</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight sm:leading-tight">
            Certified Crop Protection, Seeds & Plant Nutrition for Pakistani Growers
          </h1>

          <p className="text-emerald-100/90 max-w-3xl mx-auto text-xs sm:text-base md:text-lg leading-relaxed">
            Direct warehouse distribution of 100% manufacturer-sealed hybrid seeds, registered agrochemicals, basal fertilizers, and foliar nutrients. Guaranteed genuine supply dispatched with lot tracking from our Multan hub.
          </p>

          {/* Quick Hero Search Input */}
          <form
            action="/products"
            method="GET"
            className="max-w-xl mx-auto flex items-center bg-white rounded-2xl p-1.5 shadow-md border border-gray-200"
          >
            <div className="flex items-center flex-1 px-3">
              <svg className="w-5 h-5 text-gray-400 shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="Search Coragen, Nativo, Urea, Cotton seeds..."
                className="w-full text-gray-900 placeholder-gray-400 text-xs sm:text-sm focus:outline-none py-1.5"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl transition shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/products"
              className="bg-white text-emerald-950 font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-emerald-50 active:scale-95 transition shadow-sm text-xs sm:text-sm flex items-center gap-2"
            >
              <span>Explore Products</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a
              href="https://wa.me/923005534323"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition shadow-sm text-xs sm:text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              <span>WhatsApp Helpline</span>
            </a>
            <Link
              href="/about"
              className="bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 font-medium px-4 py-2.5 sm:py-3 rounded-xl border border-emerald-700/60 transition text-xs sm:text-sm"
            >
              Dealership Credentials
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2.5 font-bold text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-gray-900">100% Sealed Formulations</h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-normal">
              Direct primary formulator supplies from Syngenta, FMC, Bayer, and Engro.
            </p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2.5 font-bold text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-gray-900">FEFO Lot Allocation</h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-normal">
              First-Expired, First-Out lot management ensuring maximum residual shelf-life.
            </p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2.5 font-bold text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-gray-900">Segregated Packing</h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-normal">
              Hazardous chemicals packed separately with leak-proof reinforced seals.
            </p>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2.5 font-bold text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-gray-900">Fast Biltee & Logistics</h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-normal">
              Courier parcel shipping and goods transport to all farming districts.
            </p>
          </div>
        </div>
      </section>

      {/* Category Explorer Rails */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Agricultural Product Categories
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select category to view verified batches ready for dispatch from Multan.
            </p>
          </div>
          <Link
            href="/products"
            className="text-emerald-700 hover:text-emerald-800 text-xs sm:text-sm font-semibold hover:underline"
          >
            All Products →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className={`border rounded-2xl p-4 sm:p-5 block transition-all hover:shadow-sm ${cat.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/90 px-2.5 py-0.5 rounded-full border border-black/5 shadow-2xs">
                  {cat.badge}
                </span>
                <span className="text-[11px] font-semibold text-gray-500">
                  {cat.itemCount}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-1 text-gray-950">{cat.title}</h3>
              <p className="text-xs leading-relaxed opacity-85 text-gray-800">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured In-Stock Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Featured In-Stock Products
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Genuine commercial packaging with verifiable lot numbers in stock at Multan depot.
            </p>
          </div>
          <Link
            href="/products"
            className="text-emerald-700 hover:text-emerald-800 text-xs sm:text-sm font-semibold hover:underline"
          >
            Full Catalog ({featured.length}) →
          </Link>
        </div>

        {/* 2-column on mobile, 4-column on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {featured.slice(0, 8).map((p) => (
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
                <h3
                  className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-emerald-800 line-clamp-2 leading-snug"
                  title={p.name}
                >
                  {p.name}
                </h3>
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
      </section>

      {/* Multan Depot Physical Footprint & Advisory Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs px-3 py-1 rounded-full font-medium">
              <span>Multan Regional Hub</span>
              <span>·</span>
              <span>Southern Punjab</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold">
              Need Field Crop Advisory or Bulk Consignment Dispatch?
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Visit our physical depot at Basti Bair Wala, Mouza Mardan Pur, Multan, or connect directly on WhatsApp with our agronomist desk for chemical mixing advice, tank compatibility, and Goods Transport (Biltee) consignments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href="https://wa.me/923005534323"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-2 active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              <span>Chat on WhatsApp</span>
            </a>
            <Link
              href="/contact"
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition shadow-xs text-center active:scale-95"
            >
              Open Support Ticket
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
