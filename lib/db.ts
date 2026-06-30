import type { SQLiteDatabase } from "expo-sqlite";

/**
 * Local SQLite schema. Mirrors the planned Supabase Postgres tables (see the
 * project brief) so a background sync layer can push rows later. Every table
 * carries:
 *   - `synced`     0 = pending upload, 1 = pushed to Supabase
 *   - `updated_at` ISO timestamp, used for last-write-wins conflict handling
 *
 * Schema is created idempotently (CREATE TABLE IF NOT EXISTS) on every launch,
 * so a bumped version can never leave a table missing. DB_VERSION is reserved
 * for future destructive/data migrations.
 */
export const DB_NAME = "fitnotes.db";
const DB_VERSION = 3;

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  // Ensure the full schema exists. Idempotent and cheap; runs every launch.
  await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS user_goals (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        calorie_goal INTEGER NOT NULL,
        protein_goal_g INTEGER NOT NULL,
        water_goal_l REAL NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS daily_stats (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        water_l REAL NOT NULL DEFAULT 0,
        steps INTEGER NOT NULL DEFAULT 0,
        active_minutes INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        UNIQUE (user_id, date)
      );

      CREATE TABLE IF NOT EXISTS food_logs (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        food_name TEXT NOT NULL,
        detail TEXT,
        calories REAL NOT NULL DEFAULT 0,
        protein_g REAL NOT NULL DEFAULT 0,
        carbs_g REAL NOT NULL DEFAULT 0,
        fat_g REAL NOT NULL DEFAULT 0,
        logged_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_food_logs_logged_at
        ON food_logs (logged_at);

      CREATE TABLE IF NOT EXISTS workout_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        muscle_group TEXT,
        started_at TEXT NOT NULL,
        finished_at TEXT,
        notes TEXT,
        updated_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS workout_exercises (
        id TEXT PRIMARY KEY NOT NULL,
        session_id TEXT NOT NULL,
        name TEXT NOT NULL,
        muscle_group TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_workout_exercises_session
        ON workout_exercises (session_id);

      CREATE TABLE IF NOT EXISTS exercise_sets (
        id TEXT PRIMARY KEY NOT NULL,
        exercise_id TEXT NOT NULL,
        set_number INTEGER NOT NULL,
        weight_kg REAL NOT NULL DEFAULT 0,
        reps INTEGER NOT NULL DEFAULT 0,
        completed INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise
        ON exercise_sets (exercise_id);

      CREATE TABLE IF NOT EXISTS daily_notes (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT,
        energy_level INTEGER,
        sleep_hours REAL,
        noted_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_daily_notes_noted_at
        ON daily_notes (noted_at);

      CREATE TABLE IF NOT EXISTS body_weights (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        recorded_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_body_weights_recorded
        ON body_weights (recorded_at);

      -- Local user profile + session. Placeholder on-device auth; replaced by
      -- Supabase Auth (real password hashing, tokens) when sync lands.
      CREATE TABLE IF NOT EXISTS profile (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        initials TEXT NOT NULL,
        password TEXT,
        onboarded INTEGER NOT NULL DEFAULT 0,
        logged_in INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
  `);

  await db.execAsync(`PRAGMA user_version = ${DB_VERSION}`);
}

/** Local date key (YYYY-MM-DD) for "today". */
export function todayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
