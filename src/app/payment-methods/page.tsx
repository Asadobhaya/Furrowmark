import Link from "next/link";

export const metadata = {
  title: "Payment Methods & Order Settlement | Furrowmark",
  description:
    "Official payment settlement guidelines, verified IBFT bank transfers, Easypaisa, and Cash on Delivery (COD) for Furrowmark orders in Pakistan.",
};

export default function PaymentMethodsPage() {
  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Methods & Order Settlement
        </h1>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          Furrowmark provides safe, accountable agricultural order settlement. We accept Verified Advance Bank Transfer (IBFT via 1Link), Easypaisa mobile wallet, and Cash on Delivery (COD) for eligible deliveries across Pakistan.
        </p>
      </div>

      {/* Payment Security Notice */}
      <section className="border border-emerald-300 rounded-2xl p-6 bg-emerald-50/70 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-emerald-950">
            Payment Privacy & Fraud Protection Protocol
          </h2>
          <span className="text-xs font-semibold bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full">
            Secure Settlement
          </span>
        </div>
        <p className="text-sm text-emerald-900 leading-relaxed">
          To protect buyers from payment interception, fraudulent impersonation, and phishing scams, official receiving bank transfer coordinates are issued directly on the secure, authenticated order confirmation screen after your order is submitted. Each order is tied to an immutable Public Order Reference (e.g. FM-2026-XXXX-XXXX).
        </p>
      </section>

      {/* Accepted Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Method 1: Bank Transfer */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            1
          </div>
          <h3 className="font-bold text-gray-900 text-base">Direct Bank Transfer (IBFT)</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Transfer directly from any Pakistani bank (Meezan, HBL, UBL, Bank Alfalah, MCB, etc.) via mobile app or online portal.
          </p>
          <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
            <li>Zero payment processing fees.</li>
            <li>Same-day manual statement reconciliation.</li>
            <li>Receiving coordinates shown on order confirmation.</li>
          </ul>
        </div>

        {/* Method 2: Easypaisa */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            2
          </div>
          <h3 className="font-bold text-gray-900 text-base">Easypaisa Mobile Wallet</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Instant transfer using your Easypaisa mobile account or through any designated Easypaisa retail agent across Pakistan.
          </p>
          <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
            <li>Fast mobile wallet confirmation.</li>
            <li>Submit your Transaction ID during checkout.</li>
            <li>Account details provided upon order creation.</li>
          </ul>
        </div>

        {/* Method 3: COD */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            3
          </div>
          <h3 className="font-bold text-gray-900 text-base">Cash on Delivery (COD)</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Pay exact cash directly to the courier rider upon delivery at your farm or residence.
          </p>
          <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
            <li>Available up to Rs. 25,000 per consignment.</li>
            <li>Max parcel weight 10 kg for courier handling.</li>
            <li>No additional COD handling surcharge.</li>
          </ul>
        </div>
      </div>

      {/* Step by Step Guide */}
      <section className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          How to Place and Confirm an Advance Payment Order
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong>Step 1:</strong> Add your desired hybrid seeds, fertilizers, or agrochemicals to the cart and proceed to checkout.
          </p>
          <p>
            <strong>Step 2:</strong> Select <em>Advance payment (Bank Transfer / Easypaisa)</em> and complete your shipping address.
          </p>
          <p>
            <strong>Step 3:</strong> On the order summary screen, view the official receiving bank account coordinates and transfer the exact total quoting your Order Reference.
          </p>
          <p>
            <strong>Step 4:</strong> Enter your bank Transaction ID (TID) or share your receipt with our Multan dispatch desk. Our staff verifies the bank statement before dispatching your lot-tracked consignment.
          </p>
        </div>
      </section>

      {/* Bulk Consignments */}
      <section className="border border-gray-200 rounded-2xl p-6 bg-white space-y-3">
        <h2 className="text-lg font-bold text-gray-900">
          Commercial Orders & Goods Transport (Biltee)
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          For commercial orders exceeding 100 kg (such as multiple 50 kg bags of Sona Urea, Engro DAP, or bulk seed consignments), orders are dispatched via licensed Goods Transport (Biltee) freight. These commercial consignments require advance bank settlement prior to truck loading.
        </p>
      </section>

      <div className="pt-4 border-t flex items-center justify-between text-sm">
        <Link href="/products" className="text-emerald-700 hover:underline font-medium">
          ← Return to Products
        </Link>
        <Link href="/cart" className="text-emerald-700 hover:underline font-medium">
          View Shopping Cart →
        </Link>
      </div>
    </main>
  );
}
