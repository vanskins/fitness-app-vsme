import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Header } from "@/components/layout/Header";
import { AISuggestionCard } from "@/components/ui/AISuggestionCard";
import { Card } from "@/components/ui/Card";
import { MealRow } from "@/components/ui/MealRow";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatGrid, type Stat } from "@/components/ui/StatGrid";
import { useAuth } from "@/context/AuthContext";
import { useAISuggestion } from "@/hooks/useAISuggestion";
import { useCalories } from "@/hooks/useCalories";
import { useFoodLog } from "@/hooks/useFoodLog";
import { mockAiSuggestions } from "@/lib/mockData";

function greetingForNow(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const { summary } = useCalories();
  const { meals } = useFoodLog();

  const firstName = profile?.name.split(/\s+/)[0] ?? "there";

  const stats: Stat[] = [
    { label: "Protein", value: `${Math.round(summary.proteinG)}`, unit: "g" },
    { label: "Water", value: `${summary.waterL}`, unit: "L" },
    { label: "Steps", value: summary.steps.toLocaleString() },
    { label: "Active", value: `${summary.activeMinutes}`, unit: "min" },
  ];

  // AI tip from the Edge Function; falls back to static copy until it responds.
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

  return (
    <ScrollView
      className="flex-1 bg-background"
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

      {/* Calorie progress card */}
      <View className="mt-5">
        <Card>
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-sm text-muted">Calories today</Text>
              <View className="mt-1 flex-row items-baseline">
                <Text className="text-3xl font-medium text-ink">
                  {Math.round(summary.consumed).toLocaleString()}
                </Text>
                <Text className="ml-1 text-base text-muted">
                  / {summary.goal.toLocaleString()} kcal
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-medium text-primary">
                {Math.round(summary.remaining).toLocaleString()}
              </Text>
              <Text className="text-sm text-muted">remaining</Text>
            </View>
          </View>
          <View className="mt-4">
            <ProgressBar progress={summary.progress} />
          </View>
        </Card>
      </View>

      {/* 2×2 stat grid */}
      <View className="mt-3">
        <StatGrid stats={stats} />
      </View>

      {/* Today's meals */}
      <View className="mt-5">
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
