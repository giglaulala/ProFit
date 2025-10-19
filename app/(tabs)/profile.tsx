import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../../constants/Colors";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [notifications, setNotifications] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [language, setLanguage] = useState<"en" | "ka">("en");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  // Stats data from Supabase
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);

  const [isEditVisible, setIsEditVisible] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadUserData();
    loadLanguage();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      if (data) {
        const parsed = JSON.parse(data);
        setUserData(parsed);
        setEditEmail(parsed?.email ?? "");
        if (parsed?.userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, subscription")
            .eq("id", parsed.userId)
            .maybeSingle();
          if (profile) {
            setFirstName(profile.first_name ?? "");
            setLastName(profile.last_name ?? "");
            setUserData((u: any) => ({
              ...(u ?? {}),
              subscription: profile.subscription ?? u?.subscription,
            }));
          }

          const { data: settings } = await supabase
            .from("trainee_settings")
            .select("goal, weight, height, free_days")
            .eq("id", parsed.userId)
            .maybeSingle();
          if (settings) {
            setUserData((u: any) => ({
              ...(u ?? {}),
              traineeSettings: settings,
            }));
          }

          // Load stats data from monthly progress
          const { data: progressData } = await supabase
            .from("monthly_progress")
            .select("workouts_completed, minutes_exercised")
            .eq("user_id", parsed.userId);

          if (progressData && progressData.length > 0) {
            const totalWorkoutsCount = progressData.reduce(
              (sum, p) => sum + (p.workouts_completed || 0),
              0
            );
            const totalMinutesCount = progressData.reduce(
              (sum, p) => sum + (p.minutes_exercised || 0),
              0
            );

            setTotalWorkouts(totalWorkoutsCount);
            setTotalMinutes(totalMinutesCount);
          }
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem("appLanguage");
      if (saved === "en" || saved === "ka") {
        setLanguage(saved);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  const handleLanguageChange = async (lang: "en" | "ka") => {
    try {
      setLanguage(lang);
      await AsyncStorage.setItem("appLanguage", lang);
      Alert.alert("Language", `Language changed to ${lang.toUpperCase()}`);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            // Clear user data
            await AsyncStorage.removeItem("userData");
            await AsyncStorage.removeItem("userSetupData");
            // Redirect to auth screen
            router.replace("/auth");
          } catch (error) {
            console.error("Error during logout:", error);
          }
        },
      },
    ]);
  };

  // Format minutes to hours and minutes
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const userStats = [
    { label: "Total Workouts", value: totalWorkouts.toString() },
    { label: "Workout Hours", value: formatMinutes(totalMinutes) },
  ];

  const menuItems = [{ title: "Edit Profile", icon: "person", action: "edit" }];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="person" size={40} color={colors.black} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {`${firstName || "Name"} ${lastName || "Surname"}`.trim()}
          </Text>
          <Text style={[styles.userLevel, { color: colors.primary }]}>
            Subscription: {userData?.subscription ?? "Free"}
          </Text>
          <Text style={[styles.userBio, { color: colors.text }]}>
            {userData?.email ?? "user@example.com"}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {userStats.map((stat, index) => (
              <View
                key={index}
                style={[styles.statCard, { backgroundColor: colors.lightGray }]}
              >
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions removed as requested */}

        {/* Menu Items (Account) */}
        <View style={styles.menuContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account
          </Text>
          <View
            style={[styles.menuCard, { backgroundColor: colors.lightGray }]}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.darkGray,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.action === "edit") {
                    setIsEditVisible(true);
                  }
                }}
              >
                <View style={styles.menuLeft}>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.menuTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.text}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings (moved below Account) */}
        <View style={styles.settingsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Settings
          </Text>
          <View
            style={[styles.settingsCard, { backgroundColor: colors.lightGray }]}
          >
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="notifications"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Notifications
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.darkGray, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="language" size={20} color={colors.secondary} />
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Language
                </Text>
              </View>
              <View style={styles.languageToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.languagePill,
                    {
                      backgroundColor:
                        language === "en" ? colors.primary : colors.darkGray,
                    },
                  ]}
                  onPress={() => handleLanguageChange("en")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: language === "en" ? colors.black : colors.text,
                    }}
                  >
                    EN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.languagePill,
                    {
                      backgroundColor:
                        language === "ka" ? colors.primary : colors.darkGray,
                    },
                  ]}
                  onPress={() => handleLanguageChange("ka")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: language === "ka" ? colors.black : colors.text,
                    }}
                  >
                    KA
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error }]}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color={colors.background} />
            <Text style={[styles.logoutText, { color: colors.background }]}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Profile
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Email
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.lightGray, color: colors.text },
                ]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter new email"
                placeholderTextColor={colors.text}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                New Password
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.lightGray, color: colors.text },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={colors.text}
                secureTextEntry
              />
            </View>

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
                placeholder="Confirm new password"
                placeholderTextColor={colors.text}
                secureTextEntry
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.darkGray },
                ]}
                onPress={() => {
                  setIsEditVisible(false);
                  setEditEmail(userData?.email ?? "");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={async () => {
                  try {
                    if (!editEmail || !editEmail.includes("@")) {
                      Alert.alert(
                        "Invalid Email",
                        "Please enter a valid email address."
                      );
                      return;
                    }
                    if (newPassword || confirmPassword) {
                      if (newPassword.length < 6) {
                        Alert.alert(
                          "Weak Password",
                          "Password must be at least 6 characters."
                        );
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        Alert.alert("Mismatch", "Passwords do not match.");
                        return;
                      }
                    }

                    const updated = {
                      ...(userData ?? {}),
                      email: editEmail,
                      ...(newPassword ? { password: newPassword } : {}),
                    };
                    await AsyncStorage.setItem(
                      "userData",
                      JSON.stringify(updated)
                    );
                    setUserData(updated);
                    Alert.alert("Saved", "Profile updated successfully.");
                    setIsEditVisible(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  } catch (error) {
                    console.error("Error updating profile:", error);
                    Alert.alert(
                      "Error",
                      "Could not update profile. Please try again."
                    );
                  }
                }}
              >
                <Text style={{ color: colors.black }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userLevel: {
    fontSize: 16,
    color: "#00ff88",
    fontWeight: "600",
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  statsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  settingsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  settingsCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
  },
  languageToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  languagePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  menuContainer: {
    padding: 20,
    paddingTop: 10,
  },
  menuCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuTitle: {
    fontSize: 16,
  },
  logoutContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
