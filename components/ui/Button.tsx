import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Gradient } from "@/components/ui/Gradient";
import { Icon, type IconName } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { shadows } from "@/constants/shadows";
import { MIN_TAP_TARGET } from "@/constants/spacing";

type Variant = "solid" | "outline" | "text";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** Solid color treatment: brand gradient (default) or destructive red. */
  tone?: "brand" | "danger";
  /** Optional leading icon. */
  icon?: IconName;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Primary action button. `solid` is a teal gradient pill with soft elevation;
 * `text` is a teal label-only button for inline actions (e.g. "Add exercise").
 */
export function Button({
  label,
  onPress,
  variant = "solid",
  tone = "brand",
  icon,
  fullWidth,
  loading,
  disabled,
}: ButtonProps) {
  const isSolid = variant === "solid";
  const isOutline = variant === "outline";
  const isDisabled = disabled || loading;
  const tint = isSolid ? "#FFFFFF" : colors.primary;

  const content = loading ? (
    <ActivityIndicator color={tint} />
  ) : (
    <View className="flex-row items-center justify-center">
      {icon ? (
        <View className="mr-1.5">
          <Icon name={icon} size={18} color={tint} />
        </View>
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
  );

  if (isOutline) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        onPress={onPress}
        disabled={isDisabled}
        style={{ minHeight: MIN_TAP_TARGET, borderRadius: 99 }}
        className={[
          "flex-row items-center justify-center border border-primary px-5 py-3.5",
          fullWidth ? "w-full" : "self-start",
          isDisabled ? "opacity-50" : "active:opacity-60",
        ].join(" ")}
      >
        {content}
      </Pressable>
    );
  }

  if (!isSolid) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        onPress={onPress}
        disabled={isDisabled}
        style={{ minHeight: MIN_TAP_TARGET }}
        className={[
          "flex-row items-center justify-center px-3",
          fullWidth ? "w-full" : "self-start",
          isDisabled ? "opacity-50" : "active:opacity-60",
        ].join(" ")}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        shadows.card,
        { borderRadius: 99 },
        isDisabled ? { opacity: 0.5 } : null,
      ]}
      className={[fullWidth ? "w-full" : "self-start", "active:opacity-90"].join(
        " ",
      )}
    >
      {tone === "danger" ? (
        <View
          style={{
            backgroundColor: colors.danger,
            borderRadius: 99,
            minHeight: MIN_TAP_TARGET,
            justifyContent: "center",
          }}
        >
          <View className="px-5 py-3.5">{content}</View>
        </View>
      ) : (
        <Gradient
          radius={99}
          style={{ minHeight: MIN_TAP_TARGET, justifyContent: "center" }}
        >
          <View className="px-5 py-3.5">{content}</View>
        </Gradient>
      )}
    </Pressable>
  );
}
