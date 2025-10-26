import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Calendar from "../../components/Calendar";
import Colors from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { supabase } from "../../lib/supabase";

interface WorkoutDay {
  date: string;
  workout: string;
  type: "cardio" | "weight" | "mobility" | "explosive";
  completed?: boolean;
}

const roadmapCalendar: WorkoutDay[] = [
  { date: "18.06", workout: "Intervals", type: "cardio" },
  { date: "20.06", workout: "Upper Body", type: "weight" },
  { date: "22.06", workout: "Mobility Flow", type: "mobility" },
  { date: "24.06", workout: "Plyometrics", type: "explosive" },
  { date: "26.06", workout: "Tempo Run", type: "cardio" },
  { date: "28.06", workout: "Lower Body", type: "weight" },
  { date: "30.06", workout: "Mobility Flow", type: "mobility" },
  { date: "02.07", workout: "Sprints", type: "explosive" },
  { date: "04.07", workout: "Intervals", type: "cardio" },
  { date: "06.07", workout: "Upper Body", type: "weight" },
  { date: "08.07", workout: "Mobility Flow", type: "mobility" },
  { date: "10.07", workout: "Plyometrics", type: "explosive" },
];

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { t } = useLanguage();
  const [userCalendar, setUserCalendar] = useState<any | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [selectedWorkoutGoal, setSelectedWorkoutGoal] = useState("weight_loss");
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [goal, setGoal] = useState<
    "weight_loss" | "muscle_gain" | "maintenance" | "strength"
  >("weight_loss");
  const [level, setLevel] = useState<
    "amateur" | "beginner" | "medium" | "experienced" | "professional"
  >("amateur");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    loadCalendar();
  }, []);

  const loadCalendar = async () => {
    try {
      const calStr = await AsyncStorage.getItem("userCalendar");
      if (calStr) {
        const calendar = JSON.parse(calStr);
        setUserCalendar(calendar);
      }
    } catch (error) {
      console.error("Error loading calendar:", error);
    }
  };

  const workoutGoals = [
    {
      id: "weight_loss",
      title: t("dashboard.weightLoss"),
      icon: "trending-down",
      image: require("../../assets/images/weightloss.jpeg"),
    },
    {
      id: "muscle_gain",
      title: t("dashboard.muscleGain"),
      icon: "fitness",
      image: require("../../assets/images/MuscleGain.webp"),
    },
    {
      id: "maintenance",
      title: t("dashboard.maintenance"),
      icon: "body",
      image: require("../../assets/images/maintain.webp"),
    },
    {
      id: "strength",
      title: t("dashboard.strength"),
      icon: "barbell",
      image: require("../../assets/images/strengthIncrease.jpg"),
    },
  ];

  function inferWorkoutType(muscles: string[]) {
    const m = muscles.join(" ").toLowerCase();
    if (m.includes("cardio") || m.includes("run") || m.includes("bike"))
      return "cardio";
    if (m.includes("mobility") || m.includes("stretch")) return "mobility";
    if (
      m.includes("plyo") ||
      m.includes("jump") ||
      m.includes("sprint") ||
      m.includes("explosive")
    )
      return "explosive";
    return "weight";
  }

  const uiCalendarDays: WorkoutDay[] = useMemo(() => {
    if (!userCalendar) return roadmapCalendar;
    const items: WorkoutDay[] = [];
    Object.values(userCalendar.plan || {}).forEach((dp: any) => {
      const d = new Date(dp.date);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const first = dp.entries?.[0];
      const type = inferWorkoutType(first?.muscleGroups || []);
      items.push({
        date: `${dd}.${mm}`,
        workout: first?.name || "Workout",
        type: type as any,
        completed: Boolean(dp.completed),
      });
    });
    return items;
  }, [userCalendar]);

  const handleCalendarDatePress = (date: string) => {
    Alert.alert("Workout", `Workout scheduled for ${date}`);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleJoinCalendar = async () => {
    const code = joinCode.trim();
    if (!/^ProFit-\w{3,}$/i.test(code)) {
      Alert.alert("Invalid code", "Format: ProFit-XXXX");
      return;
    }
    try {
      const { data: auth } = await supabase.auth.getUser();
      const currentUserId = auth.user?.id;
      const { data, error } = await supabase
        .from("calendars")
        .select("id, title, plan, owner")
        .eq("id", code)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        Alert.alert("Error", "No calendar found for this ID");
        return;
      }
      const isOwner =
        currentUserId && data.owner && currentUserId === data.owner;
      const cal = {
        id: data.id,
        plan: isOwner ? data.plan : {},
        shareCode: data.id,
      };
      await AsyncStorage.setItem("userCalendar", JSON.stringify(cal));
      setUserCalendar(cal);
      Alert.alert("Success", "Calendar joined successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to load calendar");
    }
  };

  const generateCalendar = () => {
    const plan: Record<string, any> = {};
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + 28);

    for (let dt = new Date(today); dt <= end; dt.setDate(dt.getDate() + 1)) {
      const di = dt.getDay();
      const dn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][di];
      if (!selectedDays.includes(dn)) continue;
      const iso = dt.toISOString().slice(0, 10);

      plan[iso] = {
        date: iso,
        entries: [
          {
            name: "Full-body Routine",
            muscleGroups: ["full"],
            equipment: "Gym",
            durationSec: 30 * 60,
          },
        ],
        completed: false,
      };
    }

    const shareId = `ProFit-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
    return {
      id: shareId,
      goal,
      level,
      selectedDays,
      plan,
      shareCode: shareId,
    };
  };

  const handleCreateCalendar = async () => {
    if (selectedDays.length === 0) {
      Alert.alert("Error", "Please select at least one day");
      return;
    }
    const cal = generateCalendar();
    try {
      const { data: userInfo } = await supabase.auth.getUser();
      const owner = userInfo.user?.id ?? null;
      const { error } = await supabase.from("calendars").insert({
        id: cal.id,
        owner,
        title: `${goal} plan`,
        plan: cal.plan,
      });
      if (error && !String(error.message || "").includes("duplicate")) {
        throw error;
      }
      await AsyncStorage.setItem("userCalendar", JSON.stringify(cal));
      setUserCalendar(cal);
      Alert.alert("Success", "Calendar created successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create calendar");
    }
  };

  const handleWorkoutGoalPress = (goalId: string) => {
    setSelectedWorkoutGoal(goalId);
    setShowAllPlans(false);
    persistTraineeSettings({ goal: goalId });
  };

  const persistTraineeSettings = async (next: { goal?: string }) => {
    try {
      const { data: userInfo } = await supabase.auth.getUser();
      const userId = userInfo.user?.id;
      if (!userId) return;
      await supabase.from("trainee_settings").upsert(
        {
          id: userId,
          goal: next.goal ?? selectedWorkoutGoal,
        },
        { onConflict: "id" }
      );
    } catch (e) {
      console.warn("persist settings failed", e);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("workouts.title")}
          </Text>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Workout Calendar
          </Text>
          <Calendar
            workoutDays={uiCalendarDays}
            onDatePress={handleCalendarDatePress}
          />
          {/* Find/Create controls */}
          {!userCalendar && (
            <View style={{ marginTop: 16, gap: 12 }}>
              <View
                style={[
                  styles.paramsCard,
                  { backgroundColor: colors.darkGray },
                ]}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  {t("dashboard.findCalendar")}
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: colors.lightGray,
                      color: colors.text,
                    }}
                    placeholder="ProFit-XXX"
                    placeholderTextColor={colors.text}
                    value={joinCode}
                    onChangeText={setJoinCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    onPress={handleJoinCalendar}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: colors.primary,
                    }}
                  >
                    <Text style={{ color: colors.black, fontWeight: "600" }}>
                      {t("dashboard.join")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View
                style={[
                  styles.paramsCard,
                  { backgroundColor: colors.darkGray },
                ]}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  {t("dashboard.createCalendar")}
                </Text>
                <Text style={{ color: colors.text, marginBottom: 6 }}>
                  {t("dashboard.goal")}
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {[
                    ["weight_loss", t("dashboard.weightLoss")],
                    ["muscle_gain", t("dashboard.muscleGain")],
                    ["maintenance", t("dashboard.maintain")],
                    ["strength", t("dashboard.strength")],
                  ].map(([val, label]) => (
                    <TouchableOpacity
                      key={val}
                      onPress={() => setGoal(val as any)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor:
                          goal === val ? colors.primary : colors.lightGray,
                      }}
                    >
                      <Text
                        style={{
                          color: goal === val ? colors.black : colors.text,
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ color: colors.text, marginVertical: 6 }}>
                  {t("dashboard.level")}
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {[
                    ["amateur", t("dashboard.amateur")],
                    ["beginner", t("dashboard.beginner")],
                    ["medium", t("dashboard.medium")],
                    ["experienced", t("dashboard.experienced")],
                    ["professional", t("dashboard.professional")],
                  ].map(([val, label]) => (
                    <TouchableOpacity
                      key={val}
                      onPress={() => setLevel(val as any)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor:
                          level === val ? colors.primary : colors.lightGray,
                      }}
                    >
                      <Text
                        style={{
                          color: level === val ? colors.black : colors.text,
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ color: colors.text, marginVertical: 6 }}>
                  {t("dashboard.days")}
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {[
                    ["Mon", t("calendar.monday")],
                    ["Tue", t("calendar.tuesday")],
                    ["Wed", t("calendar.wednesday")],
                    ["Thu", t("calendar.thursday")],
                    ["Fri", t("calendar.friday")],
                    ["Sat", t("calendar.saturday")],
                    ["Sun", t("calendar.sunday")],
                  ].map(([val, label]) => (
                    <TouchableOpacity
                      key={val}
                      onPress={() => toggleDay(val)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: selectedDays.includes(val)
                          ? colors.primary
                          : colors.lightGray,
                      }}
                    >
                      <Text
                        style={{
                          color: selectedDays.includes(val)
                            ? colors.black
                            : colors.text,
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleCreateCalendar}
                  style={{
                    marginTop: 10,
                    alignSelf: "flex-start",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ color: colors.black, fontWeight: "600" }}>
                    {t("dashboard.generateCalendar")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {userCalendar && (
            <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Share", `Code: ${userCalendar.shareCode}`)
                }
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: colors.darkGray,
                }}
              >
                <Text style={{ color: colors.text }}>
                  {t("dashboard.share")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem("userCalendar");
                    setUserCalendar(null);
                    setSelectedDays([]);
                    Alert.alert("Success", "Calendar cleared");
                  } catch (error) {
                    console.error("Error clearing calendar:", error);
                  }
                }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: colors.error,
                }}
              >
                <Text style={{ color: colors.background }}>
                  {t("dashboard.clear")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Workout Goals */}
        <View style={styles.goalsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            PERSONALIZED PLAN
          </Text>
          <View style={styles.goalsGrid}>
            {(showAllPlans
              ? workoutGoals
              : workoutGoals.filter((goal) => goal.id === selectedWorkoutGoal)
            ).map((goal, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.goalCardContainer,
                  selectedWorkoutGoal === goal.id && {
                    borderWidth: 2,
                    borderColor: colors.primary,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleWorkoutGoalPress(goal.id)}
              >
                <ImageBackground
                  source={goal.image}
                  style={styles.goalCard}
                  imageStyle={styles.goalCardImage}
                >
                  <View
                    style={[
                      styles.goalCardOverlay,
                      { backgroundColor: "rgba(18, 18, 18, 0.4)" },
                    ]}
                  >
                    <View
                      style={[
                        styles.goalIconContainer,
                        { backgroundColor: "rgba(226, 255, 0, 0.2)" },
                      ]}
                    >
                      <Ionicons
                        name={goal.icon as any}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <Text style={[styles.goalTitle, { color: colors.text }]}>
                      {goal.title.toUpperCase()}
                    </Text>
                    <Text
                      style={[styles.goalDuration, { color: colors.primary }]}
                    >
                      5-8 MIN
                    </Text>
                    {selectedWorkoutGoal === goal.id && (
                      <View
                        style={[
                          styles.selectedIndicator,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.black}
                        />
                      </View>
                    )}
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>

          {!showAllPlans && (
            <TouchableOpacity
              style={[
                styles.changePlanButton,
                { backgroundColor: colors.lightGray },
              ]}
              onPress={() => setShowAllPlans(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal" size={20} color={colors.text} />
              <Text
                style={[styles.changePlanButtonText, { color: colors.text }]}
              >
                Change the plan
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  calendarContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  paramsCard: {
    padding: 16,
    borderRadius: 12,
  },
  goalsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 15,
  },
  goalCardContainer: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
  },
  goalCard: {
    width: "100%",
    height: 180,
    justifyContent: "flex-end",
  },
  goalCardImage: {
    resizeMode: "cover",
  },
  goalCardOverlay: {
    padding: 15,
    alignItems: "center",
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 5,
  },
  goalDuration: {
    fontSize: 10,
    fontWeight: "600",
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  changePlanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
    gap: 8,
  },
  changePlanButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
