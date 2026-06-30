import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { onDataReset } from "@/lib/dataEvents";
import {
  addExercise as addExerciseRepo,
  addSet as addSetRepo,
  deleteExercise as deleteExerciseRepo,
  deleteSet as deleteSetRepo,
  finishWorkout as finishWorkoutRepo,
  getCurrentWorkout,
  getOrCreateActiveSession,
  type NewExercise,
  toggleSet as toggleSetRepo,
  updateSet as updateSetRepo,
} from "@/lib/repository";
import type { WorkoutSession } from "@/types/workout";

/** The current in-progress workout, with persistence-backed CRUD. */
export function useWorkout() {
  const db = useSQLiteContext();
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setWorkout(await getCurrentWorkout(db));
    setLoading(false);
  }, [db]);

  const toggleSet = useCallback(
    async (setId: string) => {
      await toggleSetRepo(db, setId);
      await reload();
    },
    [db, reload],
  );

  // Works from anywhere: starts a session if none is active.
  const addExercise = useCallback(
    async (input: NewExercise) => {
      const sessionId = await getOrCreateActiveSession(db, "Workout");
      await addExerciseRepo(db, sessionId, input);
      await reload();
    },
    [db, reload],
  );

  // Begin a fresh active workout (used after the last one was finished).
  const startWorkout = useCallback(
    async (name = "Workout") => {
      await getOrCreateActiveSession(db, name);
      await reload();
    },
    [db, reload],
  );

  const deleteExercise = useCallback(
    async (exerciseId: string) => {
      await deleteExerciseRepo(db, exerciseId);
      await reload();
    },
    [db, reload],
  );

  const addSet = useCallback(
    async (exerciseId: string) => {
      await addSetRepo(db, exerciseId);
      await reload();
    },
    [db, reload],
  );

  const updateSet = useCallback(
    async (setId: string, fields: { weightKg: number; reps: number }) => {
      await updateSetRepo(db, setId, fields);
      await reload();
    },
    [db, reload],
  );

  const deleteSet = useCallback(
    async (setId: string) => {
      await deleteSetRepo(db, setId);
      await reload();
    },
    [db, reload],
  );

  const finish = useCallback(async () => {
    if (!workout) return;
    await finishWorkoutRepo(db, workout.id);
    await reload();
  }, [db, workout, reload]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useEffect(() => onDataReset(reload), [reload]);

  return {
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
    reload,
  };
}
