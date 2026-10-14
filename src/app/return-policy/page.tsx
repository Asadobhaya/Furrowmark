import Link from "next/link";

export const metadata = {
  title: "Return & Refund Policy | Furrowmark",
  description:
    "7-day return and refund policy under the Punjab Consumer Protection Act 2005. Complete procedures for damaged, wrong, expired, or counterfeit goods.",
};

export default function ReturnPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Return, Replacement & Refund Policy
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Statutory Protections under the Punjab Consumer Protection Act 2005
        </p>
      </div>

      <p className="text-gray-700 leading-relaxed text-sm md:text-base">
        At Furrowmark, we stand behind the quality, authenticity, and efficacy of every seed bag, fertilizer consignment, and crop protection chemical dispatched from our Multan depot. This policy outlines customer remedies and return procedures in strict compliance with <strong>Sections 13, 14, and 15 of the Punjab Consumer Protection Act 2005</strong>.
      </p>

      {/* Section 1: 7-Day Window */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          1. Statutory 7-Day Inspection and Return Window
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Customers are entitled to inspect goods upon delivery. Any claim regarding damaged, defective, expired, or incorrect agricultural products must be initiated within <strong>7 calendar days</strong> of documented delivery by the courier or transport company.
        </p>
      </section>

      {/* Section 2: Full Remedies for Wrong, Damaged, or Expired Items */}
      <section className="border border-emerald-300 bg-emerald-50/50 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-emerald-950">
          2. Remedies for Damaged, Wrong, Expired, or Non-Genuine Goods
        </h2>
        <p className="text-sm text-emerald-900 leading-relaxed">
          If your consignment suffers from any of the following defects, Furrowmark guarantees an immediate <strong>100% full replacement</strong> or a <strong>100% full cash refund</strong> to your original bank account / Easypaisa (customer choice), with all return shipping costs borne by Furrowmark:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs space-y-1.5 text-xs">
            <h3 className="font-bold text-sm text-gray-900">Transit Damage or Leakage</h3>
            <p className="text-gray-600">
              Chemical container punctures, ruptured seal caps, or torn fertilizer sacks occurring during transit. Refuse delivery or notify us within 7 days.
            </p>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs space-y-1.5 text-xs">
            <h3 className="font-bold text-sm text-gray-900">Incorrect Item Dispatched</h3>
            <p className="text-gray-600">
              Receipt of an incorrect formulation, wrong pack size, or different seed variety than the SKU confirmed on your order receipt.
            </p>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs space-y-1.5 text-xs">
            <h3 className="font-bold text-sm text-gray-900">Expired on Arrival</h3>
            <p className="text-gray-600">
              Our automated FEFO system prevents expired dispatch. However, if any product arrives past its printed manufacturer expiry date, an immediate cash refund is issued.
            </p>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs space-y-1.5 text-xs">
            <h3 className="font-bold text-sm text-gray-900">Genuineness & Anti-Counterfeit Guarantee</h3>
            <p className="text-gray-600">
              If an item fails factory seal inspection or is suspected of being counterfeit, Furrowmark quarantines the entire warehouse batch, initiates regulatory escalation with the Punjab Pesticide Inspectorate, and issues an immediate 100% cash refund.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Safety Prohibition on Opened Chemicals */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          3. Safety Prohibition: Opened Tamper-Evident Chemical Seals
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Under national and provincial hazardous substances regulations, any liquid pesticide, herbicide, or granular chemical container with a broken, cut, or tampered manufacturer seal <strong>cannot be accepted for return due to change of mind</strong>. This policy protects growers across Pakistan from receiving diluted or contaminated chemistry.
        </p>
        <p className="text-gray-700 text-sm">
          Unopened products in pristine factory condition are eligible for return within the 7-day window.
        </p>
      </section>

      {/* Section 4: Step-by-Step Return Process */}
      <section className="border border-gray-200 rounded-2xl p-6 bg-white space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          4. How to Initiate a Return or RMA
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong>Step 1: Open a Support Ticket.</strong> Visit our dedicated contact portal at{" "}
            <Link href="/contact" className="text-emerald-700 font-semibold hover:underline">
              furrowmark.pk/contact
            </Link>{" "}
            or contact our Multan desk via WhatsApp at <strong>+92 (300) 463-4494</strong>. Quote your Public Order Reference (e.g. FM-2026-XXXX-XXXX).
          </p>
          <p>
            <strong>Step 2: Submit Verification Evidence.</strong> Provide clear photos of the courier shipping label, the damaged area or wrong SKU, and the printed lot/batch number on the pack.
          </p>
          <p>
            <strong>Step 3: Reverse Logistics Collection.</strong> For approved claims, our Multan logistics desk schedules reverse courier pickup from your location or provides prepaid return dispatch details.
          </p>
          <p>
            <strong>Step 4: Swift Resolution.</strong> Once verified by our warehouse inspection desk, your replacement is dispatched same-day or your full cash refund is transferred via IBFT / Easypaisa within 48 hours.
          </p>
        </div>
      </section>

      {/* Section 5: Refund Options */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          5. Cash Refunds vs. Store Credit
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Unlike restrictive policies, Furrowmark gives farmers the right to choose:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 text-sm">
          <li>
            <strong>Full Cash Refund:</strong> Transferred directly to your designated bank account (IBFT) or Easypaisa account.
          </li>
          <li>
            <strong>Store Credit:</strong> If preferred for rapid re-ordering, credited immediately to your account ledger with lifetime validity across any product.
          </li>
        </ul>
      </section>
    </main>
  );
}
