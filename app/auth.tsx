import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ThemedLoader from "../components/ThemedLoader";
import Colors from "../constants/Colors";
import { supabase } from "../lib/supabase";

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<
    "trainer" | "trainee" | null
  >(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const existingSetupData = await AsyncStorage.getItem("userSetupData");
      const userData = {
        email,
        role: selectedRole,
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
        userId: data.user?.id,
      };
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      // Ensure profiles row exists without overwriting names with empty values
      if (data.user?.id) {
        const userId = data.user.id;
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .maybeSingle();

        if (!existing) {
          await supabase
            .from("profiles")
            .upsert({ id: userId }, { onConflict: "id" });
        } else if (firstName || lastName) {
          // Only update names if provided on this screen
          await supabase
            .from("profiles")
            .update({
              first_name: firstName || undefined,
              last_name: lastName || undefined,
            })
            .eq("id", userId);
        }
      }

      // Check persisted trainee settings to skip setup
      if (selectedRole === "trainer") {
        router.replace("/(tabs)");
      } else {
        let hasSettings = false;
        if (data.user?.id) {
          const { data: settingsRow } = await supabase
            .from("trainee_settings")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();
          if (settingsRow) hasSettings = true;
        }
        if (existingSetupData || hasSettings) {
          router.replace("/(tabs)");
        } else {
          router.replace("/setup");
        }
      }
    } catch (error: any) {
      Alert.alert("Login failed", error.message || "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !selectedRole) {
      Alert.alert("Error", "Please fill in all fields and select a role");
      return;
    }

    if (!gender) {
      Alert.alert("Error", "Please select your gender");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // You can add email redirectTo if needed
        },
      });
      if (error) throw error;

      // If session is available or after getUser, upsert profile
      const userId =
        data.user?.id || (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert(
          {
            id: userId,
            first_name: firstName || null,
            last_name: lastName || null,
            gender: gender,
            subscription: null,
          },
          { onConflict: "id" }
        );
      }

      const userData = {
        email,
        role: selectedRole,
        isLoggedIn: true,
        registerTime: new Date().toISOString(),
        userId: userId,
      };
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      if (selectedRole === "trainer") {
        router.replace("/(tabs)");
      } else {
        router.replace("/setup");
      }
    } catch (error: any) {
      Alert.alert("Registration failed", error.message || "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <View style={styles.roleContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>I am a:</Text>

      <View style={styles.roleOptions}>
        <TouchableOpacity
          style={[
            styles.roleCard,
            {
              backgroundColor:
                selectedRole === "trainer" ? colors.primary : colors.lightGray,
              borderColor:
                selectedRole === "trainer" ? colors.primary : "transparent",
              borderWidth: 2,
            },
          ]}
          onPress={() => setSelectedRole("trainer")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="fitness"
            size={32}
            color={selectedRole === "trainer" ? colors.black : colors.primary}
          />
          <Text
            style={[
              styles.roleTitle,
              {
                color: selectedRole === "trainer" ? colors.black : colors.text,
              },
            ]}
          >
            Trainer
          </Text>
          <Text
            style={[
              styles.roleDescription,
              {
                color: selectedRole === "trainer" ? colors.black : colors.text,
                opacity: 0.7,
              },
            ]}
          >
            I coach and guide others
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleCard,
            {
              backgroundColor:
                selectedRole === "trainee" ? colors.primary : colors.lightGray,
              borderColor:
                selectedRole === "trainee" ? colors.primary : "transparent",
              borderWidth: 2,
            },
          ]}
          onPress={() => setSelectedRole("trainee")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person"
            size={32}
            color={selectedRole === "trainee" ? colors.black : colors.secondary}
          />
          <Text
            style={[
              styles.roleTitle,
              {
                color: selectedRole === "trainee" ? colors.black : colors.text,
              },
            ]}
          >
            Trainee
          </Text>
          <Text
            style={[
              styles.roleDescription,
              {
                color: selectedRole === "trainee" ? colors.black : colors.text,
                opacity: 0.7,
              },
            ]}
          >
            I want to get fit
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      {!isLogin && (
        <View style={{ gap: 12, marginBottom: 20 }}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              First name
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.lightGray, color: colors.text },
              ]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor={colors.text}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Last name
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.lightGray, color: colors.text },
              ]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor={colors.text}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Gender
            </Text>
            <View style={styles.choiceRow}>
              {[
                { key: "male", label: "Male" },
                { key: "female", label: "Female" },
              ].map((g) => (
                <TouchableOpacity
                  key={g.key}
                  style={[
                    styles.choiceChip,
                    {
                      backgroundColor:
                        gender === (g.key as any)
                          ? colors.primary
                          : colors.lightGray,
                    },
                  ]}
                  onPress={() => setGender(g.key as any)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color:
                        gender === (g.key as any) ? colors.black : colors.text,
                      fontWeight: "600",
                    }}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
        <TextInput
          style={[
            styles.textInput,
            { backgroundColor: colors.lightGray, color: colors.text },
          ]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={colors.text}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>
          Password
        </Text>
        <TextInput
          style={[
            styles.textInput,
            { backgroundColor: colors.lightGray, color: colors.text },
          ]}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor={colors.text}
          secureTextEntry
        />
      </View>

      {!isLogin && (
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Confirm Password
          </Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: colors.lightGray, color: colors.text },
            ]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor={colors.text}
            secureTextEntry
          />
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ThemedLoader
          message={isLogin ? "Logging you in..." : "Creating your account..."}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="fitness" size={48} color={colors.primary} />
            <Text style={[styles.appTitle, { color: colors.text }]}>
              ProFit
            </Text>
            <Text style={[styles.appSubtitle, { color: colors.text }]}>
              Your fitness journey starts here
            </Text>
          </View>

          {/* Auth Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: isLogin ? colors.primary : colors.lightGray,
                },
              ]}
              onPress={() => setIsLogin(true)}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: isLogin ? colors.black : colors.text },
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: !isLogin ? colors.primary : colors.lightGray,
                },
              ]}
              onPress={() => setIsLogin(false)}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: !isLogin ? colors.black : colors.text },
                ]}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Role Selection (only for Register) */}
          {!isLogin && renderRoleSelection()}

          {/* Form */}
          {renderForm()}

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={isLogin ? handleLogin : handleRegister}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionButtonText, { color: colors.black }]}>
              {isLogin ? "Login" : "Register"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.black} />
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text }]}>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {isLogin ? "Register" : "Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  roleContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  roleOptions: {
    gap: 12,
  },
  roleCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  choiceRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  choiceChip: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
});
