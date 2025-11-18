import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  DeviceEventEmitter,
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

// Calendar generation functions
const buildExercisesFor = (
  goal: "weight_loss" | "muscle_gain" | "maintenance" | "strength",
  level: "amateur" | "beginner" | "medium" | "experienced" | "professional" = "beginner"
) => {
  const baseTime = {
    amateur: 40,
    beginner: 45,
    medium: 50,
    experienced: 55,
    professional: 60,
  }[level];
  
  if (goal === "weight_loss")
    return [
      {
        name: "Jogging",
        muscleGroups: ["cardio"],
        equipment: "None",
        durationSec: baseTime * 60,
      },
      {
        name: "Bodyweight Circuit",
        muscleGroups: ["full"],
        equipment: "None",
        durationSec: 15 * 60,
      },
      {
        name: "Jump Rope",
        muscleGroups: ["cardio"],
        equipment: "None",
        durationSec: 10 * 60,
      },
    ];
  if (goal === "muscle_gain")
    return [
      {
        name: "Bench Press",
        muscleGroups: ["chest"],
        equipment: "Gym",
        durationSec: 12 * 60,
      },
      {
        name: "Bent-over Rows",
        muscleGroups: ["back"],
        equipment: "Gym",
        durationSec: 12 * 60,
      },
      {
        name: "Squats",
        muscleGroups: ["legs"],
        equipment: "Gym",
        durationSec: 12 * 60,
      },
    ];
  if (goal === "maintenance")
    return [
      {
        name: "Running",
        muscleGroups: ["cardio"],
        equipment: "None",
        durationSec: 25 * 60,
      },
      {
        name: "Push-ups",
        muscleGroups: ["chest"],
        equipment: "None",
        durationSec: 10 * 60,
      },
      {
        name: "Lunges",
        muscleGroups: ["legs"],
        equipment: "None",
        durationSec: 10 * 60,
      },
    ];
  return [
    {
      name: "Deadlifts",
      muscleGroups: ["back"],
      equipment: "Gym",
      durationSec: 12 * 60,
    },
    {
      name: "Military Press",
      muscleGroups: ["shoulders"],
      equipment: "Gym",
      durationSec: 12 * 60,
    },
    {
      name: "Rows",
      muscleGroups: ["back"],
      equipment: "Gym",
      durationSec: 12 * 60,
    },
  ];
};

function buildDailyPlanForGoal(
  goal: "weight_loss" | "muscle_gain" | "maintenance" | "strength",
  level: "amateur" | "beginner" | "medium" | "experienced" | "professional",
  dayIndex: number
): { entries: any[]; restAfterEachSec: number } {
  const base = buildExercisesFor(goal, level);
  const weeklyFocus: ("weight" | "cardio" | "mobility" | "explosive")[] = [
    "weight",
    "cardio",
    "weight",
    "mobility",
    "weight",
    "explosive",
    "mobility",
  ];
  const focus = weeklyFocus[dayIndex];
  const variedRest = (type: string) =>
    type === "cardio" ? 30 : type === "mobility" ? 20 : type === "explosive" ? 90 : 60;

  let entries = base.map((e) => ({ ...e }));
  const restAfterEachSec = variedRest(focus);
  return { entries, restAfterEachSec };
}

