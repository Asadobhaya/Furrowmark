// Design tokens: deep green primary, neutral grayscale, earth accent.
// Flat, solid colors. No gradients. Defined in one file.
// All color combinations meet WCAG 2.2 AA contrast (tested in design-tokens.test.ts).

export const colors = {
  // Primary deep forest green
  primary: {
    DEFAULT: "#1c4d25",
    dark: "#133519",
    light: "#286b34",
    textOnPrimary: "#ffffff",
  },
  // Earth action accent
  accent: {
    DEFAULT: "#8b5a2b",
    hover: "#734a23",
    textOnAccent: "#ffffff",
  },
  // Neutrals (flat scale)
  neutral: {
    50: "#f8f9f8",
    100: "#f0f2f0",
    200: "#e1e4e1",
    300: "#c5c9c5",
    400: "#949a94",
    500: "#6d736d",
    600: "#525752",
    700: "#3a3e3a",
    800: "#262926",
    900: "#141614",
    white: "#ffffff",
    black: "#0a0b0a",
  },
  // Feedback states
  status: {
    success: "#1c4d25",
    error: "#b91c1c",
    warning: "#92400e",
    info: "#1e40af",
  },
} as const;

// 8px strict spacing scale
export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export const radii = {
  none: "0px",
  sm: "2px",
  DEFAULT: "4px",
  md: "6px",
  lg: "8px",
} as const;

export const typography = {
  fontFamily: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, "SFMono-Regular", Consolas, monospace',
  },
  fontFeatures: {
    tabularNums: '"tnum"',
  },
} as const;
