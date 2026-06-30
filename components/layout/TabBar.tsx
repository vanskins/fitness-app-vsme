import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MIN_TAP_TARGET } from "@/constants/spacing";

interface TabItem {
  /** Route path used for navigation and active matching. */
  path: string;
  label: string;
  icon: string;
}

/** Two tabs left of the FAB, two to the right. */
const LEFT_TABS: TabItem[] = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/food", label: "Food", icon: "🍎" },
];

const RIGHT_TABS: TabItem[] = [
  { path: "/workout", label: "Workout", icon: "🏋️" },
  { path: "/progress", label: "Progress", icon: "📈" },
];

const FAB_SIZE = 56;
/** How far the FAB rises above the bar's top edge. */
const FAB_FLOAT = 24;

interface TabBarProps {
  /** Opens the quick-add bottom sheet. */
  onFabPress: () => void;
}

/**
 * Custom 5-slot bottom nav: Home · Food · [+ FAB] · Workout · Progress.
 *
 * The FAB floats above the bar, but it is kept INSIDE this component's bounds
 * (in a transparent strip at the top) so iOS still delivers touches to it —
 * a child rendered outside its parent's bounds does not receive taps.
 */
export function TabBar({ onFabPress }: TabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const renderTab = (tab: TabItem) => {
    const active = pathname === tab.path;
    return (
      <Pressable
        key={tab.path}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={tab.label}
        onPress={() => router.navigate(tab.path as never)}
        style={{ minHeight: MIN_TAP_TARGET }}
        className="flex-1 items-center justify-center pt-2"
      >
        <Text className="text-lg" style={{ opacity: active ? 1 : 0.45 }}>
          {tab.icon}
        </Text>
        <Text
          className={
            active
              ? "mt-0.5 text-xs font-medium text-primary"
              : "mt-0.5 text-xs text-muted"
          }
        >
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    // box-none: the transparent float strip lets touches fall through to
    // screen content, while the FAB and bar still receive their own taps.
    <View pointerEvents="box-none">
      {/* FAB overlay, pinned to the top of this container so it stays in bounds */}
      <View
        pointerEvents="box-none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}
        className="items-center"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quick add"
          onPress={onFabPress}
          hitSlop={8}
          style={{ width: FAB_SIZE, height: FAB_SIZE }}
          className="items-center justify-center rounded-pill bg-primary shadow-lg active:opacity-90"
        >
          <Text
            className="text-3xl font-medium text-white"
            style={{ lineHeight: 34 }}
          >
            +
          </Text>
        </Pressable>
      </View>

      {/* Transparent strip the floating half of the FAB sits over */}
      <View pointerEvents="none" style={{ height: FAB_FLOAT }} />

      {/* The bar itself */}
      <View
        style={{ paddingBottom: insets.bottom }}
        className="flex-row items-end border-t border-border bg-surface"
      >
        {LEFT_TABS.map(renderTab)}
        {/* Center slot reserved for the floating FAB */}
        <View className="flex-1" />
        {RIGHT_TABS.map(renderTab)}
      </View>
    </View>
  );
}
