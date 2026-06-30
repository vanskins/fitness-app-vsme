/**
 * Static content not yet backed by the data layer.
 *
 * Workouts, meals, goals and daily stats now live in SQLite (see lib/db.ts,
 * lib/repository.ts and the hooks). What remains here is the user identity
 * (until auth lands) and the placeholder AI suggestion copy (until the Claude
 * Edge Function is wired up).
 */
import type { UserProfile } from "@/types/user";

export const mockUser: UserProfile = {
  id: "u_1",
  name: "Alex",
  initials: "AR",
};

export const mockAiSuggestions = {
  home: "You're 96g into your 140g protein goal. A scoop of whey or some cottage cheese this evening would close the gap.",
  workout:
    "Your last two bench sets stayed at 70kg × 8. If both felt strong, try 72.5kg next session to keep progressing.",
};
