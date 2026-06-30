import type { SQLiteDatabase } from "expo-sqlite";

import { LOCAL_USER_ID } from "@/lib/id";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

/**
 * Push/pull sync between local SQLite and Supabase.
 *
 * Strategy: each row carries `updated_at` (last-write-wins). Local rows with
 * `synced = 0` are upserted to the cloud, then marked synced. Cloud rows newer
 * than their local copy are written back. Safe to call often; no-ops unless
 * Supabase is configured and a user id is supplied.
 *
 * NOTE: wired and verified once Supabase credentials + auth are in place
 * (increment 2). Until then this never runs (isSupabaseConfigured === false).
 */

interface TableSync {
  name: string;
  /** Columns synced to/from the cloud (excludes the local-only `synced`). */
  columns: string[];
  /** Columns stored as 0/1 locally but boolean in Postgres. */
  booleanColumns?: string[];
}

const TABLES: TableSync[] = [
  {
    name: "user_goals",
    columns: ["id", "user_id", "calorie_goal", "protein_goal_g", "water_goal_l", "updated_at"],
  },
  {
    name: "daily_stats",
    columns: ["id", "user_id", "date", "water_l", "steps", "active_minutes", "updated_at"],
  },
  {
    name: "food_logs",
    columns: ["id", "user_id", "meal_type", "food_name", "detail", "calories", "protein_g", "carbs_g", "fat_g", "logged_at", "updated_at"],
  },
  {
    name: "workout_sessions",
    columns: ["id", "user_id", "name", "muscle_group", "started_at", "finished_at", "notes", "updated_at"],
  },
  {
    // Child tables have no local user_id column (linked via session_id /
    // exercise_id). user_id is stamped onto the cloud payload in toCloud().
    name: "workout_exercises",
    columns: ["id", "session_id", "name", "muscle_group", "order_index", "updated_at"],
  },
  {
    name: "exercise_sets",
    columns: ["id", "exercise_id", "set_number", "weight_kg", "reps", "completed", "updated_at"],
    booleanColumns: ["completed"],
  },
  {
    name: "daily_notes",
    columns: ["id", "user_id", "content", "energy_level", "sleep_hours", "noted_at", "updated_at"],
  },
  {
    name: "body_weights",
    columns: ["id", "user_id", "weight_kg", "recorded_at", "updated_at"],
  },
];

function toCloud(row: Record<string, unknown>, t: TableSync, userId: string) {
  const out: Record<string, unknown> = { ...row, user_id: userId };
  for (const col of t.booleanColumns ?? []) out[col] = row[col] === 1;
  return out;
}

function toLocalValue(
  value: unknown,
  isBool: boolean,
): string | number | null {
  if (isBool) return value ? 1 : 0;
  if (value === undefined || value === null) return null;
  if (typeof value === "number" || typeof value === "string") return value;
  return String(value);
}

async function pushTable(db: SQLiteDatabase, t: TableSync, userId: string) {
  if (!supabase) return;
  const pending = await db.getAllAsync<Record<string, unknown>>(
    `SELECT ${t.columns.join(", ")} FROM ${t.name} WHERE synced = 0`,
  );
  if (pending.length === 0) return;

  const payload = pending.map((r) => toCloud(r, t, userId));
  const { error } = await supabase.from(t.name).upsert(payload);
  if (error) throw error;

  const ids = pending.map((r) => String(r.id));
  const placeholders = ids.map(() => "?").join(", ");
  await db.runAsync(
    `UPDATE ${t.name} SET synced = 1 WHERE id IN (${placeholders})`,
    ids,
  );
}

async function pullTable(db: SQLiteDatabase, t: TableSync, userId: string) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from(t.name)
    .select(t.columns.join(","))
    .eq("user_id", userId);
  if (error) throw error;
  if (!data) return;

  const boolSet = new Set(t.booleanColumns ?? []);
  const rows = data as unknown as Record<string, unknown>[];
  for (const remote of rows) {
    const local = await db.getFirstAsync<{ updated_at: string }>(
      `SELECT updated_at FROM ${t.name} WHERE id = ?`,
      [String(remote.id)],
    );
    // Last-write-wins: only apply remote if newer (or local missing).
    if (local && String(local.updated_at) >= String(remote.updated_at)) continue;

    const cols = t.columns;
    // The local layer keys all rows to LOCAL_USER_ID; the cloud uses the auth
    // uid. Translate on the way in so local queries keep working unchanged.
    const values = cols.map((c) =>
      c === "user_id" ? LOCAL_USER_ID : toLocalValue(remote[c], boolSet.has(c)),
    );
    const placeholders = cols.map(() => "?").join(", ");
    const updates = cols
      .filter((c) => c !== "id")
      .map((c) => `${c} = excluded.${c}`)
      .join(", ");
    await db.runAsync(
      `INSERT INTO ${t.name} (${cols.join(", ")}, synced)
       VALUES (${placeholders}, 1)
       ON CONFLICT(id) DO UPDATE SET ${updates}, synced = 1`,
      values,
    );
  }
}

/** Full bidirectional sync. No-op unless configured and a user id is given. */
export async function syncAll(
  db: SQLiteDatabase,
  userId: string | null | undefined,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !userId) return;
  for (const t of TABLES) {
    await pushTable(db, t, userId);
    await pullTable(db, t, userId);
  }
}
