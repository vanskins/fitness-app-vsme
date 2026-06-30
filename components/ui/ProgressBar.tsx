import { View } from "react-native";

interface ProgressBarProps {
  /** 0–1 fraction; clamped. */
  progress: number;
  /** Track height in px. */
  height?: number;
  color?: string;
  trackColor?: string;
}

export function ProgressBar({
  progress,
  height = 8,
  color = "#1D9E75",
  trackColor = "#E5E7EB",
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(pct), min: 0, max: 100 }}
      style={{ height, backgroundColor: trackColor, borderRadius: 99 }}
      className="w-full overflow-hidden"
    >
      <View
        style={{ width: `${pct}%`, backgroundColor: color, borderRadius: 99 }}
        className="h-full"
      />
    </View>
  );
}
