import "../global.css";

import { Stack, useRouter, useSegments } from "expo-router";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DB_NAME, migrateDbIfNeeded } from "@/lib/db";
import { seedIfEmpty, seedWeightsIfEmpty } from "@/lib/seed";
import { isSupabaseConfigured } from "@/lib/supabase";

async function initDb(db: SQLiteDatabase) {
  await migrateDbIfNeeded(db);
  // Demo seed data is for local-only/dev mode. With Supabase auth on, each
  // account's data comes from the cloud — seeding would leak across accounts.
  if (!isSupabaseConfigured) {
    await seedIfEmpty(db);
    await seedWeightsIfEmpty(db);
  }
}

/** Redirects between the auth flow and the main app based on session. */
function useProtectedRoute(
  isReady: boolean,
  loggedIn: boolean,
  hasProfile: boolean,
) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!loggedIn && !inAuthGroup) {
      router.replace(hasProfile ? "/(auth)/login" : "/(auth)/onboarding");
    } else if (loggedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isReady, loggedIn, hasProfile, segments, router]);
}

function RootNavigator() {
  const { isReady, loggedIn, profile } = useAuth();
  useProtectedRoute(isReady, loggedIn, profile !== null);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      {!isReady ? (
        <View className="absolute inset-0 items-center justify-center bg-background">
          <ActivityIndicator color="#1D9E75" />
        </View>
      ) : null}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SQLiteProvider databaseName={DB_NAME} onInit={initDb}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
