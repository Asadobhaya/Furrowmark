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
        <header className="border-b p-4 flex gap-4">
          <Link href="/products" className="font-bold text-green-800">
            Furrowmark
          </Link>
          <Link href="/cart" className="hover:underline">
            Cart
          </Link>
          <Link href="/login" className="hover:underline ml-auto">
            Sign in
          </Link>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t bg-gray-50 text-gray-600 text-sm mt-12 py-6 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-center md:text-left">
              Furrowmark Agricultural Inputs Store. Certified genuine supplies.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
              <Link href="/shipping-policy" className="hover:underline">
                Shipping Policy
              </Link>
              <Link href="/return-policy" className="hover:underline">
                Return & RMA Policy
              </Link>
            </div>
          </div>
        </footer>

        <ChatWidget />
      </body>
    </html>
  );
}
