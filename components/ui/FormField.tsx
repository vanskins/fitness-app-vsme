import { Text, TextInput, View } from "react-native";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  multiline?: boolean;
  /** Optional trailing unit label, e.g. "kcal", "g". */
  unit?: string;
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
}: FormFieldProps) {
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
          className="flex-1 py-3 text-base text-ink"
          style={multiline ? { minHeight: 72, textAlignVertical: "top" } : undefined}
        />
        {unit ? <Text className="ml-2 text-sm text-muted">{unit}</Text> : null}
      </View>
    </View>
  );
}
