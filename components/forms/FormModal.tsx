import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";

interface FormModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitting?: boolean;
  children: ReactNode;
}

/** Bottom-sheet modal shell shared by the add/edit forms. */
export function FormModal({
  visible,
  title,
  onClose,
  onSubmit,
  submitLabel = "Save",
  submitting,
  children,
}: FormModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ paddingBottom: insets.bottom + 12, maxHeight: "88%" }}
            className="rounded-t-3xl bg-background px-5 pt-3"
          >
            <View className="mb-3 h-1 w-10 self-center rounded-pill bg-border" />
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-medium text-ink">{title}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                onPress={onClose}
                hitSlop={8}
              >
                <Text className="text-base text-muted">Cancel</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
              <View className="mt-2">
                <Button
                  label={submitLabel}
                  fullWidth
                  loading={submitting}
                  onPress={onSubmit}
                />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
