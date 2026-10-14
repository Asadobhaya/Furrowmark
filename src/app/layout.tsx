import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { ChatWidget } from "./components/ChatWidget";

export const metadata = {
  title: "Furrowmark | Certified Agricultural Inputs Store",
  description:
    "Licensed dealer for genuine hybrid seeds, regulated agrochemicals, fertilizers, and farm equipment in Pakistan.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        <header className="border-b p-4 flex flex-wrap items-center gap-4 md:gap-6 bg-white sticky top-0 z-40 shadow-xs">
          <Link href="/" className="font-bold text-xl text-emerald-800 tracking-tight">
            Furrowmark
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/products" className="hover:text-emerald-700">
              Products
            </Link>
            <Link href="/about" className="hover:text-emerald-700">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-emerald-700">
              Contact & Support
            </Link>
            <Link href="/payment-methods" className="hover:text-emerald-700">
              Payment Methods
            </Link>
          </nav>
          <div className="flex items-center gap-4 ml-auto text-sm font-medium">
            <Link href="/cart" className="hover:text-emerald-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              Cart
            </Link>
            <Link href="/login" className="hover:text-emerald-700 text-gray-600">
              Sign in
            </Link>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t bg-gray-50 text-gray-600 text-sm mt-12 py-8 px-4 space-y-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left space-y-1">
              <p className="font-semibold text-gray-800">
                Furrowmark Agricultural Inputs Store · Certified Genuine Supplies
              </p>
              <p className="text-xs text-gray-500">
                Punjab Pesticide License: DEP/MLT-AGRO/2024-8841 · FSC&RD Seed Reg: FSCRD-PB-5592
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <Link href="/about" className="hover:underline">
                About Dealership
              </Link>
              <Link href="/contact" className="hover:underline">
                Contact & Tickets
              </Link>
              <Link href="/payment-methods" className="hover:underline">
                Payment Methods
              </Link>
              <Link href="/shipping-policy" className="hover:underline">
                Shipping Policy
              </Link>
              <Link href="/return-policy" className="hover:underline">
                Return & RMA Policy
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
              <Link href="/staff/login" className="hover:underline text-gray-400 hover:text-gray-600">
                Staff Portal
              </Link>
            </div>
          </div>

          {/* Secure Payment and Depot Information Footer */}
          <div className="max-w-6xl mx-auto border-t border-gray-200 pt-4 text-xs text-gray-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <p>
              <strong>Depot Address:</strong> Grain & Seed Market, Khanewal Road, Multan, Punjab · Helpline: +92 (61) 450-8890
            </p>
            <p>
              <strong>Payment Security:</strong> Advance bank transfer details are provided securely after order checkout.
            </p>
          </div>
        </footer>

        <ChatWidget />
      </body>
    </html>
  );
}
