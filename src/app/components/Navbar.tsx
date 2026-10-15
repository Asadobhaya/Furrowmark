"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "./Logo";

interface NavbarProps {
  cartCount?: number;
  userEmail?: string;
  isStaff?: boolean;
}

export function Navbar({ cartCount = 0, userEmail, isStaff = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = "/products";
    }
  };

  const navLinks = [
    { href: "/products", label: "Catalog" },
    { href: "/about", label: "Dealership & License" },
    { href: "/contact", label: "Depot & Advisory" },
    { href: "/payment-methods", label: "Payment Methods" },
  ];

  return (
    <>
      {/* Top Utility & Regulatory Header Strip */}
      <div className="bg-emerald-950 text-emerald-100 text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="truncate">
              Punjab Pesticide License: <strong>DEP/MLT-AGRO/2024-8841</strong> · Multan Central Depot
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/923005534323"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-200 hover:text-white font-medium transition"
              title="Chat with Multan Depot Desk on WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current text-green-400" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              <span className="hidden xs:inline">WhatsApp Hotline:</span> +92 300 5534323
            </a>
            <span className="text-emerald-800">|</span>
            <Link
              href="/staff/login"
              className="text-emerald-300 hover:text-white transition"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center shrink-0 group">
            <Logo size="md" />
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-md mx-4"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Coragen, Urea, seeds, sprayers..."
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-20 py-2 text-sm text-gray-900 placeholder-gray-500 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-gray-700">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 font-semibold"
                      : "hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action cluster: Cart, User, Mobile menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Link with Badge */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-gray-100/80 hover:bg-emerald-50 hover:text-emerald-800 text-gray-800 px-3 py-2 rounded-xl text-sm font-semibold transition border border-gray-200"
              aria-label="View shopping cart"
            >
              <svg className="w-5 h-5 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 ? (
                <span className="bg-emerald-700 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[20px] text-center">
                  {cartCount}
                </span>
              ) : (
                <span className="text-xs text-gray-500 font-normal hidden sm:inline">(0)</span>
              )}
            </Link>

            {/* User Session / Login Button */}
            {userEmail ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={isStaff ? "/staff/orders" : "/orders"}
                  className="bg-emerald-100/70 text-emerald-900 border border-emerald-300 hover:bg-emerald-200/80 text-xs font-semibold px-3 py-2 rounded-xl transition"
                >
                  {isStaff ? "Staff Desk" : "Orders"}
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center text-sm font-medium text-gray-700 hover:text-emerald-800 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
              >
                Sign in
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in fade-in duration-150">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or chemicals..."
                className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="submit"
                className="bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl"
              >
                Search
              </button>
            </form>

            {/* Mobile Links */}
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-200 text-gray-800 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Full Catalog</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-200 text-gray-800 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Dealership</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-200 text-gray-800 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contact Desk</span>
              </Link>
              <Link
                href="/payment-methods"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-200 text-gray-800 flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Payments</span>
              </Link>
            </div>

            {/* Direct WhatsApp Callout in Mobile Drawer */}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <a
                href="https://wa.me/923005534323"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xs transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
                <span>WhatsApp Helpline (+92 300 5534323)</span>
              </a>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 px-1">
                <span>Depot: Basti Bair Wala, Multan</span>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-medium text-emerald-700 hover:underline"
                >
                  Sign In / Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
