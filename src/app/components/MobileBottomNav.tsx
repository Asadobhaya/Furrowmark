"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getGeneralWhatsAppUrl } from "../whatsapp";

interface MobileBottomNavProps {
  cartCount?: number;
}

export function MobileBottomNav({ cartCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isProducts = pathname.startsWith("/products");
  const isCart = pathname === "/cart";
  const isOrders = pathname.startsWith("/orders") || pathname === "/login";

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-3 py-1.5 flex items-center justify-around"
      aria-label="Mobile Bottom Navigation"
    >
      {/* Home */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isHome ? "text-emerald-800 font-semibold" : "text-gray-500 hover:text-gray-800"
        }`}
      >
        <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isHome ? 2.2 : 1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-[10px] leading-tight">Home</span>
      </Link>

      {/* Products */}
      <Link
        href="/products"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isProducts ? "text-emerald-800 font-semibold" : "text-gray-500 hover:text-gray-800"
        }`}
      >
        <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isProducts ? 2.2 : 1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="text-[10px] leading-tight">Catalog</span>
      </Link>

      {/* Cart with Live Counter */}
      <Link
        href="/cart"
        className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isCart ? "text-emerald-800 font-semibold" : "text-gray-500 hover:text-gray-800"
        }`}
      >
        <div className="relative">
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isCart ? 2.2 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-emerald-700 text-white text-[9px] font-bold px-1 rounded-full min-w-[15px] h-[15px] flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] leading-tight">Cart</span>
      </Link>

      {/* WhatsApp Advisory Hotline */}
      <a
        href={getGeneralWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-green-600 hover:text-green-700 transition"
      >
        <svg className="w-5 h-5 mb-0.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
        </svg>
        <span className="text-[10px] leading-tight font-medium">WhatsApp</span>
      </a>

      {/* Account / Support */}
      <Link
        href="/login"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isOrders ? "text-emerald-800 font-semibold" : "text-gray-500 hover:text-gray-800"
        }`}
      >
        <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isOrders ? 2.2 : 1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-[10px] leading-tight">Account</span>
      </Link>
    </nav>
  );
}
