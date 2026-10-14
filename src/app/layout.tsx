import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { ChatWidget } from "./components/ChatWidget";

export const metadata = {
  title: "Furrowmark",
  description: "Agricultural inputs store",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        <header className="border-b p-4 flex items-center gap-6">
          <Link href="/products" className="font-bold text-xl text-green-800">
            Furrowmark
          </Link>
          <Link href="/products" className="text-sm font-medium hover:text-green-700">
            Products
          </Link>
          <Link href="/payment-methods" className="text-sm font-medium hover:text-green-700">
            Payment Accounts
          </Link>
          <Link href="/cart" className="text-sm font-medium hover:text-green-700">
            Cart
          </Link>
          <Link href="/login" className="text-sm font-medium hover:text-green-700 ml-auto">
            Sign in
          </Link>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t bg-gray-50 text-gray-600 text-sm mt-12 py-8 px-4 space-y-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-center md:text-left font-medium text-gray-700">
              Furrowmark Agricultural Inputs Store · Certified Genuine Supplies
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
              <Link href="/payment-methods" className="font-semibold text-green-800 hover:underline">
                Payment Accounts
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
            </div>
          </div>

          {/* Official Payment Accounts Banner */}
          <div className="max-w-6xl mx-auto border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">
              Official Receiving Accounts for Advance Orders (Title: Muhammad Asad):
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-1">
              <span><strong>Meezan Bank:</strong> 03130115156301 (Muhammad Asad)</span>
              <span><strong>Easypaisa:</strong> 03004634494 (Muhammad Asad)</span>
              <span><strong>Cash on Delivery:</strong> Available across Pakistan</span>
            </div>
          </div>
        </footer>

        <ChatWidget />
      </body>
    </html>
  );
}
