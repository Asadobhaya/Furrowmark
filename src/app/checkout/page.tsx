export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { RECEIVING_ACCOUNTS } from "@/modules/payments/accounts";
import { getCustomerSession } from "@/modules/web/session";
import { submitOrderAction } from "../actions";

export const metadata = {
  title: "Secure Checkout | Furrowmark",
  description:
    "Complete your shipping address and select your payment method (Advance Bank Transfer or Cash on Delivery).",
};

type Props = { searchParams: Promise<{ error?: string }> };

const inputClass =
  "w-full border rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-green-600";

const FIELDS: { name: string; label: string; type?: string }[] = [
  { name: "name", label: "Name" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "address", label: "Address" },
  { name: "city", label: "City" },
  { name: "province", label: "Province / State" },
  { name: "postalCode", label: "Postal Code" },
  { name: "country", label: "Country" },
];

export default async function CheckoutPage({ searchParams }: Props) {
  const session = await getCustomerSession();
  if (!session) redirect("/login?next=/checkout");
  const { error } = await searchParams;

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {error && (
        <p role="alert" className="mb-4 text-red-700">
          {error}
        </p>
      )}
      <form action={submitOrderAction} className="space-y-4">
        <fieldset className="border rounded p-4">
          <legend className="font-medium">Shipping address</legend>
          {FIELDS.map((f) => (
            <label key={f.name} className="block mb-2">
              {f.label}
              <input
                type={f.type ?? "text"}
                name={f.name}
                required
                className={inputClass}
              />
            </label>
          ))}
        </fieldset>

        <fieldset className="border rounded p-4">
          <legend className="font-medium">Payment method</legend>
          <label className="flex items-center mb-2">
            <input
              type="radio"
              name="method"
              value="advance_payment"
              defaultChecked
              className="mr-2"
            />
            Advance payment (Meezan Bank / Easypaisa)
          </label>
          <label className="flex items-center mb-2">
            <input
              type="radio"
              name="method"
              value="cash_on_delivery"
              className="mr-2"
            />
            Cash on Delivery (COD)
          </label>

          <div className="mt-3 rounded border p-3 text-sm bg-gray-50">
            <p className="font-medium mb-2">
              For advance payment, send the exact order total to one of these
              accounts. Your payment will be verified manually before the order
              is processed.
            </p>
            <ul className="space-y-1">
              {RECEIVING_ACCOUNTS.map((acc) => (
                <li key={acc.id}>
                  <strong>{acc.label}</strong> - {acc.accountTitle} -{" "}
                  {acc.accountNumber}
                </li>
              ))}
            </ul>
            <label className="block mt-3">
              Transaction ID (required for advance payment)
              <input
                type="text"
                name="transactionReference"
                className={inputClass}
              />
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className="w-full bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-800"
        >
          Place Order
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        <Link href="/cart" className="text-green-600 hover:underline">
          ← Back to cart
        </Link>
      </p>
    </main>
  );
}
