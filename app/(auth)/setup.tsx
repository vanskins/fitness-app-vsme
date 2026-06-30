import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useAuth } from "@/context/AuthContext";

export default function SetupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState("2200");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert("Your name", "What should we call you?");
    if (!email.includes("@"))
      return Alert.alert("Email", "Please enter a valid email.");
    if (password.length < 4)
      return Alert.alert("Password", "Use at least 4 characters.");

    setSubmitting(true);
    try {
      await signUp({
        name,
        email,
        password,
        calorieGoal: parseInt(goal, 10) || undefined,
      });
      // Route gating redirects to the app once logged in.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-medium text-ink">
          Let's set you up 🎯
        </Text>
        <Text className="mt-2 text-base text-muted">
          A few details and you're ready to start logging.
        </Text>

        <View className="mt-8">
          <FormField label="Name" value={name} onChangeText={setName} placeholder="Alex Rivera" />
          <FormField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="default" />
          <FormField label="Password" value={password} onChangeText={setPassword} placeholder="At least 4 characters" />
          <FormField label="Daily calorie goal" value={goal} onChangeText={setGoal} keyboardType="numeric" unit="kcal" />
        </View>

        <View className="mt-4">
          <Button
            label="Create account"
            fullWidth
            loading={submitting}
            onPress={handleSubmit}
          />
        </View>

        <View className="mt-auto pt-6">
          <Text
            className="text-center text-sm text-muted"
            onPress={() => router.replace("/(auth)/login")}
          >
            Already have an account?{" "}
            <Text className="font-medium text-primary">Log in</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
