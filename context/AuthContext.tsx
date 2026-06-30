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

import {
  getAuthState,
  signIn as signInRepo,
  signOut as signOutRepo,
  signUp as signUpRepo,
  type SignUpInput,
} from "@/lib/auth";
import type { Profile } from "@/types/user";

interface AuthContextValue {
  /** True once the initial auth state has loaded from SQLite. */
  isReady: boolean;
  profile: Profile | null;
  loggedIn: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  /** Resolves false on bad credentials. */
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const refresh = useCallback(async () => {
    const state = await getAuthState(db);
    setProfile(state.profile);
    setLoggedIn(state.loggedIn);
  }, [db]);

  useEffect(() => {
    refresh().finally(() => setIsReady(true));
  }, [refresh]);

  const signUp = useCallback(
    async (input: SignUpInput) => {
      await signUpRepo(db, input);
      await refresh();
    },
    [db, refresh],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const ok = await signInRepo(db, email, password);
      if (ok) await refresh();
      return ok;
    },
    [db, refresh],
  );

  const signOut = useCallback(async () => {
    await signOutRepo(db);
    await refresh();
  }, [db, refresh]);

  const value = useMemo(
    () => ({ isReady, profile, loggedIn, signUp, signIn, signOut }),
    [isReady, profile, loggedIn, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
