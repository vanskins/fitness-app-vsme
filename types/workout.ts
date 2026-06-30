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
