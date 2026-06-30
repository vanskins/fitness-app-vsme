export interface UserGoals {
  calorieGoal: number;
  proteinGoalG: number;
  waterGoalL: number;
}

export interface UserProfile {
  id: string;
  name: string;
  /** Initials shown in the avatar */
  initials: string;
}

/** The local account profile (placeholder auth until Supabase). */
export interface Profile {
  id: string;
  name: string;
  email: string;
  initials: string;
  onboarded: boolean;
}

export interface DailyStats {
  caloriesConsumed: number;
  proteinG: number;
  waterL: number;
  steps: number;
  activeMinutes: number;
}
