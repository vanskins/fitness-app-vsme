import type { ReactNode } from "react";
import { View } from "react-native";

interface CardProps {
  children: ReactNode;
  /** Extra utility classes appended to the base card style. */
  className?: string;
}

/** Surface container with the 14px card radius and a hairline border. */
export function Card({ children, className }: CardProps) {
  return (
    <View
      className={["rounded-card border border-border bg-surface p-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </View>
  );
}
