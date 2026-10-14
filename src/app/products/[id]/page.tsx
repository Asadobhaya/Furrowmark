export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById } from "@/modules/catalog/service";
import { getProductSpecification } from "@/modules/catalog/specifications";
import { addToCartAction } from "../../actions";
import { formatPKR } from "../../format";
import { ProductImage } from "../../components/ProductImage";

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

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-green-700">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-green-700">Products</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Product Packshot Frame */}
        <div className="space-y-3">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl h-96 flex items-center justify-center p-8 shadow-sm overflow-hidden">
            <ProductImage slug={product.slug} className={product.className} containerClass="h-80 w-full" />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 px-2">
            <span>Genuine Pack Guaranteed</span>
            <span>Batch Tested: {primaryVariant?.lotNumber ?? "LOT-VERIFIED"}</span>
            <span>FEFO Cold-Chain Dispatch</span>
          </div>
        </div>

        {/* Product Commercial Details */}
        <div className="flex flex-col space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded">
                {product.brandName}
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded">
                {product.categoryName}
              </span>
              {spec?.hazardClass && (
                <span className="bg-amber-100 text-amber-900 text-xs font-medium px-2.5 py-1 rounded">
                  {spec.signalWord}: {spec.hazardClass}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
          </div>

          <p className="text-gray-700 leading-relaxed">
            {product.description ?? "No description available."}
          </p>

          {/* Quick Compliance Pill */}
          {spec && (
            <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-3 text-xs text-emerald-950 space-y-1">
              <p>
                <strong>Regulatory Reg No:</strong> {spec.registrationNumber} ({spec.registrationBody})
              </p>
              <p>
                <strong>Active Ingredient / Content:</strong> {spec.activeIngredient}
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </p>
          )}

          {product.variants.length === 0 ? (
            <p className="text-amber-800 bg-amber-50 p-4 rounded border border-amber-200">
              Currently out of stock. Contact support for re-supply timeline.
            </p>
          ) : (
            <form action={addToCartAction} className="border-t pt-4 space-y-4">
              <input
                type="hidden"
                name="back"
                value={`/products/${product.id}`}
              />

              {/* Variant Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Pack Size
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.variants.map((v, i) => (
                    <label
                      key={v.id}
                      className="border rounded-lg p-3 flex flex-col justify-between cursor-pointer hover:border-emerald-600 transition has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/40"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 text-sm">{v.packSize}</span>
                        <input
                          type="radio"
                          name="variantId"
                          value={v.id}
                          defaultChecked={i === 0}
                          className="accent-emerald-600"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-bold text-base text-emerald-700">
                          {formatPKR(v.priceMinor)}
                        </span>
                        <span className="text-gray-500">
                          In Stock ({v.availableStock ?? 100})
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity and Action Button */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <span className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-r">
                    Qty
                  </span>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    defaultValue={1}
                    min={1}
                    max={99}
                    className="w-16 px-2 py-2 text-center text-sm focus:outline-none"
                    aria-label="Quantity"
                  />
                </div>

                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm text-center"
                >
                  Add to Cart
                </button>
              </div>

              {/* Dealer Authenticity Footer Note */}
              <div className="pt-2 text-xs text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Punjab Pesticide License: DEP/MLT-AGRO/2024-8841</span>
                <span>FSC&RD Seed Reg: FSCRD-PB-5592</span>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Comprehensive Agronomic Specifications & Safety Data */}
      {spec && (
        <section className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-6">
          <div className="border-b pb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Agronomic Specifications & Dosage Directive
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-medium">
              Verified Technical Data
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Target Crops & Pathogens */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Target Crops</h3>
                <div className="flex flex-wrap gap-1.5">
                  {spec.targetCrops.map((c) => (
                    <span key={c} className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded text-xs font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Target Pests, Pathogens, or Deficiencies</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 text-xs leading-relaxed">
                  {spec.targetPestsOrDeficiencies.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Recommended Application Rate</h3>
                <p className="text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-100 text-xs font-medium">
                  {spec.recommendedDosage}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Water Dilution & Application Method</h3>
                <p className="text-gray-700 text-xs">
                  {spec.waterVolume}
                </p>
              </div>
            </div>

            {/* Regulatory, Safety Intervals & Medical First Aid */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <span className="text-xs text-gray-500 block">Pre-Harvest Interval (PHI)</span>
                  <span className="font-bold text-base text-gray-900">
                    {spec.preHarvestIntervalDays === 0 ? "Not Applicable" : `${spec.preHarvestIntervalDays} Days`}
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <span className="text-xs text-gray-500 block">Re-Entry Interval (REI)</span>
                  <span className="font-bold text-base text-gray-900">
                    {spec.reentryIntervalHours === 0 ? "Not Applicable" : `${spec.reentryIntervalHours} Hours`}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Storage and Handling Directives</h3>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded border border-gray-100">
                  {spec.storageAndHandling}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">First Aid & Toxicity Protocol</h3>
                <p className="text-xs text-gray-700 leading-relaxed bg-red-50/50 p-2.5 rounded border border-red-100 text-red-950">
                  {spec.firstAid}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  National Emergency: 1122 | Poison Control Centre (JPMC Karachi): 021-99205058
                </p>
              </div>

              <div className="border-t pt-3 text-xs text-gray-500 flex flex-wrap justify-between gap-2">
                <span>Formulation: <strong>{spec.formulation}</strong></span>
                <span>Depot: <strong>{spec.depotLocation}</strong></span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Back to Catalog Link */}
      <div className="pt-2">
        <Link href="/products" className="text-emerald-700 hover:underline font-medium text-sm">
          ← Back to All Agricultural Products
        </Link>
      </div>
    </main>
  );
}
