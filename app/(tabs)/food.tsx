import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MealForm } from "@/components/forms/MealForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useFoodLog } from "@/hooks/useFoodLog";
import type { NewFoodLog } from "@/lib/repository";
import type { FoodLog, MealType } from "@/types/food";

const MEAL_ICON: Record<MealType, string> = {
  breakfast: "🍳",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍎",
};

export default function FoodScreen() {
  const insets = useSafeAreaInsets();
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

  const confirmDelete = (meal: FoodLog) => {
    Alert.alert("Delete meal?", meal.foodName, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMeal(meal.id) },
    ]);
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
                    <View className="h-11 w-11 items-center justify-center rounded-pill bg-background">
                      <Text className="text-lg">{MEAL_ICON[meal.mealType]}</Text>
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
                    <Text className="text-lg text-muted">🗑️</Text>
                  </Pressable>
                </View>
              </Card>
            ))
          )}
        </View>

        <View className="mt-4">
          <Button label="Add meal" icon="+" fullWidth onPress={openCreate} />
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
