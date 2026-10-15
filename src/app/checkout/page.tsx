export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { RECEIVING_ACCOUNTS } from "@/modules/payments/accounts";
import { getCustomerSession } from "@/modules/web/session";
import { submitOrderAction } from "../actions";
import { CopyButton } from "../components/CopyButton";

export const metadata = {
  title: "Secure Checkout | Furrowmark",
  description:
    "Complete your shipping address and select your payment method (Advance Bank Transfer or Cash on Delivery).",
};

type Props = { searchParams: Promise<{ error?: string }> };

const inputStyle =
  "w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white shadow-2xs";

export default async function CheckoutPage({ searchParams }: Props) {
  const session = await getCustomerSession();
  if (!session) redirect("/login?next=/checkout");
  const { error } = await searchParams;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Title */}
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Secure Order Checkout
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Verified shipment dispatch from Furrowmark Agricultural Depot, Multan.
          </p>
        </div>
        <Link href="/cart" className="text-xs sm:text-sm font-semibold text-emerald-800 hover:underline">
          ← Back to Cart
        </Link>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      <form action={submitOrderAction} className="space-y-6">
        {/* Delivery Address Section */}
        <section className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Consignment Delivery Address
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                required
                placeholder="e.g. Malik Muhammad"
                className={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-gray-700 mb-1">
                Active Mobile / WhatsApp Number *
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                required
                placeholder="e.g. 03001234567"
                className={inputStyle}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-xs font-bold text-gray-700 mb-1">
                Farm / Shop / Physical Delivery Address *
              </label>
              <input
                id="address"
                type="text"
                name="address"
                required
                placeholder="Village / Chak / Mouza, Tehsil, District or Goods Transport Adda"
                className={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-xs font-bold text-gray-700 mb-1">
                City / Tehsil *
              </label>
              <input
                id="city"
                type="text"
                name="city"
                required
                placeholder="e.g. Multan, Khanewal, Lodhran"
                className={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="province" className="block text-xs font-bold text-gray-700 mb-1">
                Province *
              </label>
              <input
                id="province"
                type="text"
                name="province"
                required
                defaultValue="Punjab"
                placeholder="Punjab, Sindh, KPK, Balochistan"
                className={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-xs font-bold text-gray-700 mb-1">
                Postal Code *
              </label>
              <input
                id="postalCode"
                type="text"
                name="postalCode"
                required
                defaultValue="60000"
                placeholder="60000"
                className={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-xs font-bold text-gray-700 mb-1">
                Country *
              </label>
              <input
                id="country"
                type="text"
                name="country"
                required
                defaultValue="Pakistan"
                readOnly
                className={`${inputStyle} bg-gray-50 text-gray-500`}
              />
            </div>
          </div>
        </section>

        {/* Payment Method Section */}
        <section className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Select Payment Method
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-600 transition bg-white shadow-2xs has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50/40 has-[:checked]:ring-1 has-[:checked]:ring-emerald-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  Advance Bank Transfer
                </span>
                <input
                  type="radio"
                  name="method"
                  value="advance_payment"
                  defaultChecked
                  className="accent-emerald-700 w-4 h-4"
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Meezan Bank or Easypaisa account. Order dispatched immediately upon payment reference verification.
              </p>
            </label>

            <label className="border border-gray-200 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-600 transition bg-white shadow-2xs has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50/40 has-[:checked]:ring-1 has-[:checked]:ring-emerald-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  Cash on Delivery (COD)
                </span>
                <input
                  type="radio"
                  name="method"
                  value="cash_on_delivery"
                  className="accent-emerald-700 w-4 h-4"
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Pay cash to courier on arrival. Available for standard parcels up to PKR 25,000.
              </p>
            </label>
          </div>

          {/* Bank Accounts Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 text-xs text-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">
                Official Receiving Bank Accounts:
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded">
                Verified Business Title
              </span>
            </div>

            <div className="space-y-2">
              {RECEIVING_ACCOUNTS.map((acc) => (
                <div
                  key={acc.id}
                  className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">{acc.label}</span>
                    <span className="text-gray-500 text-[11px]">
                      Title: <strong>{acc.accountTitle}</strong> · Account / IBAN: <strong className="font-mono text-gray-900">{acc.accountNumber}</strong>
                    </span>
                  </div>
                  <CopyButton textToCopy={acc.accountNumber} label="Copy Account" />
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="transactionReference" className="block font-bold text-gray-800 mb-1">
                Bank / Easypaisa Transaction ID (Optional if paying COD)
              </label>
              <input
                id="transactionReference"
                type="text"
                name="transactionReference"
                placeholder="e.g. TRX-98234112 or Sender Name / Account"
                className={inputStyle}
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                If paying in advance, you can also WhatsApp the receipt screenshot to +92 300 5534323.
              </span>
            </div>
          </div>
        </section>

        {/* Submit Order Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold py-4 px-6 rounded-2xl transition shadow-md text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Confirm & Place Consignment Order</span>
          </button>

          <p className="text-[11px] text-gray-500 text-center mt-3">
            By placing an order, you agree to the Furrowmark Terms of Service, Punjab Pesticide Control Rules, and FEFO allocation dispatch terms.
          </p>
        </div>
      </form>
    </main>
  );
}
