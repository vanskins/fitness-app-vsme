export interface BodyWeight {
  id: string;
  weightKg: number;
  recordedAt: string;
}

export interface CaloriePoint {
  /** YYYY-MM-DD */
  date: string;
  calories: number;
}

export interface WeekSummary {
  workouts: number;
  /** Total volume (Σ weight × reps) of completed sets this week, in kg. */
  volumeKg: number;
  /** Average daily calories over the charted window. */
  avgCalories: number;
}
