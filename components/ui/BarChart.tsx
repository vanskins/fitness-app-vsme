import { View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

import { colors } from "@/constants/colors";

export interface BarDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  width: number;
  height?: number;
  color?: string;
  /** Optional reference line (e.g. calorie goal). */
  goal?: number;
}

const PAD = { left: 8, right: 8, top: 12, bottom: 20 };

/** Minimal bar chart with an optional goal reference line. */
export function BarChart({
  data,
  width,
  height = 160,
  color = colors.primary,
  goal,
}: BarChartProps) {
  if (data.length === 0) return <View style={{ height }} />;

  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  const max = Math.max(...data.map((d) => d.value), goal ?? 0, 1);
  const slot = plotW / data.length;
  const barW = Math.min(slot * 0.6, 28);

  const y = (v: number) => PAD.top + (1 - v / max) * plotH;
  const baseY = PAD.top + plotH;

  return (
    <Svg width={width} height={height}>
      {goal !== undefined ? (
        <>
          <Line
            x1={PAD.left}
            y1={y(goal)}
            x2={width - PAD.right}
            y2={y(goal)}
            stroke={colors.muted}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <SvgText x={PAD.left} y={y(goal) - 4} fontSize={10} fill={colors.muted}>
            goal
          </SvgText>
        </>
      ) : null}

      {data.map((d, i) => {
        const cx = PAD.left + slot * i + slot / 2;
        const barH = baseY - y(d.value);
        return (
          <Rect
            key={i}
            x={cx - barW / 2}
            y={y(d.value)}
            width={barW}
            height={Math.max(0, barH)}
            rx={4}
            fill={d.value > 0 ? color : colors.border}
          />
        );
      })}

      {data.map((d, i) => {
        const cx = PAD.left + slot * i + slot / 2;
        return (
          <SvgText
            key={`l${i}`}
            x={cx}
            y={height - 6}
            fontSize={10}
            fill={colors.muted}
            textAnchor="middle"
          >
            {d.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}