const generateCalendar = (
  goal: "weight_loss" | "muscle_gain" | "maintenance" | "strength",
  selectedDays: string[],
  level: "amateur" | "beginner" | "medium" | "experienced" | "professional" = "beginner"
) => {
  const plan: Record<string, any> = {};
  const today = new Date();
  const end = new Date();
  end.setDate(today.getDate() + 28);
  const dayIdx = (d: Date) => d.getDay();
  const dowShort = (i: number) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i];

  for (let dt = new Date(today); dt <= end; dt.setDate(dt.getDate() + 1)) {
    const di = dayIdx(dt);
    const dn = dowShort(di);
    if (!selectedDays.includes(dn)) continue;
    const iso = dt.toISOString().slice(0, 10);
    const dayPlan = buildDailyPlanForGoal(goal, level, di);
    plan[iso] = {
      date: iso,
      entries: dayPlan.entries,
      restAfterEachSec: dayPlan.restAfterEachSec,
    };
  }
  const shareId = `ProFit-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const cal = {
    id: shareId,
    goal,
    level,
    selectedDays,
    plan,
    shareCode: shareId,
  };
  return cal;
};

const createCalendarFromSetup = async (
  goal: "weight_loss" | "muscle_gain" | "maintenance" | "strength",
  selectedDays: string[],
  userId: string
) => {
  try {
    const cal = generateCalendar(goal, selectedDays, "beginner");
    const workoutGoals = [
      { id: "weight_loss", title: "Weight Loss" },
      { id: "muscle_gain", title: "Muscle Gain" },
      { id: "maintenance", title: "Maintain Form" },
      { id: "strength", title: "Increase Strength" },
    ];
    const fallbackTitle =
      (workoutGoals.find((g) => g.id === goal)?.title as string) || "Personalized Plan";
    const finalTitle = `${fallbackTitle} Plan`;

    console.log("Creating calendar in Supabase:", {
      id: cal.id,
      owner: userId,
      title: finalTitle,
      goal: cal.goal,
      level: cal.level,
      planKeys: Object.keys(cal.plan).length,
    });

    // Insert calendar into Supabase
    const { data: insertedData, error } = await supabase
      .from("calendars")
      .insert({
        id: cal.id,
        owner: userId,
        title: finalTitle,
        plan: cal.plan,
        goal: cal.goal,
        level: cal.level,
      })
      .select()
      .single();
    
    if (error) {
      // Log the full error for debugging
      console.error("Supabase calendar insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      
      // Only throw if it's not a duplicate (which is okay)
      if (!String(error.message || "").includes("duplicate")) {
        throw new Error(`Failed to save calendar to database: ${error.message}`);
      } else {
        console.log("Calendar already exists (duplicate), continuing...");
      }
    } else {
      console.log("Calendar successfully saved to Supabase:", insertedData?.id);
    }

    // Verify the calendar was saved by fetching it back
    const { data: verifyData, error: verifyError } = await supabase
      .from("calendars")
      .select("id, title, plan, owner, goal, level")
      .eq("id", cal.id)
      .eq("owner", userId)
      .single();

    if (verifyError) {
      console.warn("Warning: Could not verify calendar was saved:", verifyError.message);
    } else if (verifyData) {
      console.log("Calendar verified in Supabase:", verifyData.id);
    }

    const calWithTitle = {
      ...cal,
      title: finalTitle,
      shareCode: cal.shareCode ?? cal.id,
      selectedDays: [...selectedDays],
    };

    await AsyncStorage.setItem("userCalendar", JSON.stringify(calWithTitle));
    DeviceEventEmitter.emit("userCalendarUpdated");

    // Set flag to show greeting in calendar tab
    await AsyncStorage.setItem("showCalendarGreeting", "true");
    console.log("Calendar creation process completed successfully");
  } catch (e: any) {
    console.error("Error creating calendar:", {
      message: e.message,
      stack: e.stack,
      error: e,
    });
    // Don't throw - we don't want to block the user from proceeding
    // but log the error so we can debug
  }
};

export default function SetupScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [freeDays, setFreeDays] = useState("3");
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const workoutGoals = [
    {
      id: "weight_loss",
      title: "Weight Loss",
      icon: "trending-down",
      description: "Lose weight and improve fitness",
    },
    {
      id: "muscle_gain",
      title: "Muscle Gain",
      icon: "fitness",
      description: "Build muscle mass and strength",
    },
    {
      id: "maintenance",
      title: "Maintain Form",
      icon: "body",
      description: "Maintain current fitness level",
    },
    {
      id: "strength",
      title: "Increase Strength",
      icon: "barbell",
      description: "Improve physical strength",
    },
  ];

  const freeDaysOptions = [
    { value: "2", label: "2 days per week" },
    { value: "3", label: "3 days per week" },
    { value: "4", label: "4 days per week" },
    { value: "5", label: "5 days per week" },
    { value: "6", label: "6 days per week" },
  ];

  const weekdayOptions = [
    { value: "Mon", label: "Monday" },
    { value: "Tue", label: "Tuesday" },
    { value: "Wed", label: "Wednesday" },
    { value: "Thu", label: "Thursday" },
    { value: "Fri", label: "Friday" },
    { value: "Sat", label: "Saturday" },
    { value: "Sun", label: "Sunday" },
  ];

  const toggleWeekday = (day: string) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleNext = async () => {
    if (currentStep === 1 && !selectedGoal) {
      Alert.alert("Error", "Please select a workout goal");
      return;
    }
    if (currentStep === 2 && (!weight || !height)) {
      Alert.alert("Error", "Please enter weight and height");
      return;
    }
    if (currentStep === 3 && selectedWeekdays.length === 0) {
      Alert.alert("Error", "Please select at least one weekday for workouts");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show loader for a brief moment and navigate to main app
      setIsLoading(true);

      // Save the setup data and create calendar
      try {
        const setupData = {
          goal: selectedGoal,
          weight: parseFloat(weight),
          height: parseFloat(height),
          freeDays: selectedWeekdays.length,
          selectedWeekdays: selectedWeekdays,
          completedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem("userSetupData", JSON.stringify(setupData));
        console.log("Setup data saved:", setupData);

        // Persist to Supabase tied to the authenticated user
        const { data: userInfo } = await supabase.auth.getUser();
        const userId = userInfo.user?.id;
        if (userId) {
          // Save trainee settings first
          const { error: settingsError } = await supabase.from("trainee_settings").upsert(
            {
              id: userId,
              goal: setupData.goal,
              weight: setupData.weight,
              height: setupData.height,
              free_days: setupData.freeDays,
              completed_at: setupData.completedAt,
            },
            { onConflict: "id" }
          );

          if (settingsError) {
            console.error("Error saving trainee settings:", settingsError);
          }

          // Create calendar based on user inputs - wait for it to complete
          console.log("Starting calendar creation process...");
          try {
            await createCalendarFromSetup(
              selectedGoal as any,
              selectedWeekdays,
              userId
            );
            console.log("Calendar creation process finished");
            
            // Small delay to ensure database write is fully committed
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (calendarError: any) {
            console.error("Calendar creation failed:", calendarError);
            // Don't block user from proceeding, but log the error
            // The calendar tab will try to load from Supabase as fallback
          }
        } else {
          console.error("No user ID found, cannot create calendar");
          Alert.alert(
            "Warning",
            "Could not create calendar. Please create one manually from the Calendar tab."
          );
        }
      } catch (error) {
        console.error("Error saving setup data:", error);
        // Still allow user to proceed - they can create calendar manually
      }

      // Verify calendar was saved before navigating
      try {
        const verifyCal = await AsyncStorage.getItem("userCalendar");
        if (verifyCal) {
          const parsed = JSON.parse(verifyCal);
          console.log("Verification before navigation - Calendar in AsyncStorage:", {
            id: parsed.id,
            hasPlan: !!parsed.plan,
            planKeys: parsed.plan ? Object.keys(parsed.plan).length : 0,
          });
        } else {
          console.warn("WARNING: Calendar not found in AsyncStorage before navigation!");
        }
      } catch (e) {
        console.error("Error verifying calendar before navigation:", e);
      }

      // Navigate to Calendar tab after brief loader so the new plan is visible immediately
      setTimeout(() => {
        router.replace("/(tabs)/calendar");
      }, 1500); // 1.5 seconds loader
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetSetup = async () => {
    try {
      await AsyncStorage.removeItem("userSetupData");
      Alert.alert("Reset Complete", "Setup data has been cleared.");
    } catch (error) {
      console.error("Error resetting setup:", error);
    }
  };

  const debugSetupStatus = async () => {
    try {
      const data = await AsyncStorage.getItem("userSetupData");
      console.log("Current setup data:", data);
      Alert.alert("Debug Info", `Data: ${data || "none"}`);
    } catch (error) {
      console.error("Error checking setup data:", error);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Select Workout Goal
      </Text>
      <Text style={[styles.stepDescription, { color: colors.text }]}>
        What is your goal for starting to work out?
      </Text>

      <View style={styles.goalsContainer}>
        {workoutGoals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              {
                backgroundColor:
                  selectedGoal === goal.id ? colors.primary : colors.lightGray,
                borderColor:
                  selectedGoal === goal.id ? colors.primary : "transparent",
                borderWidth: 2,
              },
            ]}
            onPress={() => setSelectedGoal(goal.id)}
            activeOpacity={0.7}
          >
            <View style={styles.goalHeader}>
              <Ionicons
                name={goal.icon as any}
                size={32}
                color={
                  selectedGoal === goal.id
                    ? colors.black
                    : goal.id === "weight_loss"
                    ? colors.primary
                    : goal.id === "muscle_gain"
                    ? colors.secondary
                    : goal.id === "maintenance"
                    ? colors.accent
                    : colors.darkGreen
                }
              />
              <View style={styles.goalInfo}>
                <Text
                  style={[
                    styles.goalTitle,
                    {
                      color:
                        selectedGoal === goal.id ? colors.black : colors.text,
                    },
                  ]}
                >
                  {goal.title}
                </Text>
                <Text
                  style={[
                    styles.goalDescription,
                    {
                      color:
                        selectedGoal === goal.id ? colors.black : colors.text,
                      opacity: 0.7,
                    },
                  ]}
                >
                  {goal.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Enter Parameters
      </Text>
      <Text style={[styles.stepDescription, { color: colors.text }]}>
        Please provide your weight and height
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Weight (kg)
          </Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: colors.lightGray, color: colors.text },
            ]}
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 75"
            placeholderTextColor={colors.text}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            Height (cm)
          </Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: colors.lightGray, color: colors.text },
            ]}
            value={height}
            onChangeText={setHeight}
            placeholder="e.g. 180"
            placeholderTextColor={colors.text}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Free Weekdays</Text>
      <Text style={[styles.stepDescription, { color: colors.text }]}>
        Which days of the week are you available for workouts? Select all that apply.
      </Text>

      <View style={styles.weekdaysContainer}>
        {weekdayOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.weekdayOption,
              {
                backgroundColor:
                  selectedWeekdays.includes(option.value)
                    ? colors.primary
                    : colors.lightGray,
                borderColor:
                  selectedWeekdays.includes(option.value)
                    ? colors.primary
                    : "transparent",
                borderWidth: 2,
              },
            ]}
            onPress={() => toggleWeekday(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.weekdayOptionText,
                {
                  color: selectedWeekdays.includes(option.value)
                    ? colors.black
                    : colors.text,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Create Plan
      </Text>
      <Text style={[styles.stepDescription, { color: colors.text }]}>
        A personalized workout plan will be created based on your parameters
      </Text>

      <View style={[styles.summaryCard, { backgroundColor: colors.lightGray }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          Your Selection:
        </Text>

        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>
            Goal:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {workoutGoals.find((g) => g.id === selectedGoal)?.title}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>
            Weight:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.secondary }]}>
            {weight} kg
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>
            Height:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.accent }]}>
            {height} cm
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>
            Workout Days:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.darkGreen }]}>
            {selectedWeekdays.length > 0
              ? selectedWeekdays
                  .map((d) => weekdayOptions.find((o) => o.value === d)?.label)
                  .join(", ")
              : "None selected"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {isLoading ? (
        <ThemedLoader message="Setting up your workout plan..." />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: colors.lightGray },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(currentStep / 4) * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {currentStep}/4
            </Text>
            {/* Reset button for testing */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                { backgroundColor: colors.lightGray },
              ]}
              onPress={resetSetup}
            >
              <Ionicons name="refresh" size={16} color={colors.text} />
            </TouchableOpacity>
            {/* Debug button for testing */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                { backgroundColor: colors.lightGray },
              ]}
              onPress={debugSetupStatus}
            >
              <Ionicons
                name="information-circle"
                size={16}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.backButton,
                  { backgroundColor: colors.lightGray },
                ]}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
                <Text style={[styles.navButtonText, { color: colors.text }]}>
                  Back
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.navButton,
                styles.nextButton,
                { backgroundColor: colors.lightGray },
              ]}
              onPress={handleNext}
            >
              <Text style={[styles.navButtonText, { color: colors.text }]}>
                {currentStep === 4 ? "Finish" : "Next"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 15,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 30,
  },
  goalsContainer: {
    gap: 15,
  },
  goalCard: {
    padding: 20,
    borderRadius: 12,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  goalDescription: {
    fontSize: 14,
  },
  inputContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  textInput: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
  },
  daysContainer: {
    gap: 12,
  },
  dayOption: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  dayOptionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  weekdaysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  weekdayOption: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 100,
  },
  weekdayOptionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  navigationContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 15,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  backButton: {
    flex: 0.4,
  },
  nextButton: {
    flex: 0.6,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
  },
});
