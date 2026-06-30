import { Tabs, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";

import { ExerciseForm } from "@/components/forms/ExerciseForm";
import { MealForm } from "@/components/forms/MealForm";
import { NoteForm } from "@/components/forms/NoteForm";
import { QuickAddSheet } from "@/components/layout/QuickAddSheet";
import { TabBar } from "@/components/layout/TabBar";
import {
  addExercise,
  addFoodLog,
  addNote,
  getOrCreateActiveSession,
  type NewExercise,
  type NewFoodLog,
  type NewNote,
} from "@/lib/repository";

type QuickForm = "meal" | "exercise" | "note" | null;

export default function TabsLayout() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [form, setForm] = useState<QuickForm>(null);

  const handleQuickAdd = (key: string) => {
    if (key === "meal" || key === "exercise" || key === "note") setForm(key);
  };

  const submitMeal = async (input: NewFoodLog) => {
    await addFoodLog(db, input);
    router.navigate("/food");
  };

  const submitExercise = async (input: NewExercise) => {
    const sessionId = await getOrCreateActiveSession(db, "Workout");
    await addExercise(db, sessionId, input);
    router.navigate("/workout");
  };

  const submitNote = async (input: NewNote) => {
    await addNote(db, input);
    router.navigate("/profile");
  };

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={() => <TabBar onFabPress={() => setQuickAddOpen(true)} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="food" />
        <Tabs.Screen name="workout" />
        <Tabs.Screen name="progress" />
        {/* Profile is reachable from the header avatar, not the tab bar. */}
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>

      <QuickAddSheet
        visible={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSelect={handleQuickAdd}
      />

      <MealForm
        visible={form === "meal"}
        onClose={() => setForm(null)}
        onSubmit={submitMeal}
      />
      <ExerciseForm
        visible={form === "exercise"}
        onClose={() => setForm(null)}
        onSubmit={submitExercise}
      />
      <NoteForm
        visible={form === "note"}
        onClose={() => setForm(null)}
        onSubmit={submitNote}
      />
    </>
  );
}
