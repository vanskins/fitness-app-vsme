import { useEffect, useState } from "react";
import { View } from "react-native";

import { FormModal } from "@/components/forms/FormModal";
import { FormField } from "@/components/ui/FormField";
import type { ExerciseSet } from "@/types/workout";

interface SetEditFormProps {
  /** The set being edited, or null when closed. */
  set: ExerciseSet | null;
  onClose: () => void;
  onSubmit: (setId: string, fields: { weightKg: number; reps: number }) => Promise<void> | void;
}

const toNum = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

export function SetEditForm({ set, onClose, onSubmit }: SetEditFormProps) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!set) return;
    setWeight(String(set.weightKg));
    setReps(String(set.reps));
  }, [set]);

  const handleSubmit = async () => {
    if (!set) return;
    setSubmitting(true);
    try {
      await onSubmit(set.id, { weightKg: toNum(weight), reps: toNum(reps) });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      visible={set !== null}
      title={set ? `Edit set ${set.setNumber}` : "Edit set"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Save"
      submitting={submitting}
    >
      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormField label="Weight" value={weight} onChangeText={setWeight} keyboardType="numeric" unit="kg" placeholder="0" />
        </View>
        <View className="flex-1">
          <FormField label="Reps" value={reps} onChangeText={setReps} keyboardType="numeric" placeholder="0" />
        </View>
      </View>
    </FormModal>
  );
}
