import { useEffect, useState } from "react";
import { View } from "react-native";

import { useDialog } from "@/context/DialogContext";
import { FormModal } from "@/components/forms/FormModal";
import { FormField } from "@/components/ui/FormField";
import type { NewExercise } from "@/lib/repository";

interface ExerciseFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NewExercise) => Promise<void> | void;
}

const toNum = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

const toInt = (s: string, fallback: number) => {
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function ExerciseForm({ visible, onClose, onSubmit }: ExerciseFormProps) {
  const { alert } = useDialog();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [setCount, setSetCount] = useState("3");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName("");
    setMuscleGroup("");
    setWeight("");
    setReps("");
    setSetCount("3");
  }, [visible]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      await alert({
        title: "Add a name",
        message: "Please enter an exercise name.",
      });
      return;
    }
    const count = toInt(setCount, 1);
    const sets = Array.from({ length: count }, () => ({
      weightKg: toNum(weight),
      reps: toNum(reps),
    }));
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        muscleGroup: muscleGroup.trim() || undefined,
        sets,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title="Add exercise"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Add exercise"
      submitting={submitting}
    >
      <FormField label="Exercise name" value={name} onChangeText={setName} placeholder="e.g. Bench Press" />
      <FormField label="Muscle group (optional)" value={muscleGroup} onChangeText={setMuscleGroup} placeholder="e.g. Chest" />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Weight" value={weight} onChangeText={setWeight} keyboardType="numeric" unit="kg" placeholder="0" />
        </View>
        <View className="flex-1">
          <FormField label="Reps" value={reps} onChangeText={setReps} keyboardType="numeric" placeholder="0" />
        </View>
        <View className="flex-1">
          <FormField label="Sets" value={setCount} onChangeText={setSetCount} keyboardType="numeric" placeholder="3" />
        </View>
      </View>
    </FormModal>
  );
}
