import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Header } from "@/components/layout/Header";
import { AISuggestionCard } from "@/components/ui/AISuggestionCard";
import { Card } from "@/components/ui/Card";
import { Gradient } from "@/components/ui/Gradient";
import { Icon } from "@/components/ui/Icon";
import { MealRow } from "@/components/ui/MealRow";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatTile } from "@/components/ui/StatTile";
import { shadows } from "@/constants/shadows";
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

const subtleWhite = { color: "rgba(255,255,255,0.82)" };

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const { summary } = useCalories();
  const { meals } = useFoodLog();

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
      <View className="mt-3 flex-row gap-3">
        <StatTile accent="amber" icon="steps" label="Steps" value={summary.steps.toLocaleString()} />
        <StatTile accent="green" icon="active" label="Active" value={`${summary.activeMinutes}`} unit="min" />
      </View>

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
