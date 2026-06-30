/**
 * Design tokens — colors.
 * Mirrors the Tailwind theme in tailwind.config.js so values can be used
 * from plain TS (e.g. for chart libraries, icon tints) as well as className.
 */
export const colors = {
  /** Brand teal/green */
  primary: "#1D9E75",
  primaryDark: "#157A5A",

  /** AI suggestion card */
  ai: {
    bg: "#EAF3DE",
    border: "#C0DD97",
    text: "#27500A",
  },

  /** Amber accent — live workout timer chip */
  amber: {
    bg: "#FEF3C7",
    text: "#B45309",
  },

  /** Neutrals */
  ink: "#1A1A1A",
  muted: "#6B7280",
  border: "#E5E7EB",
  surface: "#FFFFFF",
  background: "#F7F8FA",

  /** Status */
  success: "#1D9E75",
  white: "#FFFFFF",
} as const;

export type Colors = typeof colors;
