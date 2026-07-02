import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Header } from "@/components/layout/Header";
import { AISuggestionCard } from "@/components/ui/AISuggestionCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Gradient } from "@/components/ui/Gradient";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MealRow } from "@/components/ui/MealRow";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatTile } from "@/components/ui/StatTile";
import { colors, type AccentName } from "@/constants/colors";
import { shadows } from "@/constants/shadows";
import { useAuth } from "@/context/AuthContext";
import { useAISuggestion } from "@/hooks/useAISuggestion";
import { useCalories } from "@/hooks/useCalories";
import { useFoodLog } from "@/hooks/useFoodLog";
import {
  useHealthActivity,
  type HealthActivityStatus,
} from "@/hooks/useHealthActivity";
import type { HealthActivityData } from "@/lib/health";
import { mockAiSuggestions } from "@/lib/mockData";

function greetingForNow(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const subtleWhite = { color: "rgba(255,255,255,0.82)" };

interface HealthMetric {
  key: keyof HealthActivityData;
  label: string;
  icon: IconName;
  accent: AccentName;
  unit?: string;
}

const HEALTH_METRICS: HealthMetric[] = [
  { key: "steps", label: "Steps Today", icon: "steps", accent: "amber" },
  {
    key: "distanceKm",
    label: "Distance",
    icon: "steps",
    accent: "blue",
    unit: "km",
  },
  {
    key: "activeCalories",
    label: "Active Calories",
    icon: "flame",
    accent: "coral",
    unit: "kcal",
  },
  {
    key: "activeMinutes",
    label: "Active Minutes",
    icon: "active",
    accent: "green",
    unit: "min",
  },
];

function formatHealthValue(metric: HealthMetric, data: HealthActivityData) {
  const value = data[metric.key];
  if (value === null) return "Not supported";
  if (metric.key === "distanceKm") return value.toFixed(value >= 10 ? 0 : 1);
  return Math.round(value).toLocaleString();
}

function HealthMetricCard({
  metric,
  data,
  status,
}: {
  metric: HealthMetric;
  data: HealthActivityData | null;
  status: HealthActivityStatus;
}) {
  const accent = colors.accent[metric.accent];
  const isLoading = status === "loading";
  const isInactive =
    status === "permissionRequired" ||
    status === "unavailable" ||
    status === "dismissed" ||
    status === "notSupported";
  const value = data ? formatHealthValue(metric, data) : null;
  const unsupportedMetric = value === "Not supported";

  return (
    <View
      style={shadows.card}
      className="min-h-[118px] flex-1 rounded-card bg-surface p-3.5"
    >
      <View className="flex-row items-center">
        <View
          style={{ backgroundColor: accent.bg }}
          className="h-8 w-8 items-center justify-center rounded-[10px]"
        >
          <Icon name={metric.icon} size={17} color={accent.icon} />
        </View>
        <Text className="ml-2 flex-1 text-sm text-muted" numberOfLines={1}>
          {metric.label}
        </Text>
      </View>

      <View className="mt-3 min-h-[34px] justify-center">
        {isLoading ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color={colors.primary} />
            <Text className="ml-2 text-sm text-muted">Loading...</Text>
          </View>
        ) : isInactive ? (
          <Text className="text-sm text-muted">
            {status === "unavailable"
              ? "Install Health Connect"
              : status === "notSupported"
              ? "Not supported"
              : "Health access required"}
          </Text>
        ) : status === "error" ? (
          <Text className="text-sm text-muted">Unable to load</Text>
        ) : (
          <View className="flex-row items-baseline">
            <Text
              className={
                unsupportedMetric
                  ? "text-sm font-medium text-muted"
                  : "text-2xl font-medium text-ink"
              }
            >
              {value ?? "0"}
            </Text>
            {metric.unit && !unsupportedMetric ? (
              <Text className="ml-1 text-sm text-faint">{metric.unit}</Text>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

function HealthStatusCard({
  status,
  retrying,
  onGrant,
  onDismiss,
  onInstall,
  onRetry,
}: {
  status: HealthActivityStatus;
  retrying: boolean;
  onGrant: () => void;
  onDismiss: () => void;
  onInstall: () => void;
  onRetry: () => void;
}) {
  if (status === "success" || status === "loading") return null;

  const copy = {
    permissionRequired: {
      title: "Health Access Needed",
      message: "Allow access to display your daily activity.",
      primary: "Grant Permission",
      action: onGrant,
    },
    unavailable: {
      title: "Health Connect Required",
      message: "Install Health Connect to automatically sync your activity.",
      primary: "Install Health Connect",
      action: onInstall,
    },
    error: {
      title: "Unable to load today's activity.",
      message: "Health data is local and optional. Your workout logging is still available.",
      primary: "Retry",
      action: onRetry,
    },
    dismissed: {
      title: "Health Sync Inactive",
      message: "Daily activity widgets will stay quiet until you choose to sync.",
      primary: "Sync Health Data",
      action: onRetry,
    },
    notSupported: {
      title: "Health Data Not Supported",
      message: "This device cannot provide activity data to FitNotes yet.",
      primary: "",
      action: onRetry,
    },
  }[status];

  return (
    <Card className="mb-3">
      <View className="flex-row">
        <View className="h-10 w-10 items-center justify-center rounded-[12px] bg-ai-bg">
          <Icon name="steps" size={20} color={colors.primary} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-medium text-ink">{copy.title}</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">
            {copy.message}
          </Text>
          <View className="mt-3 flex-row flex-wrap items-center gap-2">
            {copy.primary ? (
              <Button
                label={copy.primary}
                variant="outline"
                loading={status === "error" && retrying}
                onPress={copy.action}
              />
            ) : null}
            {status !== "notSupported" && status !== "error" ? (
              <Button label="Not Now" variant="text" onPress={onDismiss} />
            ) : null}
          </View>
        </View>
      </View>
    </Card>
  );
}

function HealthActivityDashboard({
  health,
}: {
  health: ReturnType<typeof useHealthActivity>;
}) {
  const shouldShowMetrics =
    health.status !== "dismissed" &&
    health.status !== "unavailable" &&
    health.status !== "notSupported";

  return (
    <View className="mt-6">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-medium text-ink">Activity today</Text>
        {health.status === "success" ? (
          <Button label="Refresh" variant="text" onPress={health.refresh} />
        ) : null}
      </View>

      <HealthStatusCard
        status={health.status}
        retrying={health.retrying}
        onGrant={health.requestAccess}
        onDismiss={health.dismiss}
        onInstall={health.installHealthConnect}
        onRetry={health.refresh}
      />

      {shouldShowMetrics ? (
        <>
          <View className="flex-row gap-3">
            {HEALTH_METRICS.slice(0, 2).map((metric) => (
              <HealthMetricCard
                key={metric.key}
                metric={metric}
                data={health.data}
                status={health.status}
              />
            ))}
          </View>
          <View className="mt-3 flex-row gap-3">
            {HEALTH_METRICS.slice(2).map((metric) => (
              <HealthMetricCard
                key={metric.key}
                metric={metric}
                data={health.data}
                status={health.status}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const { summary, reload: reloadCalories } = useCalories();
  const { meals, reload: reloadMeals } = useFoodLog();
  const health = useHealthActivity();
  const [refreshing, setRefreshing] = useState(false);

  const firstName = profile?.name.split(/\s+/)[0] ?? "there";

  const { tip: aiTip } = useAISuggestion(
    {
      context: "home",
      goals: { calorieGoal: summary.goal, proteinGoalG: summary.proteinGoalG },
      totals: { calories: summary.consumed, proteinG: summary.proteinG },
      meals: meals.map((m) => ({ name: m.foodName, calories: m.calories })),
    },
    mockAiSuggestions.home,
    `home:${Math.round(summary.consumed)}:${Math.round(summary.proteinG)}:${meals.length}`,
  );

  const refreshHome = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([reloadCalories(), reloadMeals(), health.refresh()]);
    } finally {
      setRefreshing(false);
    }
  }, [health, reloadCalories, reloadMeals]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshHome} />
      }
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Header
        greeting={greetingForNow()}
        name={firstName}
        initials={profile?.initials ?? "?"}
        onAvatarPress={() => router.navigate("/profile")}
      />

      {/* Calorie hero */}
      <View className="mt-5">
        <Gradient radius={20} style={shadows.hero}>
          <View className="flex-row items-center justify-between p-5">
            <View>
              <Text style={subtleWhite} className="text-sm">
                Calories today
              </Text>
              <View className="mt-1 flex-row items-baseline">
                <Text className="text-[34px] font-medium text-white">
                  {Math.round(summary.consumed).toLocaleString()}
                </Text>
                <Text style={subtleWhite} className="ml-1.5 text-sm">
                  / {summary.goal.toLocaleString()}
                </Text>
              </View>
              <View
                style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
                className="mt-3 flex-row items-center self-start rounded-pill px-3 py-1.5"
              >
                <Icon name="flame" size={14} color="#FFFFFF" />
                <Text className="ml-1.5 text-xs text-white">
                  {Math.round(summary.remaining).toLocaleString()} kcal left
                </Text>
              </View>
            </View>
            <ProgressRing progress={summary.progress} size={92}>
              <Text className="text-lg font-medium text-white">
                {Math.round(summary.progress * 100)}%
              </Text>
            </ProgressRing>
          </View>
        </Gradient>
      </View>

      {/* Stat tiles */}
      <View className="mt-3 flex-row gap-3">
        <StatTile accent="coral" icon="protein" label="Protein" value={`${Math.round(summary.proteinG)}`} unit="g" />
        <StatTile accent="blue" icon="water" label="Water" value={`${summary.waterL}`} unit="L" />
      </View>

      <HealthActivityDashboard health={health} />

      {/* Today's meals */}
      <View className="mt-6">
        <Text className="mb-2 text-lg font-medium text-ink">Today's meals</Text>
        <Card>
          {meals.length === 0 ? (
            <Text className="py-3 text-sm text-muted">
              No meals logged yet. Tap the + button to add one.
            </Text>
          ) : (
            meals.map((meal, i) => (
              <View
                key={meal.id}
                className={i > 0 ? "border-t border-border" : undefined}
              >
                <MealRow meal={meal} />
              </View>
            ))
          )}
        </Card>
      </View>

      {/* AI suggestion */}
      <View className="mt-5">
        <AISuggestionCard tip={aiTip} />
      </View>
    </ScrollView>
  );
}
