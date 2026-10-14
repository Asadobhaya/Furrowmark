export const metadata = {
  title: "Privacy & Data Protection Policy | Furrowmark",
  description:
    "Data protection practices, Google Gemini AI disclosure, statutory CNIC collection rules under Agricultural Pesticides Ordinance 1971, and PECA 2016 compliance for Furrowmark.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Privacy & Data Protection Policy
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Governed by the Prevention of Electronic Crimes Act (PECA) 2016 and Pakistani Agricultural Statutes
        </p>
      </div>

      <p className="text-gray-700 leading-relaxed text-sm md:text-base">
        Furrowmark is committed to protecting the privacy of farmers, agricultural professionals, and commercial growers who use our platform. This policy outlines our data collection, processing, and retention practices under the Electronic Transactions Ordinance 2002, the Prevention of Electronic Crimes Act (PECA) 2016, and the Agricultural Pesticides Ordinance 1971.
      </p>

      {/* Section 1: Information Collected & CNIC Justification */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          1. Information We Collect and Mandatory CNIC Justification
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>
            <strong>Delivery & Account Details:</strong> Full name, telephone/mobile number, delivery address, and order transaction history.
          </li>
          <li>
            <strong>Mandatory CNIC Collection for Regulated Agrochemicals:</strong> A valid Computerized National Identity Card (CNIC) number is requested strictly during the checkout process <em>ONLY</em> when purchasing Schedule-I regulated agricultural pesticides, insecticides, and certified seeds. This collection is mandatory under <strong>Section 14 of the Agricultural Pesticides Ordinance 1971</strong> and the <strong>Punjab Pesticides Control Rules 1973</strong>, which require licensed pesticide dealers to maintain a statutory inspection register of buyers. CNIC numbers are never requested for browsing the catalog, buying non-chemical equipment, or unauthenticated inquiries.
          </li>
          <li>
            <strong>Payment Reference Records:</strong> For advance bank payments and Easypaisa, we record the Transaction Reference ID (TID) submitted by the customer. We never request, capture, or store bank account login passwords, debit card PINs, or CVV codes.
          </li>
          <li>
            <strong>Sanitized Support Logs:</strong> Interactions with our virtual assistant and support ticket submissions are logged for quality assurance and agronomic safety. Sensitive personal numbers (CNIC or credit cards) are automatically masked before logging.
          </li>
        </ul>
      </section>

      {/* Section 2: AI & Third-Party Processing */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          2. Automated Assistant and Third-Party AI Processing Disclosure
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Furrowmark provides an automated virtual assistant to assist farmers with product catalog queries, dosage recommendations, and store policies.
        </p>
        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
          <p>
            <strong>Third-Party AI Service Provider:</strong> Inquiries submitted to the chatbot may be processed via Google Gemini AI API services.
          </p>
          <p>
            <strong>Zero Training Retention:</strong> Data transmitted to the Gemini API is processed strictly to generate real-time agronomic responses. Customer inquiries are not used by Google to train foundation AI models.
          </p>
          <p>
            <strong>Automated Sanitization:</strong> Our application automatically scrubs CNIC patterns and banking patterns prior to LLM processing.
          </p>
        </div>
      </section>

      {/* Section 3: Data Retention Schedules */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          3. Automated Data Retention & Deletion Schedules
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          To uphold minimal data retention, automated database maintenance routines purge transient data according to strict schedules:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-gray-700 text-sm">
          <li>
            <strong>Virtual Assistant Chat Records:</strong> Purged automatically 30 days following creation.
          </li>
          <li>
            <strong>Guest Shopping Carts:</strong> Purged automatically after 30 days of inactivity.
          </li>
          <li>
            <strong>Expired User Sessions:</strong> Purged 30 days post-expiration.
          </li>
          <li>
            <strong>Search Query Analytics:</strong> Retained for 90 days and stripped of personal IP addresses.
          </li>
          <li>
            <strong>Statutory Pesticide Sales Registers:</strong> Retained in immutable audit storage for the duration mandated by federal and provincial agricultural pesticide regulations.
          </li>
        </ul>
      </section>

      {/* Section 4: Data Sharing */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          4. Information Sharing and Disclosure
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Furrowmark never sells, rents, or monetizes farmer personal data. Data is shared exclusively with:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>
            <strong>Licensed Logistics & Courier Partners:</strong> Courier partners (such as TCS, Leopards, or Trax) and licensed goods transport companies strictly receive recipient name, delivery address, and phone number to complete parcel delivery.
          </li>
          <li>
            <strong>Government Regulatory Bodies:</strong> Where required by authorized agricultural pesticide inspectors under the Agricultural Pesticides Ordinance 1971 or upon lawful subpoena by a competent Pakistani court.
          </li>
        </ul>
      </section>

      {/* Section 5: Data Protection Rights */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          5. Your Rights and Support Ticket Contact
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Under Pakistani law and the Punjab Consumer Protection Act 2005, you have the right to request a summary of the personal data held on your account, request correction of inaccurate records, or request account closure (subject to mandatory statutory tax and pesticide register retention).
        </p>
        <p className="text-gray-700 text-sm">
          To exercise your data protection rights, please file an inquiry through our dedicated support ticket portal at{" "}
          <a href="/contact" className="text-emerald-700 font-semibold hover:underline">
            furrowmark.pk/contact
          </a>{" "}
          or email <strong>support@furrowmark.pk</strong>.
        </p>
      </section>
    </main>
  );
}
