/**
 * Design tokens — spacing & radii.
 * Base unit is 4px to align with the Tailwind scale.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

export const radius = {
  /** Cards */
  card: 14,
  /** Pills / chips */
  pill: 99,
  /** Avatars — use with a square element */
  avatar: 9999,
} as const;

/** Minimum tap target per the design system (accessibility). */
export const MIN_TAP_TARGET = 44;

export type Spacing = typeof spacing;
