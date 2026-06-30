import type { WorkoutSession } from "@/types/workout";

/** Formats seconds as M:SS (or H:MM:SS past an hour). */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export interface WorkoutStats {
  durationSec: number;
  volumeKg: number;
  totalSets: number;
  completedSets: number;
  exerciseCount: number;
}

export function computeWorkoutStats(w: WorkoutSession): WorkoutStats {
  const end = w.finishedAt ? Date.parse(w.finishedAt) : Date.now();
  const durationSec = Math.max(
    0,
    Math.floor((end - Date.parse(w.startedAt)) / 1000),
  );
  let volumeKg = 0;
  let totalSets = 0;
  let completedSets = 0;
  for (const ex of w.exercises) {
    for (const s of ex.sets) {
      totalSets += 1;
      if (s.completed) {
        completedSets += 1;
        volumeKg += s.weightKg * s.reps;
      }
    }
  }
  return {
    durationSec,
    volumeKg,
    totalSets,
    completedSets,
    exerciseCount: w.exercises.length,
  };
}

/** Deterministic recap, shown until (or unless) the AI summary returns. */
export function localWorkoutSummary(
  w: WorkoutSession,
  stats: WorkoutStats,
): string {
  if (stats.exerciseCount === 0) {
    return "No exercises were logged in this session.";
  }
  const names = w.exercises.map((e) => e.name).slice(0, 3).join(", ");
  const exWord = stats.exerciseCount === 1 ? "exercise" : "exercises";
  return `${stats.exerciseCount} ${exWord} · ${stats.completedSets} sets · ${Math.round(
    stats.volumeKg,
  ).toLocaleString()} kg total volume in ${formatDuration(stats.durationSec)}. Worked ${names}. Strong session — keep the momentum going.`;
}
