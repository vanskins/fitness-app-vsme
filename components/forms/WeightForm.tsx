import { useEffect, useState } from "react";

import { useDialog } from "@/context/DialogContext";
import { FormModal } from "@/components/forms/FormModal";
import { FormField } from "@/components/ui/FormField";

interface WeightFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (weightKg: number) => Promise<void> | void;
  /** Prefill (e.g. last logged weight). */
  defaultValue?: number;
}

export function WeightForm({
  visible,
  onClose,
  onSubmit,
  defaultValue,
}: WeightFormProps) {
  const { alert } = useDialog();
  const [weight, setWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setWeight(defaultValue ? String(defaultValue) : "");
  }, [visible, defaultValue]);

  const handleSubmit = async () => {
    const n = parseFloat(weight);
    if (!Number.isFinite(n) || n <= 0) {
      await alert({
        title: "Enter a weight",
        message: "Please enter a valid weight in kg.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(n);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      visible={visible}
      title="Log weight"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Save"
      submitting={submitting}
    >
      <FormField
        label="Body weight"
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        unit="kg"
        placeholder="e.g. 81.5"
      />
    </FormModal>
  );
}
