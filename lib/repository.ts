import type { SQLiteDatabase } from "expo-sqlite";

import { todayKey } from "@/lib/db";
import { generateId, LOCAL_USER_ID } from "@/lib/id";
import type { FoodLog, MealType } from "@/types/food";
import type { DailyNote } from "@/types/note";
import type { BodyWeight, CaloriePoint, WeekSummary } from "@/types/progress";
import type { UserGoals } from "@/types/user";
import type {
  ExerciseSet,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSummary,
} from "@/types/workout";

const DEFAULT_GOALS: UserGoals = {
  calorieGoal: 2200,
  proteinGoalG: 140,
  waterGoalL: 3,
};

/* ----------------------------- Goals ----------------------------- */

export async function getGoals(db: SQLiteDatabase): Promise<UserGoals> {
  const row = await db.getFirstAsync<{
    calorie_goal: number;
    protein_goal_g: number;
    water_goal_l: number;
  }>(
    `SELECT calorie_goal, protein_goal_g, water_goal_l
       FROM user_goals WHERE user_id = ? LIMIT 1`,
    [LOCAL_USER_ID],
  );
  if (!row) return DEFAULT_GOALS;
  return {
    calorieGoal: row.calorie_goal,
    proteinGoalG: row.protein_goal_g,
    waterGoalL: row.water_goal_l,
  };
}

/* -------------------------- Daily stats -------------------------- */

export interface DailyStatsRow {
  waterL: number;
  steps: number;
  activeMinutes: number;
}

export async function getDailyStats(
  db: SQLiteDatabase,
  date: string = todayKey(),
): Promise<DailyStatsRow> {
  const row = await db.getFirstAsync<{
    water_l: number;
    steps: number;
    active_minutes: number;
  }>(
    `SELECT water_l, steps, active_minutes
       FROM daily_stats WHERE user_id = ? AND date = ? LIMIT 1`,
    [LOCAL_USER_ID, date],
  );
  return {
    waterL: row?.water_l ?? 0,
    steps: row?.steps ?? 0,
    activeMinutes: row?.active_minutes ?? 0,
  };
}

/* ---------------------------- Food ------------------------------- */

