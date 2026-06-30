import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";

const { width } = Dimensions.get("window");

interface Slide {
  icon: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: "💪",
    title: "Every rep counts",
    body: "Log your workouts in seconds and watch your strength climb, session after session.",
  },
  {
    icon: "🍎",
    title: "Fuel your goals",
    body: "Track calories and macros without the spreadsheet headache. Small choices, big results.",
  },
  {
    icon: "📈",
    title: "See your progress",
    body: "Turn daily habits into visible momentum with simple, honest charts.",
  },
  {
    icon: "✨",
    title: "Your AI coach",
    body: "Get smart, personal tips based on what you actually log. You've got this.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const next = () => {
    if (isLast) {
      router.replace("/(auth)/setup");
      return;
    }
    scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
  };

  return (
    <View className="flex-1 bg-background">
      {/* Skip */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="flex-row justify-end px-5"
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/(auth)/setup")}
          hitSlop={8}
          className="active:opacity-60"
          style={{ opacity: isLast ? 0 : 1 }}
          disabled={isLast}
        >
          <Text className="text-base text-muted">Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.title}
            style={{ width }}
            className="flex-1 items-center justify-center px-10"
          >
            <View className="h-32 w-32 items-center justify-center rounded-full bg-ai-bg">
              <Text style={{ fontSize: 64 }}>{slide.icon}</Text>
            </View>
            <Text className="mt-8 text-center text-2xl font-medium text-ink">
              {slide.title}
            </Text>
            <Text className="mt-3 text-center text-base leading-6 text-muted">
              {slide.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots + CTA */}
      <View style={{ paddingBottom: insets.bottom + 16 }} className="px-6">
        <View className="mb-6 flex-row justify-center gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className={
                i === index
                  ? "h-2 w-6 rounded-pill bg-primary"
                  : "h-2 w-2 rounded-pill bg-border"
              }
            />
          ))}
        </View>
        <Button
          label={isLast ? "Get started" : "Next"}
          fullWidth
          onPress={next}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/(auth)/login")}
          className="mt-4 active:opacity-60"
        >
          <Text className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Text className="font-medium text-primary">Log in</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
