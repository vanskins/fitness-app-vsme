import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, type IconName } from "@/components/ui/Icon";
import { colors, type AccentName } from "@/constants/colors";
import { MIN_TAP_TARGET } from "@/constants/spacing";

interface QuickAddOption {
  key: string;
  label: string;
  icon: IconName;
  accent: AccentName;
  detail: string;
}

const OPTIONS: QuickAddOption[] = [
  { key: "meal", label: "Log a meal", icon: "food", accent: "green", detail: "Food, portions, macros" },
  { key: "exercise", label: "Add exercise", icon: "workout", accent: "coral", detail: "To today's workout" },
  { key: "note", label: "Quick note", icon: "note", accent: "violet", detail: "Energy, sleep, journal" },
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
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ paddingBottom: insets.bottom + 12 }}
            className="rounded-t-3xl bg-surface px-5 pt-3"
          >
            <View className="mb-3 h-1 w-10 self-center rounded-pill bg-border" />
            <Text className="mb-2 text-lg font-medium text-ink">Quick add</Text>

            {OPTIONS.map((opt) => {
              const a = colors.accent[opt.accent];
              return (
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
                  <View
                    style={{ backgroundColor: a.bg }}
                    className="h-11 w-11 items-center justify-center rounded-[14px]"
                  >
                    <Icon name={opt.icon} size={20} color={a.icon} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-medium text-ink">
                      {opt.label}
                    </Text>
                    <Text className="text-sm text-faint">{opt.detail}</Text>
                  </View>
                  <Icon name="chevron" size={18} color={colors.faint} />
                </Pressable>
              );
            })}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
