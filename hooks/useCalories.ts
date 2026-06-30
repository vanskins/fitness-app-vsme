import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import { getDailyStats, getFoodLogsForDate, getGoals } from "@/lib/repository";

export interface CaloriesSummary {
  consumed: number;
  goal: number;
  remaining: number;
  /** 0–1 fraction of the daily calorie goal. */
  progress: number;
  proteinG: number;
  proteinGoalG: number;
  waterL: number;
  waterGoalL: number;
  steps: number;
  activeMinutes: number;
}

const EMPTY: CaloriesSummary = {
  consumed: 0,
  goal: 2200,
  remaining: 2200,
  progress: 0,
  proteinG: 0,
  proteinGoalG: 140,
  waterL: 0,
  waterGoalL: 3,
  steps: 0,
  activeMinutes: 0,
};

/**
 * Today's calorie + macro + activity summary for the Home dashboard.
 * Reloads whenever the screen regains focus so logged meals appear immediately.
 */
export function useCalories() {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState<CaloriesSummary>(EMPTY);

  const reload = useCallback(async () => {
    const [goals, stats, meals] = await Promise.all([
      getGoals(db),
      getDailyStats(db),
      getFoodLogsForDate(db),
    ]);
    const consumed = meals.reduce((sum, m) => sum + m.calories, 0);
    const proteinG = meals.reduce((sum, m) => sum + m.proteinG, 0);
    setSummary({
      consumed,
      goal: goals.calorieGoal,
      remaining: Math.max(0, goals.calorieGoal - consumed),
      progress: goals.calorieGoal > 0 ? consumed / goals.calorieGoal : 0,
      proteinG,
      proteinGoalG: goals.proteinGoalG,
      waterL: stats.waterL,
      waterGoalL: goals.waterGoalL,
      steps: stats.steps,
      activeMinutes: stats.activeMinutes,
    });
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { summary, reload };
}
