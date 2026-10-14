import React from "react";

interface ProductImageProps {
  slug?: string;
  className?: string;
  containerClass?: string;
}

export function ProductImage({ slug = "", className = "", containerClass = "h-44 w-full" }: ProductImageProps) {
  const s = slug.toLowerCase();
  const c = className.toLowerCase();

  // 1. Cotton Seed
  if (s.includes("cotton") || (c === "seed" && !s.includes("corn") && !s.includes("wheat"))) {
    return (
      <div className={`flex items-center justify-center ${containerClass}`}>
        <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
          <rect width="300" height="300" fill="#F0FDF4" rx="16"/>
          <path d="M70,75 L230,75 L215,255 L85,255 Z" fill="#FFFFFF" stroke="#059669" strokeWidth="4"/>
          <rect x="60" y="60" width="180" height="15" fill="#059669" rx="3"/>
          <line x1="60" y1="67" x2="240" y2="67" stroke="#34D399" strokeWidth="2" strokeDasharray="6,4"/>
          <rect x="75" y="90" width="150" height="36" fill="#047857" rx="4"/>
          <text x="150" y="113" fill="#FFFFFF" fontFamily="sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle">ENGRO AGRITECH</text>
          <circle cx="150" cy="165" r="28" fill="#ECFDF5" stroke="#10B981" strokeWidth="2"/>
          <circle cx="140" cy="160" r="12" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5"/>
          <circle cx="160" cy="160" r="12" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5"/>
          <circle cx="150" cy="172" r="12" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5"/>
          <path d="M150,185 L150,200" stroke="#047857" strokeWidth="3" strokeLinecap="round"/>
          <text x="150" y="220" fill="#064E3B" fontFamily="sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle">COTTON SEED BS-15</text>
          <rect x="110" y="232" width="80" height="18" fill="#D1FAE5" rx="9"/>
          <text x="150" y="245" fill="#047857" fontFamily="sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">10 KG NET</text>
        </svg>
      </div>
    );
  }

  // 2. Corn / Maize Seed
  if (s.includes("corn") || s.includes("maize")) {
    return (
      <div className={`flex items-center justify-center ${containerClass}`}>
        <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
          <rect width="300" height="300" fill="#FEFCE8" rx="16"/>
          <path d="M70,75 L230,75 L215,255 L85,255 Z" fill="#FFFFFF" stroke="#D97706" strokeWidth="4"/>
          <rect x="60" y="60" width="180" height="15" fill="#D97706" rx="3"/>
          <line x1="60" y1="67" x2="240" y2="67" stroke="#FDE047" strokeWidth="2" strokeDasharray="6,4"/>
          <rect x="75" y="90" width="150" height="36" fill="#B45309" rx="4"/>
          <text x="150" y="113" fill="#FFFFFF" fontFamily="sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle">PIONEER SEEDS</text>
          <circle cx="150" cy="165" r="28" fill="#FEF9C3" stroke="#F59E0B" strokeWidth="2"/>
          <path d="M142,150 C142,145 158,145 158,150 L156,180 C156,185 144,185 144,180 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2"/>
          <path d="M136,170 C136,160 144,152 144,175" stroke="#15803D" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M164,170 C164,160 156,152 156,175" stroke="#15803D" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <text x="150" y="220" fill="#78350F" fontFamily="sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle">HYBRID CORN 30Y87</text>
          <rect x="110" y="232" width="80" height="18" fill="#FEF08A" rx="9"/>
          <text x="150" y="245" fill="#B45309" fontFamily="sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">15 KG NET</text>
        </svg>
      </div>
    );
  }

  // 3. Wheat Seed
  if (s.includes("wheat")) {
    return (
      <div className={`flex items-center justify-center ${containerClass}`}>
        <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
          <rect width="300" height="300" fill="#FFFBEB" rx="16"/>
          <path d="M70,75 L230,75 L215,255 L85,255 Z" fill="#FFFFFF" stroke="#92400E" strokeWidth="4"/>
          <rect x="60" y="60" width="180" height="15" fill="#92400E" rx="3"/>
          <line x1="60" y1="67" x2="240" y2="67" stroke="#FDE68A" strokeWidth="2" strokeDasharray="6,4"/>
          <rect x="75" y="90" width="150" height="36" fill="#78350F" rx="4"/>
          <text x="150" y="113" fill="#FFFFFF" fontFamily="sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle">ENGRO AGRITECH</text>
          <circle cx="150" cy="165" r="28" fill="#FEF3C7" stroke="#D97706" strokeWidth="2"/>
          <line x1="150" y1="145" x2="150" y2="185" stroke="#B45309" strokeWidth="2.5"/>
          <ellipse cx="143" cy="155" rx="6" ry="3" fill="#F59E0B" transform="rotate(-30 143 155)"/>
          <ellipse cx="157" cy="155" rx="6" ry="3" fill="#F59E0B" transform="rotate(30 157 155)"/>
          <ellipse cx="143" cy="165" rx="6" ry="3" fill="#F59E0B" transform="rotate(-30 143 165)"/>
          <ellipse cx="157" cy="165" rx="6" ry="3" fill="#F59E0B" transform="rotate(30 157 165)"/>
          <ellipse cx="150" cy="148" rx="6" ry="3" fill="#F59E0B" transform="rotate(90 150 148)"/>
          <text x="150" y="220" fill="#78350F" fontFamily="sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle">FAISALABAD WHEAT 08</text>
          <rect x="110" y="232" width="80" height="18" fill="#FDE68A" rx="9"/>
          <text x="150" y="245" fill="#92400E" fontFamily="sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">50 KG NET</text>
        </svg>
      </div>
    );
  }

  // 4. Sona Urea
  if (s.includes("urea")) {
    return (
      <div className={`flex items-center justify-center ${containerClass}`}>
        <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
          <rect width="300" height="300" fill="#F0FDF4" rx="16"/>
          <path d="M70,70 L230,70 L215,260 L85,260 Z" fill="#FFFFFF" stroke="#16A34A" strokeWidth="4"/>
          <rect x="60" y="55" width="180" height="15" fill="#16A34A" rx="3"/>
          <line x1="60" y1="62" x2="240" y2="62" stroke="#86EFAC" strokeWidth="2" strokeDasharray="6,4"/>
          <rect x="75" y="85" width="150" height="38" fill="#15803D" rx="4"/>
          <text x="150" y="102" fill="#FEF08A" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">FAUJI FERTILIZER</text>
          <text x="150" y="117" fill="#FFFFFF" fontFamily="sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle">SONA UREA</text>
          <circle cx="150" cy="165" r="32" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2.5"/>
          <text x="150" y="160" fill="#15803D" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle">NITROGEN</text>
          <text x="150" y="180" fill="#14532D" fontFamily="sans-serif" fontSize="18" fontWeight="bold" textAnchor="middle">46%</text>
          <text x="150" y="222" fill="#14532D" fontFamily="sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle">PRILLED UREA</text>
          <rect x="110" y="234" width="80" height="18" fill="#DCFCE7" rx="9"/>
          <text x="150" y="247" fill="#16A34A" fontFamily="sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">50 KG NET</text>
        </svg>
      </div>
    );
  }

  // 5. DAP Fertilizer
  if (s.includes("dap")) {
    return (
      <div className={`flex items-center justify-center ${containerClass}`}>
        <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
          <rect width="300" height="300" fill="#FFF7ED" rx="16"/>
          <path d="M70,70 L230,70 L215,260 L85,260 Z" fill="#FFFFFF" stroke="#EA580C" strokeWidth="4"/>
          <rect x="60" y="55" width="180" height="15" fill="#EA580C" rx="3"/>
          <line x1="60" y1="62" x2="240" y2="62" stroke="#FDBA74" strokeWidth="2" strokeDasharray="6,4"/>
          <rect x="75" y="85" width="150" height="38" fill="#18181B" rx="4"/>
          <text x="150" y="102" fill="#FB923C" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">ENGRO FERTILIZERS</text>
          <text x="150" y="117" fill="#FFFFFF" fontFamily="sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle">ENGRO DAP</text>
          <circle cx="150" cy="165" r="32" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2.5"/>
          <text x="150" y="160" fill="#C2410C" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">PHOSPHATE</text>
          <text x="150" y="180" fill="#7C2D12" fontFamily="sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle">18-46-0</text>
          <text x="150" y="222" fill="#7C2D12" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle">DI-AMMONIUM PHOSPHATE</text>
          <rect x="110" y="234" width="80" height="18" fill="#FFEDD5" rx="9"/>
          <text x="150" y="247" fill="#EA580C" fontFamily="sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">50 KG NET</text>
        </svg>
      </div>
    );
  }

  // 6. SOP Potash
  if (s.includes("sop") || s.includes("potassium") || s.includes("potash") || (c === "fertiliser")) {
    return (
      <div className={`flex items-center justify-center ${containerClass}`}>
        <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
          <rect width="300" height="300" fill="#EFF6FF" rx="16"/>
          <path d="M70,70 L230,70 L215,260 L85,260 Z" fill="#FFFFFF" stroke="#2563EB" strokeWidth="4"/>
          <rect x="60" y="55" width="180" height="15" fill="#2563EB" rx="3"/>
          <line x1="60" y1="62" x2="240" y2="62" stroke="#93C5FD" strokeWidth="2" strokeDasharray="6,4"/>
          <rect x="75" y="85" width="150" height="38" fill="#1E40AF" rx="4"/>
          <text x="150" y="102" fill="#93C5FD" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">FAUJI FERTILIZER</text>
          <text x="150" y="117" fill="#FFFFFF" fontFamily="sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle">SOLUBLE SOP</text>
          <circle cx="150" cy="165" r="32" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2.5"/>
          <text x="150" y="160" fill="#1D4ED8" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">POTASSIUM</text>
          <text x="150" y="180" fill="#1E3A8A" fontFamily="sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle">0-0-50</text>
          <text x="150" y="222" fill="#1E3A8A" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle">SULPHATE OF POTASH</text>
          <rect x="110" y="234" width="80" height="18" fill="#DBEAFE" rx="9"/>
          <text x="150" y="247" fill="#2563EB" fontFamily="sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">25 KG NET</text>
        </svg>
      </div>
    );
  }

  // 7. Virtako Granules
  if (s.includes("virtako")) {
    return (
      <div className={`flex items-center justify-center ${containerClass}`}>
        <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
          <rect width="300" height="300" fill="#F5F3FF" rx="16"/>
          <path d="M75,70 L225,70 L210,250 L90,250 Z" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="4"/>
          <rect x="70" y="55" width="160" height="15" fill="#7C3AED" rx="2"/>
          <line x1="75" y1="62" x2="225" y2="62" stroke="#C4B5FD" strokeWidth="2" strokeDasharray="4,4"/>
          <rect x="80" y="80" width="140" height="32" fill="#5B21B6" rx="4"/>
          <text x="150" y="101" fill="#FFFFFF" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle">SYNGENTA</text>
          <circle cx="150" cy="155" r="28" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2"/>
          <rect x="135" y="145" width="8" height="8" fill="#7C3AED" rx="1"/>
          <rect x="155" y="145" width="8" height="8" fill="#7C3AED" rx="1"/>
          <rect x="145" y="158" width="8" height="8" fill="#7C3AED" rx="1"/>
          <text x="150" y="205" fill="#4C1D95" fontFamily="sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle">VIRTAKO 0.6% GR</text>
          <text x="150" y="222" fill="#6D28D9" fontFamily="sans-serif" fontSize="11" textAnchor="middle">STEM BORER EXPERT</text>
          <rect x="110" y="230" width="80" height="18" fill="#EDE9FE" rx="9"/>
          <text x="150" y="243" fill="#6D28D9" fontFamily="sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">4 KG NET</text>
        </svg>
      </div>
    );
  }

  // 8. Coragen
  if (s.includes("coragen") || (c === "pesticide" && !s.includes("amistar"))) {
    return (
      <div className={`flex items-center justify-center ${containerClass}`}>
        <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
          <rect width="300" height="300" fill="#FEF2F2" rx="16"/>
          <rect x="130" y="45" width="40" height="25" fill="#DC2626" rx="4"/>
          <line x1="130" y1="52" x2="170" y2="52" stroke="#FFFFFF" strokeWidth="2"/>
          <line x1="130" y1="58" x2="170" y2="58" stroke="#FFFFFF" strokeWidth="2"/>
          <rect x="135" y="70" width="30" height="20" fill="#E5E7EB"/>
          <path d="M135,90 L105,120 L105,255 L195,255 L195,120 L165,90 Z" fill="#FFFFFF" stroke="#DC2626" strokeWidth="3"/>
          <rect x="110" y="130" width="80" height="95" fill="#FEF2F2" rx="4" stroke="#F87171" strokeWidth="1.5"/>
          <rect x="110" y="130" width="80" height="22" fill="#B91C1C" rx="2"/>
          <text x="150" y="145" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">FMC PAKISTAN</text>
          <text x="150" y="172" fill="#991B1B" fontFamily="sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle">CORAGEN</text>
          <text x="150" y="188" fill="#B91C1C" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">20 SC</text>
          <text x="150" y="210" fill="#4B5563" fontFamily="sans-serif" fontSize="8" textAnchor="middle">INSECTICIDE</text>
          <rect x="120" y="232" width="60" height="16" fill="#FEE2E2" rx="8"/>
          <text x="150" y="244" fill="#991B1B" fontFamily="sans-serif" fontSize="9" fontWeight="bold" textAnchor="middle">100 ML</text>
        </svg>
      </div>
    );
  }

  // 9. Amistar Top
  if (s.includes("amistar")) {
    return (
      <div className={`flex items-center justify-center ${containerClass}`}>
        <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
          <rect width="300" height="300" fill="#F0FDF4" rx="16"/>
          <rect x="125" y="45" width="50" height="25" fill="#047857" rx="4"/>
          <line x1="125" y1="52" x2="175" y2="52" stroke="#FFFFFF" strokeWidth="2"/>
          <line x1="125" y1="58" x2="175" y2="58" stroke="#FFFFFF" strokeWidth="2"/>
          <rect x="135" y="70" width="30" height="20" fill="#E5E7EB"/>
          <path d="M135,90 L100,120 L100,255 L200,255 L200,120 L165,90 Z" fill="#FFFFFF" stroke="#047857" strokeWidth="3"/>
          <rect x="105" y="130" width="90" height="95" fill="#F0FDF4" rx="4" stroke="#6EE7B7" strokeWidth="1.5"/>
          <rect x="105" y="130" width="90" height="22" fill="#065F46" rx="2"/>
          <text x="150" y="145" fill="#FFFFFF" fontFamily="sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">SYNGENTA</text>
          <text x="150" y="172" fill="#064E3B" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle">AMISTAR TOP</text>
          <text x="150" y="188" fill="#047857" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">325 SC</text>
          <text x="150" y="210" fill="#4B5563" fontFamily="sans-serif" fontSize="8" textAnchor="middle">BROAD FUNGICIDE</text>
          <rect x="120" y="232" width="60" height="16" fill="#D1FAE5" rx="8"/>
          <text x="150" y="244" fill="#047857" fontFamily="sans-serif" fontSize="9" fontWeight="bold" textAnchor="middle">200 ML</text>
        </svg>
      </div>
    );
  }

  // 10. Zinc Micronutrient
  if (s.includes("zinc") || s.includes("zorawar") || s.includes("nutrivex")) {
    return (
      <div className={`flex items-center justify-center ${containerClass}`}>
        <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
          <rect width="300" height="300" fill="#ECFEFF" rx="16"/>
          <path d="M75,70 L225,70 L210,255 L90,255 Z" fill="#FFFFFF" stroke="#0891B2" strokeWidth="4"/>
          <rect x="65" y="55" width="170" height="15" fill="#0891B2" rx="3"/>
          <line x1="65" y1="62" x2="235" y2="62" stroke="#67E8F9" strokeWidth="2" strokeDasharray="6,4"/>
          <rect x="80" y="85" width="140" height="36" fill="#0E7490" rx="4"/>
          <text x="150" y="108" fill="#FFFFFF" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle">ENGRO FERTILIZERS</text>
          <circle cx="150" cy="160" r="30" fill="#CFFAFE" stroke="#0891B2" strokeWidth="2.5"/>
          <text x="150" y="162" fill="#155E75" fontFamily="sans-serif" fontSize="18" fontWeight="bold" textAnchor="middle">Zn</text>
          <text x="150" y="178" fill="#0891B2" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle">33%</text>
          <text x="150" y="215" fill="#164E63" fontFamily="sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle">ZORAWAR ZINC</text>
          <text x="150" y="230" fill="#0891B2" fontFamily="sans-serif" fontSize="10" textAnchor="middle">CHELATED MICRONUTRIENT</text>
          <rect x="110" y="238" width="80" height="16" fill="#CFFAFE" rx="8"/>
          <text x="150" y="250" fill="#0891B2" fontFamily="sans-serif" fontSize="9" fontWeight="bold" textAnchor="middle">5 KG NET</text>
        </svg>
      </div>
    );
  }

  // 11. Bayer Nativo 75 WG Systemic Fungicide
  if (s.includes("nativo") || s.includes("booster") || s.includes("npk") || (c === "nutrient")) {
    return (
      <div className={`flex items-center justify-center ${containerClass}`}>
        <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
          <rect width="300" height="300" fill="#EFF6FF" rx="16"/>
          <rect x="80" y="65" width="140" height="190" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth="4" rx="6"/>
          <polygon points="80,65 105,45 225,45 220,65" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2"/>
          <polygon points="220,65 225,45 240,65" fill="#BFDBFE" stroke="#1D4ED8" strokeWidth="2"/>
          <rect x="85" y="80" width="130" height="34" fill="#1E40AF" rx="3"/>
          <text x="150" y="102" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">BAYER CROP SCIENCE</text>
          <circle cx="150" cy="155" r="30" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2"/>
          <text x="150" y="152" fill="#1E40AF" fontFamily="sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">FUNGICIDE</text>
          <text x="150" y="170" fill="#1E3A8A" fontFamily="sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle">75 WG</text>
          <text x="150" y="210" fill="#1E3A8A" fontFamily="sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle">NATIVO</text>
          <text x="150" y="225" fill="#2563EB" fontFamily="sans-serif" fontSize="9" textAnchor="middle">SYSTEMIC PROTECTION</text>
          <rect x="110" y="232" width="80" height="16" fill="#DBEAFE" rx="8"/>
          <text x="150" y="244" fill="#1D4ED8" fontFamily="sans-serif" fontSize="9" fontWeight="bold" textAnchor="middle">65 G NET</text>
        </svg>
      </div>
    );
  }

  // 12. Sprayer / Equipment / Tool (Default fallback)
  return (
    <div className={`flex items-center justify-center ${containerClass}`}>
      <svg viewBox="0 0 300 300" className="max-h-full max-w-full drop-shadow-sm">
        <rect width="300" height="300" fill="#F8FAFC" rx="16"/>
        <rect x="95" y="80" width="110" height="150" fill="#0284C7" stroke="#0369A1" strokeWidth="4" rx="16"/>
        <rect x="125" y="60" width="50" height="20" fill="#0F172A" rx="4"/>
        <rect x="135" y="52" width="30" height="8" fill="#334155" rx="2"/>
        <rect x="90" y="225" width="120" height="15" fill="#0F172A" rx="4"/>
        <path d="M120,60 C120,38 180,38 180,60" stroke="#0F172A" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <rect x="110" y="115" width="80" height="40" fill="#0369A1" rx="4"/>
        <text x="150" y="132" fill="#E0F2FE" fontFamily="sans-serif" fontSize="9" fontWeight="bold" textAnchor="middle">12V BATTERY</text>
        <text x="150" y="147" fill="#38BDF8" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">ELECTRIC</text>
        <line x1="215" y1="230" x2="235" y2="100" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round"/>
        <line x1="235" y1="100" x2="245" y2="85" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
        <text x="150" y="185" fill="#FFFFFF" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle">AGRIPRO 16L</text>
        <text x="150" y="200" fill="#BAE6FD" fontFamily="sans-serif" fontSize="9" textAnchor="middle">BACKPACK SPRAYER</text>
      </svg>
    </div>
  );
}
