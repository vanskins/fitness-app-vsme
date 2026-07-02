import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AISuggestionCard } from "@/components/ui/AISuggestionCard";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { StatTile } from "@/components/ui/StatTile";
import { colors } from "@/constants/colors";
import { fetchSuggestion } from "@/lib/aiSuggestion";
import { getWorkoutById } from "@/lib/repository";
import {
  computeWorkoutStats,
  formatDuration,
  localWorkoutSummary,
} from "@/lib/workoutSummary";
import type { WorkoutExercise, WorkoutSession } from "@/types/workout";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  );
}

function ExerciseBreakdownCard({ exercise }: { exercise: WorkoutExercise }) {
  const completedSets = exercise.sets.filter((s) => s.completed);
  const completedCount = completedSets.length;
  const totalSets = exercise.sets.length;
  const volumeKg = completedSets.reduce(
    (sum, s) => sum + s.weightKg * s.reps,
    0,
  );
  const topSet = completedSets.reduce(
    (best, s) => (s.weightKg * s.reps > best.weightKg * best.reps ? s : best),
    completedSets[0],
  );
  const completionPct = totalSets > 0 ? completedCount / totalSets : 0;

  return (
    <Card className="overflow-hidden p-0">
      <View className="bg-ai-bg px-4 pb-3 pt-4">
        <View className="flex-row items-start justify-between">
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-white">
            <Icon name="dumbbell" size={22} color={colors.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-base font-semibold text-ink">
              {exercise.name}
            </Text>
            {exercise.muscleGroup ? (
              <Text className="mt-0.5 text-xs font-medium uppercase text-ai-text">
                {exercise.muscleGroup}
              </Text>
            ) : null}
          </View>
          <View className="ml-3 items-end rounded-pill bg-white px-3 py-1.5">
            <Text className="text-xs font-semibold text-ai-text">
              {completedCount}/{totalSets}
            </Text>
            <Text className="text-[10px] font-medium uppercase text-faint">
              sets
            </Text>
          </View>
        </View>

        <View className="mt-4 h-2 overflow-hidden rounded-pill bg-white">
          <View
            className="h-full rounded-pill bg-primary"
            style={{ width: `${Math.round(completionPct * 100)}%` }}
          />
        </View>
      </View>

      <View className="px-4 py-3">
        <View className="mb-2 flex-row gap-2">
          <View className="flex-1 rounded-2xl bg-background px-3 py-2">
            <Text className="text-[10px] font-medium uppercase text-faint">
              Volume
            </Text>
            <Text className="mt-0.5 text-sm font-semibold text-ink">
              {Math.round(volumeKg).toLocaleString()} kg
            </Text>
          </View>
          <View className="flex-1 rounded-2xl bg-background px-3 py-2">
            <Text className="text-[10px] font-medium uppercase text-faint">
              Top set
            </Text>
            <Text className="mt-0.5 text-sm font-semibold text-ink">
              {topSet ? `${topSet.weightKg} kg x ${topSet.reps}` : "-"}
            </Text>
          </View>
        </View>

        {exercise.sets.map((set) => (
          <View
            key={set.id}
            className="mt-2 flex-row items-center rounded-2xl border border-border bg-surface px-3 py-2.5"
          >
            <View
              className={[
                "mr-3 h-8 w-8 items-center justify-center rounded-pill",
                set.completed ? "bg-primary" : "bg-background",
              ].join(" ")}
            >
              <Text
                className={[
                  "text-xs font-semibold",
                  set.completed ? "text-white" : "text-faint",
                ].join(" ")}
              >
                {set.setNumber}
              </Text>
            </View>

            <View className="min-w-0 flex-1">
              <Text className="text-sm font-semibold text-ink">
                {set.weightKg} kg x {set.reps}
              </Text>
              <Text className="mt-0.5 text-xs text-muted">
                {Math.round(set.weightKg * set.reps).toLocaleString()} kg
                volume
              </Text>
            </View>

            {set.completed ? (
              <View className="ml-3 h-7 w-7 items-center justify-center rounded-pill bg-ai-bg">
                <Icon name="check" size={15} color={colors.primary} />
              </View>
            ) : (
              <View className="ml-3 rounded-pill bg-background px-2.5 py-1">
                <Text className="text-xs font-medium text-faint">Skipped</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiText, setAiText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getWorkoutById(db, String(id)).then((w) => {
      if (active) {
        setWorkout(w);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [db, id]);

  const stats = useMemo(
    () => (workout ? computeWorkoutStats(workout) : null),
    [workout],
  );

  // Fetch an AI summary; the computed recap shows until/unless it returns.
  useEffect(() => {
    if (!workout || !stats) return;
    let active = true;
    fetchSuggestion({
      context: "workout_summary",
      workout: {
        name: workout.name,
        durationSec: stats.durationSec,
        volumeKg: stats.volumeKg,
        completedSets: stats.completedSets,
        exercises: workout.exercises.map((e) => ({
          name: e.name,
          topSetKg: e.sets.reduce((max, s) => Math.max(max, s.weightKg), 0),
        })),
      },
    }).then((t) => {
      if (active && t) setAiText(t);
    });
    return () => {
      active = false;
    };
  }, [workout, stats]);

  return (
    <View className="flex-1 bg-background">
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="flex-row items-center px-4 pb-2"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={8}
          className="mr-1 h-9 w-9 items-center justify-center active:opacity-60"
        >
          <Icon name="back" size={24} color={colors.ink} />
        </Pressable>
        <Text className="text-2xl font-medium text-ink">
          {workout?.name ?? "Workout"}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !workout || !stats ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-sm text-muted">Workout not found.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-sm text-muted">{formatDate(workout.startedAt)}</Text>

          {/* Stats */}
          <View className="mt-3 flex-row gap-3">
            <StatTile accent="green" icon="active" label="Volume" value={Math.round(stats.volumeKg).toLocaleString()} unit="kg" />
            <StatTile accent="blue" icon="timer" label="Duration" value={formatDuration(stats.durationSec)} />
          </View>
          <View className="mt-3 flex-row gap-3">
            <StatTile accent="amber" icon="check" label="Sets" value={`${stats.completedSets}`} />
            <StatTile accent="coral" icon="dumbbell" label="Exercises" value={`${stats.exerciseCount}`} />
          </View>

          {/* AI summary */}
          <View className="mt-5">
            <AISuggestionCard
              title="Workout summary"
              tip={aiText ?? localWorkoutSummary(workout, stats)}
            />
          </View>

          {/* Exercise breakdown */}
          <Text className="mb-2 mt-6 text-lg font-medium text-ink">Exercises</Text>
          <View className="gap-3">
            {workout.exercises.map((ex) => (
              <ExerciseBreakdownCard key={ex.id} exercise={ex} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
