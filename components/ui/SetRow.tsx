import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/ui/Icon";
import { MIN_TAP_TARGET } from "@/constants/spacing";
import type { ExerciseSet } from "@/types/workout";

interface SetRowProps {
  set: ExerciseSet;
  onToggle?: (setId: string) => void;
  /** Tap the weight/reps to edit them. */
  onEdit?: (set: ExerciseSet) => void;
  /** Long-press the row to delete the set. */
  onDelete?: (setId: string) => void;
}

/** A single set row: number, weight × reps (tap to edit), and a toggle. */
export function SetRow({ set, onToggle, onEdit, onDelete }: SetRowProps) {
  return (
    <View
      className="flex-row items-center justify-between py-2"
      style={{ minHeight: MIN_TAP_TARGET }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit set ${set.setNumber}`}
        onPress={() => onEdit?.(set)}
        onLongPress={() => onDelete?.(set.id)}
        className="flex-1 flex-row items-center active:opacity-60"
      >
        <View className="h-7 w-7 items-center justify-center rounded-pill bg-background">
          <Text className="text-sm font-medium text-muted">
            {set.setNumber}
          </Text>
        </View>
        <Text className="ml-3 text-base text-ink">
          {set.weightKg} kg
          <Text className="text-muted"> × </Text>
          {set.reps} reps
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: set.completed }}
        accessibilityLabel={`Mark set ${set.setNumber} complete`}
        onPress={() => onToggle?.(set.id)}
        hitSlop={8}
        className="active:opacity-70"
      >
        <View
          className={[
            "h-7 w-7 items-center justify-center rounded-pill border",
            set.completed
              ? "border-primary bg-primary"
              : "border-border bg-surface",
          ].join(" ")}
        >
          {set.completed ? <Icon name="check" size={15} color="#FFFFFF" /> : null}
        </View>
      </Pressable>
    </View>
  );
}
