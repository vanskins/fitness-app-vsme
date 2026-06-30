import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import { onDataReset } from "@/lib/dataEvents";
import { getWorkoutHistory } from "@/lib/repository";
import type { WorkoutSummary } from "@/types/workout";

/** Past (finished) workouts, newest first. */
export function useWorkoutHistory() {
  const db = useSQLiteContext();
  const [sessions, setSessions] = useState<WorkoutSummary[]>([]);

  const reload = useCallback(async () => {
    setSessions(await getWorkoutHistory(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useEffect(() => onDataReset(reload), [reload]);

  return { sessions, reload };
}
