import { useEffect, useState } from "react";

import { useDialog } from "@/context/DialogContext";
import { FormModal } from "@/components/forms/FormModal";
import { Chips } from "@/components/ui/Chips";
import { FormField } from "@/components/ui/FormField";
import type { NewNote } from "@/lib/repository";
import type { DailyNote } from "@/types/note";

interface NoteFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NewNote) => Promise<void> | void;
  initial?: DailyNote | null;
}

const ENERGY_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

const toNumOrUndef = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
};

export function NoteForm({ visible, onClose, onSubmit, initial }: NoteFormProps) {
  const { alert } = useDialog();
  const [content, setContent] = useState("");
  const [energy, setEnergy] = useState("3");
  const [sleep, setSleep] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setContent(initial?.content ?? "");
    setEnergy(initial?.energyLevel ? String(initial.energyLevel) : "3");
    setSleep(initial?.sleepHours != null ? String(initial.sleepHours) : "");
  }, [visible, initial]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      await alert({ title: "Write something", message: "Please enter a note." });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        content: content.trim(),
        energyLevel: parseInt(energy, 10),
        sleepHours: toNumOrUndef(sleep),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title={initial ? "Edit note" : "Quick note"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={initial ? "Save changes" : "Add note"}
      submitting={submitting}
    >
      <FormField
        label="Note"
        value={content}
        onChangeText={setContent}
        placeholder="How did today go?"
        multiline
      />
      <Chips
        label="Energy level"
        options={ENERGY_OPTIONS}
        selected={energy}
        onSelect={setEnergy}
      />
      <FormField
        label="Sleep (optional)"
        value={sleep}
        onChangeText={setSleep}
        keyboardType="decimal-pad"
        unit="hrs"
        placeholder="e.g. 7.5"
      />
    </FormModal>
  );
}
