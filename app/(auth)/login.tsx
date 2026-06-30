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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes("@") || !password) {
      return Alert.alert("Sign in", "Enter your email and password.");
    }
    setSubmitting(true);
    try {
      const ok = await signIn(email, password);
      if (!ok) {
        Alert.alert(
          "Couldn't sign in",
          "That email and password don't match. Try again or create an account.",
        );
      }
      // On success, route gating redirects into the app.
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
        <View className="mt-6 h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Text className="text-2xl">🏋️</Text>
        </View>
        <Text className="mt-6 text-3xl font-medium text-ink">Welcome back 👋</Text>
        <Text className="mt-2 text-base text-muted">
          Let's pick up right where you left off.
        </Text>

        <View className="mt-8">
          <FormField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
          <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" />
        </View>

        <View className="mt-4">
          <Button
            label="Log in"
            fullWidth
            loading={submitting}
            onPress={handleSubmit}
          />
        </View>

        <View className="mt-auto pt-6">
          <Text
            className="text-center text-sm text-muted"
            onPress={() => router.replace("/(auth)/setup")}
          >
            New here?{" "}
            <Text className="font-medium text-primary">Create an account</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
