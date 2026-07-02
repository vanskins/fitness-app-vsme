import { useFocusEffect } from "expo-router";
import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import {
  getHealthAvailability,
  getHealthPermissionStatus,
  openHealthConnectInstall,
  readTodayHealthActivity,
  requestHealthPermissions,
  type HealthActivityData,
  type HealthAvailability,
} from "@/lib/health";
import { LOCAL_USER_ID } from "@/lib/id";

export type HealthActivityStatus =
  | "loading"
  | "success"
  | "permissionRequired"
  | "dismissed"
  | "unavailable"
  | "notSupported"
  | "error";

export interface HealthActivityState {
  status: HealthActivityStatus;
  availability?: HealthAvailability;
  data: HealthActivityData | null;
  retrying: boolean;
}

const EMPTY_HEALTH_DATA: HealthActivityData = {
  steps: 0,
  distanceKm: 0,
  activeCalories: 0,
  activeMinutes: 0,
};

async function getPromptDismissed(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ dismissed: number }>(
    `SELECT dismissed FROM health_preferences WHERE user_id = ? LIMIT 1`,
    [LOCAL_USER_ID],
  );
  return row?.dismissed === 1;
}

async function setPromptDismissed(
  db: SQLiteDatabase,
  dismissed: boolean,
) {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO health_preferences
       (id, user_id, dismissed, updated_at, synced)
     VALUES ('health_pref_local', ?, ?, ?, 0)
     ON CONFLICT(user_id) DO UPDATE SET
       dismissed = excluded.dismissed,
       updated_at = excluded.updated_at,
       synced = 0`,
    [LOCAL_USER_ID, dismissed ? 1 : 0, now],
  );
}

export function useHealthActivity() {
  const db = useSQLiteContext();
  const [state, setState] = useState<HealthActivityState>({
    status: "loading",
    data: null,
    retrying: false,
  });

  const load = useCallback(
    async (options?: { retrying?: boolean; ignoreDismissed?: boolean }) => {
      const retrying = options?.retrying ?? false;
      setState((current) => ({
        ...current,
        status: retrying ? current.status : "loading",
        retrying,
      }));

      try {
        const availability = await getHealthAvailability();

        if (availability.status !== "available") {
          const dismissed =
            !options?.ignoreDismissed && (await getPromptDismissed(db));
          setState({
            status:
              dismissed
                ? "dismissed"
                : availability.status === "unavailable"
                ? "unavailable"
                : "notSupported",
            availability,
            data: dismissed ? EMPTY_HEALTH_DATA : null,
            retrying: false,
          });
          return;
        }

        const permission = await getHealthPermissionStatus();

        if (permission !== "granted") {
          const dismissed =
            !options?.ignoreDismissed && (await getPromptDismissed(db));
          setState({
            status: dismissed ? "dismissed" : "permissionRequired",
            availability,
            data: dismissed ? EMPTY_HEALTH_DATA : null,
            retrying: false,
          });
          return;
        }

        const data = await readTodayHealthActivity();
        setState({ status: "success", availability, data, retrying: false });
      } catch {
        if (!retrying) {
          await load({
            retrying: true,
            ignoreDismissed: options?.ignoreDismissed,
          });
          return;
        }
        setState((current) => ({
          ...current,
          status: "error",
          data: null,
          retrying: false,
        }));
      }
    },
    [db],
  );

  const requestAccess = useCallback(async () => {
    await setPromptDismissed(db, false);
    setState((current) => ({ ...current, status: "loading" }));
    const permission = await requestHealthPermissions();
    if (permission === "granted") {
      await load({ ignoreDismissed: true });
      return;
    }
    setState((current) => ({
      ...current,
      status: "permissionRequired",
      data: null,
      retrying: false,
    }));
  }, [db, load]);

  const dismiss = useCallback(async () => {
    await setPromptDismissed(db, true);
    setState((current) => ({
      ...current,
      status: "dismissed",
      data: EMPTY_HEALTH_DATA,
      retrying: false,
    }));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        load();
      }
    });
    return () => sub.remove();
  }, [load]);

  return {
    ...state,
    refresh: () => load({ ignoreDismissed: true }),
    requestAccess,
    dismiss,
    installHealthConnect: openHealthConnectInstall,
  };
}
