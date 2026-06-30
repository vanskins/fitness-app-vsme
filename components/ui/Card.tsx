import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";

import { shadows } from "@/constants/shadows";

interface CardProps {
  children: ReactNode;
  /** Extra utility classes appended to the base card style. */
  className?: string;
  style?: ViewStyle | ViewStyle[];
}

/** Surface container with the 16px card radius and soft elevation. */
export function Card({ children, className, style }: CardProps) {
  return (
    <View
      style={[shadows.card, ...(Array.isArray(style) ? style : style ? [style] : [])]}
      className={["rounded-card bg-surface p-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </View>
  );
}
