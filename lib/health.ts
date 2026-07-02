import { Linking, NativeModules, Platform } from "react-native";

export type HealthMetricKey =
  | "steps"
  | "distanceKm"
  | "activeCalories"
  | "activeMinutes";

export interface HealthActivityData {
  steps: number;
  distanceKm: number;
  activeCalories: number;
  activeMinutes: number | null;
}

export type HealthAvailability =
  | { status: "available"; provider: "appleHealth" | "healthConnect" }
  | { status: "unavailable"; provider: "healthConnect"; reason: "missing" }
  | { status: "notSupported"; reason: "platform" | "nativeModuleMissing" };

export type HealthPermissionStatus = "granted" | "denied" | "undetermined";

interface NativeHealthModule {
  isAvailable?: () => Promise<boolean>;
  getPermissionStatus?: () => Promise<HealthPermissionStatus>;
  requestPermissions?: () => Promise<HealthPermissionStatus>;
  readDailyActivity?: (date: string) => Promise<Partial<HealthActivityData>>;
}

const healthModule = NativeModules.FitNotesHealth as NativeHealthModule | undefined;

/**
 * Standalone health boundary. The app currently ships without a native
 * HealthKit/Health Connect bridge, so this module degrades to unsupported
 * states until a bridge exposes the small FitNotesHealth surface above.
 */
export async function getHealthAvailability(): Promise<HealthAvailability> {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return { status: "notSupported", reason: "platform" };
  }

  if (!healthModule?.isAvailable) {
    if (Platform.OS === "android") {
      return {
        status: "unavailable",
        provider: "healthConnect",
        reason: "missing",
      };
    }
    return { status: "notSupported", reason: "nativeModuleMissing" };
  }

  const available = await healthModule.isAvailable();
  if (available) {
    return {
      status: "available",
      provider: Platform.OS === "ios" ? "appleHealth" : "healthConnect",
    };
  }

  if (Platform.OS === "android") {
    return {
      status: "unavailable",
      provider: "healthConnect",
      reason: "missing",
    };
  }

  return { status: "notSupported", reason: "nativeModuleMissing" };
}

export async function getHealthPermissionStatus(): Promise<HealthPermissionStatus> {
  return healthModule?.getPermissionStatus?.() ?? "denied";
}

export async function requestHealthPermissions(): Promise<HealthPermissionStatus> {
  return healthModule?.requestPermissions?.() ?? "denied";
}

export async function readTodayHealthActivity(): Promise<HealthActivityData> {
  const date = new Date().toISOString().slice(0, 10);
  const data = await healthModule?.readDailyActivity?.(date);

  return {
    steps: Math.max(0, Math.round(data?.steps ?? 0)),
    distanceKm: Math.max(0, data?.distanceKm ?? 0),
    activeCalories: Math.max(0, Math.round(data?.activeCalories ?? 0)),
    activeMinutes:
      data?.activeMinutes === null || data?.activeMinutes === undefined
        ? null
        : Math.max(0, Math.round(data.activeMinutes)),
  };
}

export async function openHealthConnectInstall(): Promise<void> {
  const packageName = "com.google.android.apps.healthdata";
  const urls = [
    `market://details?id=${packageName}`,
    `https://play.google.com/store/apps/details?id=${packageName}`,
  ];

  for (const url of urls) {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return;
    }
  }
}
