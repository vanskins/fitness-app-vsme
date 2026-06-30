import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MIN_TAP_TARGET } from "@/constants/spacing";

interface QuickAddOption {
  key: string;
  label: string;
  icon: string;
  detail: string;
}

const OPTIONS: QuickAddOption[] = [
  { key: "meal", label: "Log a meal", icon: "🍎", detail: "Food, portions, macros" },
  { key: "exercise", label: "Add exercise", icon: "🏋️", detail: "To today's workout" },
  { key: "note", label: "Quick note", icon: "📝", detail: "Energy, sleep, journal" },
];

interface QuickAddSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (key: string) => void;
}

/** Bottom sheet opened by the center FAB for quick-add actions. */
export function QuickAddSheet({ visible, onClose, onSelect }: QuickAddSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <View className="flex-1 justify-end">
          {/* Stop propagation so taps inside the sheet don't close it. */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ paddingBottom: insets.bottom + 12 }}
            className="rounded-t-3xl bg-surface px-5 pt-3"
          >
            <View className="mb-3 h-1 w-10 self-center rounded-pill bg-border" />
            <Text className="mb-2 text-lg font-medium text-ink">Quick add</Text>

            {OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                accessibilityRole="button"
                onPress={() => {
                  onSelect?.(opt.key);
                  onClose();
                }}
                style={{ minHeight: MIN_TAP_TARGET }}
                className="flex-row items-center py-3 active:opacity-70"
              >
                <View className="h-11 w-11 items-center justify-center rounded-pill bg-background">
                  <Text className="text-lg">{opt.icon}</Text>
                </View>
                <View className="ml-3">
                  <Text className="text-base font-medium text-ink">
                    {opt.label}
                  </Text>
                  <Text className="text-sm text-muted">{opt.detail}</Text>
                </View>
              </Pressable>
            ))}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
