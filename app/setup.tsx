import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

export default function SetupScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [freeDays, setFreeDays] = useState("3");
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

  const handleNext = async () => {
    if (currentStep === 1 && !selectedGoal) {
      Alert.alert("Error", "Please select a workout goal");
      return;
    }
    if (currentStep === 2 && (!weight || !height)) {
      Alert.alert("Error", "Please enter weight and height");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show loader for a brief moment and navigate to main app
      setIsLoading(true);

      // Save the setup data (optional, for future use)
      try {
        const setupData = {
          goal: selectedGoal,
          weight: parseFloat(weight),
          height: parseFloat(height),
          freeDays: parseInt(freeDays),
          completedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem("userSetupData", JSON.stringify(setupData));
        console.log("Setup data saved:", setupData);
      } catch (error) {
        console.error("Error saving setup data:", error);
      }

      // Navigate to main app after brief loader
      setTimeout(() => {
        router.replace("/(tabs)");
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
      <Text style={[styles.stepTitle, { color: colors.text }]}>Free Days</Text>
      <Text style={[styles.stepDescription, { color: colors.text }]}>
        How many days do you have available for workouts per week?
      </Text>

      <View style={styles.daysContainer}>
        {freeDaysOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.dayOption,
              {
                backgroundColor:
                  freeDays === option.value ? colors.primary : colors.lightGray,
                borderColor:
                  freeDays === option.value ? colors.primary : "transparent",
                borderWidth: 2,
              },
            ]}
            onPress={() => setFreeDays(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayOptionText,
                {
                  color: freeDays === option.value ? colors.black : colors.text,
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
            Free Days:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.darkGreen }]}>
            {freeDaysOptions.find((d) => d.value === freeDays)?.label}
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
