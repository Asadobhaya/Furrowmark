export interface EmergencyCheckResult {
  isEmergency: boolean;
  emergencyType?: "poisoning" | "spill" | "ingestion" | "eye_contact";
  message?: string;
}

const EMERGENCY_PATTERNS = [
  /\b(swallowed|ingested|drank|eaten|consumed)\b.*\b(pesticide|chemical|poison|insecticide|spray|fungicide)\b/i,
  /\b(pesticide|chemical|poison|insecticide|fungicide)\b.*\b(swallowed|ingested|drank|in mouth)\b/i,
  /\b(eye|eyes)\b.*\b(burn|burning|splashed|spray|pesticide|chemical)\b/i,
  /\b(splashed|spray in)\b.*\b(eye|eyes|face)\b/i,
  /\b(poison|poisoning|toxic exposure|unconscious|convulsion|vomiting blood)\b/i,
  /\b(child|baby|kid|dog|animal)\b.*\b(ate|drank|swallowed|poisoned)\b/i,
];

export const EMERGENCY_ADVICE = `EMERGENCY MEDICAL WARNING:
If a human or animal has ingested, inhaled, or been severely exposed to an agrochemical:

1. CALL EMERGENCY SERVICES IMMEDIATELY:
   - National Emergency Helpline (Pakistan): 1122 (Rescue 1122)
   - National Poison Control Centre (JPMC Karachi): 021-99205058
   - Armed Forces Institute of Pathology (Rawalpindi): 051-9270682

2. FIRST AID IMMEDIATE PROTOCOLS:
   - EYE CONTACT: Flush eyes immediately with gentle clean water for at least 15-20 minutes.
   - SKIN CONTACT: Remove contaminated clothing immediately and wash skin thoroughly with soap and water.
   - INGESTION: DO NOT induce vomiting unless explicitly directed by a medical professional or the product label. Keep the victim calm and airway clear.
   - INHALATION: Move person to fresh air immediately.

3. KEEP THE PRODUCT CONTAINER AND SAFETY DATA SHEET (SDS) READY FOR THE DOCTOR.`;

export function checkEmergencyInput(input: string): EmergencyCheckResult {
  const trimmed = input.trim();
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isEmergency: true,
        emergencyType: "poisoning",
        message: EMERGENCY_ADVICE,
      };
    }
  }
  return { isEmergency: false };
}

export function sanitizeChatText(text: string): string {
  // Redact potential 13-digit CNIC numbers and 16-digit credit card numbers
  return text
    .replace(/\b\d{5}-\d{7}-\d\b/g, "[REDACTED-CNIC]")
    .replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, "[REDACTED-CARD]");
}
