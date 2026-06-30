export interface ExerciseSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: string;
  orderIndex: number;
  /** When this exercise became active (passive duration tracking). */
  startedAt?: string;
  /** When the user advanced past it (or the workout finished). */
  endedAt?: string;
  /** Derived: seconds spent on this exercise (only once ended). */
  durationSec?: number;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  muscleGroup: string;
  startedAt: string;
  finishedAt?: string;
  notes?: string;
  exercises: WorkoutExercise[];
}

/** Lightweight row for the workout history list. */
export interface WorkoutSummary {
  id: string;
  name: string;
  startedAt: string;
  finishedAt?: string;
  exerciseCount: number;
  setCount: number;
  completedSets: number;
  volumeKg: number;
}
