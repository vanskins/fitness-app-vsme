import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useDialog } from "@/context/DialogContext";
import { FormModal } from "@/components/forms/FormModal";
import { FormField } from "@/components/ui/FormField";
import { Icon, type IconName } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { shadows } from "@/constants/shadows";
import type { NewExercise } from "@/lib/repository";

interface ExerciseFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NewExercise) => Promise<void> | void;
}

const MUSCLE_GROUP_OPTIONS = [
  { value: "Legs", label: "Legs", icon: "steps", tint: colors.accent.green },
  { value: "Arms", label: "Arms", icon: "dumbbell", tint: colors.accent.blue },
  { value: "Core", label: "Core", icon: "active", tint: colors.accent.violet },
  { value: "Chest", label: "Chest", icon: "workout", tint: colors.accent.coral },
  {
    value: "Shoulders",
    label: "Shoulders",
    icon: "weight",
    tint: colors.accent.amber,
  },
  { value: "HIIT", label: "HIIT", icon: "flame", tint: colors.ai },
] satisfies Array<{
  value: string;
  label: string;
  icon: IconName;
  tint: { bg: string; icon: string; text: string };
}>;

type MuscleGroup = (typeof MUSCLE_GROUP_OPTIONS)[number]["value"];

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
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("Legs");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [setCount, setSetCount] = useState("3");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName("");
    setMuscleGroup("Legs");
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
        muscleGroup,
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
      <View className="rounded-card border border-border bg-surface p-4">
        <FormField
          label="Exercise name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Bench Press"
        />
        <MuscleGroupSelector
          selected={muscleGroup}
          onSelect={setMuscleGroup}
        />
      </View>

      <View className="mt-4 rounded-card border border-border bg-surface p-4">
        <Text className="mb-3 text-sm font-medium text-ink">Starting set</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField
              label="Weight"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              unit="kg"
              placeholder="0"
            />
          </View>
          <View className="flex-1">
            <FormField
              label="Reps"
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          <View className="flex-1">
            <FormField
              label="Sets"
              value={setCount}
              onChangeText={setSetCount}
              keyboardType="numeric"
              placeholder="3"
            />
          </View>
        </View>
      </View>
    </FormModal>
  );
}

interface MuscleGroupSelectorProps {
  selected: MuscleGroup;
  onSelect: (value: MuscleGroup) => void;
}

function MuscleGroupSelector({ selected, onSelect }: MuscleGroupSelectorProps) {
  return (
    <View>
      <Text className="mb-2 text-sm text-muted">Muscle group</Text>
      <View className="flex-row flex-wrap justify-between gap-y-2">
        {MUSCLE_GROUP_OPTIONS.map((option) => {
          const active = option.value === selected;
          const textColor = active ? colors.white : option.tint.text;
          const iconBg = active ? "rgba(255,255,255,0.18)" : option.tint.bg;
          const iconColor = active ? colors.white : option.tint.icon;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(option.value)}
              style={[
                active ? shadows.card : null,
                {
                  width: "48.5%",
                  minHeight: 62,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary : colors.background,
                },
              ]}
              className="flex-row items-center px-3 active:opacity-80"
            >
              <View
                style={{ backgroundColor: iconBg }}
                className="mr-2.5 h-9 w-9 items-center justify-center rounded-pill"
              >
                <Icon name={option.icon} size={18} color={iconColor} />
              </View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                className="flex-1 text-sm font-medium"
                style={{ color: textColor }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
