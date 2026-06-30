import { useEffect, useState } from "react";
import { View } from "react-native";

import { useDialog } from "@/context/DialogContext";
import { FormModal } from "@/components/forms/FormModal";
import { Chips } from "@/components/ui/Chips";
import { FormField } from "@/components/ui/FormField";
import type { NewFoodLog } from "@/lib/repository";
import type { FoodLog, MealType } from "@/types/food";

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

interface MealFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NewFoodLog) => Promise<void> | void;
  /** When provided, the form edits this meal instead of creating one. */
  initial?: FoodLog | null;
}

const toNum = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

export function MealForm({ visible, onClose, onSubmit, initial }: MealFormProps) {
  const { alert } = useDialog();
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [foodName, setFoodName] = useState("");
  const [detail, setDetail] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset / prefill whenever the modal opens.
  useEffect(() => {
    if (!visible) return;
    setMealType(initial?.mealType ?? "breakfast");
    setFoodName(initial?.foodName ?? "");
    setDetail(initial?.detail ?? "");
    setCalories(initial ? String(initial.calories) : "");
    setProtein(initial ? String(initial.proteinG) : "");
    setCarbs(initial ? String(initial.carbsG) : "");
    setFat(initial ? String(initial.fatG) : "");
  }, [visible, initial]);

  const handleSubmit = async () => {
    if (!foodName.trim()) {
      await alert({ title: "Add a name", message: "Please enter a food name." });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        mealType,
        foodName: foodName.trim(),
        detail: detail.trim() || undefined,
        calories: toNum(calories),
        proteinG: toNum(protein),
        carbsG: toNum(carbs),
        fatG: toNum(fat),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title={initial ? "Edit meal" : "Log a meal"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={initial ? "Save changes" : "Add meal"}
      submitting={submitting}
    >
      <Chips
        label="Meal"
        options={MEAL_OPTIONS}
        selected={mealType}
        onSelect={setMealType}
      />
      <FormField label="Food name" value={foodName} onChangeText={setFoodName} placeholder="e.g. Grilled chicken bowl" />
      <FormField label="Detail (optional)" value={detail} onChangeText={setDetail} placeholder="e.g. Chicken, rice, veggies" />
      <FormField label="Calories" value={calories} onChangeText={setCalories} keyboardType="numeric" unit="kcal" placeholder="0" />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Protein" value={protein} onChangeText={setProtein} keyboardType="numeric" unit="g" placeholder="0" />
        </View>
        <View className="flex-1">
          <FormField label="Carbs" value={carbs} onChangeText={setCarbs} keyboardType="numeric" unit="g" placeholder="0" />
        </View>
        <View className="flex-1">
          <FormField label="Fat" value={fat} onChangeText={setFat} keyboardType="numeric" unit="g" placeholder="0" />
        </View>
      </View>
    </FormModal>
  );
}
