export const metadata = {
  title: "Shipping & Fulfilment Policy | Furrowmark",
  description:
    "Standard courier parcel rates, commercial goods transport (Biltee), hazardous chemical segregation, and delivery timelines across Pakistan.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Shipping & Fulfilment Policy
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Multan Central Logistics Depot · Hazardous Material Handling Protocols
        </p>
      </div>

      <p className="text-gray-700 leading-relaxed text-sm md:text-base">
        Furrowmark ships agricultural inputs across all farming districts in Pakistan. We uphold strict adherence to safety, hazardous materials regulations, and temperature protection during transit.
      </p>

      {/* Section 1: Delivery Rates */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          1. Delivery Rate Schedule & Packaging Limits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-2">
            <h3 className="font-bold text-gray-900">Standard Courier Parcel</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              For seeds, liquid chemical bottles (up to 1L), pouches, and equipment spares delivered via TCS, Leopards, or Trax.
            </p>
            <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
              <li>Up to 5 kg: <strong>Rs. 350 flat rate</strong> nationwide.</li>
              <li>5 kg to 10 kg: <strong>Rs. 600 flat rate</strong>.</li>
              <li>Estimated transit: 2 to 4 working days.</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-2">
            <h3 className="font-bold text-gray-900">Commercial Cargo / Biltee Freight</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              For commercial bags (50 kg Urea, 50 kg DAP, 25 kg SOP, and 50 kg wheat seed bags) dispatched via registered Goods Transport.
            </p>
            <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
              <li>Typically <strong>Rs. 200 to Rs. 300 per 50 kg bag</strong>.</li>
              <li>Customer collects at city transport terminal.</li>
              <li>Billed at actual freight receipt (Biltee).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Segregation */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          2. Hazardous Agrochemical Segregation Protocol
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          To comply with national transport safety directives, orders containing both general agricultural goods (seeds, tools) and regulated chemicals (pesticides, fungicides) are automatically segregated into distinct parcels:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>
            <strong>General Agricultural Goods:</strong> Dispatched in standard protective cartons.
          </li>
          <li>
            <strong>Hazardous Agrochemicals:</strong> Packed in reinforced, leak-proof containers with absorbent barrier lining, safety warning placards, and product Safety Data Sheets (SDS).
          </li>
        </ul>
        <p className="text-xs text-gray-500">
          Note: Split shipments may arrive in separate courier deliveries with distinct tracking numbers.
        </p>
      </section>

      {/* Section 3: COD */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          3. Cash on Delivery (COD) Rules and Inspection
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Cash on Delivery is available across Pakistan for orders up to <strong>Rs. 25,000</strong> with a parcel weight under <strong>10 kg</strong>. No additional COD handling surcharge is charged to the farmer.
        </p>
        <p className="text-gray-700 leading-relaxed text-sm">
          Upon arrival, inspect the external parcel for any signs of liquid leakage or puncture before completing payment to the courier rider. If external leakage is detected, refuse delivery immediately and notify our Multan desk at <strong>support@furrowmark.pk</strong>.
        </p>
      </section>

      {/* Section 4: Timeframes */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          4. Delivery Timeframes & Working Days
        </h2>
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 text-sm">
          <li>
            <strong>Punjab & Sindh Agricultural Hubs:</strong> 2 to 4 working days following payment verification.
          </li>
          <li>
            <strong>Khyber Pakhtunkhwa & Balochistan:</strong> 4 to 6 working days depending on transport hub accessibility.
          </li>
          <li>
            Dispatches operate Monday through Saturday from our Multan warehouse.
          </li>
        </ul>
      </section>
    </main>
  );
}
