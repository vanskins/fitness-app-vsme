import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad" | "email-address";
  multiline?: boolean;
  /** Optional trailing unit label, e.g. "kcal", "g". */
  unit?: string;
  /** Masks the input and shows a Show/Hide toggle (for passwords). */
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
}

/** Labeled text input matching the app's card styling. */
export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline,
  unit,
  secureTextEntry,
  autoCapitalize,
  autoComplete,
  textContentType,
}: FormFieldProps) {
  const [hidden, setHidden] = useState(true);
  const isSecure = !!secureTextEntry;

  return (
    <View className="mb-3">
      <Text className="mb-1 text-sm text-muted">{label}</Text>
      <View className="flex-row items-center rounded-card border border-border bg-surface px-3">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          multiline={multiline}
          secureTextEntry={isSecure && hidden}
          autoCapitalize={autoCapitalize ?? (isSecure ? "none" : undefined)}
          autoCorrect={!isSecure}
          autoComplete={autoComplete}
          textContentType={textContentType}
          className="flex-1 py-3 text-base text-ink"
          style={multiline ? { minHeight: 72, textAlignVertical: "top" } : undefined}
        />
        {isSecure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            className="ml-2 active:opacity-60"
          >
            <Text className="text-sm font-medium text-primary">
              {hidden ? "Show" : "Hide"}
            </Text>
          </Pressable>
        ) : unit ? (
          <Text className="ml-2 text-sm text-muted">{unit}</Text>
        ) : null}
      </View>
    </View>
  );
}
