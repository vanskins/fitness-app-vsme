import { useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WeightForm } from "@/components/forms/WeightForm";
import { BarChart } from "@/components/ui/BarChart";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LineChart } from "@/components/ui/LineChart";
import { colors } from "@/constants/colors";
import { useCalories } from "@/hooks/useCalories";
import { useProgress } from "@/hooks/useProgress";

const SCREEN_W = Dimensions.get("window").width;
// screen padding (16*2) + card padding (16*2)
const CHART_W = SCREEN_W - 64;

const WEEKDAY = ["S", "M", "T", "W", "T", "F", "S"];

function weekdayLabel(dateKey: string): string {
  // dateKey is YYYY-MM-DD (local). Parse parts to avoid TZ shifts.
  const [y, m, d] = dateKey.split("-").map(Number);
  return WEEKDAY[new Date(y, m - 1, d).getDay()];
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { weights, calories, workouts, summary, addWeight } = useProgress();
  const { summary: calorieSummary } = useCalories();
  const [weightFormOpen, setWeightFormOpen] = useState(false);

  const latest = weights.length ? weights[weights.length - 1].weightKg : null;
  const first = weights.length ? weights[0].weightKg : null;
  const delta = latest != null && first != null ? latest - first : 0;

  const barData = calories.map((p) => ({
    label: weekdayLabel(p.date),
    value: p.calories,
  }));
  const workoutBarData = workouts.map((p) => ({
    label: weekdayLabel(p.date),
    value: p.volumeKg,
  }));
  const workoutTotal = workouts.reduce((sum, p) => sum + p.workouts, 0);
  const completedSetTotal = workouts.reduce((sum, p) => sum + p.completedSets, 0);
  const workoutVolumeTotal = workouts.reduce((sum, p) => sum + p.volumeKg, 0);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-medium text-ink">Progress</Text>

        {/* This week summary */}
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <Card>
              <Text className="text-sm text-muted">Workouts</Text>
              <Text className="mt-1 text-xl font-medium text-ink">
                {summary.workouts}
              </Text>
              <Text className="text-xs text-muted">this week</Text>
            </Card>
          </View>
          <View className="flex-1">
            <Card>
              <Text className="text-sm text-muted">Volume</Text>
              <Text className="mt-1 text-xl font-medium text-ink">
                {Math.round(summary.volumeKg).toLocaleString()}
              </Text>
              <Text className="text-xs text-muted">kg lifted</Text>
            </Card>
          </View>
          <View className="flex-1">
            <Card>
              <Text className="text-sm text-muted">Avg kcal</Text>
              <Text className="mt-1 text-xl font-medium text-ink">
                {Math.round(summary.avgCalories).toLocaleString()}
              </Text>
              <Text className="text-xs text-muted">per day</Text>
            </Card>
          </View>
        </View>

        {/* Workout progress */}
        <Text className="mb-2 mt-6 text-lg font-medium text-ink">
          Workout progress
        </Text>
        <Card>
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-sm text-muted">Last 7 days</Text>
              <View className="mt-1 flex-row items-baseline">
                <Text className="text-2xl font-medium text-ink">
                  {Math.round(workoutVolumeTotal).toLocaleString()}
                </Text>
                <Text className="ml-1 text-sm text-muted">kg</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-sm font-medium text-ink">
                {workoutTotal} {workoutTotal === 1 ? "workout" : "workouts"}
              </Text>
              <Text className="text-xs text-muted">
                {completedSetTotal} completed sets
              </Text>
            </View>
          </View>
          {workoutBarData.some((d) => d.value > 0) ? (
            <View className="mt-2">
              <BarChart
                data={workoutBarData}
                width={CHART_W}
                color={colors.accent.blue.icon}
              />
            </View>
          ) : (
            <Text className="py-6 text-center text-sm text-muted">
              No finished workouts in the last 7 days. Complete a workout to
              see your training volume.
            </Text>
          )}
        </Card>

        {/* Weight trend */}
        <Text className="mb-2 mt-6 text-lg font-medium text-ink">
          Weight trend
        </Text>
        <Card>
          {latest != null ? (
            <View className="flex-row items-baseline justify-between">
              <View className="flex-row items-baseline">
                <Text className="text-2xl font-medium text-ink">
                  {latest.toFixed(1)}
                </Text>
                <Text className="ml-1 text-sm text-muted">kg</Text>
              </View>
              <Text
                className={
                  delta <= 0
                    ? "text-sm font-medium text-primary"
                    : "text-sm font-medium text-amber"
                }
              >
                {delta > 0 ? "+" : ""}
                {delta.toFixed(1)} kg
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-muted">No weight logged yet.</Text>
          )}
          {weights.length > 0 ? (
            <View className="mt-2">
              <LineChart data={weights.map((w) => w.weightKg)} width={CHART_W} />
            </View>
          ) : null}
          <View className="mt-3">
            <Button
              label="Log weight"
              icon="add"
              fullWidth
              onPress={() => setWeightFormOpen(true)}
            />
          </View>
        </Card>

        {/* Calorie history */}
        <Text className="mb-2 mt-6 text-lg font-medium text-ink">
          Calorie history
        </Text>
        <Card>
          <Text className="text-sm text-muted">Last 7 days</Text>
          {barData.some((d) => d.value > 0) ? (
            <View className="mt-2">
              <BarChart
                data={barData}
                width={CHART_W}
                goal={calorieSummary.goal}
              />
            </View>
          ) : (
            <Text className="py-6 text-center text-sm text-muted">
              No meals logged in the last 7 days. Log meals to see your trend.
            </Text>
          )}
        </Card>
      </ScrollView>

      <WeightForm
        visible={weightFormOpen}
        onClose={() => setWeightFormOpen(false)}
        onSubmit={addWeight}
        defaultValue={latest ?? undefined}
      />
    </View>
  );
}
