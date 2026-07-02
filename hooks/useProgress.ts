import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { onDataReset } from "@/lib/dataEvents";
import {
  addWeight as addWeightRepo,
  deleteWeight as deleteWeightRepo,
  getCalorieHistory,
  getWeekSummary,
  getWeights,
  getWorkoutProgressHistory,
} from "@/lib/repository";
import type {
  BodyWeight,
  CaloriePoint,
  WeekSummary,
  WorkoutPoint,
} from "@/types/progress";

const CALORIE_DAYS = 7;
const WORKOUT_DAYS = 7;

const EMPTY_SUMMARY: WeekSummary = {
  workouts: 0,
  volumeKg: 0,
  avgCalories: 0,
};

/** Progress data: weight trend, calorie history, and a weekly summary. */
export function useProgress() {
  const db = useSQLiteContext();
  const [weights, setWeights] = useState<BodyWeight[]>([]);
  const [calories, setCalories] = useState<CaloriePoint[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutPoint[]>([]);
  const [summary, setSummary] = useState<WeekSummary>(EMPTY_SUMMARY);

  const reload = useCallback(async () => {
    const [w, history, workoutHistory] = await Promise.all([
      getWeights(db),
      getCalorieHistory(db, CALORIE_DAYS),
      getWorkoutProgressHistory(db, WORKOUT_DAYS),
    ]);
    setWeights(w);
    setCalories(history);
    setWorkouts(workoutHistory);
    setSummary(await getWeekSummary(db, history));
  }, [db]);

  const addWeight = useCallback(
    async (weightKg: number) => {
      await addWeightRepo(db, weightKg);
      await reload();
    },
    [db, reload],
  );

  const deleteWeight = useCallback(
    async (id: string) => {
      await deleteWeightRepo(db, id);
      await reload();
    },
    [db, reload],
  );

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useEffect(() => onDataReset(reload), [reload]);

  return {
    weights,
    calories,
    workouts,
    summary,
    addWeight,
    deleteWeight,
    reload,
  };
}
