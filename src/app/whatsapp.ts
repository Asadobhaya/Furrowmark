export const WHATSAPP_NUMBERS = {
  primary: "923005534323",
  secondary: "923004634494",
};

/**
 * Pre-written inquiry for general queries, helplines, navbar, footer, and contact desk.
 */
export function getGeneralWhatsAppUrl(
  phone: string = WHATSAPP_NUMBERS.primary
): string {
  const message =
    "Hello Furrowmark! I want to get information about your agricultural products, stock availability, and current prices. Please guide me.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Pre-written inquiry for advisory and technical field crop queries.
 */
export function getAdvisoryWhatsAppUrl(
  phone: string = WHATSAPP_NUMBERS.primary
): string {
  const message =
    "Hello Furrowmark Multan Depot! I want to get information about crop protection products, seed varieties, and technical advisory for my farm.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Pre-written inquiry targeting a specific agricultural input or formulation.
 */
export function getProductWhatsAppUrl(
  productName: string,
  brandName?: string,
  phone: string = WHATSAPP_NUMBERS.primary
): string {
  const brandSuffix = brandName ? ` (${brandName})` : "";
  const message = `Hello Furrowmark! I want to get information about ${productName}${brandSuffix}. Could you please share the current price, pack sizes, available stock, and application details?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Pre-written inquiry for order returns or shipment verification.
 */
export function getReturnWhatsAppUrl(
  phone: string = WHATSAPP_NUMBERS.primary
): string {
  const message =
    "Hello Furrowmark Support! I want to get information regarding order return or consignment verification. Please assist me.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
