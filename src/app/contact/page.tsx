export const dynamic = "force-dynamic";

import Link from "next/link";
import { submitSupportTicketAction } from "../actions";

export const metadata = {
  title: "Contact & Agronomic Support | Furrowmark",
  description:
    "Contact Furrowmark agricultural depot in Multan, Pakistan. Submit a support ticket, get chemical dosage advisory, or reach our licensed dealer desk.",
};

type Props = {
  searchParams: Promise<{ ticket?: string; success?: string; error?: string }>;
};

export default async function ContactPage({ searchParams }: Props) {
  const { ticket, success, error } = await searchParams;

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Contact Furrowmark & Support Desk
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Direct warehouse communication, agronomic crop advisory, order inquiries, and statutory RMA support.
        </p>
      </div>

      {/* Success Notification */}
      {success && ticket && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 text-emerald-950 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">Support Ticket Created Successfully</span>
          </div>
          <p className="text-sm">
            Your inquiry has been assigned reference number:{" "}
            <strong className="font-mono text-base text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {ticket}
            </strong>
          </p>
          <p className="text-xs text-emerald-800">
            Our Multan technical team reviews tickets during depot hours (8:00 AM to 6:00 PM). For urgent poison emergencies, contact Rescue 1122 or JPMC Poison Control (021-99205058).
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Physical Footprint & Dealership Credentials */}
        <div className="space-y-6">
          <div className="border rounded-2xl p-6 bg-gray-50/50 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              Multan Depot & Physical Headquarters
            </h2>

            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Physical Address:
                </p>
                <p className="font-medium text-gray-900 mt-0.5">
                  Furrowmark Agricultural Depot
                  <br />
                  Basti Bair Wala, Mouza Mardan Pur
                  <br />
                  Multan, Punjab, Pakistan
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Helpline (Tap to chat on WhatsApp):
                </p>
                <div className="flex flex-col gap-2 mt-1">
                  <a
                    href="https://wa.me/923005534323"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-fit bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    WhatsApp: +92 300 5534323
                  </a>
                  <a
                    href="https://wa.me/923004634494"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-fit bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    WhatsApp: +92 300 4634494
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Support Email:
                </p>
                <p className="font-medium text-gray-900 mt-0.5">
                  support@furrowmark.pk
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Operating Hours:
                </p>
                <p className="font-medium text-gray-900 mt-0.5">
                  Monday to Saturday: 8:00 AM to 6:00 PM PKT
                  <br />
                  <span className="text-xs text-gray-500">Sunday: Closed (Emergency dispatch on call)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Dealership Regulatory Verification */}
          <div className="border border-emerald-200 rounded-2xl p-6 bg-emerald-50/40 space-y-3 text-xs text-emerald-950">
            <h3 className="font-bold text-sm text-emerald-950">
              Official Dealer License Credentials
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Punjab Pesticide Dealer License:</strong>{" "}
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
                  DEP/MLT-AGRO/2024-8841
                </span>
                <br />
                <span className="text-gray-600 text-[11px]">
                  Issued by Directorate General of Pest Warning & Quality Control of Pesticides, Punjab.
                </span>
              </p>
              <p>
                <strong>Federal Seed Dealer Registration:</strong>{" "}
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
                  FSCRD-PB-5592
                </span>
                <br />
                <span className="text-gray-600 text-[11px]">
                  Registered with Federal Seed Certification & Registration Department (Ministry of National Food Security).
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Submit Support Ticket Form */}
        <section className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Submit a Support Ticket
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Need technical advice, order tracking, or return authorization? File a ticket below.
            </p>
          </div>

          <form action={submitSupportTicketAction} className="space-y-4 text-sm">
            <div>
              <label htmlFor="name" className="block font-medium text-gray-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g. Malik Bahawal"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block font-medium text-gray-700 mb-1">
                  Phone / Mobile Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="03001234567"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-medium text-gray-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="farmer@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block font-medium text-gray-700 mb-1">
                Inquiry Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                placeholder="e.g. Coragen dosage for cotton armyworm or Order FM-2026-..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label htmlFor="message" className="block font-medium text-gray-700 mb-1">
                Detailed Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="Describe your crop type, pest infestation symptoms, order reference number, or delivery inquiry..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 px-4 rounded-lg transition shadow-sm"
            >
              Submit Ticket to Multan Depot Desk
            </button>

            <p className="text-[11px] text-gray-500 text-center">
              Your inquiry is handled directly by licensed agronomists under our strict privacy data protection standards.
            </p>
          </form>
        </section>
      </div>

      <div className="pt-4 border-t flex items-center justify-between text-sm">
        <Link href="/" className="text-emerald-700 hover:underline">
          ← Back to Homepage
        </Link>
        <Link href="/about" className="text-emerald-700 hover:underline">
          Learn About Our Dealership →
        </Link>
      </div>
    </main>
  );
}
