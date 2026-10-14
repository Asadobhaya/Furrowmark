import Link from "next/link";
import { RECEIVING_ACCOUNTS } from "@/modules/payments/accounts";

export const metadata = {
  title: "Payment Methods - Furrowmark",
  description: "Official payment methods, bank account details, and verification policy for Furrowmark.",
};

export default function PaymentMethodsPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Official Payment Accounts & Instructions
        </h1>
        <p className="text-gray-600">
          Furrowmark accepts Direct Advance Payments via Bank Transfer and Easypaisa, as well as Cash on Delivery (COD) for eligible deliveries across Pakistan.
        </p>
      </div>

      {/* Advance Payment Accounts */}
      <section className="border rounded-xl p-6 bg-emerald-50 border-emerald-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-emerald-950">
            1. Direct Advance Payment Accounts
          </h2>
          <span className="text-xs font-semibold bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full">
            Recommended
          </span>
        </div>
        <p className="text-sm text-emerald-900">
          Transfer the exact total amount shown at checkout to either of the following official accounts registered in the name of store owner Muhammad Asad:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {RECEIVING_ACCOUNTS.map((acc) => (
            <div
              key={acc.id}
              className="bg-white border border-emerald-300 rounded-lg p-5 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-gray-900">{acc.label}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                  Official Account
                </span>
              </div>
              <div className="space-y-1 text-sm pt-2 border-t">
                <p className="text-gray-500 text-xs">Account Title:</p>
                <p className="font-semibold text-gray-800">{acc.accountTitle}</p>
                <p className="text-gray-500 text-xs mt-2">Account Number:</p>
                <p className="font-mono text-base font-bold text-emerald-700 tracking-wider">
                  {acc.accountNumber}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/80 rounded-lg p-4 text-xs text-gray-700 border border-emerald-200 space-y-1 mt-4">
          <p className="font-semibold text-gray-900">How to confirm your advance payment:</p>
          <p>1. Open your banking app (Meezan, HBL, UBL, etc.) or Easypaisa app.</p>
          <p>2. Send the exact order total to the account above.</p>
          <p>3. Note down the Transaction Reference ID (TID / Ref No) provided by your bank.</p>
          <p>4. Enter your Transaction Reference ID in the checkout screen and click Place Order.</p>
          <p>5. Our staff verifies the bank statement before dispatching your order.</p>
        </div>
      </section>

      {/* Cash on Delivery */}
      <section className="border rounded-xl p-6 bg-white shadow-sm space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          2. Cash on Delivery (COD)
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Cash on Delivery is available for non-restricted agricultural goods and standard parcel sizes throughout Pakistan. Payment is made in cash directly to the courier rider upon delivery at your farm or residence.
        </p>
        <p className="text-xs text-gray-500">
          Note: Regulated bulk chemical drums or commercial bulk seed consignments exceeding courier weight limits may require advance bank transfer.
        </p>
      </section>

      <div className="pt-4 border-t flex items-center justify-between">
        <Link href="/products" className="text-sm font-medium text-green-700 hover:underline">
          ← Return to Store Products
        </Link>
        <Link href="/cart" className="text-sm font-medium text-green-700 hover:underline">
          View Shopping Cart →
        </Link>
      </div>
    </main>
  );
}
