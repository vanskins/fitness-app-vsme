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
import type { WorkoutSession } from "@/types/workout";

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
          <View className="gap-2">
            {workout.exercises.map((ex) => (
              <Card key={ex.id}>
                <Text className="text-base font-medium text-ink">{ex.name}</Text>
                {ex.muscleGroup ? (
                  <Text className="text-xs text-faint">{ex.muscleGroup}</Text>
                ) : null}
                <View className="mt-2 border-t border-border pt-1">
                  {ex.sets.map((s) => (
                    <View
                      key={s.id}
                      className="flex-row items-center justify-between py-1.5"
                    >
                      <Text className="text-sm text-ink">
                        Set {s.setNumber} · {s.weightKg} kg × {s.reps}
                      </Text>
                      {s.completed ? (
                        <Icon name="check" size={16} color={colors.primary} />
                      ) : (
                        <Text className="text-xs text-faint">skipped</Text>
                      )}
                    </View>
                  ))}
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
