import { Pressable, Text, View } from "react-native";

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipsProps<T extends string> {
  label?: string;
  options: ChipOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

/** Single-select pill chips (e.g. meal type, energy level). */
export function Chips<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: ChipsProps<T>) {
  return (
    <View className="mb-3">
      {label ? <Text className="mb-1 text-sm text-muted">{label}</Text> : null}
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === selected;
          return (
            <Pressable
              key={opt.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(opt.value)}
              className={[
                "rounded-pill border px-4 py-2 active:opacity-70",
                active
                  ? "border-primary bg-primary"
                  : "border-border bg-surface",
              ].join(" ")}
            >
              <Text
                className={
                  active
                    ? "text-sm font-medium text-white"
                    : "text-sm text-ink"
                }
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
