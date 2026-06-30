import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExerciseForm } from "@/components/forms/ExerciseForm";
import { SetEditForm } from "@/components/forms/SetEditForm";
import { AISuggestionCard } from "@/components/ui/AISuggestionCard";
import { Button } from "@/components/ui/Button";
import { ExerciseCard } from "@/components/ui/ExerciseCard";
import { useWorkout } from "@/hooks/useWorkout";
import { mockAiSuggestions } from "@/lib/mockData";
import type { ExerciseSet } from "@/types/workout";

/** Formats elapsed seconds as M:SS (or H:MM:SS past an hour). */
function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    workout,
    loading,
    toggleSet,
    addExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
    finish,
  } = useWorkout();
  const [tick, setTick] = useState(0);
  const [exerciseFormOpen, setExerciseFormOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<ExerciseSet | null>(null);

  // Tick once a second so the elapsed time (derived from startedAt) updates.
  useEffect(() => {
    if (!workout || workout.finishedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [workout]);

  const elapsed = useMemo(() => {
    if (!workout) return 0;
    void tick; // recompute on each tick
    return Math.max(
      0,
      Math.floor((Date.now() - Date.parse(workout.startedAt)) / 1000),
    );
  }, [workout, tick]);

  // The "current" exercise is the first one with an incomplete set.
  const currentIndex = useMemo(() => {
    if (!workout) return -1;
    const idx = workout.exercises.findIndex((ex) =>
      ex.sets.some((s) => !s.completed),
    );
    return idx === -1 ? workout.exercises.length - 1 : idx;
  }, [workout]);

  const confirmFinish = () => {
    if (!workout) return;
    Alert.alert("Finish workout?", `${workout.name} · ${formatElapsed(elapsed)}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Finish",
        onPress: async () => {
          await finish();
          router.navigate("/");
        },
      },
    ]);
  };

  const confirmDeleteExercise = (exerciseId: string, name: string) => {
    Alert.alert("Delete exercise?", name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteExercise(exerciseId),
      },
    ]);
  };

  const confirmDeleteSet = (setId: string) => {
    Alert.alert("Delete set?", "Remove this set from the exercise?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteSet(setId) },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#1D9E75" />
      </View>
    );
  }

  const isEmpty = !workout || workout.exercises.length === 0;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with live timer chip */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-medium text-ink">
              {workout?.name ?? "Workout"}
            </Text>
            <Text className="text-sm text-muted">
              {workout?.muscleGroup || "Add an exercise to start"}
            </Text>
          </View>
          {workout ? (
            <View className="rounded-pill bg-amber-bg px-3 py-1.5">
              <Text className="text-sm font-medium text-amber">
                ⏱ {formatElapsed(elapsed)}
              </Text>
            </View>
          ) : null}
        </View>

        {isEmpty ? (
          <View className="mt-10 items-center px-6">
            <Text className="text-5xl">🏋️</Text>
            <Text className="mt-4 text-center text-sm text-muted">
              No exercises yet. Add one to begin logging sets.
            </Text>
          </View>
        ) : (
          <View className="mt-5 gap-3">
            {workout.exercises.map((exercise, i) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                expanded={i === currentIndex}
                onToggleSet={toggleSet}
                onEditSet={setEditingSet}
                onDeleteSet={confirmDeleteSet}
                onAddSet={addSet}
                onDeleteExercise={(id) =>
                  confirmDeleteExercise(id, exercise.name)
                }
              />
            ))}
          </View>
        )}

        {/* Add exercise */}
        <View className="mt-3">
          <Button
            label="Add exercise"
            variant="text"
            icon="+"
            onPress={() => setExerciseFormOpen(true)}
          />
        </View>

        {/* AI tip */}
        <View className="mt-5">
          <AISuggestionCard title="AI Tip" tip={mockAiSuggestions.workout} />
        </View>

        {/* Finish workout */}
        {!isEmpty ? (
          <View className="mt-6">
            <Button label="Finish workout" fullWidth onPress={confirmFinish} />
          </View>
        ) : null}
      </ScrollView>

      <ExerciseForm
        visible={exerciseFormOpen}
        onClose={() => setExerciseFormOpen(false)}
        onSubmit={addExercise}
      />
      <SetEditForm
        set={editingSet}
        onClose={() => setEditingSet(null)}
        onSubmit={updateSet}
      />
    </View>
  );
}
