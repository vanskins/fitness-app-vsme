import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { formatDuration } from "@/lib/workoutSummary";
import type { WorkoutSummary } from "@/types/workout";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  );
}

function durationOf(s: WorkoutSummary): string | null {
  if (!s.finishedAt) return null;
  return formatDuration(
    Math.max(0, Math.floor((Date.parse(s.finishedAt) - Date.parse(s.startedAt)) / 1000)),
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessions } = useWorkoutHistory();

  return (
    <View className="flex-1 bg-background">
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="flex-row items-center px-4 pb-2"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={8}
          className="mr-1 h-9 w-9 items-center justify-center active:opacity-60"
        >
          <Icon name="back" size={24} color={colors.ink} />
        </Pressable>
        <Text className="text-2xl font-medium text-ink">Workout history</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {sessions.length === 0 ? (
          <Card>
            <Text className="py-3 text-sm text-muted">
              No finished workouts yet. Complete a workout and it'll show up here.
            </Text>
          </Card>
        ) : (
          <View className="gap-2">
            {sessions.map((s) => {
              const dur = durationOf(s);
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push({ pathname: "/workout/[id]", params: { id: s.id } })
                  }
                  className="active:opacity-70"
                >
                  <Card>
                    <View className="flex-row items-center">
                      <View
                        style={{ backgroundColor: colors.accent.green.bg }}
                        className="h-11 w-11 items-center justify-center rounded-[14px]"
                      >
                        <Icon name="workout" size={20} color={colors.accent.green.icon} />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-base font-medium text-ink">
                          {s.name}
                        </Text>
                        <Text className="text-xs text-faint">
                          {formatDate(s.startedAt)}
                          {dur ? ` · ${dur}` : ""}
                        </Text>
                        <Text className="mt-0.5 text-xs text-muted">
                          {s.exerciseCount} ex · {s.completedSets} sets ·{" "}
                          {Math.round(s.volumeKg).toLocaleString()} kg
                        </Text>
                      </View>
                      <Icon name="chevron" size={18} color={colors.faint} />
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
