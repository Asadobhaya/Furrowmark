import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { Logo } from "./components/Logo";
import { getGeneralWhatsAppUrl } from "./whatsapp";
import { getCartId, getCustomerSession, getStaffSession } from "@/modules/web/session";
import { CartService } from "@/modules/cart/service";

export const metadata = {
  title: "Furrowmark | Certified Agricultural Inputs Store",
  description:
    "Licensed dealer for genuine hybrid seeds, regulated agrochemicals, fertilizers, and farm equipment in Pakistan.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cartId = await getCartId(false).catch(() => null);
  const cart = cartId ? await CartService.getCartView({ cartId }).catch(() => null) : null;
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const customerSession = await getCustomerSession().catch(() => null);
  const staffSession = await getStaffSession().catch(() => null);

  const activeEmail = staffSession?.userId ? "Staff Desk" : customerSession?.userId;
  const isStaff = !!staffSession;

  return (
    <html lang="en">
      <head>
        {/* Chatzy Embedded Chatbot Widget & Mobile Shadow-DOM Elevation Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === "undefined") return;

                function injectShadowStyles(root) {
                  if (!root) return;
                  try {
                    var style = root.querySelector("#chatzy-mobile-override");
                    if (!style) {
                      style = document.createElement("style");
                      style.id = "chatzy-mobile-override";
                      root.appendChild(style);
                    }
                    var isProduct = Boolean(document.querySelector(".product-mobile-bar"));
                    var bottomPos = isProduct ? "9.5rem" : "6rem";
                    var css = "@media (max-width: 768px) { " +
                      ":root, :host { --chatzy-icon-width: 52px !important; --chatzy-icon-height: 52px !important; } " +
                      ".chatzy-chatbot-wrapper { bottom: " + bottomPos + " !important; right: 1.25rem !important; margin: 0 !important; } " +
                      ".chatzy-chatbot-icon { width: 52px !important; height: 52px !important; } " +
                      ".chatzy-chatbot-icon img { width: 100% !important; height: 100% !important; object-fit: cover !important; } " +
                      "}";
                    if (style.textContent !== css) {
                      style.textContent = css;
                    }
                    if (root.lastChild !== style) {
                      root.appendChild(style);
                    }
                  } catch (e) {}
                }

                function handleShadowRoot(root) {
                  if (!root) return;
                  injectShadowStyles(root);
                  try {
                    var obs = new MutationObserver(function() {
                      injectShadowStyles(root);
                    });
                    obs.observe(root, { childList: true });
                  } catch (e) {}
                }

                try {
                  var origAttach = Element.prototype.attachShadow;
                  Element.prototype.attachShadow = function() {
                    var root = origAttach.apply(this, arguments);
                    var self = this;
                    setTimeout(function() {
                      if (self.id === "chatzy-shadow-host" || !self.id) {
                        handleShadowRoot(root);
                      }
                    }, 0);
                    return root;
                  };
                } catch (e) {}

                function checkExisting() {
                  var host = document.getElementById("chatzy-shadow-host");
                  if (host && host.shadowRoot) {
                    handleShadowRoot(host.shadowRoot);
                  }
                }

                if (document.readyState === "loading") {
                  document.addEventListener("DOMContentLoaded", checkExisting);
                } else {
                  checkExisting();
                }

                var pollTimer = setInterval(checkExisting, 250);
                setTimeout(function() {
                  clearInterval(pollTimer);
                }, 15000);
              })();
            `,
          }}
        />
        <link
          rel="stylesheet"
          href="https://chatzy-kb-store.s3.amazonaws.com/icons/5ab07987-b5db-477c-82ff-1287e0883acb"
        />
        <script
          src="https://chatzy-kb-store.s3.amazonaws.com/icons/56706cc4-b3ba-4eba-9610-f2fb07008a5c"
          id="c72e045b-76f8-4307-894a-57c318fdb495"
          className="chatzy_widget_script"
          defer
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (max-width: 768px) {
                :root {
                  --chatzy-icon-width: 52px !important;
                  --chatzy-icon-height: 52px !important;
                }
                .chatzy-chatbot-wrapper {
                  bottom: 6rem !important;
                  right: 1.25rem !important;
                  margin: 0 !important;
                }
                body:has(.product-mobile-bar) .chatzy-chatbot-wrapper {
                  bottom: 9.5rem !important;
                }
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-gray-900 antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-16 md:pb-0">
        {/* Responsive Navbar with Desktop & Mobile Menus */}
        <Navbar cartCount={cartCount} userEmail={activeEmail} isStaff={isStaff} />

        {/* Main Content Area */}
        <div className="flex-1">{children}</div>

        {/* Professional Enterprise Agricultural Footer */}
        <footer className="border-t border-gray-200 bg-white text-gray-600 text-xs sm:text-sm mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Col 1: Dealership Identity & Location */}
              <div className="space-y-3">
                <Logo size="sm" showSubtext={false} />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Licensed direct-distribution depot supplying verified formulator-sealed seeds, crop protection chemicals, and fertilizers to growers across Pakistan.
                </p>
                <div className="pt-1 text-xs text-gray-700 space-y-1">
                  <p>
                    <strong>Depot:</strong> Basti Bair Wala, Mouza Mardan Pur, Multan, Punjab
                  </p>
                  <p>
                    <strong>Hours:</strong> Mon - Sat: 8:00 AM - 6:00 PM PKT
                  </p>
                </div>
              </div>

              {/* Col 2: Catalog Categories */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                  Product Categories
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/products?category=seeds" className="hover:text-emerald-800 transition">
                      Certified Hybrid Seeds
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=fertilizers" className="hover:text-emerald-800 transition">
                      Macronutrient Fertilizers (Urea / DAP / SOP)
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=plant-protection" className="hover:text-emerald-800 transition">
                      Plant Protection (Coragen, Nativo, Virtako)
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=nutrients-foliar" className="hover:text-emerald-800 transition">
                      Chelated Micronutrients & Foliars
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=agricultural-tools" className="hover:text-emerald-800 transition">
                      Knapsack Sprayers & Equipment
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 3: Direct Farmer Helplines & WhatsApp */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                  Helpline & Support Desk
                </h3>
                <div className="space-y-2">
                  <a
                    href={getGeneralWhatsAppUrl("923005534323")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold px-3 py-2 rounded-xl text-xs transition border border-emerald-200 w-full"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>WhatsApp: +92 300 5534323</span>
                  </a>
                  <a
                    href={getGeneralWhatsAppUrl("923004634494")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold px-3 py-2 rounded-xl text-xs transition border border-emerald-200 w-full"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>WhatsApp: +92 300 4634494</span>
                  </a>
                </div>
                <div className="pt-1 text-xs">
                  <Link href="/contact" className="text-emerald-700 font-medium hover:underline">
                    Submit Formal Support Ticket →
                  </Link>
                </div>
              </div>

              {/* Col 4: Statutory Licensing & Policies */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                  Statutory Licenses & Legal
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-[11px] text-gray-600 space-y-1">
                  <p>
                    <strong>Pesticide License:</strong> DEP/MLT-AGRO/2024-8841
                  </p>
                  <p>
                    <strong>Seed Registration:</strong> FSCRD-PB-5592
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Directorate General of Pest Warning & Federal Seed Certification.
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 pt-1">
                  <Link href="/shipping-policy" className="hover:text-emerald-800">
                    Shipping Policy
                  </Link>
                  <Link href="/return-policy" className="hover:text-emerald-800">
                    Return Policy
                  </Link>
                  <Link href="/privacy" className="hover:text-emerald-800">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="hover:text-emerald-800">
                    Terms
                  </Link>
                  <Link href="/staff/login" className="hover:text-emerald-800 text-gray-400">
                    Staff Desk
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Copyright Strip */}
            <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
              <p>
                Furrowmark Multan Agricultural Supplies. All formulator brand marks belong to their respective holders.
              </p>
              <p>
                Certified Formulations · First-Expired, First-Out (FEFO) Dispatch
              </p>
            </div>
          </div>
        </footer>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <MobileBottomNav cartCount={cartCount} />
      </body>
    </html>
  );
}
