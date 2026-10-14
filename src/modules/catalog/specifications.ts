export interface ProductAgronomicSpec {
  activeIngredient: string;
  registrationNumber: string;
  registrationBody: string;
  targetCrops: string[];
  targetPestsOrDeficiencies: string[];
  recommendedDosage: string;
  waterVolume: string;
  preHarvestIntervalDays: number;
  reentryIntervalHours: number;
  hazardClass: string;
  signalWord: "DANGER" | "WARNING" | "CAUTION";
  formulation: string;
  storageAndHandling: string;
  firstAid: string;
  manufacturer: string;
  depotLocation: string;
}

export const PRODUCT_SPECIFICATIONS: Record<string, ProductAgronomicSpec> = {
  // 1. Hybrid Cotton Seed BS-15
  "hybrid-cotton-seed-bs-15": {
    activeIngredient: "Transgenic Cry1Ac Hybrid Cotton Seed (Germination >= 85%, Purity >= 98%)",
    registrationNumber: "FSCRD-PB-COT-1582",
    registrationBody: "Federal Seed Certification & Registration Department (FSC&RD)",
    targetCrops: ["Cotton (Kharif)"],
    targetPestsOrDeficiencies: ["American Bollworm", "Spotted Bollworm", "Pink Bollworm tolerance"],
    recommendedDosage: "10 kg per acre (Delinted machine planting)",
    waterVolume: "Standard irrigated furrow sowing",
    preHarvestIntervalDays: 0,
    reentryIntervalHours: 0,
    hazardClass: "Non-hazardous biological seed",
    signalWord: "CAUTION",
    formulation: "Certified Delinted Fungicide-Treated Seed",
    storageAndHandling: "Store in a cool, dry, well-ventilated seed warehouse below 25 deg C. Protect from direct moisture and rodents.",
    firstAid: "Treated with antifungal protectant. Wash hands with soap and water after handling. Do not use for human food, animal feed, or oil extraction.",
    manufacturer: "Engro Agritech Pakistan",
    depotLocation: "Multan Central Seed Depot",
  },

  // 2. Pioneer 30Y87 Hybrid Corn
  "pioneer-30y87-hybrid-corn": {
    activeIngredient: "Hybrid Maize Yellow Flint Grain (Germination >= 90%, Purity >= 99%)",
    registrationNumber: "FSCRD-PB-CRN-2019",
    registrationBody: "Federal Seed Certification & Registration Department (FSC&RD)",
    targetCrops: ["Spring Maize", "Autumn Maize"],
    targetPestsOrDeficiencies: ["Stem Borer tolerance", "Stalk Rot resistance", "High heat tolerance"],
    recommendedDosage: "15 kg per acre (75 cm row spacing, 20 cm plant spacing)",
    waterVolume: "Ridge and furrow irrigated sowing",
    preHarvestIntervalDays: 0,
    reentryIntervalHours: 0,
    hazardClass: "Non-hazardous biological seed",
    signalWord: "CAUTION",
    formulation: "Color-Coated Hybrid Seed with Maxim XL Protection",
    storageAndHandling: "Store unopened in original moisture-barrier bags in ambient shade. Keep away from pesticide vapors.",
    firstAid: "Coated with seed protectant. Wash exposed skin thoroughly with soap and water after field planting. Keep out of reach of children.",
    manufacturer: "Pioneer Seeds Pakistan",
    depotLocation: "Multan Central Seed Depot",
  },

  // 3. Faisalabad-2008 Certified Wheat Seed
  "faisalabad-2008-wheat-seed": {
    activeIngredient: "Certified Triticum aestivum Seed (Germination >= 85%, Genetic Purity >= 98%)",
    registrationNumber: "FSCRD-PB-WHT-0804",
    registrationBody: "Federal Seed Certification & Registration Department (FSC&RD)",
    targetCrops: ["Wheat (Rabi Season)"],
    targetPestsOrDeficiencies: ["Yellow Rust (Puccinia striiformis)", "Brown Rust", "Loose Smut"],
    recommendedDosage: "50 kg per acre for timely sowing (November 1 to November 20)",
    waterVolume: "Broadcast or rabi seed drill",
    preHarvestIntervalDays: 0,
    reentryIntervalHours: 0,
    hazardClass: "Non-hazardous biological seed",
    signalWord: "CAUTION",
    formulation: "Graded and Vitavax-Treated Certified Grain",
    storageAndHandling: "Store on wooden pallets in dry aeration. Protect from storage weevils and humidity.",
    firstAid: "Treated grain. Not for human consumption. Wash thoroughly after handling.",
    manufacturer: "Engro Agritech Pakistan",
    depotLocation: "Multan Central Seed Depot",
  },

  // 4. Sona Urea Prilled 46% Nitrogen
  "sona-urea-46-nitrogen": {
    activeIngredient: "Ammoniacal / Amide Nitrogen (N) 46.0% w/w",
    registrationNumber: "FFC-UREA-STD-1978",
    registrationBody: "National Fertilizer Development Centre (NFDC) / Ministry of Industries",
    targetCrops: ["Cotton", "Wheat", "Sugarcane", "Rice", "Maize", "Citrus", "Vegetables"],
    targetPestsOrDeficiencies: ["Nitrogen Deficiency", "Stunted vegetative growth", "Pale chlorosis"],
    recommendedDosage: "1 to 2 bags (50 kg to 100 kg) per acre depending on crop stage and soil fertility",
    waterVolume: "Broadcast prior to flood irrigation or side-dressing",
    preHarvestIntervalDays: 7,
    reentryIntervalHours: 4,
    hazardClass: "WHO Class U (Unlikely to present hazard)",
    signalWord: "CAUTION",
    formulation: "Free-Flowing Prilled Granules",
    storageAndHandling: "Hygroscopic fertilizer. Store in tightly closed bags on dry raised platforms under covered shed.",
    firstAid: "Avoid breathing dust. In case of contact with eyes, rinse immediately with clean water.",
    manufacturer: "Fauji Fertilizer Company Limited (FFC)",
    depotLocation: "Multan Fertilizer Terminal",
  },

  // 5. Engro DAP Di-Ammonium Phosphate 18-46-0
  "engro-dap-18-46-0": {
    activeIngredient: "Total Nitrogen (N) 18.0% + Available Phosphate (P2O5) 46.0%",
    registrationNumber: "ENG-DAP-IMP-1846",
    registrationBody: "National Fertilizer Development Centre (NFDC)",
    targetCrops: ["Wheat", "Cotton", "Maize", "Potatoes", "Oilseeds", "Orchards"],
    targetPestsOrDeficiencies: ["Phosphorus Deficiency", "Poor root establishment", "Delayed tillering"],
    recommendedDosage: "1 to 1.5 bags (50 kg to 75 kg) per acre applied as basal dressing during land preparation",
    waterVolume: "Drill application during sowing or basal soil incorporation",
    preHarvestIntervalDays: 0,
    reentryIntervalHours: 4,
    hazardClass: "WHO Class U (Unlikely to present hazard)",
    signalWord: "CAUTION",
    formulation: "Dark Brown Granular Formulation",
    storageAndHandling: "Keep dry and sheltered. Avoid direct contact with damp ground surfaces.",
    firstAid: "Wash skin with soap after broadcasting. Wear protective dust mask during machine hopper filling.",
    manufacturer: "Engro Fertilizers Limited",
    depotLocation: "Multan Fertilizer Terminal",
  },

  // 6. SOP Soluble Potassium Sulphate 0-0-50
  "sop-potassium-sulphate-0-0-50": {
    activeIngredient: "Soluble Potash (K2O) 50.0% + Elemental Sulphur (S) 18.0% (Chloride-Free)",
    registrationNumber: "FFC-SOP-5018",
    registrationBody: "National Fertilizer Development Centre (NFDC)",
    targetCrops: ["Potatoes", "Citrus", "Mangoes", "Cotton", "Tobacco", "Vegetables"],
    targetPestsOrDeficiencies: ["Potassium deficiency", "Weak stalk", "Poor fruit grading and sugar content"],
    recommendedDosage: "25 kg per acre during tuber development or boll formation",
    waterVolume: "Fully soluble for fertigation, drip systems, or flood irrigation",
    preHarvestIntervalDays: 0,
    reentryIntervalHours: 2,
    hazardClass: "WHO Class U (Unlikely to present hazard)",
    signalWord: "CAUTION",
    formulation: "100% Water Soluble Crystalline Powder",
    storageAndHandling: "Store in sealed original packaging in a cool, moisture-free facility.",
    firstAid: "Rinse with plenty of water if exposed to eyes. Safe handling standard PPE recommended.",
    manufacturer: "Fauji Fertilizer Company Limited",
    depotLocation: "Multan Fertilizer Terminal",
  },

  // 7. Virtako 0.6% GR Insecticide
  "virtako-06-gr-insecticide": {
    activeIngredient: "Chlorantraniliprole 0.5% + Thiamethoxam 0.1% GR",
    registrationNumber: "DPP-REG-SYN-0481-I",
    registrationBody: "Department of Plant Protection (DPP), Ministry of National Food Security",
    targetCrops: ["Rice (Paddy)", "Maize", "Sugarcane"],
    targetPestsOrDeficiencies: ["Yellow Stem Borer (Scirpophaga incertulas)", "Leaf Folder (Cnaphalocrocis medinalis)", "Shoot Borer"],
    recommendedDosage: "4 kg per acre broadcast in standing water (2 to 3 inches) within 15 to 25 days after transplanting",
    waterVolume: "Granular direct broadcast (keep standing water 3 to 4 days)",
    preHarvestIntervalDays: 21,
    reentryIntervalHours: 24,
    hazardClass: "WHO Class III (Slightly Hazardous)",
    signalWord: "CAUTION",
    formulation: "Ready-to-use Sand-Core Granules (GR)",
    storageAndHandling: "Lock in pesticide storage room away from foodstuffs, animal fodder, and children. Prevent contamination of fish ponds and waterways.",
    firstAid: "If swallowed: do NOT induce vomiting. Call Rescue 1122 or JPMC Poison Centre (021-99205058) immediately. If on skin, remove contaminated clothing and wash with soap and water.",
    manufacturer: "Syngenta Pakistan Limited",
    depotLocation: "Multan Chemical Quarantine Warehouse",
  },

  // 8. Coragen 20 SC Caterpillars Specialist
  "coragen-20-sc-fmc": {
    activeIngredient: "Chlorantraniliprole 18.5% w/w (200 g/L SC)",
    registrationNumber: "DPP-REG-FMC-0219-I",
    registrationBody: "Department of Plant Protection (DPP), Ministry of National Food Security",
    targetCrops: ["Cotton", "Rice", "Sugarcane", "Tomato", "Chilli", "Maize"],
    targetPestsOrDeficiencies: ["American Bollworm (Helicoverpa armigera)", "Spotted Bollworm", "Fall Armyworm (Spodoptera frugiperda)", "Rice Stem Borer"],
    recommendedDosage: "50 mL per acre in 100 to 120 liters of water for thorough foliar coverage",
    waterVolume: "100 to 120 Liters clean water per acre (hollow cone nozzle)",
    preHarvestIntervalDays: 9,
    reentryIntervalHours: 12,
    hazardClass: "WHO Class III (Slightly Hazardous)",
    signalWord: "CAUTION",
    formulation: "Suspension Concentrate (SC)",
    storageAndHandling: "Store in original bottle with cap tightly locked. Keep between 5 deg C and 35 deg C away from direct sunlight.",
    firstAid: "In case of eye contact, rinse eyes immediately with copious water for 15 minutes. In case of ingestion, keep airway clear and contact medical helpline immediately.",
    manufacturer: "FMC United Private Limited (Pakistan)",
    depotLocation: "Multan Chemical Quarantine Warehouse",
  },

  // 9. Amistar Top 325 SC Fungicide
  "amistar-top-325-sc": {
    activeIngredient: "Azoxystrobin 200 g/L + Difenoconazole 125 g/L SC",
    registrationNumber: "DPP-REG-SYN-0315-F",
    registrationBody: "Department of Plant Protection (DPP), Ministry of National Food Security",
    targetCrops: ["Rice", "Wheat", "Chilli", "Tomato", "Onion", "Melon"],
    targetPestsOrDeficiencies: ["Rice Blast (Magnaporthe oryzae)", "Sheath Blight", "Powdery Mildew", "Early Blight", "Purple Blotch"],
    recommendedDosage: "200 mL per acre applied preventative or at first onset of disease symptoms",
    waterVolume: "100 to 120 Liters clean water per acre",
    preHarvestIntervalDays: 14,
    reentryIntervalHours: 24,
    hazardClass: "WHO Class II (Moderately Hazardous)",
    signalWord: "WARNING",
    formulation: "Suspension Concentrate (SC)",
    storageAndHandling: "Keep container tightly closed in dry locked store. Highly toxic to aquatic organisms with long lasting effects. Do not discharge into surface drains.",
    firstAid: "Skin exposure: Remove clothing, flush skin with plenty of soap and water. If inhaled: Move person to fresh air. Provide label to attending physician.",
    manufacturer: "Syngenta Pakistan Limited",
    depotLocation: "Multan Chemical Quarantine Warehouse",
  },

  // 10. Engro Zorawar Zinc 33%
  "engro-zorawar-zinc-33": {
    activeIngredient: "Chelated Zinc Sulphate Monohydrate (Zn 33.0% + S 15.0%)",
    registrationNumber: "PCO-ENG-ZN33",
    registrationBody: "Punjab Fertilizer Control Order / Directorate of Soil Fertility",
    targetCrops: ["Paddy Rice", "Citrus", "Cotton", "Wheat", "Maize"],
    targetPestsOrDeficiencies: ["Khaira Disease in Paddy Rice", "Zinc Deficiency", "Little Leaf Syndrome in Citrus"],
    recommendedDosage: "5 kg to 10 kg per acre broadcast before transplanting or foliar spray at 2 g/L",
    waterVolume: "Broadcast with sand or fertigation",
    preHarvestIntervalDays: 0,
    reentryIntervalHours: 4,
    hazardClass: "WHO Class U (Unlikely to present acute hazard)",
    signalWord: "CAUTION",
    formulation: "Micro-Granular Soluble Crystals",
    storageAndHandling: "Store in a dry room. Protect from water contact until ready for field use.",
    firstAid: "Wash skin with water after application. In case of accidental ingestion, drink plenty of water and seek medical advice.",
    manufacturer: "Engro Fertilizers Limited",
    depotLocation: "Multan Fertilizer Terminal",
  },

  // 11. Bayer Nativo 75 WG Systemic Fungicide
  "bayer-nativo-75-wg": {
    activeIngredient: "Tebuconazole 50% + Trifloxystrobin 25% WG (75% w/w)",
    registrationNumber: "DPP-REG-BAY-0312-F",
    registrationBody: "Department of Plant Protection (DPP), Ministry of National Food Security",
    targetCrops: ["Rice", "Wheat", "Mango", "Tomato", "Chilli"],
    targetPestsOrDeficiencies: ["Rice Neck Blast", "False Smut", "Wheat Yellow Rust", "Powdery Mildew", "Anthracnose"],
    recommendedDosage: "65 g per acre in 100 liters of water at booting or early flowering stage",
    waterVolume: "100 Liters clean water per acre with fine hollow cone spray nozzles",
    preHarvestIntervalDays: 21,
    reentryIntervalHours: 24,
    hazardClass: "WHO Class II (Moderately Hazardous)",
    signalWord: "WARNING",
    formulation: "Water Dispersible Granules (WG)",
    storageAndHandling: "Store in original sealed aluminum foil packs in pesticide locked vault. Keep out of reach of children and livestock.",
    firstAid: "Eye contact: Hold eyes open and flush slowly and gently with water for 15-20 minutes. If swallowed, call Rescue 1122 immediately. Symptomatic treatment.",
    manufacturer: "Bayer Crop Science Pakistan",
    depotLocation: "Multan Chemical Quarantine Warehouse",
  },

  // 12. Battery Powered 16L Knapsack Sprayer
  "battery-powered-16l-knapsack-sprayer": {
    activeIngredient: "Mechanical Agricultural Spray Equipment (12V 8Ah Rechargeable Lead-Acid/Lithium)",
    registrationNumber: "ENG-AGR-TOOL-2024",
    registrationBody: "Agricultural Machinery Research Institute (AMRI) Standards",
    targetCrops: ["All Field Crops", "Vegetables", "Orchards", "Cotton", "Paddy"],
    targetPestsOrDeficiencies: ["Uniform application of registered crop protection chemicals and foliar nutrition"],
    recommendedDosage: "16 Liter tank capacity, 4 bar operating pressure, 3.1 L/min pump discharge rate",
    waterVolume: "16 Liters per filling",
    preHarvestIntervalDays: 0,
    reentryIntervalHours: 0,
    hazardClass: "Agricultural Machine Tool",
    signalWord: "CAUTION",
    formulation: "Heavy-Duty UV Resistant Polypropylene Tank with Telescopic Brass Lance",
    storageAndHandling: "Flush pump with clean water immediately after pesticide application. Charge battery every 3 months during idle seasons.",
    firstAid: "Ensure pressure is relieved via trigger lock before opening tank lid. Always wear safety goggles and chemical gloves when mixing chemicals.",
    manufacturer: "AgriPro Machinery Pakistan",
    depotLocation: "Multan Central Machinery Hub",
  },
};

