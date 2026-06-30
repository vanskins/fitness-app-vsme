import type { SQLiteDatabase } from "expo-sqlite";

import { todayKey } from "@/lib/db";
import { generateId, LOCAL_USER_ID } from "@/lib/id";

/**
 * Seeds ~8 days of body-weight history so the Progress trend chart has data.
 * No-op once any weight exists. Runs separately from seedIfEmpty so existing
 * installs (migrated to v2) also get sample data.
 */
export async function seedWeightsIfEmpty(db: SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) as c FROM body_weights",
  );
  if ((existing?.c ?? 0) > 0) return;

  // Gentle downward trend, oldest first.
  const samples = [82.4, 82.1, 82.3, 81.9, 81.7, 81.8, 81.5, 81.3];
  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  for (let i = 0; i < samples.length; i++) {
    const daysAgo = samples.length - 1 - i;
    const at = new Date(now - daysAgo * dayMs).toISOString();
    await db.runAsync(
      `INSERT INTO body_weights
         (id, user_id, weight_kg, recorded_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [generateId("wt"), LOCAL_USER_ID, samples[i], at, at],
    );
  }
}

/**
 * Seeds first-run data so the app isn't empty on launch. No-op if goals
 * already exist. Mirrors the previous mock values, now persisted in SQLite.
 */
export async function seedIfEmpty(db: SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) as c FROM user_goals",
  );
  if ((existing?.c ?? 0) > 0) return;

  const now = new Date().toISOString();
  const today = todayKey();

  // Goals
  await db.runAsync(
    `INSERT INTO user_goals
       (id, user_id, calorie_goal, protein_goal_g, water_goal_l, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [generateId("goal"), LOCAL_USER_ID, 2200, 140, 3, now],
  );

  // Today's non-food stats
  await db.runAsync(
    `INSERT INTO daily_stats
       (id, user_id, date, water_l, steps, active_minutes, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [generateId("stat"), LOCAL_USER_ID, today, 1.8, 7320, 42, now],
  );

  // Today's meals
  const meals = [
    ["breakfast", "Oats & berries", "Rolled oats, blueberries, almond milk", 380, 14, 58, 9],
    ["lunch", "Grilled chicken bowl", "Chicken, brown rice, veggies", 620, 48, 62, 16],
    ["snack", "Greek yogurt", "Plain, with honey", 180, 18, 20, 4],
  ] as const;
  for (const [mealType, name, detail, cal, p, c, f] of meals) {
    await db.runAsync(
      `INSERT INTO food_logs
         (id, user_id, meal_type, food_name, detail, calories, protein_g, carbs_g, fat_g, logged_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [generateId("food"), LOCAL_USER_ID, mealType, name, detail, cal, p, c, f, now, now],
    );
  }

  // In-progress workout
  const sessionId = generateId("sess");
  await db.runAsync(
    `INSERT INTO workout_sessions
       (id, user_id, name, muscle_group, started_at, finished_at, notes, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, 0)`,
    [sessionId, LOCAL_USER_ID, "Push Day", "Chest · Shoulders · Triceps", now, now],
  );

  const exercises: Array<{
    name: string;
    muscle: string;
    sets: Array<[number, number, number, number]>; // setNumber, weight, reps, completed
  }> = [
    {
      name: "Bench Press",
      muscle: "Chest",
      sets: [
        [1, 60, 10, 1],
        [2, 70, 8, 1],
        [3, 70, 8, 1],
      ],
    },
    {
      name: "Overhead Press",
      muscle: "Shoulders",
      sets: [
        [1, 40, 10, 1],
        [2, 45, 8, 0],
        [3, 45, 8, 0],
      ],
    },
    {
      name: "Triceps Pushdown",
      muscle: "Triceps",
      sets: [
        [1, 25, 12, 0],
        [2, 25, 12, 0],
      ],
    },
  ];

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const exId = generateId("ex");
    await db.runAsync(
      `INSERT INTO workout_exercises
         (id, session_id, name, muscle_group, order_index, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [exId, sessionId, ex.name, ex.muscle, i, now],
    );
    for (const [setNumber, weight, reps, completed] of ex.sets) {
      await db.runAsync(
        `INSERT INTO exercise_sets
           (id, exercise_id, set_number, weight_kg, reps, completed, updated_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [generateId("set"), exId, setNumber, weight, reps, completed, now],
      );
    }
  }
}
