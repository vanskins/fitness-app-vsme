import { Text, View } from "react-native";

import { Icon, type IconName } from "@/components/ui/Icon";
import { colors, type AccentName } from "@/constants/colors";
import type { FoodLog, MealType } from "@/types/food";

const MEAL: Record<
  MealType,
  { icon: IconName; accent: AccentName; label: string }
> = {
  breakfast: { icon: "breakfast", accent: "amber", label: "Breakfast" },
  lunch: { icon: "lunch", accent: "green", label: "Lunch" },
  dinner: { icon: "dinner", accent: "coral", label: "Dinner" },
  snack: { icon: "snack", accent: "violet", label: "Snack" },
};

interface MealRowProps {
  meal: FoodLog;
}

export function MealRow({ meal }: MealRowProps) {
  const m = MEAL[meal.mealType];
  const a = colors.accent[m.accent];
  return (
    <View className="flex-row items-center py-3">
      <View
        style={{ backgroundColor: a.bg }}
        className="h-10 w-10 items-center justify-center rounded-[12px]"
      >
        <Icon name={m.icon} size={18} color={a.icon} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-base font-medium text-ink">{meal.foodName}</Text>
        <Text className="text-xs text-faint" numberOfLines={1}>
          {meal.detail ? `${m.label} · ${meal.detail}` : m.label}
        </Text>
      </View>
      <Text className="ml-2 text-base font-medium text-ink">
        {Math.round(meal.calories)}
        <Text className="text-xs text-faint"> kcal</Text>
      </Text>
    </View>
  );
}
