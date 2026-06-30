import type { Session } from "@supabase/supabase-js";
import { useSQLiteContext } from "expo-sqlite";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { initials } from "@/lib/auth";
import { emitDataReset } from "@/lib/dataEvents";
import { generateId, LOCAL_USER_ID } from "@/lib/id";
import { prepareLocalCacheForUser } from "@/lib/localData";
import { supabase } from "@/lib/supabase";
import { syncAll } from "@/lib/sync";
import type { Profile } from "@/types/user";

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  calorieGoal?: number;
}

interface AuthContextValue {
  isReady: boolean;
  profile: Profile | null;
  loggedIn: boolean;
  /** When needsConfirmation is true, the user must confirm via email before logging in. */
  signUp: (input: SignUpInput) => Promise<{ needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function profileFromSession(session: Session | null): Profile | null {
  const user = session?.user;
  if (!user) return null;
  const name =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "";
  return {
    id: user.id,
    email: user.email ?? "",
    name,
    initials: initials(name || user.email || "?"),
    onboarded: true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Load the persisted session and subscribe to auth changes.
  useEffect(() => {
    if (!supabase) {
      setIsReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // On login: make sure the local cache belongs to this user (wipe it if a
  // different account previously used this device), then sync local ⇄ cloud.
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) return;
    (async () => {
      await prepareLocalCacheForUser(db, uid);
      emitDataReset(); // reflect the wipe in any mounted screens immediately
      await syncAll(db, uid);
      emitDataReset(); // reflect pulled cloud rows
    })().catch((e) => console.warn("[sync] failed:", e?.message ?? e));
  }, [db, session?.user?.id]);

  const signUp = useCallback(
    async (input: SignUpInput) => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        options: { data: { name: input.name.trim() } },
      });
      if (error) throw error;

      // Brand-new account: ensure the local cache is theirs (clears any prior
      // account's data on this device) before we write anything.
      const newUid = data.session?.user?.id;
      if (newUid) await prepareLocalCacheForUser(db, newUid);

      // Apply the chosen calorie goal locally; it syncs once a session exists.
      if (input.calorieGoal && input.calorieGoal > 0) {
        const now = new Date().toISOString();
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
            [generateId("goal"), LOCAL_USER_ID, input.calorieGoal, now],
          );
        }
      }
      // No session means email confirmation is required.
      return { needsConfirmation: !data.session };
    },
    [db],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return !error;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      profile: profileFromSession(session),
      loggedIn: !!session,
      signUp,
      signIn,
      signOut,
    }),
    [isReady, session, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
