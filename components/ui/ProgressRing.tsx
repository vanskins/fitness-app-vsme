import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ProgressRingProps {
  /** 0–1 fraction; clamped. */
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  /** Centered content (e.g. a percentage label). */
  children?: ReactNode;
}

export function ProgressRing({
  progress,
  size = 92,
  stroke = 9,
  color = "#FFFFFF",
  trackColor = "rgba(255,255,255,0.25)",
  children,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, progress));
  const offset = circumference * (1 - pct);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children ? (
        <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
