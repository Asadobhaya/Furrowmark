"use client";

import { useState } from "react";

interface OwnerWhatsAppNotifierProps {
  orderRef: string;
  message: string;
  isNewOrder?: boolean;
  primaryPhone?: string;
  secondaryPhone?: string;
}

export function OwnerWhatsAppNotifier({
  orderRef,
  message,
  isNewOrder = false,
  primaryPhone = "923005534323",
  secondaryPhone = "923004634494",
}: OwnerWhatsAppNotifierProps) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const primaryUrl = `https://wa.me/${primaryPhone}?text=${encodeURIComponent(message)}`;
  const secondaryUrl = `https://wa.me/${secondaryPhone}?text=${encodeURIComponent(message)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <section className="bg-emerald-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-emerald-700/80 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-500/20 border border-green-400/40 text-green-300 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Send Order Details to Owner on WhatsApp
              </h2>
              {isNewOrder && (
                <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wide">
                  New Order
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Notify Multan depot management immediately with complete buyer details and product quantities.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs text-emerald-300 hover:text-white underline underline-offset-2 shrink-0 self-start sm:self-auto"
        >
          {showPreview ? "Hide Message Preview" : "View Message Preview"}
        </button>
      </div>

      {/* Message Preview Dropdown */}
      {showPreview && (
        <div className="bg-emerald-950/90 border border-emerald-800 rounded-2xl p-4 text-xs font-mono text-emerald-100 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
          {message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <a
          href={primaryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2.5 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-extrabold py-3.5 px-5 rounded-2xl text-xs sm:text-sm transition shadow-md"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
          <span>Send Full Order Summary to Owner (+92 300 5534323)</span>
        </a>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <a
            href={secondaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-emerald-100 font-semibold py-2.5 px-3 rounded-xl text-xs transition border border-emerald-600/70"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
            <span>Alternate: +92 300 4634494</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-emerald-100 font-semibold py-2.5 px-3 rounded-xl text-xs transition border border-emerald-600/70"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-300">Message Copied</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Message Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
