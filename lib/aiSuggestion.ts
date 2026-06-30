import { supabase } from "@/lib/supabase";

/**
 * Calls the `suggest` Supabase Edge Function for an AI fitness tip.
 *
 * Returns null when Supabase isn't configured, the function isn't deployed, the
 * user isn't authenticated, or anything errors — callers fall back to static
 * copy, so the AI is purely additive and never blocks the UI.
 */
export interface SuggestInput {
  context: "home" | "workout";
  goals?: { calorieGoal?: number; proteinGoalG?: number };
  totals?: { calories?: number; proteinG?: number };
  meals?: Array<{ name?: string; calories?: number }>;
  workout?: { name?: string; exercises?: Array<{ name?: string; topSetKg?: number }> };
}

export async function fetchSuggestion(
  input: SuggestInput,
): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.functions.invoke("suggest", {
      body: input,
    });
    if (error) return null;
    const suggestion = (data as { suggestion?: string } | null)?.suggestion;
    return typeof suggestion === "string" && suggestion.length > 0
      ? suggestion
      : null;
  } catch {
    return null;
  }
}
