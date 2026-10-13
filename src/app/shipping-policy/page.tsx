export const metadata = {
  title: "Shipping & Fulfilment Policy - Furrowmark",
  description:
    "Fulfilment, hazardous chemical parcel segregation, and delivery guidelines for Furrowmark orders.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">
        Shipping & Fulfilment Policy
      </h1>

      <p className="text-gray-700 leading-relaxed">
        Furrowmark ships agricultural inputs across Pakistan, maintaining strict
        adherence to safety and environmental standards during transit.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          1. Split Parcel Delivery & Hazardous Material Segregation
        </h2>
        <p className="text-gray-700 leading-relaxed">
          To comply with national transport safety directives, orders containing
          both general farming goods (seeds, biological fertilisers, tools) and
          regulated agrochemicals (pesticides, insecticides, herbicides) are
          automatically segregated into distinct parcels:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>General Agricultural Goods:</strong> Dispatched in standard
            protective packaging.
          </li>
          <li>
            <strong>Hazardous Agrochemicals:</strong> Packed in reinforced,
            leak-proof hazardous material packaging with safety warning placards
            and emergency spillage documentation.
          </li>
        </ul>
        <p className="text-gray-700 text-sm">
          Note: Split shipments may arrive in separate courier dispatches with
          unique tracking identifiers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          2. Delivery Timeframes & Service Areas
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Major Farming Hubs (Punjab & Sindh):</strong> 2 to 4 working
            days following payment verification.
          </li>
          <li>
            <strong>Remote Agricultural Districts & Upper Regions:</strong> 4 to
            7 working days depending on courier accessibility.
          </li>
          <li>
            Dispatches occur Monday through Saturday, excluding statutory
            holidays.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          3. Cash on Delivery (COD) Inspection
        </h2>
        <p className="text-gray-700 leading-relaxed">
          For COD shipments, couriers collect the exact cash total upon arrival.
          Customers are encouraged to visually inspect the external packaging
          for signs of transit damage or leaks before accepting hazardous
          consignments. If an agrochemical container exhibits external leakage,
          refuse delivery immediately and notify customer support.
        </p>
      </section>
    </main>
  );
}
