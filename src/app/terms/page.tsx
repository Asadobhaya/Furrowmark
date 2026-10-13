export const metadata = {
  title: "Terms of Service - Furrowmark",
  description:
    "Terms and conditions governing orders and use of the Furrowmark agricultural inputs store.",
};

export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">
        Terms of Service
      </h1>

      <p className="text-gray-700 leading-relaxed">
        Welcome to Furrowmark. By browsing our catalog, registering an account,
        or placing orders for agricultural seeds, fertilisers, pesticides, or
        farm implements, you agree to comply with and be bound by the following
        Terms of Service.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          1. Regulatory Compliance for Agricultural Chemicals
        </h2>
        <p className="text-gray-700 leading-relaxed">
          The purchase, handling, and application of registered pesticides and
          agrochemicals are governed by national and provincial agricultural
          laws. Buyers must:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            Hold appropriate agricultural permits or farming status where
            required by local authorities.
          </li>
          <li>
            Strictly adhere to manufacturer safety data sheets (SDS), label
            instructions, pre-harvest intervals (PHI), and re-entry intervals
            (REI).
          </li>
          <li>
            Ensure safe storage away from children, livestock, and water
            channels.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          2. Permitted Payment Methods
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Furrowmark operates on direct payment confirmation:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Advance Payment (Meezan Bank / Easypaisa):</strong> Payment
            must be sent directly to our designated accounts (Title: Muhammad
            Asad, Meezan Bank: 03130115156301, Easypaisa: 03004634494). The
            customer must submit their transaction ID during checkout. Orders
            remain in pending payment until manual verification by staff. Unpaid
            orders expire after 48 hours.
          </li>
          <li>
            <strong>Cash on Delivery (COD):</strong> Permitted for eligible
            regions and standard order sizes. Cash payment is due immediately
            upon courier parcel handover.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          3. Pricing and Stock Allocations
        </h2>
        <p className="text-gray-700 leading-relaxed">
          All prices are quoted in Pakistani Rupees (PKR) and include applicable
          statutory sales taxes. Placing an order temporarily reserves stock
          using First-Expired, First-Out (FEFO) batch allocation. If an advance
          payment order is cancelled or times out, reserved inventory is
          released back into the store catalog.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          4. Limitation of Liability & Agronomic Advisory
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Product information and chatbot guidance provided on Furrowmark are
          for general agronomic informational purposes only. Crop performance is
          subject to soil conditions, weather patterns, irrigation, and farmer
          application techniques. Furrowmark disclaims liability for crop losses
          resulting from misuse, weather catastrophes, or failure to follow
          manufacturer label directives.
        </p>
      </section>
    </main>
  );
}
