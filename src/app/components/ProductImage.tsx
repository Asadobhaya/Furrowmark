import React from "react";

interface ProductImageProps {
  slug?: string;
  className?: string;
  containerClass?: string;
  alt?: string;
}

const PRODUCT_PHOTO_MAP: Record<string, { src: string; title: string }> = {
  "fmc-coragen-20-sc": {
    src: "/images/products/coragen.jpg",
    title: "FMC Coragen 20 SC Insecticide",
  },
  "bayer-nativo-75-wg": {
    src: "/images/products/nativo.jpg",
    title: "Bayer Nativo 75 WG Fungicide",
  },
  "agripro-battery-sprayer-16l": {
    src: "/images/products/sprayer.jpg",
    title: "AgriPro 16L Battery Knapsack Sprayer",
  },
  "engro-urea-sona-fertilizer": {
    src: "/images/products/urea.jpg",
    title: "Sona Urea 50kg Fertilizer",
  },
  "engro-dap-fertilizer": {
    src: "/images/products/dap.jpg",
    title: "Engro DAP 50kg Fertilizer",
  },
  "fauji-sop-potash-fertilizer": {
    src: "/images/products/sop.jpg",
    title: "Fauji SOP 50kg Fertilizer",
  },
  "syngenta-virtako-insecticide": {
    src: "/images/products/virtako.jpg",
    title: "Syngenta Virtako 4kg Insecticide",
  },
  "syngenta-amistar-top": {
    src: "/images/products/amistar.jpg",
    title: "Syngenta Amistar Top 200ml Fungicide",
  },
  "engro-zorawar-zinc-33": {
    src: "/images/products/zinc.jpg",
    title: "Engro Zorawar Zinc 33% 5kg",
  },
  "bayer-foliar-npk-20-20-20": {
    src: "/images/products/npk.jpg",
    title: "Bayer Bayfolan NPK 20-20-20 1kg",
  },
  "pioneer-hybrid-corn-30y87": {
    src: "/images/products/corn.jpg",
    title: "Pioneer 30Y87 Hybrid Corn Seed",
  },
  "punjab-seed-cotton-bs-15": {
    src: "/images/products/cotton.jpg",
    title: "Punjab Seed Corporation Cotton Seed BS-15",
  },
  "wheat-faisalabad-2008": {
    src: "/images/products/wheat.jpg",
    title: "Certified Wheat Seed Faisalabad-2008",
  },
};

export function ProductImage({
  slug = "",
  className = "",
  containerClass = "h-44 w-full",
  alt,
}: ProductImageProps) {
  const s = slug.toLowerCase();
  const c = className.toLowerCase();

  let photo = PRODUCT_PHOTO_MAP[s];
  if (!photo) {
    if (s.includes("coragen")) photo = PRODUCT_PHOTO_MAP["fmc-coragen-20-sc"];
    else if (s.includes("nativo")) photo = PRODUCT_PHOTO_MAP["bayer-nativo-75-wg"];
    else if (
      s.includes("spray") ||
      s.includes("tool") ||
      c === "tool"
    )
      photo = PRODUCT_PHOTO_MAP["agripro-battery-sprayer-16l"];
    else if (s.includes("urea"))
      photo = PRODUCT_PHOTO_MAP["engro-urea-sona-fertilizer"];
    else if (s.includes("dap"))
      photo = PRODUCT_PHOTO_MAP["engro-dap-fertilizer"];
    else if (s.includes("sop") || s.includes("potash"))
      photo = PRODUCT_PHOTO_MAP["fauji-sop-potash-fertilizer"];
    else if (s.includes("virtako"))
      photo = PRODUCT_PHOTO_MAP["syngenta-virtako-insecticide"];
    else if (s.includes("amistar"))
      photo = PRODUCT_PHOTO_MAP["syngenta-amistar-top"];
    else if (s.includes("zinc") || s.includes("zorawar"))
      photo = PRODUCT_PHOTO_MAP["engro-zorawar-zinc-33"];
    else if (
      s.includes("npk") ||
      s.includes("foliar") ||
      s.includes("booster")
    )
      photo = PRODUCT_PHOTO_MAP["bayer-foliar-npk-20-20-20"];
    else if (s.includes("corn") || s.includes("maize"))
      photo = PRODUCT_PHOTO_MAP["pioneer-hybrid-corn-30y87"];
    else if (s.includes("cotton"))
      photo = PRODUCT_PHOTO_MAP["punjab-seed-cotton-bs-15"];
    else if (s.includes("wheat") || c === "seed")
      photo = PRODUCT_PHOTO_MAP["wheat-faisalabad-2008"];
    else photo = PRODUCT_PHOTO_MAP["fmc-coragen-20-sc"];
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-white ${containerClass}`}
    >
      <img
        src={photo.src}
        alt={alt ?? photo.title}
        loading="lazy"
        className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
}
