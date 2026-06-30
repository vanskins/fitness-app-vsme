import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { onDataReset } from "@/lib/dataEvents";
import {
  addFoodLog,
  deleteFoodLog,
  getFoodLogsForDate,
  type NewFoodLog,
  updateFoodLog,
} from "@/lib/repository";
import type { FoodLog } from "@/types/food";

/** Today's meals, with create/update/delete mutators. */
export function useFoodLog() {
  const db = useSQLiteContext();
  const [meals, setMeals] = useState<FoodLog[]>([]);

  const reload = useCallback(async () => {
    setMeals(await getFoodLogsForDate(db));
  }, [db]);

  const addMeal = useCallback(
    async (input: NewFoodLog) => {
      await addFoodLog(db, input);
      await reload();
    },
    [db, reload],
  );

  const updateMeal = useCallback(
    async (id: string, input: NewFoodLog) => {
      await updateFoodLog(db, id, input);
      await reload();
    },
    [db, reload],
  );

  const deleteMeal = useCallback(
    async (id: string) => {
      await deleteFoodLog(db, id);
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

  return { meals, addMeal, updateMeal, deleteMeal, reload };
}
