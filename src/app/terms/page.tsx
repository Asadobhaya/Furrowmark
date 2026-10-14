export const metadata = {
  title: "Terms of Service | Furrowmark",
  description:
    "Terms and conditions governing agricultural orders, pesticide regulations, delivery rates, COD rules, and Multan jurisdiction for Furrowmark.",
};

export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Effective Date: October 2026 · Licensed Dealer Depot Multan, Punjab
        </p>
      </div>

      <p className="text-gray-700 leading-relaxed text-sm md:text-base">
        Welcome to Furrowmark. By browsing our catalog, registering an account, or placing orders for agricultural hybrid seeds, fertilizers, registered crop chemicals, or spray machinery, you agree to comply with and be bound by the following Terms of Service.
      </p>

      {/* Dealer Licensing Notice */}
      <div className="border border-emerald-300 bg-emerald-50/60 rounded-xl p-4 text-xs text-emerald-950 space-y-1">
        <p className="font-bold text-sm">Official Dealer Authorization:</p>
        <p>
          Punjab Pesticide Dealer License: <strong>DEP/MLT-AGRO/2024-8841</strong> (Directorate General of Pest Warning & Quality Control of Pesticides, Government of Punjab).
        </p>
        <p>
          Federal Seed Certification Registration: <strong>FSCRD-PB-5592</strong> (FSC&RD, Ministry of National Food Security & Research, Government of Pakistan).
        </p>
        <p>
          Registered Depot: Grain & Seed Market, Khanewal Road, Multan, Punjab, Pakistan.
        </p>
      </div>

      {/* Section 1: Agrochemicals */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          1. Regulatory Compliance for Agricultural Chemicals and Seeds
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          The distribution, purchase, storage, and application of registered agricultural chemicals and certified seeds are strictly governed by the Agricultural Pesticides Ordinance 1971, the Punjab Pesticides Control Rules 1973, and the Seed Act 1976 / Seed (Amendment) Act 2015.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>
            <strong>Mandatory Identity Recording:</strong> In accordance with Section 14 of the Agricultural Pesticides Ordinance 1971, buyers purchasing Schedule-I regulated agrochemicals must provide a valid CNIC during checkout for statutory dealer register maintenance.
          </li>
          <li>
            <strong>Application and Label Adherence:</strong> Buyers and applicators must strictly comply with manufacturer Safety Data Sheets (SDS), statutory label rates, water volumes, Pre-Harvest Intervals (PHI), and Re-Entry Intervals (REI).
          </li>
          <li>
            <strong>Storage and Safety:</strong> All pesticides must be stored in secure, locked rooms away from children, livestock, fodder, and open water sources.
          </li>
        </ul>
      </section>

      {/* Section 2: Payment Settlement */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          2. Permitted Payment Settlement Methods
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Furrowmark enforces verified, accountable payment settlement across all orders:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>
            <strong>Advance Bank Transfer (IBFT via 1Link):</strong> Official receiving bank transfer coordinates and matching Public Order References are displayed securely on the post-checkout order confirmation screen (/orders/[id]). The customer submits their bank Transaction Reference ID (TID) upon transfer. Payments are verified manually by staff before order dispatch. Advance payment inventory holds expire after 48 hours if unverified.
          </li>
          <li>
            <strong>Easypaisa Mobile Wallet:</strong> Direct payment via Easypaisa mobile account or agent transfer. Instructions are provided upon order placement.
          </li>
          <li>
            <strong>Cash on Delivery (COD):</strong> Permitted for eligible courier service areas across Pakistan for orders up to Rs. 25,000 with a total parcel weight not exceeding 10 kg. No additional COD handling surcharge is applied. Payment in exact cash is due immediately upon courier handover.
          </li>
        </ul>
      </section>

      {/* Section 3: Delivery Charges & Shipping */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          3. Delivery Charges, Weight Limits, and Fulfilment
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>
            <strong>Standard Courier Parcel Fee:</strong> A flat delivery fee of Rs. 350 applies to all standard retail courier consignments up to 5 kg. Parcels between 5 kg and 10 kg are billed at Rs. 600.
          </li>
          <li>
            <strong>Commercial Bulk Cargo (Goods Transport / Biltee):</strong> Consignments exceeding courier weight limits (such as 50 kg bags of Sona Urea, Engro DAP, or commercial wheat seed consignments) are dispatched via licensed Goods Transport companies from our Multan depot. Freight charges (typically Rs. 200 to Rs. 300 per 50 kg bag) are paid directly to the transport company upon terminal collection.
          </li>
          <li>
            <strong>Hazardous Chemical Segregation:</strong> Regulated pesticides and liquid formulations are segregated into leak-proof, reinforced packaging separate from seeds and tools per national transport safety directives.
          </li>
        </ul>
      </section>

      {/* Section 4: Pricing and FEFO Batch Allocations */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          4. Pricing, Taxes, and Inventory Allocation
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          All catalog prices are quoted in Pakistani Rupees (PKR) and include statutory taxes where applicable. Furrowmark operates an automated First-Expired, First-Out (FEFO) inventory management system ensuring that dispatched products have maximum active residual shelf-life. If an advance payment order is cancelled or times out, reserved inventory is automatically restored to the available store catalog.
        </p>
      </section>

      {/* Section 5: Governing Law & Jurisdiction */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          5. Governing Law and Exclusive Dispute Jurisdiction
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          These Terms of Service, user accounts, and all sales contracts shall be governed by, construed, and enforced in accordance with the substantive laws of the Islamic Republic of Pakistan and the Province of Punjab. Any dispute, claim, or controversy arising out of or relating to transactions on Furrowmark shall be submitted to the exclusive jurisdiction of the competent civil courts located in Multan, Punjab, Pakistan.
        </p>
      </section>

      {/* Section 6: Agronomic Guidance Disclaimer */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          6. Limitation of Liability and Agronomic Advisory
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Technical specifications, chatbot recommendations, and agronomic guidance provided on Furrowmark are for general informational purposes based on manufacturer label registrations. Field performance is subject to micro-climatic factors, soil chemistry, irrigation, and farmer execution. Furrowmark disclaims liability for crop failure resulting from weather extremes, pest resistance, or off-label misuse.
        </p>
      </section>
    </main>
  );
}
