import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Gradient } from "@/components/ui/Gradient";
import { Icon } from "@/components/ui/Icon";
import { shadows } from "@/constants/shadows";

interface StartWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (name: string) => void | Promise<void>;
}

/** Custom confirmation popup for beginning a new workout (optional name). */
export function StartWorkoutModal({
  visible,
  onClose,
  onStart,
}: StartWorkoutModalProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) setName("");
  }, [visible]);

  const handleStart = async () => {
    setSubmitting(true);
    try {
      await onStart(name.trim() || "Workout");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-8"
          onPress={onClose}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={shadows.hero}
            className="w-full rounded-3xl bg-surface p-6"
          >
            <View className="items-center">
              <Gradient radius={99} style={{ width: 64, height: 64 }}>
                <View className="flex-1 items-center justify-center">
                  <Icon name="dumbbell" size={30} color="#FFFFFF" />
                </View>
              </Gradient>
              <Text className="mt-4 text-xl font-medium text-ink">
                Start a workout?
              </Text>
              <Text className="mt-1 text-center text-sm text-muted">
                Give it a name (optional), then log your sets as you go.
              </Text>
            </View>

            <View className="mt-5">
              <FormField
                label="Workout name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Push Day"
                autoCapitalize="words"
              />
            </View>

            <Button
              label="Start workout"
              icon="add"
              fullWidth
              loading={submitting}
              onPress={handleStart}
            />
            <View className="mt-1 items-center">
              <Button label="Cancel" variant="text" onPress={onClose} />
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