export function getProductSpecification(slug: string): ProductAgronomicSpec | null {
  const normalized = slug.toLowerCase().trim();
  if (PRODUCT_SPECIFICATIONS[normalized]) {
    return PRODUCT_SPECIFICATIONS[normalized];
  }
  // Substring fallback
  for (const [key, spec] of Object.entries(PRODUCT_SPECIFICATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return spec;
    }
  }
  if (normalized.includes("cotton")) return PRODUCT_SPECIFICATIONS["hybrid-cotton-seed-bs-15"];
  if (normalized.includes("corn") || normalized.includes("maize")) return PRODUCT_SPECIFICATIONS["pioneer-30y87-hybrid-corn"];
  if (normalized.includes("wheat")) return PRODUCT_SPECIFICATIONS["faisalabad-2008-wheat-seed"];
  if (normalized.includes("urea")) return PRODUCT_SPECIFICATIONS["sona-urea-46-nitrogen"];
  if (normalized.includes("dap")) return PRODUCT_SPECIFICATIONS["engro-dap-18-46-0"];
  if (normalized.includes("sop") || normalized.includes("potash")) return PRODUCT_SPECIFICATIONS["sop-potassium-sulphate-0-0-50"];
  if (normalized.includes("virtako")) return PRODUCT_SPECIFICATIONS["virtako-06-gr-insecticide"];
  if (normalized.includes("coragen")) return PRODUCT_SPECIFICATIONS["coragen-20-sc-fmc"];
  if (normalized.includes("amistar")) return PRODUCT_SPECIFICATIONS["amistar-top-325-sc"];
  if (normalized.includes("zinc") || normalized.includes("zorawar") || normalized.includes("nutrivex")) return PRODUCT_SPECIFICATIONS["engro-zorawar-zinc-33"];
  if (normalized.includes("nativo") || normalized.includes("booster") || normalized.includes("npk")) return PRODUCT_SPECIFICATIONS["bayer-nativo-75-wg"];
  if (normalized.includes("sprayer") || normalized.includes("knapsack")) return PRODUCT_SPECIFICATIONS["battery-powered-16l-knapsack-sprayer"];

  return null;
}
