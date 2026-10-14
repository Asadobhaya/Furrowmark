export const dynamic = "force-dynamic";

import Link from "next/link";
import { searchProducts } from "@/modules/catalog/service";
import { formatPKR } from "./format";
import { ProductImage } from "./components/ProductImage";

export const metadata = {
  title: "Furrowmark | Licensed Agricultural Inputs & Agrochemicals Store",
  description:
    "Official Pakistani agricultural inputs store. Certified hybrid seeds, genuine pesticides, fertilizers, and farm machinery with Punjab dealer licensing and FEFO batch dispatch.",
};

const CATEGORY_CARDS = [
  {
    slug: "seeds",
    title: "Certified Seeds",
    desc: "Cotton BS-15, Pioneer 30Y87 corn, and Faisalabad wheat",
    bg: "bg-amber-50 border-amber-200 text-amber-950",
    badge: "FSC&RD Certified",
  },
  {
    slug: "fertilizers",
    title: "Macronutrient Fertilizers",
    desc: "Sona Urea 46% N, Engro DAP 18-46-0, and Soluble SOP 0-0-50",
    bg: "bg-emerald-50 border-emerald-200 text-emerald-950",
    badge: "Direct Factory Bags",
  },
  {
    slug: "plant-protection",
    title: "Plant Protection",
    desc: "Virtako 0.6% GR, Coragen 20 SC, Amistar Top, and Bayer Nativo",
    bg: "bg-purple-50 border-purple-200 text-purple-950",
    badge: "DPP Regulated",
  },
  {
    slug: "nutrients-foliar",
    title: "Nutrients & Foliar",
    desc: "Engro Zorawar Zinc 33% and high-bioavailability micronutrients",
    bg: "bg-cyan-50 border-cyan-200 text-cyan-950",
    badge: "Foliar & Fertigation",
  },
  {
    slug: "agricultural-tools",
    title: "Agricultural Tools",
    desc: "Rechargeable 16L knapsack sprayers, brass lances, and spray spares",
    bg: "bg-sky-50 border-sky-200 text-sky-950",
    badge: "Field Equipment",
  },
];

export default async function HomePage() {
  const featured = await searchProducts("");

  return (
    <main className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-emerald-900 text-white py-14 px-4 md:px-8 border-b border-emerald-800">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/50 px-3 py-1 rounded-full text-xs font-medium text-emerald-200">
            <span>Punjab Pesticide License: DEP/MLT-AGRO/2024-8841</span>
            <span>·</span>
            <span>FSC&RD Seed Reg: FSCRD-PB-5592</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Certified Agricultural Inputs for Pakistani Growers
          </h1>

          <p className="text-emerald-100 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
            Direct warehouse distribution of 100% manufacturer-sealed hybrid seeds, registered agrochemicals, basal fertilizers, and foliar nutrients. Guaranteed genuine supply dispatched with lot tracking from our Multan hub.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/products"
              className="bg-white text-emerald-900 font-bold px-6 py-3 rounded-lg hover:bg-emerald-50 transition shadow"
            >
              Browse Catalog
            </Link>
            <Link
              href="/about"
              className="bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold px-6 py-3 rounded-lg border border-emerald-700 transition"
            >
              Dealership & Credentials
            </Link>
            <Link
              href="/contact"
              className="bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold px-6 py-3 rounded-lg border border-emerald-700 transition"
            >
              Depot Contact & Support
            </Link>
          </div>
        </div>
      </section>

      {/* Official Dealer Licensing & Quality Commitment */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-1">
            <h3 className="font-bold text-gray-900">100% Factory Sealed</h3>
            <p className="text-xs text-gray-600">
              Direct formulator supply from Syngenta, FMC, Bayer, Engro, and Fauji.
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-1">
            <h3 className="font-bold text-gray-900">FEFO Lot Tracking</h3>
            <p className="text-xs text-gray-600">
              First-Expired, First-Out lot management ensuring maximum residual shelf-life.
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-1">
            <h3 className="font-bold text-gray-900">Segregated Dispatch</h3>
            <p className="text-xs text-gray-600">
              Hazardous chemicals packed separately in reinforced leak-proof packaging.
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-1">
            <h3 className="font-bold text-gray-900">Nationwide Delivery</h3>
            <p className="text-xs text-gray-600">
              Courier parcel shipping and goods transport (Biltee) to farming districts.
            </p>
          </div>
        </div>
      </section>

      {/* Category Navigation Cards */}
      <section className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Explore Agricultural Categories
          </h2>
          <Link
            href="/products"
            className="text-emerald-700 text-sm font-semibold hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className={`border rounded-xl p-5 block transition hover:shadow-md ${cat.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/80 px-2.5 py-0.5 rounded-full border border-black/5">
                  {cat.badge}
                </span>
                <span className="text-xs font-semibold">Explore →</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{cat.title}</h3>
              <p className="text-xs leading-relaxed opacity-90">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured In-Stock Catalog Items */}
      <section className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Featured In-Stock Products
            </h2>
            <p className="text-xs text-gray-500">
              Authentic packaging with batch allocation ready for shipment from Multan depot.
            </p>
          </div>
          <Link
            href="/products"
            className="text-emerald-700 text-sm font-semibold hover:underline"
          >
            Full Catalog ({featured.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.slice(0, 8).map((p) => (
            <div
              key={p.id}
              className="border border-gray-200 rounded-xl p-4 flex flex-col bg-white shadow-sm hover:shadow-md transition"
            >
              <Link href={`/products/${p.id}`} className="block mb-2">
                <div className="bg-gray-50 border border-gray-100 rounded-lg h-44 flex items-center justify-center p-3 mb-2 overflow-hidden">
                  <ProductImage
                    slug={p.slug}
                    className={p.className}
                    containerClass="h-40 w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                  <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {p.brandName}
                  </span>
                  <span>{p.categoryName}</span>
                </div>
                <h3
                  className="text-sm font-semibold text-gray-900 hover:text-emerald-700 line-clamp-2"
                  title={p.name}
                >
                  {p.name}
                </h3>
              </Link>

              <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 block">From</span>
                  <span className="text-emerald-800 text-base font-bold">
                    {formatPKR(p.startingPriceMinor)}
                  </span>
                </div>
                <Link
                  href={`/products/${p.id}`}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-xs px-2.5 py-1 rounded transition"
                >
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advisory & Multan Depot Physical Footprint */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gray-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold">
              Need Field Advisory or Bulk Consignment Dispatch?
            </h2>
            <p className="text-gray-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Visit our physical depot at Grain & Seed Market, Multan, or file a support ticket for crop dosage advisory, bulk commercial seed bookings, and Goods Transport (Biltee) logistics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition shadow"
            >
              Open Support Ticket
            </Link>
            <Link
              href="/about"
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold px-5 py-2.5 rounded-lg border border-gray-700 transition"
            >
              About Our Dealership
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
