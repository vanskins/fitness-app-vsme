import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { MIN_TAP_TARGET } from "@/constants/spacing";

type Variant = "solid" | "text";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** Optional leading glyph (e.g. "+"). Kept simple to avoid an icon dep. */
  icon?: string;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Primary action button. `solid` is full teal; `text` is a teal label-only
 * button used for inline actions like "Add exercise".
 */
export function Button({
  label,
  onPress,
  variant = "solid",
  icon,
  fullWidth,
  loading,
  disabled,
}: ButtonProps) {
  const isSolid = variant === "solid";
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={{ minHeight: MIN_TAP_TARGET }}
      className={[
        "flex-row items-center justify-center rounded-pill px-5",
        isSolid ? "bg-primary" : "bg-transparent",
        fullWidth ? "w-full" : "self-start",
        isDisabled ? "opacity-50" : "active:opacity-80",
      ].join(" ")}
    >
      {loading ? (
        <ActivityIndicator color={isSolid ? "#FFFFFF" : "#1D9E75"} />
      ) : (
        <View className="flex-row items-center">
          {icon ? (
            <Text
              className={
                isSolid
                  ? "mr-1.5 text-base font-medium text-white"
                  : "mr-1.5 text-base font-medium text-primary"
              }
            >
              {icon}
            </Text>
          ) : null}
          <Text
            className={
              isSolid
                ? "text-base font-medium text-white"
                : "text-base font-medium text-primary"
            }
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
