import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDialog } from "@/context/DialogContext";
import { MealForm } from "@/components/forms/MealForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { colors, type AccentName } from "@/constants/colors";
import { useFoodLog } from "@/hooks/useFoodLog";
import type { NewFoodLog } from "@/lib/repository";
import type { FoodLog, MealType } from "@/types/food";

const MEAL: Record<MealType, { icon: IconName; accent: AccentName }> = {
  breakfast: { icon: "breakfast", accent: "amber" },
  lunch: { icon: "lunch", accent: "green" },
  dinner: { icon: "dinner", accent: "coral" },
  snack: { icon: "snack", accent: "violet" },
};

export default function FoodScreen() {
  const insets = useSafeAreaInsets();
  const { confirm } = useDialog();
  const { meals, addMeal, updateMeal, deleteMeal } = useFoodLog();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FoodLog | null>(null);

  const totalCals = meals.reduce((s, m) => s + m.calories, 0);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (meal: FoodLog) => {
    setEditing(meal);
    setFormOpen(true);
  };

  const confirmDelete = async (meal: FoodLog) => {
    const ok = await confirm({
      title: "Delete meal?",
      message: meal.foodName,
      confirmLabel: "Delete",
      destructive: true,
      icon: "trash",
    });
    if (ok) deleteMeal(meal.id);
  };

  const handleSubmit = async (input: NewFoodLog) => {
    if (editing) await updateMeal(editing.id, input);
    else await addMeal(input);
  };

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
        <View className="flex-row items-end justify-between">
          <Text className="text-2xl font-medium text-ink">Food</Text>
          <Text className="text-sm text-muted">
            {Math.round(totalCals).toLocaleString()} kcal today
          </Text>
        </View>

        <View className="mt-4 gap-2">
          {meals.length === 0 ? (
            <Card>
              <Text className="py-3 text-sm text-muted">
                No meals logged yet. Add your first meal below.
              </Text>
            </Card>
          ) : (
            meals.map((meal) => (
              <Card key={meal.id}>
                <View className="flex-row items-center">
                  <Pressable
                    className="flex-1 flex-row items-center active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${meal.foodName}`}
                    onPress={() => openEdit(meal)}
                  >
                    <View
                      style={{ backgroundColor: colors.accent[MEAL[meal.mealType].accent].bg }}
                      className="h-11 w-11 items-center justify-center rounded-[14px]"
                    >
                      <Icon
                        name={MEAL[meal.mealType].icon}
                        size={20}
                        color={colors.accent[MEAL[meal.mealType].accent].icon}
                      />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-xs capitalize text-muted">
                        {meal.mealType}
                      </Text>
                      <Text className="text-base font-medium text-ink">
                        {meal.foodName}
                      </Text>
                      <Text className="text-xs text-muted">
                        {Math.round(meal.calories)} kcal · P{Math.round(meal.proteinG)} C{Math.round(meal.carbsG)} F{Math.round(meal.fatG)}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${meal.foodName}`}
                    onPress={() => confirmDelete(meal)}
                    hitSlop={8}
                    className="ml-2 h-9 w-9 items-center justify-center rounded-pill active:opacity-60"
                  >
                    <Icon name="trash" size={18} color={colors.faint} />
                  </Pressable>
                </View>
              </Card>
            ))
          )}
        </View>

        <View className="mt-4">
          <Button label="Add meal" icon="add" fullWidth onPress={openCreate} />
        </View>
      </ScrollView>

      <MealForm
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
    </View>
  );
}
