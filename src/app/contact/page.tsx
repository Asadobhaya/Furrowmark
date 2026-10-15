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
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Contact Furrowmark & Support Desk
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Direct warehouse communication, agronomic crop advisory, order inquiries, and statutory RMA support.
        </p>
      </div>

      {/* Success Notification */}
      {success && ticket && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-emerald-950 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="font-bold text-base sm:text-lg">Support Ticket Created Successfully</span>
          </div>
          <p className="text-xs sm:text-sm">
            Your inquiry has been assigned reference number:{" "}
            <strong className="font-mono text-sm sm:text-base text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              {ticket}
            </strong>
          </p>
          <p className="text-xs text-emerald-800">
            Our Multan technical team reviews tickets during depot hours (8:00 AM to 6:00 PM). For urgent poison emergencies, contact Rescue 1122 or JPMC Poison Control (021-99205058).
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="bg-red-50 border border-red-300 rounded-2xl p-4 text-red-800 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* Physical Footprint & Dealership Credentials */}
        <div className="space-y-6">
          <div className="border border-gray-200/90 rounded-3xl p-5 sm:p-6 bg-white shadow-2xs space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
              Multan Depot & Physical Headquarters
            </h2>

            <div className="space-y-3.5 text-xs sm:text-sm text-gray-700">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Physical Address:
                </p>
                <p className="font-semibold text-gray-900 mt-1 leading-snug">
                  Furrowmark Agricultural Depot
                  <br />
                  Basti Bair Wala, Mouza Mardan Pur
                  <br />
                  Multan, Punjab, Pakistan
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Helpline (Click to chat on WhatsApp):
                </p>
                <div className="flex flex-col gap-2 mt-2">
                  <a
                    href="https://wa.me/923005534323"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-full sm:w-fit bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl transition text-xs shadow-2xs"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                    <span>WhatsApp: +92 300 5534323</span>
                  </a>
                  <a
                    href="https://wa.me/923004634494"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-full sm:w-fit bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl transition text-xs shadow-2xs"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                    <span>WhatsApp: +92 300 4634494</span>
                  </a>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Support Email:
                </p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  support@furrowmark.pk
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Operating Hours:
                </p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  Monday to Saturday: 8:00 AM to 6:00 PM PKT
                  <br />
                  <span className="text-xs text-gray-500 font-normal">Sunday: Closed (Emergency dispatch on call)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Dealership Regulatory Verification */}
          <div className="border border-emerald-200 rounded-3xl p-5 sm:p-6 bg-emerald-50/50 space-y-3 text-xs text-emerald-950 shadow-2xs">
            <h3 className="font-bold text-sm text-emerald-950">
              Official Dealer License Credentials
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Punjab Pesticide Dealer License:</strong>{" "}
                <span className="font-mono bg-white px-2 py-0.5 rounded-lg border border-emerald-200 font-bold">
                  DEP/MLT-AGRO/2024-8841
                </span>
                <br />
                <span className="text-gray-600 text-[11px]">
                  Issued by Directorate General of Pest Warning & Quality Control of Pesticides, Punjab.
                </span>
              </p>
              <p>
                <strong>Federal Seed Dealer Registration:</strong>{" "}
                <span className="font-mono bg-white px-2 py-0.5 rounded-lg border border-emerald-200 font-bold">
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
        <section className="border border-gray-200/90 rounded-3xl p-5 sm:p-7 bg-white shadow-2xs space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Submit a Support Ticket
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Need technical advice, order tracking, or return authorization? File a ticket below.
            </p>
          </div>

          <form action={submitSupportTicketAction} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label htmlFor="name" className="block font-bold text-gray-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g. Malik Bahawal"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block font-bold text-gray-700 mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="03001234567"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-bold text-gray-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="farmer@example.com"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block font-bold text-gray-700 mb-1">
                Inquiry Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                placeholder="e.g. Coragen dosage for cotton armyworm or Order FM-2026-..."
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
              />
            </div>

            <div>
              <label htmlFor="message" className="block font-bold text-gray-700 mb-1">
                Detailed Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="Describe your crop type, pest infestation symptoms, order reference number, or delivery inquiry..."
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold py-2.5 sm:py-3 px-4 rounded-xl transition shadow-xs text-xs sm:text-sm"
            >
              Submit Ticket to Multan Depot Desk
            </button>

            <p className="text-[11px] text-gray-500 text-center">
              Your inquiry is handled directly by licensed agronomists under our strict privacy data protection standards.
            </p>
          </form>
        </section>
      </div>

      <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs sm:text-sm">
        <Link href="/" className="text-emerald-800 font-semibold hover:underline">
          ← Back to Homepage
        </Link>
        <Link href="/about" className="text-emerald-800 font-semibold hover:underline">
          Learn About Our Dealership →
        </Link>
      </div>
    </main>
  );
}
