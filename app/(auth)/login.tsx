import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Gradient } from "@/components/ui/Gradient";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";
import { useDialog } from "@/context/DialogContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const { alert } = useDialog();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes("@") || !password) {
      await alert({ title: "Sign in", message: "Enter your email and password." });
      return;
    }
    setSubmitting(true);
    try {
      const ok = await signIn(email, password);
      if (!ok) {
        await alert({
          title: "Couldn't sign in",
          message:
            "That email and password don't match. Try again or create an account.",
        });
      }
      // On success, route gating redirects into the app.
    } catch (e) {
      await alert({
        title: "Sign in failed",
        message: e instanceof Error ? e.message : "Please try again.",
      });
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
        <Gradient radius={99} style={{ width: 64, height: 64, marginTop: 24 }}>
          <View className="flex-1 items-center justify-center">
            <Icon name="dumbbell" size={30} color="#FFFFFF" />
          </View>
        </Gradient>
        <Text className="mt-6 text-3xl font-medium text-ink">Welcome back 👋</Text>
        <Text className="mt-2 text-base text-muted">
          Let's pick up right where you left off.
        </Text>

        <View className="mt-8">
          <FormField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
          <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry autoComplete="current-password" textContentType="password" />
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
