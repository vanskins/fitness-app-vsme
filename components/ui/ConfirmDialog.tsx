import { Modal, Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { shadows } from "@/constants/shadows";

export interface DialogOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button + warning icon tint, for deletes/logout. */
  destructive?: boolean;
  icon?: IconName;
  /** Single-button info dialog (no cancel). */
  confirmOnly?: boolean;
}

interface ConfirmDialogProps {
  visible: boolean;
  options?: DialogOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Presentational custom dialog used by the DialogProvider. */
export function ConfirmDialog({
  visible,
  options,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!options) return null;
  const tint = options.destructive ? colors.accent.coral : colors.accent.green;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 px-8"
        onPress={onCancel}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={shadows.hero}
          className="w-full rounded-3xl bg-surface p-6"
        >
          {options.icon ? (
            <View className="items-center">
              <View
                style={{ backgroundColor: tint.bg }}
                className="h-14 w-14 items-center justify-center rounded-full"
              >
                <Icon name={options.icon} size={26} color={tint.icon} />
              </View>
            </View>
          ) : null}

          <Text
            className={`text-xl font-medium text-ink ${
              options.icon ? "mt-4 text-center" : ""
            }`}
          >
            {options.title}
          </Text>
          {options.message ? (
            <Text
              className={`mt-1 text-sm leading-5 text-muted ${
                options.icon ? "text-center" : ""
              }`}
            >
              {options.message}
            </Text>
          ) : null}

          <View className="mt-5">
            <Button
              label={options.confirmLabel ?? "Confirm"}
              tone={options.destructive ? "danger" : "brand"}
              fullWidth
              onPress={onConfirm}
            />
          </View>
          {options.confirmOnly ? null : (
            <View className="mt-1 items-center">
              <Button
                label={options.cancelLabel ?? "Cancel"}
                variant="text"
                onPress={onCancel}
              />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
