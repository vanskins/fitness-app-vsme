import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Gradient } from "@/components/ui/Gradient";
import { Icon, type IconName } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { shadows } from "@/constants/shadows";
import { MIN_TAP_TARGET } from "@/constants/spacing";

interface TabItem {
  path: string;
  label: string;
  icon: IconName;
}

const LEFT_TABS: TabItem[] = [
  { path: "/", label: "Home", icon: "home" },
  { path: "/food", label: "Food", icon: "food" },
];

const RIGHT_TABS: TabItem[] = [
  { path: "/workout", label: "Workout", icon: "workout" },
  { path: "/progress", label: "Progress", icon: "progress" },
];

const FAB_SIZE = 56;
const FAB_FLOAT = 24;

interface TabBarProps {
  onFabPress: () => void;
}

/** Custom 5-slot bottom nav: Home · Food · [+ FAB] · Workout · Progress. */
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
        <Icon
          name={tab.icon}
          size={23}
          color={active ? colors.primary : colors.faint}
        />
        <Text
          className={
            active
              ? "mt-1 text-[11px] font-medium text-primary"
              : "mt-1 text-[11px] text-faint"
          }
        >
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View pointerEvents="box-none">
      {/* Floating FAB, kept inside bounds (top strip) so iOS delivers taps. */}
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
          style={[shadows.fab, { borderRadius: 99 }]}
          className="active:opacity-90"
        >
          <Gradient radius={99} style={{ width: FAB_SIZE, height: FAB_SIZE }}>
            <View className="flex-1 items-center justify-center">
              <Icon name="add" size={28} color="#FFFFFF" />
            </View>
          </Gradient>
        </Pressable>
      </View>

      <View pointerEvents="none" style={{ height: FAB_FLOAT }} />

      <View
        style={{ paddingBottom: insets.bottom }}
        className="flex-row items-end border-t border-border bg-surface"
      >
        {LEFT_TABS.map(renderTab)}
        <View className="flex-1" />
        {RIGHT_TABS.map(renderTab)}
      </View>
    </View>
  );
}
