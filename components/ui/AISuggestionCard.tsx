import { Text, View } from "react-native";

import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";

interface AISuggestionCardProps {
  /** Short contextual tip. */
  tip: string;
  title?: string;
}

/** AI suggestion card — soft teal tint with the brand sparkle. */
export function AISuggestionCard({ tip, title = "AI coach" }: AISuggestionCardProps) {
  return (
    <View className="flex-row rounded-card border border-ai-border bg-ai-bg p-4">
      <View className="mr-2.5 mt-0.5">
        <Icon name="sparkles" size={18} color={colors.ai.icon} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-ai-text">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-ai-text">{tip}</Text>
      </View>
    </View>
  );
}
