import type { ReactNode } from "react";
import { useRef } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { colors } from "@/constants/colors";

let counter = 0;

interface GradientProps {
  children?: ReactNode;
  from?: string;
  to?: string;
  /** Corner radius (clips the gradient). */
  radius?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * A view with a diagonal linear-gradient background, drawn with react-native-svg
 * (no extra native module). Clips to `radius` so gradient cards/FAB look right.
 */
export function Gradient({
  children,
  from = colors.gradient.from,
  to = colors.gradient.to,
  radius = 0,
  style,
}: GradientProps) {
  const id = useRef(`grad${++counter}`).current;
  return (
    <View style={[{ borderRadius: radius, overflow: "hidden" }, style]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}
