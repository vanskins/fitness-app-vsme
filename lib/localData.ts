import AsyncStorage from "expo-sqlite/kv-store";
import type { SQLiteDatabase } from "expo-sqlite";

/**
 * The local SQLite DB is a single-user cache for whoever is currently logged in
 * (rows are keyed to LOCAL_USER_ID; the sync layer translates to/from the real
 * auth uid). To keep one account's data from showing under another on the same
 * device, we track which auth user the cache currently belongs to and wipe it
 * when a different user logs in.
 */

const OWNER_KEY = "fitnotes.localDataOwner";

const USER_TABLES = [
  "food_logs",
  "daily_stats",
  "user_goals",
  "workout_sessions",
  "workout_exercises",
  "exercise_sets",
  "daily_notes",
  "body_weights",
];

export async function clearAllUserData(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(USER_TABLES.map((t) => `DELETE FROM ${t};`).join("\n"));
}

async function getLocalOwner(): Promise<string | null> {
  return AsyncStorage.getItem(OWNER_KEY);
}

async function setLocalOwner(userId: string): Promise<void> {
  await AsyncStorage.setItem(OWNER_KEY, userId);
}

/**
 * Ensures the local cache belongs to `userId`. If a different user (or none)
 * previously owned it, wipes all local user data so nothing leaks across
 * accounts. Idempotent — a no-op when the cache already belongs to this user.
 */
export async function prepareLocalCacheForUser(
  db: SQLiteDatabase,
  userId: string,
): Promise<void> {
  const owner = await getLocalOwner();
  if (owner !== userId) {
    await clearAllUserData(db);
    await setLocalOwner(userId);
  }
}
