import { Text, View } from "react-native";

import { Icon, type IconName } from "@/components/ui/Icon";
import { colors, type AccentName } from "@/constants/colors";
import { shadows } from "@/constants/shadows";

interface StatTileProps {
  accent: AccentName;
  icon: IconName;
  label: string;
  value: string;
  unit?: string;
}

/** Colorful metric tile: an accent icon chip, big value, and label. */
export function StatTile({ accent, icon, label, value, unit }: StatTileProps) {
  const a = colors.accent[accent];
  return (
    <View
      style={shadows.card}
      className="flex-1 rounded-card bg-surface p-3.5"
    >
      <View className="flex-row items-center">
        <View
          style={{ backgroundColor: a.bg }}
          className="h-8 w-8 items-center justify-center rounded-[10px]"
        >
          <Icon name={icon} size={17} color={a.icon} />
        </View>
        <Text className="ml-2 text-sm text-muted">{label}</Text>
      </View>
      <View className="mt-2 flex-row items-baseline">
        <Text className="text-2xl font-medium text-ink">{value}</Text>
        {unit ? <Text className="ml-1 text-sm text-faint">{unit}</Text> : null}
      </View>
    </View>
  );
}
