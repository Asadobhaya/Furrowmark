export const metadata = {
  title: "Privacy Policy - Furrowmark",
  description:
    "Privacy and data protection terms for Furrowmark agricultural commerce platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">
        Privacy & Data Protection Policy
      </h1>

      <p className="text-gray-700 leading-relaxed">
        Furrowmark is committed to protecting the privacy of farmers,
        agricultural professionals, and partners who use our platform. This
        policy outlines our data handling practices under the electronic
        transaction laws and statutory consumer data standards of Pakistan.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          1. Information We Collect
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Account & Order Details:</strong> Full name, phone number,
            delivery address, CNIC details where required for regulated
            agrochemical tracking, and order transaction history.
          </li>
          <li>
            <strong>Payment Information:</strong> For advance bank payments and
            Easypaisa, we record the transaction reference submitted by the
            customer. We never request or store bank account passwords, ATM
            PINs, or sensitive payment credentials.
          </li>
          <li>
            <strong>Customer Support Logs:</strong> Interactions with our
            automated assistant and customer service team are logged strictly
            for operational resolution and quality assurance. Emergency poison
            control queries are retained with high security for medical
            verification.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          2. Automated Data Retention & Deletion Schedules
        </h2>
        <p className="text-gray-700 leading-relaxed">
          In compliance with our minimal data retention framework, our automated
          background maintenance workers enforce strict deletion schedules:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Customer Support Chat Records:</strong> Deleted
            automatically 30 days after creation.
          </li>
          <li>
            <strong>Guest Shopping Carts:</strong> Purged automatically after 30
            days of inactivity.
          </li>
          <li>
            <strong>Expired User Sessions:</strong> Purged 30 days
            post-expiration.
          </li>
          <li>
            <strong>Catalog Search Analytics:</strong> Retained for 90 days and
            stripped of personal identifiers.
          </li>
          <li>
            <strong>Authentication & Login Logs:</strong> Retained for 90 days
            for brute-force defense, then automatically purged.
          </li>
          <li>
            <strong>Statutory Tax and Pesticide Sales Registers:</strong>{" "}
            Retained in immutable audit storage for the duration mandated by
            federal and provincial agricultural pesticide regulations.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          3. Information Sharing and Disclosure
        </h2>
        <p className="text-gray-700 leading-relaxed">
          We do not sell, rent, or trade your personal information. Data is
          shared exclusively with:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Licensed Logistics Providers:</strong> To deliver physical
            agricultural parcels to your farm or premises. Hazardous
            agrochemicals are manifested separately per transportation safety
            regulations.
          </li>
          <li>
            <strong>Regulatory Authorities:</strong> Where disclosure is
            mandated by Pakistani agricultural inspectorates or judicial
            authorities under pesticide handling statutes.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          4. Your Data Protection Rights
        </h2>
        <p className="text-gray-700 leading-relaxed">
          You have the right to request access to the personal data we hold
          about you, request rectification of erroneous records, or request
          account erasure (subject to statutory financial and pesticide register
          retention requirements). To submit a request, contact our data
          protection team via support ticket.
        </p>
      </section>
    </main>
  );
}
