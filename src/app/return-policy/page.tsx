export const metadata = {
  title: "Return & Refund Policy - Furrowmark",
  description:
    "Statutory 7-day return policy and chemical safety RMA guidelines for Furrowmark.",
};

export default function ReturnPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">
        Return & RMA Policy
      </h1>

      <p className="text-gray-700 leading-relaxed">
        Furrowmark provides a transparent return and refund process designed to
        protect customer satisfaction while strictly upholding agricultural
        safety and quality control standards.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          1. Standard 7-Day Return Window
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Eligible items may be submitted for Return Merchandise Authorization
          (RMA) within <strong>7 days</strong> of documented delivery. Requests
          initiated after 7 days cannot be accepted.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          2. Strict Safety Prohibition: Unsealed Agrochemicals
        </h2>
        <p className="text-gray-700 leading-relaxed">
          In accordance with agricultural safety regulations, any chemical
          pesticide, herbicide, or liquid nutrient bottle that has had its
          tamper-evident seal broken, opened, or altered is{" "}
          <strong>strictly non-returnable and non-refundable</strong>.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Returns of sealed, unopened chemicals will be routed into quarantine
          inspection before any inventory re-certification.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          3. Non-Returnable Products
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            Opened or partially used seeds, chemical formulations, or
            fertilisers.
          </li>
          <li>
            Products that have passed their manufacturer expiry date in the
            customer possession.
          </li>
          <li>
            Custom mixed or treated seed batches prepared specifically for
            customer acreage.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          4. Refund Method & Store Credit Ledger
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Approved returns are issued directly to the customer account as store
          credit recorded in our immutable store credit ledger. Store credit
          never expires and can be applied toward any future seed, fertiliser,
          or equipment order on Furrowmark. For cash bank transfers, contact
          support with your verified return inspection receipt.
        </p>
      </section>
    </main>
  );
}
