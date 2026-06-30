import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { shadows } from "@/constants/shadows";

interface RestTimerBarProps {
  /** Seconds remaining. */
  remaining: number;
  onAddTime: (delta: number) => void;
  onSkip: () => void;
}

function fmt(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Floating between-sets rest countdown with quick adjust + skip controls. */
export function RestTimerBar({ remaining, onAddTime, onSkip }: RestTimerBarProps) {
  return (
    <View
      className="flex-row items-center rounded-3xl bg-ink px-4 py-3"
      style={shadows.fab}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-white/15">
        <Icon name="timer" size={18} color="#FFFFFF" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-xs font-medium uppercase tracking-wide text-white/60">
          Rest
        </Text>
        <Text className="text-xl font-semibold text-white" style={{ fontVariant: ["tabular-nums"] }}>
          {fmt(remaining)}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Subtract 15 seconds"
        onPress={() => onAddTime(-15)}
        hitSlop={6}
        className="h-9 w-12 items-center justify-center rounded-pill bg-white/15 active:opacity-70"
      >
        <Text className="text-sm font-semibold text-white">-15</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add 15 seconds"
        onPress={() => onAddTime(15)}
        hitSlop={6}
        className="ml-2 h-9 w-12 items-center justify-center rounded-pill bg-white/15 active:opacity-70"
      >
        <Text className="text-sm font-semibold text-white">+15</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Skip rest"
        onPress={onSkip}
        hitSlop={6}
        className="ml-2 h-9 w-9 items-center justify-center rounded-pill bg-white active:opacity-70"
      >
        <Icon name="check" size={18} color={colors.ink} />
      </Pressable>
    </View>
  );
}