interface FoodRow {
  id: string;
  user_id: string;
  meal_type: string;
  food_name: string;
  detail: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

function mapFood(r: FoodRow): FoodLog {
  return {
    id: r.id,
    userId: r.user_id,
    mealType: r.meal_type as MealType,
    foodName: r.food_name,
    detail: r.detail ?? undefined,
    calories: r.calories,
    proteinG: r.protein_g,
    carbsG: r.carbs_g,
    fatG: r.fat_g,
    loggedAt: r.logged_at,
  };
}

export async function getFoodLogsForDate(
  db: SQLiteDatabase,
  date: string = todayKey(),
): Promise<FoodLog[]> {
  const rows = await db.getAllAsync<FoodRow>(
    `SELECT * FROM food_logs
       WHERE user_id = ? AND substr(logged_at, 1, 10) = ?
       ORDER BY logged_at ASC`,
    [LOCAL_USER_ID, date],
  );
  return rows.map(mapFood);
}

export interface NewFoodLog {
  mealType: MealType;
  foodName: string;
  detail?: string;
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

export async function addFoodLog(
  db: SQLiteDatabase,
  input: NewFoodLog,
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO food_logs
       (id, user_id, meal_type, food_name, detail, calories, protein_g, carbs_g, fat_g, logged_at, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      generateId("food"),
      LOCAL_USER_ID,
      input.mealType,
      input.foodName,
      input.detail ?? null,
      input.calories,
      input.proteinG ?? 0,
      input.carbsG ?? 0,
      input.fatG ?? 0,
      now,
      now,
    ],
  );
}

export async function updateFoodLog(
  db: SQLiteDatabase,
  id: string,
  input: NewFoodLog,
): Promise<void> {
  await db.runAsync(
    `UPDATE food_logs
        SET meal_type = ?, food_name = ?, detail = ?, calories = ?,
            protein_g = ?, carbs_g = ?, fat_g = ?, updated_at = ?, synced = 0
      WHERE id = ?`,
    [
      input.mealType,
      input.foodName,
      input.detail ?? null,
      input.calories,
      input.proteinG ?? 0,
      input.carbsG ?? 0,
      input.fatG ?? 0,
      new Date().toISOString(),
      id,
    ],
  );
}

export async function deleteFoodLog(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync(`DELETE FROM food_logs WHERE id = ?`, [id]);
}

/* --------------------------- Workout ----------------------------- */

/** Returns the active (unfinished) session id, creating one if none exists. */
export async function getOrCreateActiveSession(
  db: SQLiteDatabase,
  name = "Workout",
  muscleGroup = "",
): Promise<string> {
  const existing = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM workout_sessions
      WHERE user_id = ? AND finished_at IS NULL
      ORDER BY started_at DESC LIMIT 1`,
    [LOCAL_USER_ID],
  );
  if (existing) return existing.id;

  const now = new Date().toISOString();
  const id = generateId("sess");
  await db.runAsync(
    `INSERT INTO workout_sessions
       (id, user_id, name, muscle_group, started_at, finished_at, notes, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, 0)`,
    [id, LOCAL_USER_ID, name, muscleGroup, now, now],
  );
  return id;
}

interface SessionRow {
  id: string;
  name: string;
  muscle_group: string | null;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
}

/** Loads a session's exercises + sets into a full WorkoutSession. */
async function hydrateSession(
  db: SQLiteDatabase,
  session: SessionRow,
): Promise<WorkoutSession> {
  const exerciseRows = await db.getAllAsync<{
    id: string;
    name: string;
    muscle_group: string | null;
    order_index: number;
    started_at: string | null;
    ended_at: string | null;
  }>(
    `SELECT id, name, muscle_group, order_index, started_at, ended_at
       FROM workout_exercises WHERE session_id = ? ORDER BY order_index ASC`,
    [session.id],
  );

  const exercises: WorkoutExercise[] = [];
  for (const ex of exerciseRows) {
    const setRows = await db.getAllAsync<{
      id: string;
      set_number: number;
      weight_kg: number;
      reps: number;
      completed: number;
    }>(
      `SELECT id, set_number, weight_kg, reps, completed
         FROM exercise_sets WHERE exercise_id = ? ORDER BY set_number ASC`,
      [ex.id],
    );
    const durationSec =
      ex.started_at && ex.ended_at
        ? Math.max(
            0,
            Math.floor(
              (Date.parse(ex.ended_at) - Date.parse(ex.started_at)) / 1000,
            ),
          )
        : undefined;
    exercises.push({
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscle_group ?? "",
      orderIndex: ex.order_index,
      startedAt: ex.started_at ?? undefined,
      endedAt: ex.ended_at ?? undefined,
      durationSec,
      sets: setRows.map((s) => ({
        id: s.id,
        setNumber: s.set_number,
        weightKg: s.weight_kg,
        reps: s.reps,
        completed: s.completed === 1,
      })),
    });
  }

  return {
    id: session.id,
    name: session.name,
    muscleGroup: session.muscle_group ?? "",
    startedAt: session.started_at,
    finishedAt: session.finished_at ?? undefined,
    notes: session.notes ?? undefined,
    exercises,
  };
}

const SESSION_COLS =
  "id, name, muscle_group, started_at, finished_at, notes";

/** The most recent session (active or finished). */
export async function getCurrentWorkout(
  db: SQLiteDatabase,
): Promise<WorkoutSession | null> {
  const session = await db.getFirstAsync<SessionRow>(
    `SELECT ${SESSION_COLS} FROM workout_sessions
      WHERE user_id = ? ORDER BY started_at DESC LIMIT 1`,
    [LOCAL_USER_ID],
  );
  return session ? hydrateSession(db, session) : null;
}

export async function getWorkoutById(
  db: SQLiteDatabase,
  id: string,
): Promise<WorkoutSession | null> {
  const session = await db.getFirstAsync<SessionRow>(
    `SELECT ${SESSION_COLS} FROM workout_sessions WHERE id = ? LIMIT 1`,
    [id],
  );
  return session ? hydrateSession(db, session) : null;
}

/** Finished sessions, newest first, with aggregate stats for the history list. */
export async function getWorkoutHistory(
  db: SQLiteDatabase,
): Promise<WorkoutSummary[]> {
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    started_at: string;
    finished_at: string | null;
    exercise_count: number;
    set_count: number;
    completed_sets: number;
    volume: number;
  }>(
    `SELECT ws.id, ws.name, ws.started_at, ws.finished_at,
       (SELECT COUNT(*) FROM workout_exercises we WHERE we.session_id = ws.id) AS exercise_count,
       (SELECT COUNT(*) FROM exercise_sets es JOIN workout_exercises we ON we.id = es.exercise_id WHERE we.session_id = ws.id) AS set_count,
       (SELECT COUNT(*) FROM exercise_sets es JOIN workout_exercises we ON we.id = es.exercise_id WHERE we.session_id = ws.id AND es.completed = 1) AS completed_sets,
       (SELECT COALESCE(SUM(es.weight_kg * es.reps), 0) FROM exercise_sets es JOIN workout_exercises we ON we.id = es.exercise_id WHERE we.session_id = ws.id AND es.completed = 1) AS volume
     FROM workout_sessions ws
     WHERE ws.user_id = ? AND ws.finished_at IS NOT NULL
     ORDER BY ws.started_at DESC`,
    [LOCAL_USER_ID],
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    startedAt: r.started_at,
    finishedAt: r.finished_at ?? undefined,
    exerciseCount: r.exercise_count,
    setCount: r.set_count,
    completedSets: r.completed_sets,
    volumeKg: r.volume,
  }));
}

export async function toggleSet(
  db: SQLiteDatabase,
  setId: string,
): Promise<void> {
  await db.runAsync(
    `UPDATE exercise_sets
        SET completed = CASE completed WHEN 1 THEN 0 ELSE 1 END,
            updated_at = ?, synced = 0
      WHERE id = ?`,
    [new Date().toISOString(), setId],
  );
}

export interface NewExercise {
  name: string;
  muscleGroup?: string;
  /** Sets to create up front; defaults to one empty set. */
  sets?: Array<{ weightKg: number; reps: number }>;
}

export async function addExercise(
  db: SQLiteDatabase,
  sessionId: string,
  input: NewExercise,
): Promise<void> {
  const now = new Date().toISOString();
  // Passively close out the previous exercise so its duration is captured
  // when the user advances to the next one.
  await db.runAsync(
    `UPDATE workout_exercises SET ended_at = ?, updated_at = ?, synced = 0
      WHERE session_id = ? AND ended_at IS NULL`,
    [now, now, sessionId],
  );
  const count = await db.getFirstAsync<{ c: number }>(
    `SELECT COUNT(*) as c FROM workout_exercises WHERE session_id = ?`,
    [sessionId],
  );
  const orderIndex = count?.c ?? 0;
  const exId = generateId("ex");
  await db.runAsync(
    `INSERT INTO workout_exercises
       (id, session_id, name, muscle_group, order_index, started_at, ended_at, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?, 0)`,
    [exId, sessionId, input.name, input.muscleGroup ?? "", orderIndex, now, now],
  );

  const sets = input.sets?.length ? input.sets : [{ weightKg: 0, reps: 0 }];
  for (let i = 0; i < sets.length; i++) {
    await db.runAsync(
      `INSERT INTO exercise_sets
         (id, exercise_id, set_number, weight_kg, reps, completed, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, 0, ?, 0)`,
      [generateId("set"), exId, i + 1, sets[i].weightKg, sets[i].reps, now],
    );
  }
}

export async function deleteExercise(
  db: SQLiteDatabase,
  exerciseId: string,
): Promise<void> {
  await db.runAsync(`DELETE FROM exercise_sets WHERE exercise_id = ?`, [
    exerciseId,
  ]);
  await db.runAsync(`DELETE FROM workout_exercises WHERE id = ?`, [exerciseId]);
}

/** Appends an empty set (next set number) to an exercise. */
export async function addSet(
  db: SQLiteDatabase,
  exerciseId: string,
): Promise<void> {
  const now = new Date().toISOString();
  const max = await db.getFirstAsync<{ n: number | null }>(
    `SELECT MAX(set_number) as n FROM exercise_sets WHERE exercise_id = ?`,
    [exerciseId],
  );
  const setNumber = (max?.n ?? 0) + 1;
  // Prefill weight/reps from the previous set for convenience.
  const prev = await db.getFirstAsync<{ weight_kg: number; reps: number }>(
    `SELECT weight_kg, reps FROM exercise_sets
      WHERE exercise_id = ? ORDER BY set_number DESC LIMIT 1`,
    [exerciseId],
  );
  await db.runAsync(
    `INSERT INTO exercise_sets
       (id, exercise_id, set_number, weight_kg, reps, completed, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, 0, ?, 0)`,
    [
      generateId("set"),
      exerciseId,
      setNumber,
      prev?.weight_kg ?? 0,
      prev?.reps ?? 0,
      now,
    ],
  );
}

export async function updateSet(
  db: SQLiteDatabase,
  setId: string,
  fields: { weightKg: number; reps: number },
): Promise<void> {
  await db.runAsync(
    `UPDATE exercise_sets
        SET weight_kg = ?, reps = ?, updated_at = ?, synced = 0
      WHERE id = ?`,
    [fields.weightKg, fields.reps, new Date().toISOString(), setId],
  );
}

export async function deleteSet(
  db: SQLiteDatabase,
  setId: string,
): Promise<void> {
  await db.runAsync(`DELETE FROM exercise_sets WHERE id = ?`, [setId]);
}

export async function finishWorkout(
  db: SQLiteDatabase,
  sessionId: string,
): Promise<void> {
  const now = new Date().toISOString();
  // Close the final exercise so its duration is recorded too.
  await db.runAsync(
    `UPDATE workout_exercises SET ended_at = ?, updated_at = ?, synced = 0
      WHERE session_id = ? AND ended_at IS NULL`,
    [now, now, sessionId],
  );
  await db.runAsync(
    `UPDATE workout_sessions SET finished_at = ?, updated_at = ?, synced = 0 WHERE id = ?`,
    [now, now, sessionId],
  );
}

/* ----------------------------- Notes ----------------------------- */

interface NoteRow {
  id: string;
  user_id: string;
  content: string | null;
  energy_level: number | null;
  sleep_hours: number | null;
  noted_at: string;
}

function mapNote(r: NoteRow): DailyNote {
  return {
    id: r.id,
    userId: r.user_id,
    content: r.content ?? "",
    energyLevel: r.energy_level ?? undefined,
    sleepHours: r.sleep_hours ?? undefined,
    notedAt: r.noted_at,
  };
}

export async function getNotes(db: SQLiteDatabase): Promise<DailyNote[]> {
  const rows = await db.getAllAsync<NoteRow>(
    `SELECT * FROM daily_notes WHERE user_id = ? ORDER BY noted_at DESC`,
    [LOCAL_USER_ID],
  );
  return rows.map(mapNote);
}

export interface NewNote {
  content: string;
  energyLevel?: number;
  sleepHours?: number;
}

export async function addNote(
  db: SQLiteDatabase,
  input: NewNote,
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO daily_notes
       (id, user_id, content, energy_level, sleep_hours, noted_at, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      generateId("note"),
      LOCAL_USER_ID,
      input.content,
      input.energyLevel ?? null,
      input.sleepHours ?? null,
      now,
      now,
    ],
  );
}

export async function updateNote(
  db: SQLiteDatabase,
  id: string,
  input: NewNote,
): Promise<void> {
  await db.runAsync(
    `UPDATE daily_notes
        SET content = ?, energy_level = ?, sleep_hours = ?, updated_at = ?, synced = 0
      WHERE id = ?`,
    [
      input.content,
      input.energyLevel ?? null,
      input.sleepHours ?? null,
      new Date().toISOString(),
      id,
    ],
  );
}

export async function deleteNote(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync(`DELETE FROM daily_notes WHERE id = ?`, [id]);
}

/* ---------------------------- Progress --------------------------- */

export async function getWeights(db: SQLiteDatabase): Promise<BodyWeight[]> {
  const rows = await db.getAllAsync<{
    id: string;
    weight_kg: number;
    recorded_at: string;
  }>(
    `SELECT id, weight_kg, recorded_at FROM body_weights
      WHERE user_id = ? ORDER BY recorded_at ASC`,
    [LOCAL_USER_ID],
  );
  return rows.map((r) => ({
    id: r.id,
    weightKg: r.weight_kg,
    recordedAt: r.recorded_at,
  }));
}

export async function addWeight(
  db: SQLiteDatabase,
  weightKg: number,
  recordedAt: string = new Date().toISOString(),
): Promise<void> {
  await db.runAsync(
    `INSERT INTO body_weights
       (id, user_id, weight_kg, recorded_at, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [generateId("wt"), LOCAL_USER_ID, weightKg, recordedAt, recordedAt],
  );
}

export async function deleteWeight(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync(`DELETE FROM body_weights WHERE id = ?`, [id]);
}

/** Calories per day for the last `days` days (inclusive of today), zero-filled. */
export async function getCalorieHistory(
  db: SQLiteDatabase,
  days = 7,
): Promise<CaloriePoint[]> {
  const rows = await db.getAllAsync<{ d: string; c: number }>(
    `SELECT substr(logged_at, 1, 10) as d, SUM(calories) as c
       FROM food_logs WHERE user_id = ? GROUP BY d`,
    [LOCAL_USER_ID],
  );
  const byDate = new Map(rows.map((r) => [r.d, r.c]));

  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const points: CaloriePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = todayKey(new Date(now - i * dayMs));
    points.push({ date, calories: byDate.get(date) ?? 0 });
  }
  return points;
}

export async function getWeekSummary(
  db: SQLiteDatabase,
  calorieHistory: CaloriePoint[],
): Promise<WeekSummary> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const workoutRow = await db.getFirstAsync<{ c: number }>(
    `SELECT COUNT(*) as c FROM workout_sessions
      WHERE user_id = ? AND started_at >= ?`,
    [LOCAL_USER_ID, cutoff],
  );

  const volumeRow = await db.getFirstAsync<{ v: number }>(
    `SELECT COALESCE(SUM(es.weight_kg * es.reps), 0) as v
       FROM exercise_sets es
       JOIN workout_exercises we ON we.id = es.exercise_id
       JOIN workout_sessions ws ON ws.id = we.session_id
      WHERE ws.user_id = ? AND es.completed = 1 AND ws.started_at >= ?`,
    [LOCAL_USER_ID, cutoff],
  );

  const days = calorieHistory.length || 1;
  const avgCalories =
    calorieHistory.reduce((s, p) => s + p.calories, 0) / days;

  return {
    workouts: workoutRow?.c ?? 0,
    volumeKg: volumeRow?.v ?? 0,
    avgCalories,
  };
}
