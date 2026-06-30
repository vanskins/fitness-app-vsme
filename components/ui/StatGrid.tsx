import { Text, View } from "react-native";

import { Card } from "@/components/ui/Card";

export interface Stat {
  label: string;
  value: string;
  /** Short unit, e.g. "g", "L". */
  unit?: string;
}

interface StatGridProps {
  stats: Stat[];
}

/**
 * 2-column stat grid (mobile constraint: max 2 columns).
 * Renders stats in rows of two.
 */
export function StatGrid({ stats }: StatGridProps) {
  return (
    <View className="flex-row flex-wrap -mx-1.5">
      {stats.map((stat) => (
        <View key={stat.label} className="w-1/2 px-1.5 py-1.5">
          <Card>
            <Text className="text-sm text-muted">{stat.label}</Text>
            <View className="mt-1 flex-row items-baseline">
              <Text className="text-xl font-medium text-ink">{stat.value}</Text>
              {stat.unit ? (
                <Text className="ml-1 text-sm text-muted">{stat.unit}</Text>
              ) : null}
            </View>
          </Card>
        </View>
      ))}
    </View>
  );
}
