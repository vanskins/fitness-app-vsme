import type { ViewStyle } from "react-native";

/** Soft elevation presets (iOS shadow* + Android elevation). */
export const shadows: Record<"card" | "hero" | "fab", ViewStyle> = {
  card: {
    shadowColor: "#0B1220",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  hero: {
    shadowColor: "#0C7E5C",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  fab: {
    shadowColor: "#0C7E5C",
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
};
