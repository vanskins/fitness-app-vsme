export interface DailyNote {
  id: string;
  userId: string;
  content: string;
  /** 1–5 self-rated energy, or undefined if not set. */
  energyLevel?: number;
  sleepHours?: number;
  notedAt: string;
}
