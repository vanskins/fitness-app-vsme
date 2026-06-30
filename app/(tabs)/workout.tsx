import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDialog } from "@/context/DialogContext";

import { ExerciseForm } from "@/components/forms/ExerciseForm";
import { SetEditForm } from "@/components/forms/SetEditForm";
import { CurrentExerciseCard } from "@/components/workout/CurrentExerciseCard";
import { RestTimerBar } from "@/components/workout/RestTimerBar";
import { StartWorkoutModal } from "@/components/workout/StartWorkoutModal";
import { AISuggestionCard } from "@/components/ui/AISuggestionCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { shadows } from "@/constants/shadows";
import { useRestTimer } from "@/hooks/useRestTimer";
import { useWorkout } from "@/hooks/useWorkout";
import { mockAiSuggestions } from "@/lib/mockData";
import { formatDuration } from "@/lib/workoutSummary";
import type { ExerciseSet, WorkoutExercise } from "@/types/workout";

/** Formats elapsed seconds as M:SS (or H:MM:SS past an hour). */
function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Collapsed summary row for an exercise the user has already moved past. */
function DoneExerciseRow({ exercise }: { exercise: WorkoutExercise }) {
  const completed = exercise.sets.filter((s) => s.completed).length;
  return (
    <View
      className="flex-row items-center rounded-2xl bg-surface px-4 py-3"
      style={shadows.card}
    >
      <View className="h-7 w-7 items-center justify-center rounded-pill bg-primary">
        <Icon name="check" size={14} color="#FFFFFF" />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-base font-medium text-ink">{exercise.name}</Text>
        <Text className="text-xs text-muted">
          {completed}/{exercise.sets.length} sets
          {exercise.durationSec != null
            ? ` · ${formatDuration(exercise.durationSec)}`
            : ""}
        </Text>
      </View>
    </View>
  );
}

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { confirm } = useDialog();
  const {
    workout,
    loading,
    toggleSet,
    addExercise,
    startWorkout,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
    finish,
  } = useWorkout();
  const rest = useRestTimer();
  const [tick, setTick] = useState(0);
  const [startOpen, setStartOpen] = useState(false);
  const [exerciseFormOpen, setExerciseFormOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<ExerciseSet | null>(null);

  const isFinished = !!workout?.finishedAt;
  const hasActive = !!workout && !isFinished;
  const exercises = useMemo(() => workout?.exercises ?? [], [workout]);
  const hasExercises = exercises.length > 0;

  // In guided mode the last exercise is the one being worked; earlier ones are done.
  const currentExercise = hasActive && hasExercises
    ? exercises[exercises.length - 1]
    : null;
  const doneExercises = hasActive ? exercises.slice(0, -1) : [];

  // Tick once a second so live timers update.
  useEffect(() => {
    if (!hasActive) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [hasActive]);

  const totalElapsed = useMemo(() => {
    if (!workout) return 0;
    void tick;
    const end = workout.finishedAt
      ? Date.parse(workout.finishedAt)
      : Date.now();
    return Math.max(0, Math.floor((end - Date.parse(workout.startedAt)) / 1000));
  }, [workout, tick]);

  const exerciseElapsed = useMemo(() => {
    if (!currentExercise) return 0;
    void tick;
    const start = currentExercise.startedAt
      ? Date.parse(currentExercise.startedAt)
      : workout
        ? Date.parse(workout.startedAt)
        : Date.now();
    return Math.max(0, Math.floor((Date.now() - start) / 1000));
  }, [currentExercise, workout, tick]);

  // Start a rest countdown when a set is freshly marked complete.
  const handleToggleSet = useCallback(
    async (setId: string) => {
      const set = exercises
        .flatMap((ex) => ex.sets)
        .find((s) => s.id === setId);
      const willComplete = set ? !set.completed : false;
      await toggleSet(setId);
      if (willComplete) rest.start();
    },
    [exercises, toggleSet, rest],
  );

  const openNextExercise = () => {
    rest.stop();
    setExerciseFormOpen(true);
  };

  const handleAddExercise = useCallback(
    async (input: Parameters<typeof addExercise>[0]) => {
      rest.stop();
      await addExercise(input);
    },
    [addExercise, rest],
  );

  const confirmFinish = async () => {
    if (!workout) return;
    const ok = await confirm({
      title: "Finish workout?",
      message: `${workout.name} · ${formatElapsed(totalElapsed)}`,
      confirmLabel: "Finish",
      icon: "check",
    });
    if (ok) {
      const id = workout.id;
      rest.stop();
      await finish();
      router.push({ pathname: "/workout/[id]", params: { id } });
    }
  };

  const confirmDeleteExercise = async (exerciseId: string, name: string) => {
    const ok = await confirm({
      title: "Delete exercise?",
      message: name,
      confirmLabel: "Delete",
      destructive: true,
      icon: "trash",
    });
    if (ok) deleteExercise(exerciseId);
  };

  const confirmDeleteSet = async (setId: string) => {
    const ok = await confirm({
      title: "Delete set?",
      message: "Remove this set from the exercise?",
      confirmLabel: "Delete",
      destructive: true,
      icon: "trash",
    });
    if (ok) deleteSet(setId);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: rest.active ? 120 : 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with live total timer */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-medium text-ink">
              {workout?.name ?? "Workout"}
            </Text>
            <Text className="text-sm text-muted">
              {isFinished
                ? "Completed"
                : hasActive
                  ? hasExercises
                    ? `${exercises.length} ${exercises.length === 1 ? "exercise" : "exercises"} logged`
                    : "Add your first exercise"
                  : "Ready when you are"}
            </Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            {workout && isFinished ? (
              <View className="flex-row items-center rounded-pill bg-ai-bg px-3 py-1.5">
                <Icon name="check" size={14} color={colors.ai.icon} />
                <Text className="ml-1.5 text-sm font-medium text-ai-text">
                  {formatElapsed(totalElapsed)}
                </Text>
              </View>
            ) : workout ? (
              <View className="flex-row items-center rounded-pill bg-amber-bg px-3 py-1.5">
                <Icon name="timer" size={14} color={colors.amber.text} />
                <Text
                  className="ml-1.5 text-sm font-medium text-amber"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {formatElapsed(totalElapsed)}
                </Text>
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Workout history"
              onPress={() => router.push("/history")}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-pill border border-border bg-surface active:opacity-70"
            >
              <Icon name="history" size={18} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* ---- No active workout: start CTA ---- */}
        {!workout ? (
          <View className="mt-16 items-center px-6">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-ai-bg">
              <Icon name="workout" size={30} color={colors.primary} />
            </View>
            <Text className="mt-4 text-center text-sm text-muted">
              Ready to train? Start a workout and log your sets one exercise at a
              time.
            </Text>
          </View>
        ) : null}

        {/* ---- Finished: read-only recap ---- */}
        {workout && isFinished ? (
          <View className="mt-5 gap-3">
            {exercises.map((ex) => (
              <DoneExerciseRow key={ex.id} exercise={ex} />
            ))}
          </View>
        ) : null}

        {/* ---- Active with no exercises yet ---- */}
        {hasActive && !hasExercises ? (
          <View className="mt-16 items-center px-6">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-ai-bg">
              <Icon name="dumbbell" size={28} color={colors.primary} />
            </View>
            <Text className="mt-4 text-center text-sm text-muted">
              Let's begin. Add your first exercise to start logging sets.
            </Text>
          </View>
        ) : null}

        {/* ---- Active guided runner ---- */}
        {currentExercise ? (
          <View className="mt-5">
            <CurrentExerciseCard
              exercise={currentExercise}
              elapsedLabel={formatElapsed(exerciseElapsed)}
              positionLabel={`Exercise ${exercises.length}`}
              onToggleSet={handleToggleSet}
              onEditSet={setEditingSet}
              onDeleteSet={confirmDeleteSet}
              onAddSet={addSet}
              onDeleteExercise={(id) =>
                confirmDeleteExercise(id, currentExercise.name)
              }
            />
            {rest.active && rest.remaining != null ? (
              <View className="mt-3">
                <RestTimerBar
                  remaining={rest.remaining}
                  onAddTime={rest.addTime}
                  onSkip={rest.stop}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {doneExercises.length > 0 ? (
          <View className="mt-5">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
              Completed
            </Text>
            <View className="gap-2">
              {doneExercises.map((ex) => (
                <DoneExerciseRow key={ex.id} exercise={ex} />
              ))}
            </View>
          </View>
        ) : null}

        {/* AI tip (active only) */}
        {hasActive ? (
          <View className="mt-5">
            <AISuggestionCard title="AI Tip" tip={mockAiSuggestions.workout} />
          </View>
        ) : null}

        {/* ---- Primary actions ---- */}
        {hasActive ? (
          <View className="mt-6 gap-3">
            <Button
              label={hasExercises ? "Next exercise" : "Add first exercise"}
              icon="add"
              fullWidth
              onPress={openNextExercise}
            />
            {hasExercises ? (
              <Button
                label="Finish workout"
                variant="outline"
                fullWidth
                onPress={confirmFinish}
              />
            ) : null}
          </View>
        ) : (
          <View className="mt-6">
            <Button
              label={isFinished ? "Start new workout" : "Start workout"}
              icon="add"
              fullWidth
              onPress={() => setStartOpen(true)}
            />
          </View>
        )}
      </ScrollView>

      <StartWorkoutModal
        visible={startOpen}
        onClose={() => setStartOpen(false)}
        onStart={startWorkout}
      />
      <ExerciseForm
        visible={exerciseFormOpen}
        onClose={() => setExerciseFormOpen(false)}
        onSubmit={handleAddExercise}
      />
      <SetEditForm
        set={editingSet}
        onClose={() => setEditingSet(null)}
        onSubmit={updateSet}
      />
    </View>
  );
}
