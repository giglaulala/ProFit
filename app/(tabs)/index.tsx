import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
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
import VideoPlayer from "../../components/VideoPlayer";
import WorkoutTimer from "../../components/WorkoutTimer";
import Colors from "../../constants/Colors";
import {
  getVideoByExerciseName,
  WorkoutVideo,
} from "../../constants/WorkoutVideos";

const { width } = Dimensions.get("window");

interface WorkoutDay {
  date: string;
  workout: string;
  type: "chest" | "legs" | "cardio" | "shoulders" | "back";
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  video: string;
  muscleGroup: string;
}

interface WorkoutDetails {
  title: string;
  exercises: Exercise[];
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDay | null>(
    null
  );
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(120);
  const [timerTitle, setTimerTitle] = useState("");
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [freeDays, setFreeDays] = useState(3);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showHeightModal, setShowHeightModal] = useState(false);
  const [showFreeDaysModal, setShowFreeDaysModal] = useState(false);
  const [selectedWorkoutGoal, setSelectedWorkoutGoal] = useState("weight_loss");
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<WorkoutVideo | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [userCalendar, setUserCalendar] = useState<any | null>(null);
  const [calendarMap, setCalendarMap] = useState<Record<string, any>>({});
  const [goal, setGoal] = useState<
    "weight_loss" | "muscle_gain" | "maintenance" | "strength"
  >("weight_loss");
  const [level, setLevel] = useState<
    "amateur" | "beginner" | "medium" | "experienced" | "professional"
  >("amateur");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const workoutGoals = [
    {
      id: "weight_loss",
      title: "Weight Loss",
      icon: "trending-down",
      color: colors.primary,
      image: require("../../assets/images/weightloss.jpeg"),
    },
    {
      id: "muscle_gain",
      title: "Muscle Gain",
      icon: "fitness",
      color: colors.secondary,
      image: require("../../assets/images/MuscleGain.webp"),
    },
    {
      id: "maintenance",
      title: "Maintain Form",
      icon: "body",
      color: colors.accent,
      image: require("../../assets/images/maintain.webp"),
    },
    {
      id: "strength",
      title: "Increase Strength",
      icon: "barbell",
      color: colors.darkGreen,
      image: require("../../assets/images/strengthIncrease.jpg"),
    },
  ];

  const roadmapCalendar: WorkoutDay[] = [
    { date: "18.06", workout: "Chest Workout", type: "chest" },
    { date: "20.06", workout: "Leg Day", type: "legs" },
    { date: "22.06", workout: "Cardio", type: "cardio" },
    { date: "24.06", workout: "Shoulder Workout", type: "shoulders" },
    { date: "26.06", workout: "Back Workout", type: "back" },
    { date: "28.06", workout: "Cardio", type: "cardio" },
    { date: "30.06", workout: "Chest Workout", type: "chest" },
    { date: "02.07", workout: "Leg Day", type: "legs" },
    { date: "04.07", workout: "Cardio", type: "cardio" },
    { date: "06.07", workout: "Shoulder Workout", type: "shoulders" },
    { date: "08.07", workout: "Back Workout", type: "back" },
    { date: "10.07", workout: "Cardio", type: "cardio" },
  ];

  const workoutDetails: Record<string, WorkoutDetails> = {
    chest: {
      title: "Chest Workout",
      exercises: [
        {
          name: "Bench Press",
          sets: 4,
          reps: "8-12",
          rest: "2 min",
          video: "Bench Press Video",
          muscleGroup: "chest",
        },
        {
          name: "Cable Fly",
          sets: 3,
          reps: "10-15",
          rest: "1.5 min",
          video: "Fly Video",
          muscleGroup: "chest",
        },
        {
          name: "Push-ups",
          sets: 3,
          reps: "15-20",
          rest: "1 min",
          video: "Push-ups Video",
          muscleGroup: "chest",
        },
      ],
    },
    legs: {
      title: "Leg Day",
      exercises: [
        {
          name: "Squats",
          sets: 4,
          reps: "8-12",
          rest: "3 min",
          video: "Squats Video",
          muscleGroup: "legs",
        },
        {
          name: "Lunges",
          sets: 3,
          reps: "10-15",
          rest: "2 min",
          video: "Lunges Video",
          muscleGroup: "legs",
        },
        {
          name: "Calf Raises",
          sets: 3,
          reps: "15-20",
          rest: "1 min",
          video: "Calf Raises Video",
          muscleGroup: "legs",
        },
        {
          name: "Deadlifts",
          sets: 3,
          reps: "6-10",
          rest: "3 min",
          video: "Deadlifts Video",
          muscleGroup: "legs",
        },
      ],
    },
    shoulders: {
      title: "Shoulder Workout",
      exercises: [
        {
          name: "Military Press",
          sets: 4,
          reps: "8-12",
          rest: "2 min",
          video: "Military Press Video",
          muscleGroup: "shoulders",
        },
        {
          name: "Lateral Raises",
          sets: 3,
          reps: "12-15",
          rest: "1.5 min",
          video: "Lateral Raises Video",
          muscleGroup: "shoulders",
        },
        {
          name: "Front Raises",
          sets: 3,
          reps: "12-15",
          rest: "1.5 min",
          video: "Front Raises Video",
          muscleGroup: "shoulders",
        },
        {
          name: "Rear Delt Flyes",
          sets: 3,
          reps: "12-15",
          rest: "1.5 min",
          video: "Rear Delt Flyes Video",
          muscleGroup: "shoulders",
        },
      ],
    },
    back: {
      title: "Back Workout",
      exercises: [
        {
          name: "Pull-ups",
          sets: 4,
          reps: "8-12",
          rest: "2 min",
          video: "Pull-ups Video",
          muscleGroup: "back",
        },
        {
          name: "Bent-over Rows",
          sets: 3,
          reps: "10-15",
          rest: "2 min",
          video: "Bent-over Rows Video",
          muscleGroup: "back",
        },
        {
          name: "Lat Pulldowns",
          sets: 3,
          reps: "12-15",
          rest: "1.5 min",
          video: "Lat Pulldowns Video",
          muscleGroup: "back",
        },
        {
          name: "T-Bar Rows",
          sets: 3,
          reps: "10-12",
          rest: "2 min",
          video: "T-Bar Rows Video",
          muscleGroup: "back",
        },
      ],
    },
    cardio: {
      title: "Cardio",
      exercises: [
        {
          name: "Running",
          sets: 1,
          reps: "30 min",
          rest: "0",
          video: "Running Video",
          muscleGroup: "cardio",
        },
        {
          name: "Cycling",
          sets: 1,
          reps: "25 min",
          rest: "0",
          video: "Cycling Video",
          muscleGroup: "cardio",
        },
        {
          name: "Jump Rope",
          sets: 1,
          reps: "20 min",
          rest: "0",
          video: "Jump Rope Video",
          muscleGroup: "cardio",
        },
      ],
    },
  };

  const handleWorkoutPress = (workout: WorkoutDay) => {
    setSelectedWorkout(workout);
    setShowWorkoutModal(true);
  };

  const handleTimerPress = (rest: string) => {
    // Convert rest time to seconds (e.g., "2 min" -> 120 seconds)
    const minutes = parseInt(rest.split(" ")[0]);
    setTimerDuration(minutes * 60);
    setTimerTitle(`Rest: ${rest}`);
    setShowTimer(true);
  };

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case "chest":
        return "body";
      case "legs":
        return "fitness";
      case "cardio":
        return "heart";
      case "shoulders":
        return "barbell";
      case "back":
        return "body";
      default:
        return "fitness";
    }
  };

  const getMuscleGroupIcon = (muscleGroup: string) => {
    switch (muscleGroup) {
      case "chest":
        return "body";
      case "legs":
        return "fitness";
      case "shoulders":
        return "barbell";
      case "back":
        return "body";
      case "arms":
        return "fitness";
      case "abs":
        return "body";
      case "cardio":
        return "heart";
      default:
        return "fitness";
    }
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    switch (muscleGroup) {
      case "chest":
        return colors.primary;
      case "legs":
        return colors.secondary;
      case "shoulders":
        return colors.accent;
      case "back":
        return colors.darkGreen;
      case "arms":
        return colors.purple;
      case "abs":
        return colors.blue;
      case "cardio":
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getMuscleGroupImage = (muscleGroup: string) => {
    switch (muscleGroup) {
      case "chest":
        return require("../../assets/images/muscles.png");
      case "legs":
        return require("../../assets/images/gym.png");
      case "shoulders":
        return require("../../assets/images/shoulder.png");
      case "back":
        return require("../../assets/images/muscles.png");
      case "arms":
        return require("../../assets/images/gym.png");
      case "abs":
        return require("../../assets/images/muscles.png");
      case "cardio":
        return require("../../assets/images/gym.png");
      default:
        return require("../../assets/images/gym.png");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [calStr, mapStr] = await Promise.all([
          AsyncStorage.getItem("userCalendar"),
          AsyncStorage.getItem("calendarShareMap"),
        ]);
        if (calStr) setUserCalendar(JSON.parse(calStr));
        if (mapStr) setCalendarMap(JSON.parse(mapStr));
      } catch (e) {
        console.error("calendar load error", e);
      }
    })();
  }, []);

  const uiCalendarDays: WorkoutDay[] = useMemo(() => {
    if (!userCalendar) return roadmapCalendar;
    // Adapt plan to WorkoutDay
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
      });
    });
    return items;
  }, [userCalendar]);

  function inferWorkoutType(muscles: string[]) {
    const m = muscles.join(" ").toLowerCase();
    if (m.includes("leg")) return "legs";
    if (m.includes("shoulder")) return "shoulders";
    if (m.includes("back")) return "back";
    if (m.includes("cardio")) return "cardio";
    return "chest";
  }

  const handleCalendarDatePress = (date: string) => {
    const workout = uiCalendarDays.find((w) => w.date === date);
    if (workout) {
      handleWorkoutPress(workout);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const generateCalendar = () => {
    const plan: Record<string, any> = {};
    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + 28);
    const dayName = (d: Date) =>
      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    const pickExercises = buildExercisesFor(goal, level);
    for (let dt = new Date(today); dt <= end; dt.setDate(dt.getDate() + 1)) {
      const dn = dayName(dt);
      const map: Record<string, string> = {
        Mon: "Mon",
        Tue: "Tue",
        Wed: "Wed",
        Thu: "Thu",
        Fri: "Fri",
        Sat: "Sat",
        Sun: "Sun",
      };
      if (!selectedDays.includes(map[dn] ?? dn)) continue;
      const iso = dt.toISOString().slice(0, 10);
      plan[iso] = { date: iso, entries: pickExercises(), restAfterEachSec: 60 };
    }
    const cal = {
      id: `cal_${Date.now()}`,
      goal,
      level,
      selectedDays,
      plan,
      shareCode: `ProFit-${Math.random()
        .toString(36)
        .slice(2, 5)
        .toUpperCase()}`,
    };
    return cal;
  };

  const buildExercisesFor = (g: typeof goal, l: typeof level) => {
    const baseTime = {
      amateur: 30,
      beginner: 35,
      medium: 40,
      experienced: 45,
      professional: 50,
    }[l];
    return () => {
      if (g === "weight_loss")
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
        ];
      if (g === "muscle_gain")
        return [
          {
            name: "Squats",
            muscleGroups: ["legs"],
            equipment: "Gym",
            durationSec: 12 * 60,
          },
          {
            name: "Bench Press",
            muscleGroups: ["chest"],
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
      if (g === "strength")
        return [
          {
            name: "Deadlift",
            muscleGroups: ["back", "legs"],
            equipment: "Gym",
            durationSec: 15 * 60,
          },
          {
            name: "Overhead Press",
            muscleGroups: ["shoulders"],
            equipment: "Gym",
            durationSec: 12 * 60,
          },
        ];
      return [
        {
          name: "Full-body Routine",
          muscleGroups: ["full"],
          equipment: "Gym",
          durationSec: 30 * 60,
        },
      ];
    };
  };

  const handleJoinCalendar = async () => {
    const code = joinCode.trim();
    if (!/^ProFit-\w{3,}$/i.test(code)) {
      alert("Invalid code. Format ProFit-XXX");
      return;
    }
    const cal = calendarMap[code];
    if (!cal) {
      alert("No calendar for this code");
      return;
    }
    await AsyncStorage.setItem("userCalendar", JSON.stringify(cal));
    setUserCalendar(cal);
  };

  const handleCreateCalendar = async () => {
    if (selectedDays.length === 0) {
      alert("Pick at least one day");
      return;
    }
    const cal = generateCalendar();
    const newMap = { ...calendarMap, [cal.shareCode]: cal };
    await Promise.all([
      AsyncStorage.setItem("userCalendar", JSON.stringify(cal)),
      AsyncStorage.setItem("calendarShareMap", JSON.stringify(newMap)),
    ]);
    setCalendarMap(newMap);
    setUserCalendar(cal);
  };

  const handleWeightPress = () => {
    setShowWeightModal(true);
  };

  const handleHeightPress = () => {
    setShowHeightModal(true);
  };

  const handleFreeDaysPress = () => {
    setShowFreeDaysModal(true);
  };

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
  };

  const handleFreeDaysChange = (newFreeDays: number) => {
    setFreeDays(newFreeDays);
  };

  const handleWorkoutGoalPress = (goalId: string) => {
    setSelectedWorkoutGoal(goalId);
  };

  const handleVideoPress = (exerciseName: string) => {
    const video = getVideoByExerciseName(exerciseName);
    if (video) {
      setSelectedVideo(video);
      setShowVideoPlayer(true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["right", "left"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        {/* Header */}
        <ImageBackground
          source={require("../../assets/images/fitness-equipment.jpg")}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <View style={styles.headerOverlay}>
            <Text style={[styles.appTitle, { color: colors.text }]}>
              ProFit
            </Text>
            <Text style={[styles.greeting, { color: colors.text }]}>
              VOLUME UP YOUR{"\n"}BODY GOALS
            </Text>
          </View>
        </ImageBackground>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.darkGray }]}
              onPress={handleWeightPress}
              activeOpacity={0.7}
            >
              <Ionicons name="scale-outline" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {weight}kg
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                WEIGHT
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.darkGray }]}
              onPress={handleHeightPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="resize-outline"
                size={24}
                color={colors.secondary}
              />
              <Text style={[styles.statValue, { color: colors.secondary }]}>
                {height}cm
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                HEIGHT
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.darkGray }]}
              onPress={handleFreeDaysPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color={colors.accent}
              />
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {freeDays}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                FREE DAYS
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workout Goals */}
        <View style={styles.goalsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            PERSONALIZED PLAN
          </Text>
          <View style={styles.goalsGrid}>
            {workoutGoals.map((goal, index) => (
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
        </View>

        {/* Weekly Stats */}
        <View style={styles.weeklyStatsContainer}>
          <View style={styles.weeklyStatsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              CALORIES
            </Text>
            <View style={styles.weeklyAverage}>
              <Text style={[styles.weeklyAverageLabel, { color: colors.text }]}>
                WEEKLY AVERAGE
              </Text>
              <Text
                style={[styles.weeklyAverageValue, { color: colors.primary }]}
              >
                102 CAL
              </Text>
            </View>
          </View>
          <View style={styles.weeklyGraph}>
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
              (day, index) => (
                <View key={day} style={styles.graphColumn}>
                  <View
                    style={[
                      styles.graphBar,
                      {
                        height: index === 2 ? 100 : 40,
                        backgroundColor:
                          index === 2 ? colors.primary : colors.darkGray,
                      },
                    ]}
                  />
                  <Text style={[styles.graphLabel, { color: colors.text }]}>
                    {day}
                  </Text>
                </View>
              )
            )}
          </View>
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
                  Find Calendar
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
                      Join
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
                  Create Calendar
                </Text>
                <Text style={{ color: colors.text, marginBottom: 6 }}>
                  Goal
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {[
                    ["weight_loss", "Weight loss"],
                    ["muscle_gain", "Muscle gain"],
                    ["maintenance", "Maintain"],
                    ["strength", "Strength"],
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
                  Level
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {[
                    "amateur",
                    "beginner",
                    "medium",
                    "experienced",
                    "professional",
                  ].map((l) => (
                    <TouchableOpacity
                      key={l}
                      onPress={() => setLevel(l as any)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor:
                          level === l ? colors.primary : colors.lightGray,
                      }}
                    >
                      <Text
                        style={{
                          color: level === l ? colors.black : colors.text,
                        }}
                      >
                        {l}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ color: colors.text, marginVertical: 6 }}>
                  Days
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => toggleDay(d)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 999,
                          backgroundColor: selectedDays.includes(d)
                            ? colors.primary
                            : colors.lightGray,
                        }}
                      >
                        <Text
                          style={{
                            color: selectedDays.includes(d)
                              ? colors.black
                              : colors.text,
                          }}
                        >
                          {d}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
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
                    Generate Calendar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {userCalendar && (
            <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => alert(`Share: ${userCalendar.shareCode}`)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: colors.darkGray,
                }}
              >
                <Text style={{ color: colors.text }}>Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await AsyncStorage.removeItem("userCalendar");
                  setUserCalendar(null);
                }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: colors.error,
                }}
              >
                <Text style={{ color: colors.background }}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Workout Details Modal */}
      <Modal
        visible={showWorkoutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWorkoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedWorkout && workoutDetails[selectedWorkout.type]?.title}
              </Text>
              <TouchableOpacity onPress={() => setShowWorkoutModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Muscle Group Indicator */}
            {selectedWorkout && (
              <View
                style={[
                  styles.muscleGroupIndicator,
                  { backgroundColor: colors.lightGray },
                ]}
              >
                <Text style={[styles.muscleGroupTitle, { color: colors.text }]}>
                  Muscles Worked
                </Text>
                <View style={styles.muscleGroupIcons}>
                  <View style={styles.muscleGroupItem}>
                    <Image
                      source={require("../../assets/images/muscles.png")}
                      style={styles.muscleGroupImage}
                    />
                    <Text
                      style={[styles.muscleGroupName, { color: colors.text }]}
                    >
                      Triceps
                    </Text>
                  </View>
                  <View style={styles.muscleGroupItem}>
                    <Image
                      source={require("../../assets/images/gym.png")}
                      style={styles.muscleGroupImage}
                    />
                    <Text
                      style={[styles.muscleGroupName, { color: colors.text }]}
                    >
                      Chest
                    </Text>
                  </View>
                  <View style={styles.muscleGroupItem}>
                    <Image
                      source={require("../../assets/images/shoulder.png")}
                      style={styles.muscleGroupImage}
                    />
                    <Text
                      style={[styles.muscleGroupName, { color: colors.text }]}
                    >
                      Shoulders
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <ScrollView style={styles.modalBody}>
              {selectedWorkout &&
                workoutDetails[selectedWorkout.type]?.exercises.map(
                  (exercise, index) => (
                    <View
                      key={index}
                      style={[
                        styles.exerciseCard,
                        { backgroundColor: colors.lightGray },
                      ]}
                    >
                      <View style={styles.exerciseHeader}>
                        <View style={styles.exerciseTitleContainer}>
                          <Text
                            style={[
                              styles.exerciseName,
                              { color: colors.text },
                            ]}
                          >
                            {exercise.name}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.videoButton,
                            { backgroundColor: colors.lightGray },
                          ]}
                          onPress={() => handleVideoPress(exercise.name)}
                        >
                          <Ionicons
                            name="play"
                            size={16}
                            color={colors.primary}
                          />
                          <Text
                            style={[
                              styles.videoButtonText,
                              { color: colors.primary },
                            ]}
                          >
                            Video
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Exercise Muscle Groups */}
                      <View style={styles.exerciseMuscleGroups}>
                        {exercise.name === "Bench Press" && (
                          <>
                            <View style={styles.exerciseMuscleItem}>
                              <Image
                                source={require("../../assets/images/muscles.png")}
                                style={styles.exerciseMuscleIcon}
                              />
                              <Text
                                style={[
                                  styles.exerciseMuscleName,
                                  { color: colors.text },
                                ]}
                              >
                                Triceps
                              </Text>
                            </View>
                            <View style={styles.exerciseMuscleItem}>
                              <Image
                                source={require("../../assets/images/gym.png")}
                                style={styles.exerciseMuscleIcon}
                              />
                              <Text
                                style={[
                                  styles.exerciseMuscleName,
                                  { color: colors.text },
                                ]}
                              >
                                Chest
                              </Text>
                            </View>
                            <View style={styles.exerciseMuscleItem}>
                              <Image
                                source={require("../../assets/images/shoulder.png")}
                                style={styles.exerciseMuscleIcon}
                              />
                              <Text
                                style={[
                                  styles.exerciseMuscleName,
                                  { color: colors.text },
                                ]}
                              >
                                Shoulders
                              </Text>
                            </View>
                          </>
                        )}
                        {exercise.name === "Cable Fly" && (
                          <>
                            <View style={styles.exerciseMuscleItem}>
                              <Image
                                source={require("../../assets/images/gym.png")}
                                style={styles.exerciseMuscleIcon}
                              />
                              <Text
                                style={[
                                  styles.exerciseMuscleName,
                                  { color: colors.text },
                                ]}
                              >
                                Chest
                              </Text>
                            </View>
                            <View style={styles.exerciseMuscleItem}>
                              <Image
                                source={require("../../assets/images/shoulder.png")}
                                style={styles.exerciseMuscleIcon}
                              />
                              <Text
                                style={[
                                  styles.exerciseMuscleName,
                                  { color: colors.text },
                                ]}
                              >
                                Shoulders
                              </Text>
                            </View>
                          </>
                        )}
                        {exercise.name === "Push-ups" && (
                          <>
                            <View style={styles.exerciseMuscleItem}>
                              <Image
                                source={require("../../assets/images/muscles.png")}
                                style={styles.exerciseMuscleIcon}
                              />
                              <Text
                                style={[
                                  styles.exerciseMuscleName,
                                  { color: colors.text },
                                ]}
                              >
                                Triceps
                              </Text>
                            </View>
                            <View style={styles.exerciseMuscleItem}>
                              <Image
                                source={require("../../assets/images/gym.png")}
                                style={styles.exerciseMuscleIcon}
                              />
                              <Text
                                style={[
                                  styles.exerciseMuscleName,
                                  { color: colors.text },
                                ]}
                              >
                                Chest
                              </Text>
                            </View>
                            <View style={styles.exerciseMuscleItem}>
                              <Image
                                source={require("../../assets/images/shoulder.png")}
                                style={styles.exerciseMuscleIcon}
                              />
                              <Text
                                style={[
                                  styles.exerciseMuscleName,
                                  { color: colors.text },
                                ]}
                              >
                                Shoulders
                              </Text>
                            </View>
                          </>
                        )}
                      </View>

                      <View style={styles.exerciseDetails}>
                        <View style={styles.exerciseDetail}>
                          <Text
                            style={[styles.detailLabel, { color: colors.text }]}
                          >
                            Sets:
                          </Text>
                          <Text
                            style={[
                              styles.detailValue,
                              { color: colors.primary },
                            ]}
                          >
                            {exercise.sets}
                          </Text>
                        </View>
                        <View style={styles.exerciseDetail}>
                          <Text
                            style={[styles.detailLabel, { color: colors.text }]}
                          >
                            Reps:
                          </Text>
                          <Text
                            style={[
                              styles.detailValue,
                              { color: colors.primary },
                            ]}
                          >
                            {exercise.reps}
                          </Text>
                        </View>
                        <View style={styles.exerciseDetail}>
                          <Text
                            style={[styles.detailLabel, { color: colors.text }]}
                          >
                            Rest:
                          </Text>
                          <Text
                            style={[
                              styles.detailValue,
                              { color: colors.primary },
                            ]}
                          >
                            {exercise.rest}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.timerButton,
                          { backgroundColor: colors.lightGray },
                        ]}
                        onPress={() => handleTimerPress(exercise.rest)}
                      >
                        <Ionicons
                          name="timer-outline"
                          size={16}
                          color={colors.secondary}
                        />
                        <Text
                          style={[
                            styles.timerButtonText,
                            { color: colors.secondary },
                          ]}
                        >
                          Start Timer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )
                )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Weight Edit Modal */}
      <Modal
        visible={showWeightModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Weight
              </Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.editModalBody}>
              <Text style={[styles.editModalLabel, { color: colors.text }]}>
                Current Weight: {weight}kg
              </Text>
              <View style={styles.numberInputContainer}>
                <TouchableOpacity
                  style={[
                    styles.numberButton,
                    { backgroundColor: colors.darkGray },
                  ]}
                  onPress={() => handleWeightChange(Math.max(30, weight - 1))}
                >
                  <Ionicons name="remove" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.numberInput, { color: colors.primary }]}>
                  {weight}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.numberButton,
                    { backgroundColor: colors.darkGray },
                  ]}
                  onPress={() => handleWeightChange(Math.min(200, weight + 1))}
                >
                  <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.editModalUnit, { color: colors.text }]}>
                kg
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Height Edit Modal */}
      <Modal
        visible={showHeightModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHeightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Height
              </Text>
              <TouchableOpacity onPress={() => setShowHeightModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.editModalBody}>
              <Text style={[styles.editModalLabel, { color: colors.text }]}>
                Current Height: {height}cm
              </Text>
              <View style={styles.numberInputContainer}>
                <TouchableOpacity
                  style={[
                    styles.numberButton,
                    { backgroundColor: colors.darkGray },
                  ]}
                  onPress={() => handleHeightChange(Math.max(100, height - 1))}
                >
                  <Ionicons name="remove" size={24} color={colors.secondary} />
                </TouchableOpacity>
                <Text style={[styles.numberInput, { color: colors.secondary }]}>
                  {height}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.numberButton,
                    { backgroundColor: colors.darkGray },
                  ]}
                  onPress={() => handleHeightChange(Math.min(250, height + 1))}
                >
                  <Ionicons name="add" size={24} color={colors.secondary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.editModalUnit, { color: colors.text }]}>
                cm
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Free Days Edit Modal */}
      <Modal
        visible={showFreeDaysModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFreeDaysModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Edit Free Days
              </Text>
              <TouchableOpacity onPress={() => setShowFreeDaysModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.editModalBody}>
              <Text style={[styles.editModalLabel, { color: colors.text }]}>
                Free Days per Week: {freeDays}
              </Text>
              <View style={styles.numberInputContainer}>
                <TouchableOpacity
                  style={[
                    styles.numberButton,
                    { backgroundColor: colors.darkGray },
                  ]}
                  onPress={() =>
                    handleFreeDaysChange(Math.max(0, freeDays - 1))
                  }
                >
                  <Ionicons name="remove" size={24} color={colors.accent} />
                </TouchableOpacity>
                <Text style={[styles.numberInput, { color: colors.accent }]}>
                  {freeDays}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.numberButton,
                    { backgroundColor: colors.darkGray },
                  ]}
                  onPress={() =>
                    handleFreeDaysChange(Math.min(7, freeDays + 1))
                  }
                >
                  <Ionicons name="add" size={24} color={colors.accent} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.editModalUnit, { color: colors.text }]}>
                days per week
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Workout Timer Modal */}
      <WorkoutTimer
        visible={showTimer}
        onClose={() => setShowTimer(false)}
        duration={timerDuration}
        title={timerTitle}
      />

      {/* Video Player Modal */}
      <VideoPlayer
        visible={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
        video={selectedVideo}
      />

      {/* Floating Chat Button */}
      <TouchableOpacity
        style={[styles.floatingChatButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/chat")}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color={colors.black} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    height: 300,
    justifyContent: "flex-end",
  },
  headerBackgroundImage: {
    resizeMode: "cover",
  },
  headerOverlay: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(18, 18, 18, 0.8)",
  },
  appTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 20,
    opacity: 0.7,
  },
  greeting: {
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 42,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 60) / 3,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 15,
  },
  goalsContainer: {
    padding: 20,
  },
  goalsGrid: {
    gap: 15,
  },
  goalCardContainer: {
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
  },
  goalCard: {
    flex: 1,
  },
  goalCardImage: {
    resizeMode: "cover",
  },
  goalCardOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-end",
    backgroundColor: "rgba(18, 18, 18, 0.4)",
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(226, 255, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  goalDuration: {
    fontSize: 14,
    fontWeight: "600",
  },
  floatingSearchContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: 20,
    paddingTop: 10,
    backgroundColor: "transparent",
  },
  searchBarBlur: {
    borderRadius: 12,
    overflow: "hidden",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(226, 255, 0, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  paramsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  paramsCard: {
    padding: 15,
    borderRadius: 12,
  },
  paramItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  paramLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paramIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  paramLabel: {
    fontSize: 16,
  },
  paramValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  roadmapContainer: {
    padding: 20,
    paddingTop: 10,
  },
  weeklyStatsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  weeklyStatsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  weeklyAverage: {
    alignItems: "flex-end",
  },
  weeklyAverageLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  weeklyAverageValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  weeklyGraph: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 120,
    marginTop: 10,
  },
  graphColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  graphBar: {
    width: 30,
    borderRadius: 15,
    marginBottom: 8,
  },
  graphLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  calendarContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalBody: {
    maxHeight: 400,
  },
  exerciseCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  videoButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  exerciseDetails: {
    marginBottom: 10,
  },
  exerciseDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  timerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  timerButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  editModalBody: {
    alignItems: "center",
  },
  editModalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  numberInput: {
    fontSize: 16,
    fontWeight: "bold",
  },
  editModalUnit: {
    fontSize: 12,
    fontWeight: "600",
  },
  decorationsContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  greenCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(226,255,0,0.18)",
    top: -80,
    left: -60,
    filter: "blur(24px)",
  },
  greenCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(226,255,0,0.12)",
    bottom: 60,
    right: -40,
    filter: "blur(18px)",
  },
  greenCircle3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(226,255,0,0.10)",
    top: 300,
    left: 80,
    filter: "blur(12px)",
  },
  selectedIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingChatButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  muscleGroupIndicator: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  muscleGroupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  muscleGroupIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  muscleGroupImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  muscleGroupName: {
    fontSize: 16,
    fontWeight: "600",
  },
  muscleGroupIconImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  muscleGroupItem: {
    alignItems: "center",
  },
  exerciseMuscleGroups: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    marginBottom: 10,
  },
  exerciseMuscleItem: {
    alignItems: "center",
  },
  exerciseMuscleIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  exerciseMuscleName: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});
