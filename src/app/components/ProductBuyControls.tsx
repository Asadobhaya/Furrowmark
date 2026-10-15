"use client";

import { useState } from "react";
import { formatPKR } from "../format";
import { QuantityStepper } from "./QuantityStepper";
import { addToCartAction } from "../actions";

interface Variant {
  id: string;
  packSize: string;
  priceMinor: number;
  availableStock?: number;
}

interface ProductBuyControlsProps {
  productId: string;
  productName: string;
  brandName: string;
  variants: Variant[];
  whatsappInquiryUrl: string;
}

export function ProductBuyControls({
  productId,
  variants,
  whatsappInquiryUrl,
}: ProductBuyControlsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState<number>(1);

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  const isOutOfStock = (selectedVariant?.availableStock ?? 0) <= 0;

  return (
    <>
      <form action={addToCartAction} className="border-t border-gray-200 pt-4 space-y-4">
        <input type="hidden" name="back" value={`/products/${productId}`} />
        <input type="hidden" name="variantId" value={selectedVariantId} />

        {/* Variant / Pack Size Selector Cards */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">
            Select Pack Size & Formulation
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {variants.map((v) => {
              const isSelected = v.id === selectedVariantId;
              const inStock = (v.availableStock ?? 0) > 0;

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`text-left border rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs ${
                    isSelected
                      ? "border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700"
                      : "border-gray-200 bg-white hover:border-emerald-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">
                      {v.packSize}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                    <span className="font-extrabold text-sm sm:text-base text-emerald-900">
                      {formatPKR(v.priceMinor)}
                    </span>
                    <span
                      className={`font-semibold text-[11px] ${
                        inStock ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {inStock ? `In Stock (${v.availableStock})` : "Out of Stock"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity & Add to Cart Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-xs font-bold text-gray-600">Quantity:</span>
            <QuantityStepper
              name="quantity"
              initialValue={quantity}
              min={1}
              max={selectedVariant?.availableStock ?? 99}
              onChange={(val) => setQuantity(val)}
            />
          </div>

          <button
            type="submit"
            disabled={isOutOfStock}
            className="flex-1 bg-emerald-800 hover:bg-emerald-900 active:scale-95 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-2.5 sm:py-3 px-5 rounded-2xl transition shadow-xs text-center flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
          </button>
        </div>

        {/* Direct WhatsApp Agronomist Advice Button */}
        <div className="pt-1">
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-50 hover:bg-green-100 active:scale-95 text-green-900 border border-green-300 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition"
          >
            <svg className="w-4 h-4 fill-current text-green-700" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.874.801 2.791.801 3.18 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.787-5.767-5.787zm3.377 8.219c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.072-.494-1.637-.674-2.678-2.336-2.76-2.444-.081-.108-.66-1.876-.66-1.677 0-.796.417-1.189.566-1.343.149-.153.324-.192.433-.192.108 0 .216.002.311.007.1.005.234-.038.366.279.135.327.461 1.124.502 1.206.041.082.069.177.014.286-.054.108-.082.176-.162.272-.081.096-.17.214-.243.287-.081.082-.165.171-.071.334.095.162.42 1.002.902 1.431.62.551 1.143.722 1.305.803.163.082.257.069.351-.041.095-.109.405-.472.513-.635.109-.163.217-.136.365-.082.149.054.945.446 1.107.527.162.082.27.122.311.19.041.069.041.405-.103.81zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.385A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
            <span>Ask Multan Agronomist on WhatsApp about this Formulation</span>
          </a>
        </div>
      </form>

      {/* Mobile Sticky Quick-Action Bar */}
      {selectedVariant && (
        <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2 flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] text-gray-500 block leading-tight">
              {selectedVariant.packSize}
            </span>
            <span className="text-emerald-900 font-extrabold text-sm leading-tight block">
              {formatPKR(selectedVariant.priceMinor)}
            </span>
          </div>

          <form action={addToCartAction} className="flex items-center gap-2">
            <input type="hidden" name="back" value={`/products/${productId}`} />
            <input type="hidden" name="variantId" value={selectedVariantId} />
            <input type="hidden" name="quantity" value={quantity} />
            <button
              type="submit"
              disabled={isOutOfStock}
              className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 disabled:bg-gray-300 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>{isOutOfStock ? "Sold Out" : "Add to Cart"}</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
