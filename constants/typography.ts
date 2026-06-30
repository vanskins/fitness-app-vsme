/**
 * Design tokens — typography.
 * Only two weights are used across the app: 400 regular and 500 medium.
 */
export const fontWeight = {
  regular: "400",
  medium: "500",
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 22,
  "2xl": 28,
  "3xl": 34,
} as const;

export type FontWeight = keyof typeof fontWeight;
export type FontSize = keyof typeof fontSize;
