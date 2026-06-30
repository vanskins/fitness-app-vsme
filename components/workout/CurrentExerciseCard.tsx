import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/ui/Icon";
import { SetRow } from "@/components/ui/SetRow";
import { colors } from "@/constants/colors";
import { shadows } from "@/constants/shadows";
import type { ExerciseSet, WorkoutExercise } from "@/types/workout";

interface CurrentExerciseCardProps {
  exercise: WorkoutExercise;
  /** Live "time on this exercise" label (M:SS). */
  elapsedLabel: string;
  /** "Exercise N" position label. */
  positionLabel: string;
  onToggleSet: (setId: string) => void;
  onEditSet: (set: ExerciseSet) => void;
  onDeleteSet: (setId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onDeleteExercise: (exerciseId: string) => void;
}

/**
 * The hero card for the exercise the user is currently working through in
 * guided mode: prominent header with a live per-exercise timer, editable sets,
 * add-set and delete controls.
 */
export function CurrentExerciseCard({
  exercise,
  elapsedLabel,
  positionLabel,
  onToggleSet,
  onEditSet,
  onDeleteSet,
  onAddSet,
  onDeleteExercise,
}: CurrentExerciseCardProps) {
  const completedCount = exercise.sets.filter((s) => s.completed).length;

  return (
    <View
      className="overflow-hidden rounded-3xl bg-surface"
      style={shadows.card}
    >
      {/* Accent header */}
      <View className="flex-row items-center justify-between bg-ai-bg px-5 pb-3 pt-4">
        <View className="flex-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-ai-text">
            {positionLabel}
          </Text>
          <Text className="mt-0.5 text-xl font-semibold text-ink">
            {exercise.name}
          </Text>
          {exercise.muscleGroup ? (
            <Text className="text-sm text-muted">{exercise.muscleGroup}</Text>
          ) : null}
        </View>
        <View className="items-end">
          <View className="flex-row items-center rounded-pill bg-white px-3 py-1.5">
            <Icon name="timer" size={14} color={colors.ai.icon} />
            <Text
              className="ml-1.5 text-sm font-semibold text-ai-text"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {elapsedLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Sets */}
      <View className="px-5 pb-4 pt-1">
        {exercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            onToggle={onToggleSet}
            onEdit={onEditSet}
            onDelete={onDeleteSet}
          />
        ))}

        <View className="mt-1 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add set"
            onPress={() => onAddSet(exercise.id)}
            className="py-2 active:opacity-60"
          >
            <Text className="text-sm font-medium text-primary">+ Add set</Text>
          </Pressable>
          <View className="flex-row items-center">
            <Text className="mr-3 text-xs text-muted">
              {completedCount}/{exercise.sets.length} done
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete ${exercise.name}`}
              onPress={() => onDeleteExercise(exercise.id)}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center rounded-pill active:opacity-60"
            >
              <Icon name="trash" size={17} color={colors.faint} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
