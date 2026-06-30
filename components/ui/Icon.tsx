import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "@/constants/colors";

/** Semantic icon names mapped to a concrete glyph + family. */
const ICONS = {
  home: ["ion", "home"],
  food: ["ion", "restaurant"],
  workout: ["mci", "dumbbell"],
  progress: ["ion", "stats-chart"],
  add: ["ion", "add"],
  flame: ["ion", "flame"],
  water: ["ion", "water"],
  steps: ["ion", "walk"],
  active: ["ion", "flash"],
  protein: ["mci", "food-drumstick"],
  sparkles: ["ion", "sparkles"],
  breakfast: ["ion", "sunny"],
  lunch: ["ion", "fast-food"],
  dinner: ["ion", "restaurant"],
  snack: ["ion", "nutrition"],
  trash: ["ion", "trash"],
  edit: ["ion", "create"],
  check: ["ion", "checkmark"],
  chevron: ["ion", "chevron-forward"],
  bell: ["ion", "notifications"],
  weight: ["mci", "scale-bathroom"],
  note: ["ion", "document-text"],
  user: ["ion", "person"],
  logout: ["ion", "log-out"],
  close: ["ion", "close"],
  timer: ["ion", "timer"],
  plusCircle: ["ion", "add-circle"],
  sleep: ["ion", "moon"],
  energy: ["ion", "flash"],
  dumbbell: ["mci", "dumbbell"],
  back: ["ion", "chevron-back"],
  history: ["mci", "history"],
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 20, color = colors.ink }: IconProps) {
  const [family, glyph] = ICONS[name];
  if (family === "mci") {
    return (
      <MaterialCommunityIcons name={glyph as never} size={size} color={color} />
    );
  }
  return <Ionicons name={glyph as never} size={size} color={color} />;
}
