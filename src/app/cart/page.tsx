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
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {error && (
        <p role="alert" className="mb-4 text-red-700">
          {error}
        </p>
      )}
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="space-y-4 mb-6">
          {items.map((item) => (
            <li key={item.id} className="border rounded p-4 flex items-center">
              <div className="flex-1">
                <p className="font-medium" title={item.name}>
                  {item.name}{" "}
                  <span className="text-sm text-gray-600">({item.sku})</span>
                </p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                <p className="text-green-800 font-semibold mt-1">
                  {formatPKR(item.lineSubtotalMinor)}
                </p>
              </div>
              <form
                action={updateCartAction}
                className="flex items-center gap-2"
              >
                <input type="hidden" name="variantId" value={item.variantId} />
                <input
                  type="number"
                  name="quantity"
                  min={0}
                  defaultValue={item.quantity}
                  className="border rounded w-16 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
                  aria-label="Quantity (0 removes the item)"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-800"
                >
                  Update
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {quote && items.length > 0 && (
        <section className="border-t pt-4 mb-6">
          <p>Subtotal: {formatPKR(quote.subtotalMinor)}</p>
          <p>Tax: {formatPKR(quote.taxMinor)}</p>
          <p>Shipping: {formatPKR(quote.shippingMinor)}</p>
          <p className="font-bold mt-2">Total: {formatPKR(quote.totalMinor)}</p>
        </section>
      )}

      {items.length > 0 && (
        <Link
          href="/checkout"
          className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-800"
        >
          Proceed to Checkout
        </Link>
      )}
    </main>
  );
}
