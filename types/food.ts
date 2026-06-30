export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodLog {
  id: string;
  userId: string;
  mealType: MealType;
  foodName: string;
  detail?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  loggedAt: string;
}
