import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PlaceholderScreenProps {
  title: string;
  icon: string;
  blurb: string;
}

/** Reusable "to be built" screen for routes not yet designed. */
export function PlaceholderScreen({
  title,
  icon,
  blurb,
}: PlaceholderScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 items-center justify-center bg-background px-8"
      style={{ paddingTop: insets.top }}
    >
      <Text className="text-5xl">{icon}</Text>
      <Text className="mt-4 text-xl font-medium text-ink">{title}</Text>
      <Text className="mt-2 text-center text-sm text-muted">{blurb}</Text>
    </View>
  );
}
