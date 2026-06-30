import { Text, View } from "react-native";

interface AISuggestionCardProps {
  /** Short contextual tip. */
  tip: string;
  title?: string;
}

/**
 * AI suggestion card — green-tint background with the brand sparkle.
 * Colors per design system: bg #EAF3DE, border #C0DD97, text #27500A.
 */
export function AISuggestionCard({
  tip,
  title = "AI Suggestion",
}: AISuggestionCardProps) {
  return (
    <View className="flex-row rounded-card border border-ai-border bg-ai-bg p-4">
      <Text className="mr-2 text-base">✨</Text>
      <View className="flex-1">
        <Text className="text-sm font-medium text-ai-text">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-ai-text">{tip}</Text>
      </View>
    </View>
  );
}
