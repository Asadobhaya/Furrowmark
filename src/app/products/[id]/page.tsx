export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById } from "@/modules/catalog/service";
import { getProductSpecification } from "@/modules/catalog/specifications";
import { addToCartAction } from "../../actions";
import { formatPKR } from "../../format";
import { ProductImage } from "../../components/ProductImage";
import { QuantityStepper } from "../../components/QuantityStepper";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return {
      title: "Product Not Found | Furrowmark",
      description: "The requested agricultural input could not be found.",
    };
  }
  const spec = getProductSpecification(product.slug);
  const aiInfo = spec?.activeIngredient ? ` ${spec.activeIngredient}.` : "";
  return {
    title: `${product.name} | Furrowmark`,
    description: `${product.brandName} ${product.name}.${aiInfo} Certified genuine Pakistani agricultural supply with FEFO batch dispatch from Multan warehouse.`,
  };
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const product = await getProductById(id);
  if (!product) notFound();

  const spec = getProductSpecification(product.slug);
  const primaryVariant = product.variants[0];

  const whatsappInquiryUrl = `https://wa.me/923005534323?text=${encodeURIComponent(
    `Hello Furrowmark Depot, I am inquiring about ${product.name} (${product.brandName}). Please provide dosage and availability guidance.`
  )}`;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto no-scrollbar py-1">
        <Link href="/" className="hover:text-emerald-800 shrink-0">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-emerald-800 shrink-0">Products</Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main Product Overview Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-start">
        {/* Product Packshot Frame */}
        <div className="space-y-3">
          <div className="bg-white border border-gray-200/90 rounded-3xl h-80 sm:h-96 flex items-center justify-center p-6 sm:p-8 shadow-xs overflow-hidden">
            <ProductImage
              slug={product.slug}
              className={product.className}
              containerClass="h-68 sm:h-80 w-full"
            />
          </div>
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between text-[11px] text-gray-600 gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              100% Sealed Pack
            </span>
            <span>Batch: <strong>{primaryVariant?.lotNumber ?? "LOT-VERIFIED"}</strong></span>
            <span>FEFO Dispatch</span>
          </div>
        </div>

        {/* Product Commercial Details */}
        <div className="flex flex-col space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-lg">
                {product.brandName}
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                {product.categoryName}
              </span>
              {spec?.hazardClass && (
                <span className="bg-amber-100 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {spec.signalWord}: {spec.hazardClass}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-gray-950 tracking-tight leading-tight">
              {product.name}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {product.description ?? "No description available."}
          </p>

          {/* Regulatory Compliance Box */}
          {spec && (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-3.5 text-xs text-emerald-950 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold">DPP / FSC&RD Reg No:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  {spec.registrationNumber}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold shrink-0">Active Ingredient:</span>
                <span className="text-right font-medium text-emerald-900">{spec.activeIngredient}</span>
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          {product.variants.length === 0 ? (
            <div className="text-amber-900 bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs sm:text-sm">
              Currently out of stock. Contact our Multan depot desk for consignment re-supply schedule.
            </div>
          ) : (
            <form action={addToCartAction} className="border-t border-gray-200 pt-4 space-y-5">
              <input type="hidden" name="back" value={`/products/${product.id}`} />

              {/* Variant Selector */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">
                  Select Pack Size & Formulation
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.variants.map((v, i) => (
                    <label
                      key={v.id}
                      className="border border-gray-200 rounded-2xl p-3 flex flex-col justify-between cursor-pointer hover:border-emerald-600 transition bg-white shadow-2xs has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50/40 has-[:checked]:ring-1 has-[:checked]:ring-emerald-700"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-gray-900 text-xs sm:text-sm">{v.packSize}</span>
                        <input
                          type="radio"
                          name="variantId"
                          value={v.id}
                          defaultChecked={i === 0}
                          className="accent-emerald-700 w-4 h-4"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                        <span className="font-extrabold text-sm sm:text-base text-emerald-900">
                          {formatPKR(v.priceMinor)}
                        </span>
                        <span
                          className={`font-semibold text-[11px] ${
                            (v.availableStock ?? 0) > 0 ? "text-emerald-700" : "text-red-600"
                          }`}
                        >
                          {(v.availableStock ?? 0) > 0
                            ? `In Stock (${v.availableStock})`
                            : "Out of Stock"}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Responsive Quantity Stepper & Add to Cart Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <span className="text-xs font-bold text-gray-600">Quantity:</span>
                  <QuantityStepper
                    name="quantity"
                    initialValue={1}
                    min={1}
                    max={primaryVariant?.availableStock ?? 99}
                  />
                </div>

                <button
                  type="submit"
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-xs text-center flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Add to Cart</span>
                </button>
              </div>

              {/* Direct WhatsApp Agronomist Advice Button */}
              <div className="pt-1">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-50 hover:bg-green-100 text-green-900 border border-green-300 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition active:scale-98"
                >
                  <svg className="w-4 h-4 fill-current text-green-700" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                  <span>Ask Multan Agronomist on WhatsApp about this Formulation</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Comprehensive Agronomic Specifications & Safety Data */}
      {spec && (
        <section className="border border-gray-200/90 rounded-3xl p-5 sm:p-8 bg-white shadow-2xs space-y-6">
          <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                Agronomic Specifications & Application Directive
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Statutory dosage, water volume, and pre-harvest safety guidelines.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold w-fit">
              Verified Technical Leaflet
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            {/* Left: Agronomic targets & rates */}
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-1.5">Target Crops</h3>
                <div className="flex flex-wrap gap-1.5">
                  {spec.targetCrops.map((c) => (
                    <span key={c} className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1.5">Target Pests, Pathogens, or Deficiencies</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 leading-relaxed">
                  {spec.targetPestsOrDeficiencies.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">Recommended Application Rate</h3>
                <div className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200 font-semibold">
                  {spec.recommendedDosage}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">Water Dilution & Application Method</h3>
                <p className="text-gray-700 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  {spec.waterVolume}
                </p>
              </div>
            </div>

            {/* Right: Regulatory intervals & First Aid */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5">
                  <span className="text-[11px] text-gray-500 font-medium block">Pre-Harvest Interval (PHI)</span>
                  <span className="font-extrabold text-sm sm:text-base text-gray-900 mt-0.5 block">
                    {spec.preHarvestIntervalDays === 0 ? "Not Applicable" : `${spec.preHarvestIntervalDays} Days`}
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5">
                  <span className="text-[11px] text-gray-500 font-medium block">Re-Entry Interval (REI)</span>
                  <span className="font-extrabold text-sm sm:text-base text-gray-900 mt-0.5 block">
                    {spec.reentryIntervalHours === 0 ? "Not Applicable" : `${spec.reentryIntervalHours} Hours`}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">Storage & Handling Protocol</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {spec.storageAndHandling}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">First Aid & Emergency Directive</h3>
                <div className="text-red-950 bg-red-50/70 p-3 rounded-xl border border-red-200 leading-relaxed">
                  <p>{spec.firstAid}</p>
                  <p className="text-[11px] text-red-700 font-bold mt-2 pt-2 border-t border-red-200/60">
                    Emergency: 1122 | Poison Control (JPMC Karachi): 021-99205058
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Return to Products Link */}
      <div className="pt-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-emerald-800 hover:text-emerald-900 font-semibold text-xs sm:text-sm hover:underline"
        >
          <span>← Back to All Agricultural Products</span>
        </Link>
      </div>
    </main>
  );
}
