import { Text, View } from "react-native";

import type { FoodLog, MealType } from "@/types/food";

const MEAL_ICON: Record<MealType, string> = {
  breakfast: "🍳",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍎",
};

const MEAL_LABEL: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

interface MealRowProps {
  meal: FoodLog;
}

export function MealRow({ meal }: MealRowProps) {
  return (
    <View className="flex-row items-center py-3">
      <View className="h-11 w-11 items-center justify-center rounded-pill bg-background">
        <Text className="text-lg">{MEAL_ICON[meal.mealType]}</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-xs text-muted">{MEAL_LABEL[meal.mealType]}</Text>
        <Text className="text-base font-medium text-ink">{meal.foodName}</Text>
        {meal.detail ? (
          <Text className="text-sm text-muted" numberOfLines={1}>
            {meal.detail}
          </Text>
        ) : null}
      </View>
      <Text className="ml-2 text-base font-medium text-ink">
        {meal.calories}
        <Text className="text-sm text-muted"> kcal</Text>
      </Text>
    </View>
  );
}
