export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/modules/catalog/service";
import { addToCartAction } from "../../actions";
import { formatPKR } from "../../format";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function ProductDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <main className="p-4">
      <nav className="mb-4">
        <Link href="/products" className="text-green-600 hover:underline">
          ← Back to products
        </Link>
      </nav>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-gray-50 border border-gray-200 rounded-xl h-80 flex items-center justify-center p-6 shadow-sm overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2" title={product.name}>
            {product.name}
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            {product.brandName} · {product.categoryName}
          </p>
          <p className="mb-4 whitespace-pre-line">
            {product.description ?? "No description available."}
          </p>

          {error && (
            <p role="alert" className="mb-4 text-red-700">
              {error}
            </p>
          )}

          {product.variants.length === 0 ? (
            <p>Currently unavailable.</p>
          ) : (
            <form action={addToCartAction} className="space-y-3">
              <input
                type="hidden"
                name="back"
                value={`/products/${product.id}`}
              />
              <fieldset>
                <legend className="font-medium mb-1">Pack size</legend>
                {product.variants.map((v, i) => (
                  <label key={v.id} className="flex items-center mb-1">
                    <input
                      type="radio"
                      name="variantId"
                      value={v.id}
                      defaultChecked={i === 0}
                      className="mr-2"
                    />
                    {v.packSize} - {formatPKR(v.priceMinor)}
                  </label>
                ))}
              </fieldset>
              <div className="flex items-center gap-2">
                <label htmlFor="quantity" className="sr-only">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  defaultValue={1}
                  min={1}
                  max={99}
                  className="border rounded px-2 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-800"
                >
                  Add to cart
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
