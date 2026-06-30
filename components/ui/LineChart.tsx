import { View } from "react-native";
import Svg, { Circle, Polyline, Text as SvgText } from "react-native-svg";

import { colors } from "@/constants/colors";

interface LineChartProps {
  data: number[];
  width: number;
  height?: number;
  color?: string;
  /** Decimal places for the min/max axis labels. */
  precision?: number;
}

const PAD = { left: 8, right: 36, top: 12, bottom: 8 };

/** Minimal line chart (no dependencies beyond react-native-svg). */
export function LineChart({
  data,
  width,
  height = 160,
  color = colors.primary,
  precision = 1,
}: LineChartProps) {
  if (data.length === 0) return <View style={{ height }} />;

  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const x = (i: number) =>
    data.length > 1
      ? PAD.left + (i / (data.length - 1)) * plotW
      : PAD.left + plotW / 2;
  const y = (v: number) => PAD.top + (1 - (v - min) / span) * plotH;

  const points = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  return (
    <Svg width={width} height={height}>
      {/* max / min axis labels on the right */}
      <SvgText x={width - PAD.right + 4} y={PAD.top + 4} fontSize={11} fill={colors.muted}>
        {max.toFixed(precision)}
      </SvgText>
      <SvgText x={width - PAD.right + 4} y={height - PAD.bottom} fontSize={11} fill={colors.muted}>
        {min.toFixed(precision)}
      </SvgText>

      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((v, i) => (
        <Circle key={i} cx={x(i)} cy={y(v)} r={3} fill={color} />
      ))}
    </Svg>
  );
}
