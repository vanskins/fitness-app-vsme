import type { SQLiteDatabase } from "expo-sqlite";

import { LOCAL_USER_ID } from "@/lib/id";
import type { Profile } from "@/types/user";

/**
 * Local, on-device "auth". Single profile keyed to LOCAL_USER_ID so it lines
 * up with the rest of the seeded data. Passwords are stored as-is for this
 * offline placeholder — Supabase Auth (hashing, tokens) replaces this later.
 */

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  initials: string;
  onboarded: number;
  logged_in: number;
}

function mapProfile(r: ProfileRow): Profile {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    initials: r.initials,
    onboarded: r.onboarded === 1,
  };
}

export interface AuthState {
  profile: Profile | null;
  loggedIn: boolean;
}

export async function getAuthState(db: SQLiteDatabase): Promise<AuthState> {
  const row = await db.getFirstAsync<ProfileRow>(
    `SELECT id, name, email, initials, onboarded, logged_in
       FROM profile WHERE id = ? LIMIT 1`,
    [LOCAL_USER_ID],
  );
  return {
    profile: row ? mapProfile(row) : null,
    loggedIn: row?.logged_in === 1,
  };
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  /** Optional daily calorie goal to apply to user_goals. */
  calorieGoal?: number;
}

export async function signUp(
  db: SQLiteDatabase,
  input: SignUpInput,
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO profile (id, name, email, initials, password, onboarded, logged_in, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name, email = excluded.email, initials = excluded.initials,
       password = excluded.password, onboarded = 1, logged_in = 1, updated_at = excluded.updated_at`,
    [
      LOCAL_USER_ID,
      input.name.trim(),
      input.email.trim().toLowerCase(),
      initials(input.name),
      input.password,
      now,
      now,
    ],
  );

  if (input.calorieGoal && input.calorieGoal > 0) {
    // Upsert the calorie goal into user_goals (seeded row may already exist).
    const existing = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM user_goals WHERE user_id = ? LIMIT 1`,
      [LOCAL_USER_ID],
    );
    if (existing) {
      await db.runAsync(
        `UPDATE user_goals SET calorie_goal = ?, updated_at = ?, synced = 0 WHERE id = ?`,
        [input.calorieGoal, now, existing.id],
      );
    } else {
      await db.runAsync(
        `INSERT INTO user_goals (id, user_id, calorie_goal, protein_goal_g, water_goal_l, updated_at, synced)
         VALUES (?, ?, ?, 140, 3, ?, 0)`,
        [`goal_${now}`, LOCAL_USER_ID, input.calorieGoal, now],
      );
    }
  }
}

/** Returns true on success. */
export async function signIn(
  db: SQLiteDatabase,
  email: string,
  password: string,
): Promise<boolean> {
  const row = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM profile WHERE id = ? AND email = ? AND password = ? LIMIT 1`,
    [LOCAL_USER_ID, email.trim().toLowerCase(), password],
  );
  if (!row) return false;
  await db.runAsync(
    `UPDATE profile SET logged_in = 1, updated_at = ? WHERE id = ?`,
    [new Date().toISOString(), LOCAL_USER_ID],
  );
  return true;
}

export async function signOut(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(
    `UPDATE profile SET logged_in = 0, updated_at = ? WHERE id = ?`,
    [new Date().toISOString(), LOCAL_USER_ID],
  );
}
