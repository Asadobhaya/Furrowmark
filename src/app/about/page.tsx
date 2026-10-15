export const dynamic = "force-dynamic";

import Link from "next/link";
import { Logo } from "../components/Logo";
import { getGeneralWhatsAppUrl } from "../whatsapp";

export const metadata = {
  title: "About Us & Dealership Credentials | Furrowmark",
  description:
    "Furrowmark is a licensed agricultural inputs dealer in Multan, Pakistan. Learn about our genuine supply chain, FEFO batch testing, and regulatory certifications.",
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Title with Logo */}
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            About Furrowmark Agricultural Dealership
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Certified Genuine Farm Supplies · Punjab Pesticide Dealer License DEP/MLT-AGRO/2024-8841
          </p>
        </div>
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-2xl shrink-0 self-start sm:self-auto">
          <Logo size="md" />
        </div>
      </div>

      {/* Mission */}
      <section className="space-y-4 text-gray-700 leading-relaxed text-sm md:text-base">
        <p>
          Founded in Multan, the central agricultural heartland of southern Punjab, Furrowmark was established to address the critical challenge facing Pakistani farmers: <strong>counterfeit, adulterated, and compromised agricultural inputs</strong>.
        </p>
        <p>
          Substandard pesticides, diluted micronutrients, and low-germination hybrid seeds inflict billions of rupees in yield losses annually across the Indus Basin. Furrowmark bridges the gap between premier multinational chemical formulators, certified seed corporations, and progressive Pakistani growers by operating an uncompromised, direct-distribution model.
        </p>
      </section>

      {/* Official Credentials */}
      <section className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-emerald-950">
          Statutory Dealer Authorization & Compliance
        </h2>
        <p className="text-sm text-emerald-900 leading-relaxed">
          Furrowmark operates in full compliance with the Agricultural Pesticides Ordinance 1971, Punjab Pesticides Control Rules 1973, and the Seed Act 1976 / Seed (Amendment) Act 2015.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-white border border-emerald-300 rounded-xl p-4 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Pesticide Distribution License
            </span>
            <p className="font-mono text-base font-bold text-gray-900">
              DEP/MLT-AGRO/2024-8841
            </p>
            <p className="text-xs text-gray-600">
              Issued by the Directorate General of Pest Warning & Quality Control of Pesticides, Agriculture Department, Government of the Punjab. Authorizes storage and distribution of Schedule-I registered agricultural chemicals.
            </p>
          </div>

          <div className="bg-white border border-emerald-300 rounded-xl p-4 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Federal Seed Registration
            </span>
            <p className="font-mono text-base font-bold text-gray-900">
              FSCRD-PB-5592
            </p>
            <p className="text-xs text-gray-600">
              Registered under the Federal Seed Certification & Registration Department (FSC&RD), Ministry of National Food Security & Research, Government of Pakistan. Authorizes commercial sale of certified hybrid and OP varieties.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Formulators */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          Direct Formulator Partnerships
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Every pack dispatched from our warehouse originates directly from primary formulation plants and certified seed processing units. We do not source from unregulated grey-market brokers.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-sm font-semibold text-gray-800">
          <div className="border rounded-lg p-3 bg-gray-50">Syngenta Pakistan</div>
          <div className="border rounded-lg p-3 bg-gray-50">FMC United Pakistan</div>
          <div className="border rounded-lg p-3 bg-gray-50">Bayer Crop Science</div>
          <div className="border rounded-lg p-3 bg-gray-50">Fauji Fertilizer Company</div>
          <div className="border rounded-lg p-3 bg-gray-50">Engro Fertilizers & Agri</div>
          <div className="border rounded-lg p-3 bg-gray-50">Pioneer Seeds Pakistan</div>
        </div>
      </section>

      {/* Warehouse & Storage Rigor */}
      <section className="border border-gray-200 rounded-2xl p-6 bg-white space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          Multan Warehouse Standards
        </h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong>First-Expired, First-Out (FEFO) Inventory:</strong> Chemical active ingredients degrade when subjected to prolonged warehouse heat. Our automated warehouse software strictly tracks lot numbers, manufacturing dates, and expiration intervals so no farmer receives stagnant or sub-potent chemistry.
          </p>
          <p>
            <strong>Temperature-Monitored Seed Storage:</strong> Certified hybrid seed germplasm requires cool aeration to maintain germination rates above 85-90%. Our seed bays are insulated against high summer temperatures in southern Punjab.
          </p>
          <p>
            <strong>Segregated Chemical Dispatch:</strong> To uphold human safety and prevent cross-contamination during transit, regulated agrochemicals are packed separately from seeds and agricultural tools in reinforced, leak-proof hazardous cargo packaging.
          </p>
        </div>
      </section>

      {/* Physical Visit & Contact */}
      <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-700 space-y-3">
        <h3 className="font-bold text-gray-900 text-base">Visit Our Multan Depot</h3>
        <p>
          Farmers, corporate growers, and agronomists are welcome to visit our physical facility at Basti Bair Wala, Mouza Mardan Pur, Multan. Helpline (WhatsApp):{" "}
          <a href={getGeneralWhatsAppUrl("923005534323")} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold hover:underline">+92 300 5534323</a>
          {" · "}
          <a href={getGeneralWhatsAppUrl("923004634494")} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold hover:underline">+92 300 4634494</a>
        </p>
        <div className="flex flex-wrap gap-4 pt-1">
          <Link
            href="/contact"
            className="bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-800 transition text-xs"
          >
            Contact Desk & Support Ticket
          </Link>
          <Link
            href="/products"
            className="border border-gray-300 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition text-xs"
          >
            Explore Catalog
          </Link>
        </div>
      </section>
    </main>
  );
}
