import { describe, it, expect } from "vitest";
import { colors } from "./tokens";

// Standard relative luminance formula (WCAG 2.1 / 2.2)
function getLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return (a[0] ?? 0) * 0.2126 + (a[1] ?? 0) * 0.7152 + (a[2] ?? 0) * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe("Design Tokens Contrast (WCAG 2.2 AA Compliance)", () => {
  it("Primary brand button text meets at least 4.5:1 contrast against primary green", () => {
    const ratio = getContrastRatio(
      colors.primary.textOnPrimary,
      colors.primary.DEFAULT,
    );
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("Accent action button text meets at least 4.5:1 contrast against accent", () => {
    const ratio = getContrastRatio(
      colors.accent.textOnAccent,
      colors.accent.DEFAULT,
    );
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("Body text (neutral-900) meets at least 4.5:1 contrast against page background (neutral-50 / white)", () => {
    const ratioAgainstWhite = getContrastRatio(
      colors.neutral[900],
      colors.neutral.white,
    );
    const ratioAgainst50 = getContrastRatio(
      colors.neutral[900],
      colors.neutral[50],
    );
    expect(ratioAgainstWhite).toBeGreaterThanOrEqual(7.0); // Exceeds even AAA
    expect(ratioAgainst50).toBeGreaterThanOrEqual(7.0);
  });

  it("Subtle secondary text (neutral-700) meets at least 4.5:1 contrast against white", () => {
    const ratio = getContrastRatio(colors.neutral[700], colors.neutral.white);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("Error status text meets at least 4.5:1 contrast against white background", () => {
    const ratio = getContrastRatio(colors.status.error, colors.neutral.white);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
