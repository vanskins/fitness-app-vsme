import { Pressable, Text, View } from "react-native";

import { Gradient } from "@/components/ui/Gradient";
import { MIN_TAP_TARGET } from "@/constants/spacing";

interface HeaderProps {
  greeting: string;
  name: string;
  /** Avatar initials. */
  initials: string;
  /** Tapping the avatar (e.g. to open Profile). */
  onAvatarPress?: () => void;
}

/** Greeting header with a gradient initials avatar (Home dashboard). */
export function Header({ greeting, name, initials, onAvatarPress }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-sm text-muted">{greeting}</Text>
        <Text className="text-2xl font-medium text-ink">{name}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={onAvatarPress}
        hitSlop={8}
        style={{ minWidth: MIN_TAP_TARGET, minHeight: MIN_TAP_TARGET }}
        className="items-center justify-center active:opacity-70"
      >
        <Gradient radius={99} style={{ width: 44, height: 44 }}>
          <View className="flex-1 items-center justify-center">
            <Text className="text-base font-medium text-white">{initials}</Text>
          </View>
        </Gradient>
      </Pressable>
    </View>
  );
}
