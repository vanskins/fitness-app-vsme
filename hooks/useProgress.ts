import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import {
  addWeight as addWeightRepo,
  deleteWeight as deleteWeightRepo,
  getCalorieHistory,
  getWeekSummary,
  getWeights,
} from "@/lib/repository";
import type { BodyWeight, CaloriePoint, WeekSummary } from "@/types/progress";

const CALORIE_DAYS = 7;

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
  const [summary, setSummary] = useState<WeekSummary>(EMPTY_SUMMARY);

  const reload = useCallback(async () => {
    const [w, history] = await Promise.all([
      getWeights(db),
      getCalorieHistory(db, CALORIE_DAYS),
    ]);
    setWeights(w);
    setCalories(history);
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

  return { weights, calories, summary, addWeight, deleteWeight, reload };
}
