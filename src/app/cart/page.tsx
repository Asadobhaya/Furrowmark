export const dynamic = "force-dynamic";

import Link from "next/link";
import { CartService } from "@/modules/cart/service";
import { getCartId } from "@/modules/web/session";
import { updateCartAction } from "../actions";
import { formatPKR } from "../format";

export const metadata = {
  title: "Shopping Cart | Furrowmark",
  description:
    "Review agricultural items in your cart, calculate shipping, and proceed to secure checkout.",
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function CartPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const cartId = await getCartId(false);
  const cart = cartId ? await CartService.getCartView({ cartId }) : null;
  const items = cart?.items ?? [];
  const quote = cart?.quote;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Title */}
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Verified agricultural consignments from Multan depot.
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs sm:text-sm font-semibold text-emerald-800 hover:underline"
        >
          ← Continue Shopping
        </Link>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border border-gray-200/90 rounded-3xl p-8 sm:p-14 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Your Cart is Currently Empty</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Explore our certified seeds, plant protection agrochemicals, and balanced fertilizers.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-block bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition shadow-xs"
            >
              Browse Agricultural Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {item.sku}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      FEFO Stock Ready
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Unit Price: {formatPKR(item.unitPriceMinor)}
                  </p>
                  <p className="text-sm font-extrabold text-emerald-900 pt-1">
                    Line Total: {formatPKR(item.lineSubtotalMinor)}
                  </p>
                </div>

                {/* Quantity update and delete Form */}
                <form
                  action={updateCartAction}
                  className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0"
                >
                  <input type="hidden" name="variantId" value={item.variantId} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Qty:</span>
                    <input
                      type="number"
                      name="quantity"
                      min={0}
                      max={99}
                      defaultValue={item.quantity}
                      className="border border-gray-300 rounded-xl w-16 px-2.5 py-1.5 text-center text-sm font-bold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                      aria-label="Quantity (set 0 to remove item)"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-gray-100 hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 border border-gray-200 text-xs font-semibold px-3 py-2 rounded-xl transition active:scale-95"
                  >
                    Update
                  </button>

                  <button
                    type="submit"
                    name="quantity"
                    value={0}
                    className="text-gray-400 hover:text-red-600 p-2 rounded-xl transition"
                    title="Remove item"
                    aria-label="Remove item from cart"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </form>
              </div>
            ))}

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <span className="font-bold">Guaranteed Genuine Dispatch Guarantee:</span> All agrochemicals and seeds are pulled from air-conditioned, temperature-monitored inventory in Multan with verified lot numbers and tamper-proof seals.
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          {quote && (
            <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-bold text-gray-900">{formatPKR(quote.subtotalMinor)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax / Statutory Reg Duty</span>
                  <span className="font-medium text-gray-900">{formatPKR(quote.taxMinor)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping & Handling</span>
                  <span className="font-medium text-gray-900">{formatPKR(quote.shippingMinor)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-2 flex justify-between items-baseline">
                  <span className="font-extrabold text-base text-gray-900">Total</span>
                  <span className="font-extrabold text-xl text-emerald-900">
                    {formatPKR(quote.totalMinor)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold py-3 px-4 rounded-2xl transition shadow-xs text-center flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Proceed to Secure Checkout</span>
                </Link>
              </div>

              <div className="pt-2 text-[11px] text-gray-500 text-center space-y-1">
                <p>Support both Advance Bank Transfer & Cash on Delivery (COD).</p>
                <p>Need help? Call Multan Depot Desk: +92 300 5534323</p>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
