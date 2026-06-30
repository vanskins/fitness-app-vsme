import { Pressable, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SetRow } from "@/components/ui/SetRow";
import { colors } from "@/constants/colors";
import type { ExerciseSet, WorkoutExercise } from "@/types/workout";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  /**
   * When true the card is expanded with per-set rows (the "current" exercise).
   * When false it collapses to a one-line summary.
   */
  expanded?: boolean;
  onToggleSet?: (setId: string) => void;
  onEditSet?: (set: ExerciseSet) => void;
  onDeleteSet?: (setId: string) => void;
  onAddSet?: (exerciseId: string) => void;
  onDeleteExercise?: (exerciseId: string) => void;
}

/**
 * Exercise card. Completed exercises collapse to a summary row; the current
 * exercise expands to show editable set rows plus add-set / delete controls.
 */
export function ExerciseCard({
  exercise,
  expanded,
  onToggleSet,
  onEditSet,
  onDeleteSet,
  onAddSet,
  onDeleteExercise,
}: ExerciseCardProps) {
  const completedCount = exercise.sets.filter((s) => s.completed).length;
  const allDone =
    exercise.sets.length > 0 && completedCount === exercise.sets.length;

  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-medium text-ink">
            {exercise.name}
          </Text>
          <Text className="text-sm text-muted">{exercise.muscleGroup}</Text>
        </View>
        {expanded ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${exercise.name}`}
            onPress={() => onDeleteExercise?.(exercise.id)}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-pill active:opacity-60"
          >
            <Icon name="trash" size={18} color={colors.faint} />
          </Pressable>
        ) : (
          <View className="flex-row items-center">
            <Text className="text-sm text-muted">
              {completedCount}/{exercise.sets.length} sets
            </Text>
            {allDone ? (
              <View className="ml-2 h-6 w-6 items-center justify-center rounded-pill bg-primary">
                <Icon name="check" size={13} color="#FFFFFF" />
              </View>
            ) : null}
          </View>
        )}
      </View>

      {expanded ? (
        <View className="mt-2 border-t border-border pt-1">
          {exercise.sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              onToggle={onToggleSet}
              onEdit={onEditSet}
              onDelete={onDeleteSet}
            />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add set"
            onPress={() => onAddSet?.(exercise.id)}
            className="mt-1 py-2 active:opacity-60"
          >
            <Text className="text-sm font-medium text-primary">+ Add set</Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}
