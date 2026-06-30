/**
 * Design tokens — colors.
 * Vibrant, motivational palette: one brand teal + a set of accent ramps used
 * across stat tiles, meal types, and charts. Mirrors tailwind.config.js so the
 * same values are usable from plain TS (charts, gradients, icon tints).
 */
export const colors = {
  /** Brand teal/green */
  primary: "#1D9E75",
  primaryDark: "#0C7E5C",

  /** Hero / FAB gradient stops (teal → deep green). */
  gradient: {
    from: "#1AAE7E",
    to: "#0C7E5C",
  },

  /** Accent ramps — each has a soft tint bg, a mid icon tone, and dark text. */
  accent: {
    coral: { bg: "#FAECE7", icon: "#D85A30", text: "#993C1D" },
    blue: { bg: "#E6F1FB", icon: "#378ADD", text: "#0C447C" },
    amber: { bg: "#FAEEDA", icon: "#BA7517", text: "#854F0B" },
    green: { bg: "#EAF3DE", icon: "#639922", text: "#27500A" },
    violet: { bg: "#EEEDFE", icon: "#7F77DD", text: "#3C3489" },
  },

  /** AI suggestion card */
  ai: {
    bg: "#E1F5EE",
    border: "#9FE1CB",
    text: "#0F6E56",
    icon: "#0F8A66",
  },

  /** Amber accent — live workout timer chip */
  amber: {
    bg: "#FEF3C7",
    text: "#B45309",
  },

  /** Neutrals */
  ink: "#15171A",
  muted: "#6B7280",
  faint: "#9AA0A6",
  border: "#EEF0F2",
  surface: "#FFFFFF",
  background: "#F4F6F8",

  /** Status */
  success: "#1D9E75",
  danger: "#E24B4A",
  white: "#FFFFFF",
} as const;

export type Colors = typeof colors;
export type AccentName = keyof typeof colors.accent;
