import "react-native-url-polyfill/auto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
// AsyncStorage-compatible KV backed by SQLite — persists the auth session
// without adding @react-native-async-storage (no extra native module).
import AsyncStorage from "expo-sqlite/kv-store";

/**
 * Supabase client. Reads credentials from EXPO_PUBLIC_ env vars (Expo inlines
 * any var prefixed with EXPO_PUBLIC_ at build time; put them in `.env`).
 *
 * The app is local-first: if Supabase isn't configured, `supabase` is null and
 * everything keeps working on-device. The sync layer no-ops until configured.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  url.startsWith("http") &&
  !url.includes("YOUR-PROJECT") &&
  anonKey.length > 20;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
