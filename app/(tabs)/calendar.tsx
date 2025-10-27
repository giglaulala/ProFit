import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import Colors from "../../constants/Colors";
import {
  getVideoByExerciseName,
  WorkoutVideo,
} from "../../constants/WorkoutVideos";
import { useLanguage } from "../../contexts/LanguageContext";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

interface WorkoutDay {
  date: string;
  workout: string;
  type: "cardio" | "weight" | "mobility" | "explosive";
  completed?: boolean;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  video: string;
  muscleGroup: string;
  equipment?: string;
}

interface WorkoutDetails {
  title: string;
  exercises: Exercise[];
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { t } = useLanguage();
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDay | null>(
    null
  );
  const [workoutRunning, setWorkoutRunning] = useState(false);
  const [workoutStartAt, setWorkoutStartAt] = useState<number | null>(null);
  const [workoutPopupStartTime, setWorkoutPopupStartTime] = useState<
    number | null
  >(null);
  const [completedExercisesCount, setCompletedExercisesCount] = useState(0);
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [freeDays, setFreeDays] = useState(3);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showHeightModal, setShowHeightModal] = useState(false);
  const [showFreeDaysModal, setShowFreeDaysModal] = useState(false);
  const [selectedWorkoutGoal, setSelectedWorkoutGoal] = useState("weight_loss");
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<WorkoutVideo | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [userCalendar, setUserCalendar] = useState<any | null>(null);
  const [calendarMap, setCalendarMap] = useState<Record<string, any>>({});
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    selectedDate?: string;
    selectedMinutes?: number;
    selectedCalories?: number;
    totalCompleted: number;
    totalMinutes: number;
    totalCalories: number;
  }>({ totalCompleted: 0, totalMinutes: 0, totalCalories: 0 });

  // Custom Alert States
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertData, setAlertData] = useState<{
    title: string;
    message: string;
    buttons: {
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }[];
  }>({ title: "", message: "", buttons: [] });
  const [completedExerciseIdxs, setCompletedExerciseIdxs] = useState<
    Set<number>
  >(new Set());
  const [goal, setGoal] = useState<
    "weight_loss" | "muscle_gain" | "maintenance" | "strength"
  >("weight_loss");
  const [level, setLevel] = useState<
    "amateur" | "beginner" | "medium" | "experienced" | "professional"
  >("amateur");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [firstName, setFirstName] = useState<string>("");

  // Monthly Goals State
  const [monthlyGoals, setMonthlyGoals] = useState({
    workoutGoal: 20,
    calorieGoal: 15000,
    minuteGoal: 1800,
  });
  const [monthlyProgress, setMonthlyProgress] = useState({
    workoutsCompleted: 0,
    caloriesBurned: 0,
    minutesExercised: 0,
  });
  const [weeklyProgress, setWeeklyProgress] = useState({
    workoutsCompleted: 0,
    caloriesBurned: 0,
    minutesExercised: 0,
  });

  const workoutGoals = [
    {
      id: "weight_loss",
      title: t("dashboard.weightLoss"),
      icon: "trending-down",
      color: colors.primary,
      image: require("../../assets/images/weightloss.jpeg"),
    },
    {
      id: "muscle_gain",
      title: t("dashboard.muscleGain"),
      icon: "fitness",
      color: colors.secondary,
      image: require("../../assets/images/MuscleGain.webp"),
    },
    {
      id: "maintenance",
      title: t("dashboard.maintenance"),
      icon: "body",
      color: colors.accent,
      image: require("../../assets/images/maintain.webp"),
    },
    {
      id: "strength",
      title: t("dashboard.strength"),
      icon: "barbell",
      color: colors.darkGreen,
      image: require("../../assets/images/strengthIncrease.jpg"),
    },
  ];

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

  const workoutDetails: Record<string, WorkoutDetails> = {
    cardio: {
      title: t("dashboard.cardioSession"),
      exercises: [
        {
          name: "Intervals",
          sets: 1,
          reps: "15 min",
          rest: "-",
          video: "Intervals",
          muscleGroup: "cardio",
        },
        {
          name: "Tempo Run",
          sets: 1,
          reps: "20 min",
          rest: "-",
          video: "Run",
          muscleGroup: "cardio",
        },
        {
          name: "Rowing Machine",
          sets: 1,
          reps: "12 min",
          rest: "-",
          video: "Row",
          muscleGroup: "cardio",
        },
        {
          name: "Assault Bike",
          sets: 1,
          reps: "10 min",
          rest: "-",
          video: "Bike",
          muscleGroup: "cardio",
        },
      ],
    },
    weight: {
      title: t("dashboard.weightTraining"),
      exercises: [
        {
          name: "Squats",
          sets: 4,
          reps: "6-10",
          rest: "3 min",
          video: "Squats",
          muscleGroup: "legs",
        },
        {
          name: "Bench Press",
          sets: 4,
          reps: "6-10",
          rest: "2-3 min",
          video: "Bench Press",
          muscleGroup: "chest",
        },
        {
          name: "Rows",
          sets: 3,
          reps: "8-12",
          rest: "2 min",
          video: "Rows",
          muscleGroup: "back",
        },
        {
          name: "Lat Pulldown",
          sets: 3,
          reps: "8-12",
          rest: "2 min",
          video: "Lat Pulldown",
          muscleGroup: "back",
        },
        {
          name: "Shoulder Press",
          sets: 3,
          reps: "8-12",
          rest: "2 min",
          video: "Military Press",
          muscleGroup: "shoulders",
        },
      ],
    },
    mobility: {
      title: t("dashboard.mobilityFlow"),
      exercises: [
        {
          name: "Hip Openers",
          sets: 2,
          reps: "60s",
          rest: "30s",
          video: "Mobility",
          muscleGroup: "mobility",
        },
        {
          name: "Thoracic Twists",
          sets: 2,
          reps: "60s",
          rest: "30s",
          video: "Mobility",
          muscleGroup: "mobility",
        },
        {
          name: "Hamstring Stretch",
          sets: 2,
          reps: "60s",
          rest: "30s",
          video: "Mobility",
          muscleGroup: "mobility",
        },
        {
          name: "Ankle Mobility",
          sets: 2,
          reps: "60s",
          rest: "30s",
          video: "Mobility",
          muscleGroup: "mobility",
        },
        {
          name: "Hip Flexor Stretch",
          sets: 2,
          reps: "60s",
          rest: "30s",
          video: "Mobility",
          muscleGroup: "mobility",
        },
      ],
    },
    explosive: {
      title: t("dashboard.explosiveTraining"),
      exercises: [
        {
          name: "Box Jumps",
          sets: 4,
          reps: "6-8",
          rest: "2-3 min",
          video: "Plyometrics",
          muscleGroup: "legs",
        },
        {
          name: "Sprints",
          sets: 4,
          reps: "3-4",
          rest: "2-3 min",
          video: "Sprint",
          muscleGroup: "full",
        },
        {
          name: "Medicine Ball Slams",
          sets: 4,
          reps: "8-10",
          rest: "2 min",
          video: "Plyometrics",
          muscleGroup: "full",
        },
        {
          name: "Broad Jumps",
          sets: 4,
          reps: "6-8",
          rest: "2-3 min",
          video: "Plyometrics",
          muscleGroup: "legs",
        },
        {
          name: "Plyo Push-ups",
          sets: 3,
          reps: "6-10",
          rest: "2 min",
          video: "Plyometrics",
          muscleGroup: "chest",
        },
      ],
    },
  };

  const handleWorkoutPress = (workout: WorkoutDay) => {
    setSelectedWorkout(workout);
    setWorkoutRunning(false);
    setWorkoutStartAt(null);
    setWorkoutPopupStartTime(Date.now()); // Track when popup is opened
    setCompletedExercisesCount(0);
    setCompletedExerciseIdxs(new Set());
    setShowWorkoutModal(true);
  };

  const estimateCaloriesFor = (minutes: number, type: string) => {
    // Simple estimation factors by workout type
    const factors: Record<string, number> = {
      cardio: 10,
      weight: 8,
      mobility: 5,
      explosive: 11,
      default: 7,
    };
    const f = factors[type] ?? factors.default;
    return Math.round(minutes * f);
  };

  const handleStartWorkout = () => {
    if (!workoutRunning) {
      setWorkoutRunning(true);
      setWorkoutStartAt(Date.now());
      setCompletedExercisesCount(0);
    }
  };

  const markExerciseCompleted = () => {
    setCompletedExercisesCount((c) => c + 1);
  };

  const toggleExerciseCompleted = (index: number) => {
    setCompletedExerciseIdxs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
        setCompletedExercisesCount((c) => Math.max(0, c - 1));
      } else {
        next.add(index);
        setCompletedExercisesCount((c) => c + 1);
      }
      return next;
    });
  };

  const showCustomAlertModal = (
    title: string,
    message: string,
    buttons: {
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }[]
  ) => {
    setAlertData({ title, message, buttons });
    setShowCustomAlert(true);
  };

  const handleFinishWorkout = async () => {
    // Check if all exercises are completed
    if (selectedWorkout) {
      const totalExercises =
        workoutDetails[selectedWorkout.type]?.exercises.length || 0;
      const completedCount = completedExerciseIdxs.size;

      if (completedCount < totalExercises) {
        showCustomAlertModal(
          "Incomplete Workout",
          `You have completed ${completedCount} out of ${totalExercises} exercises. Are you sure you want to finish the workout?`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Finish Anyway",
              style: "destructive",
              onPress: () => finishWorkoutProcess(),
            },
          ]
        );
        return;
      }
    }

    finishWorkoutProcess();
  };

  const finishWorkoutProcess = async () => {
    const totalMs = workoutStartAt ? Date.now() - workoutStartAt : 0;
    const totalMin = Math.max(1, Math.round(totalMs / 60000));

    // Calculate total time spent in workout popup
    const popupTimeMs = workoutPopupStartTime
      ? Date.now() - workoutPopupStartTime
      : 0;
    const popupTimeMin = Math.round(popupTimeMs / 60000);

    // Close first to avoid a re-render that shows Start button
    setShowWorkoutModal(false);

    // Persist completion
    try {
      if (selectedWorkout && userCalendar) {
        const updated = { ...userCalendar } as any;
        const todayIso = Object.keys(updated.plan || {}).find((iso: string) => {
          const d = new Date(iso);
          const dd = String(d.getDate()).padStart(2, "0");
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          return `${dd}.${mm}` === selectedWorkout.date;
        });
        if (todayIso && updated.plan[todayIso]) {
          updated.plan[todayIso].completed = true;
          const sessionType = selectedWorkout.type;
          const calories = estimateCaloriesFor(totalMin, sessionType);
          updated.plan[todayIso].stats = {
            minutes: totalMin,
            calories,
            completedAt: new Date().toISOString(),
          };
          await AsyncStorage.setItem("userCalendar", JSON.stringify(updated));
          setUserCalendar(updated);

          // Update progress tracking
          await updateProgress(1, calories, totalMin);
        }
      }
    } catch (e) {
      // ignore
    }

    // Reset flow state after close
    setWorkoutRunning(false);
    setWorkoutStartAt(null);
    setWorkoutPopupStartTime(null);
    setSelectedWorkout(null);

    // Notify user
    setTimeout(() => {
      showCustomAlertModal(
        t("dashboard.workoutFinished"),
        `Workout Time: ${totalMin} min\nTotal Time: ${popupTimeMin} min\nCompleted: ${completedExercisesCount}`,
        [{ text: "OK" }]
      );
    }, 0);
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
        return require("../../assets/images/chest.png");
      case "legs":
        return require("../../assets/images/quads.png");
      case "shoulders":
        return require("../../assets/images/shoulder.png");
      case "back":
        return require("../../assets/images/lats.png");
      case "arms":
        return require("../../assets/images/biceps.png");
      case "abs":
        return require("../../assets/images/abdomen.png");
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
        if (calStr) {
          const calendar = JSON.parse(calStr);
          setUserCalendar(calendar);
          // Update selectedDays from the loaded calendar
          if (calendar.selectedDays) {
            setSelectedDays(calendar.selectedDays);
          }
          // Update selectedWorkoutGoal from the loaded calendar
          if (calendar.goal) {
            setSelectedWorkoutGoal(calendar.goal);
          }
        }
        if (mapStr) setCalendarMap(JSON.parse(mapStr));
        // Load trainee settings from Supabase or fallback to AsyncStorage setup
        const { data: userInfo } = await supabase.auth.getUser();
        const userId = userInfo.user?.id;
        if (userId) {
          const { data: settings } = await supabase
            .from("trainee_settings")
            .select("goal, weight, height, free_days")
            .eq("id", userId)
            .maybeSingle();
          if (settings) {
            if (typeof settings.weight === "number") setWeight(settings.weight);
            if (typeof settings.height === "number") setHeight(settings.height);
            if (typeof settings.free_days === "number")
              setFreeDays(settings.free_days);
            if (typeof settings.goal === "string")
              setSelectedWorkoutGoal(settings.goal);
          } else {
            const setupStr = await AsyncStorage.getItem("userSetupData");
            if (setupStr) {
              const s = JSON.parse(setupStr);
              if (typeof s.weight === "number") setWeight(s.weight);
              if (typeof s.height === "number") setHeight(s.height);
              if (typeof s.freeDays === "number") setFreeDays(s.freeDays);
              if (typeof s.goal === "string") setSelectedWorkoutGoal(s.goal);
            }
          }

          // Load user's first name from profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name")
            .eq("id", userId)
            .maybeSingle();
          if (profile?.first_name) {
            setFirstName(profile.first_name);
          }

          // Load monthly goals and progress
          await Promise.all([
            loadMonthlyGoals(),
            loadMonthlyProgress(),
            loadWeeklyProgress(),
          ]);
        }
      } catch (e) {
        console.error("calendar load error", e);
      }
    })();
  }, []);

  const persistTraineeSettings = async (next: {
    weight?: number;
    height?: number;
    freeDays?: number;
    goal?: string;
  }) => {
    try {
      const { data: userInfo } = await supabase.auth.getUser();
      const userId = userInfo.user?.id;
      if (!userId) return;
      await supabase.from("trainee_settings").upsert(
        {
          id: userId,
          goal: next.goal ?? selectedWorkoutGoal,
          weight: next.weight ?? weight,
          height: next.height ?? height,
          free_days: next.freeDays ?? freeDays,
        },
        { onConflict: "id" }
      );
    } catch (e) {
      console.warn("persist settings failed", e);
    }
  };

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
        completed: Boolean(dp.completed),
      });
    });
    return items;
  }, [userCalendar]);

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

  const handleCalendarDatePress = (date: string) => {
    const workout = uiCalendarDays.find((w) => w.date === date);
    if (!workout) return;
    // Prefer plan-driven details when available
    const planObj = (userCalendar?.plan ?? {}) as Record<string, any>;
    const maybePlanEntry = Object.values(planObj).find((p: any) => {
      const d = new Date(p.date);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      return `${dd}.${mm}` === date;
    });
    if (maybePlanEntry && maybePlanEntry.completed) {
      showCustomAlertModal(
        t("dashboard.completed"),
        "This workout is marked as completed.",
        [
          {
            text: t("dashboard.viewSummary"),
            onPress: () => openSummaryForDate(date),
          },
          {
            text: t("dashboard.unmark"),
            style: "destructive",
            onPress: () => unmarkCompleted(date),
          },
          { text: t("dashboard.cancel"), style: "cancel" },
        ]
      );
      return;
    }
    if (maybePlanEntry) {
      // Map entry to our WorkoutDay type for the modal
      const first = maybePlanEntry.entries?.[0];
      const type = inferWorkoutType(first?.muscleGroups || []);
      handleWorkoutPress({
        date,
        workout: first?.name || workout.workout,
        type: type as any,
      });
      return;
    }
    handleWorkoutPress(workout);
  };

  const unmarkCompleted = async (date: string) => {
    try {
      if (!userCalendar) return;
      const updated = { ...userCalendar } as any;
      const todayIso = Object.keys(updated.plan || {}).find((iso: string) => {
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        return `${dd}.${mm}` === date;
      });
      if (todayIso && updated.plan[todayIso]) {
        const stats = updated.plan[todayIso].stats;
        updated.plan[todayIso].completed = false;
        delete updated.plan[todayIso].stats;
        await AsyncStorage.setItem("userCalendar", JSON.stringify(updated));
        setUserCalendar(updated);

        // Decrease progress counters if stats existed
        if (stats) {
          await updateProgress(-1, -stats.calories, -stats.minutes);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const openSummaryForDate = (date: string) => {
    const planObj = (userCalendar?.plan ?? {}) as Record<string, any>;
    // Selected day stats
    let selectedMinutes: number | undefined;
    let selectedCalories: number | undefined;
    Object.values(planObj).forEach((p: any) => {
      const d = new Date(p.date);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${dd}.${mm}`;
      if (key === date && p.completed && p.stats) {
        selectedMinutes = p.stats.minutes;
        selectedCalories = p.stats.calories;
      }
    });

    // Totals across plan
    let totalCompleted = 0;
    let totalMinutes = 0;
    let totalCalories = 0;
    Object.values(planObj).forEach((p: any) => {
      if (p.completed) {
        totalCompleted += 1;
        if (p.stats?.minutes) totalMinutes += p.stats.minutes;
        if (p.stats?.calories) totalCalories += p.stats.calories;
      }
    });

    setSummaryData({
      selectedDate: date,
      selectedMinutes,
      selectedCalories,
      totalCompleted,
      totalMinutes,
      totalCalories,
    });
    setShowSummaryModal(true);
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
    const dayIdx = (d: Date) => d.getDay(); // 0..6
    const dowShort = (i: number) =>
      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i];

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
    const shareId = `ProFit-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
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

  const buildExercisesFor = (g: typeof goal, l: typeof level) => {
    const baseTime = {
      amateur: 40,
      beginner: 45,
      medium: 50,
      experienced: 55,
      professional: 60,
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

  // Build a varied day plan per goal and day-of-week
  function buildDailyPlanForGoal(
    g: typeof goal,
    l: typeof level,
    dayIndex: number
  ): { entries: any[]; restAfterEachSec: number } {
    const base = buildExercisesFor(g, l);
    const variedRest = (type: string) =>
      type === "cardio"
        ? 30
        : type === "mobility"
        ? 20
        : type === "explosive"
        ? 90
        : 60;

    // Choose a focus by cycling through logical types across the week
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

    // Start with goal-default set
    let entries = base().map((e) => ({
      name: e.name,
      muscleGroups: e.muscleGroups,
      equipment: e.equipment,
      durationSec: e.durationSec,
    }));

    // Adjust entries to match daily focus and mix types for calendar icons
    if (g === "weight_loss") {
      if (focus === "cardio") {
        entries = [
          {
            name: "Intervals",
            muscleGroups: ["cardio"],
            equipment: "None",
            durationSec: 20 * 60,
          },
          {
            name: "Tempo Run",
            muscleGroups: ["cardio"],
            equipment: "None",
            durationSec: 25 * 60,
          },
          {
            name: "Rowing Machine",
            muscleGroups: ["cardio"],
            equipment: "Gym",
            durationSec: 12 * 60,
          },
        ];
      } else if (focus === "mobility") {
        entries = [
          {
            name: "Hip Openers",
            muscleGroups: ["mobility"],
            equipment: "None",
            durationSec: 12 * 60,
          },
          {
            name: "Thoracic Twists",
            muscleGroups: ["mobility"],
            equipment: "None",
            durationSec: 12 * 60,
          },
          {
            name: "Hamstring Stretch",
            muscleGroups: ["mobility"],
            equipment: "None",
            durationSec: 8 * 60,
          },
        ];
      } else if (focus === "explosive") {
        entries = [
          {
            name: "Sprints",
            muscleGroups: ["explosive"],
            equipment: "None",
            durationSec: 15 * 60,
          },
          {
            name: "Box Jumps",
            muscleGroups: ["explosive"],
            equipment: "None",
            durationSec: 10 * 60,
          },
          {
            name: "Medicine Ball Slams",
            muscleGroups: ["explosive"],
            equipment: "Gym",
            durationSec: 8 * 60,
          },
        ];
      } else {
        // weight focus but lighter for weight loss
        entries = [
          {
            name: "Goblet Squat",
            muscleGroups: ["legs"],
            equipment: "Gym",
            durationSec: 12 * 60,
          },
          {
            name: "Incline DB Press",
            muscleGroups: ["chest"],
            equipment: "Gym",
            durationSec: 12 * 60,
          },
          {
            name: "Seated Cable Row",
            muscleGroups: ["back"],
            equipment: "Gym",
            durationSec: 10 * 60,
          },
        ];
      }
    } else if (g === "muscle_gain") {
      if (focus === "weight") {
        entries = [
          {
            name: "Back Squat",
            muscleGroups: ["legs"],
            equipment: "Gym",
            durationSec: 14 * 60,
          },
          {
            name: "Bench Press",
            muscleGroups: ["chest"],
            equipment: "Gym",
            durationSec: 14 * 60,
          },
          {
            name: "Row",
            muscleGroups: ["back"],
            equipment: "Gym",
            durationSec: 14 * 60,
          },
          {
            name: "Lat Pulldown",
            muscleGroups: ["back"],
            equipment: "Gym",
            durationSec: 10 * 60,
          },
        ];
      } else if (focus === "mobility") {
        entries = [
          {
            name: "Shoulder Mobility",
            muscleGroups: ["mobility"],
            equipment: "None",
            durationSec: 14 * 60,
          },
          {
            name: "Hip Mobility",
            muscleGroups: ["mobility"],
            equipment: "None",
            durationSec: 14 * 60,
          },
          {
            name: "Ankle Mobility",
            muscleGroups: ["mobility"],
            equipment: "None",
            durationSec: 8 * 60,
          },
        ];
      } else if (focus === "explosive") {
        entries = [
          {
            name: "Power Clean (technique)",
            muscleGroups: ["explosive"],
            equipment: "Gym",
            durationSec: 12 * 60,
          },
          {
            name: "Broad Jumps",
            muscleGroups: ["explosive"],
            equipment: "None",
            durationSec: 10 * 60,
          },
          {
            name: "Kettlebell Swings",
            muscleGroups: ["explosive"],
            equipment: "Gym",
            durationSec: 8 * 60,
          },
        ];
      } else {
        entries = [
          {
            name: "Tempo Run",
            muscleGroups: ["cardio"],
            equipment: "None",
            durationSec: 20 * 60,
          },
          {
            name: "Assault Bike",
            muscleGroups: ["cardio"],
            equipment: "Gym",
            durationSec: 10 * 60,
          },
        ];
      }
    } else if (g === "strength") {
      if (focus === "weight") {
        entries = [
          {
            name: "Deadlift",
            muscleGroups: ["back", "legs"],
            equipment: "Gym",
            durationSec: 18 * 60,
          },
          {
            name: "Overhead Press",
            muscleGroups: ["shoulders"],
            equipment: "Gym",
            durationSec: 14 * 60,
          },
          {
            name: "Weighted Pull-ups",
            muscleGroups: ["back"],
            equipment: "Gym",
            durationSec: 10 * 60,
          },
        ];
      } else if (focus === "explosive") {
        entries = [
          {
            name: "Sled Push",
            muscleGroups: ["explosive"],
            equipment: "Gym",
            durationSec: 15 * 60,
          },
          {
            name: "Box Jumps",
            muscleGroups: ["explosive"],
            equipment: "None",
            durationSec: 10 * 60,
          },
          {
            name: "Sprint Starts",
            muscleGroups: ["explosive"],
            equipment: "None",
            durationSec: 6 * 60,
          },
        ];
      } else if (focus === "mobility") {
        entries = [
          {
            name: "Ankle Mobility",
            muscleGroups: ["mobility"],
            equipment: "None",
            durationSec: 12 * 60,
          },
          {
            name: "T-Spine Mobility",
            muscleGroups: ["mobility"],
            equipment: "None",
            durationSec: 12 * 60,
          },
          {
            name: "Hip Flexor Stretch",
            muscleGroups: ["mobility"],
            equipment: "None",
            durationSec: 8 * 60,
          },
        ];
      } else {
        entries = [
          {
            name: "Intervals",
            muscleGroups: ["cardio"],
            equipment: "None",
            durationSec: 16 * 60,
          },
          {
            name: "Rower",
            muscleGroups: ["cardio"],
            equipment: "Gym",
            durationSec: 8 * 60,
          },
        ];
      }
    } else {
      // maintenance
      if (focus === "weight") {
        entries = [
          {
            name: "Full-body Circuit",
            muscleGroups: ["full"],
            equipment: "Gym",
            durationSec: 25 * 60,
          },
          {
            name: "Core Finisher",
            muscleGroups: ["abs"],
            equipment: "None",
            durationSec: 8 * 60,
          },
        ];
      } else if (focus === "cardio") {
        entries = [
          {
            name: "Cycling",
            muscleGroups: ["cardio"],
            equipment: "None",
            durationSec: 25 * 60,
          },
          {
            name: "Incline Walk",
            muscleGroups: ["cardio"],
            equipment: "Gym",
            durationSec: 10 * 60,
          },
        ];
      } else if (focus === "mobility") {
        entries = [
          {
            name: "Mobility Flow",
            muscleGroups: ["mobility"],
            equipment: "None",
            durationSec: 18 * 60,
          },
          {
            name: "Neck Mobility",
            muscleGroups: ["mobility"],
            equipment: "None",
            durationSec: 6 * 60,
          },
        ];
      } else {
        entries = [
          {
            name: "Sprints",
            muscleGroups: ["explosive"],
            equipment: "None",
            durationSec: 12 * 60,
          },
          {
            name: "Plyo Push-ups",
            muscleGroups: ["explosive"],
            equipment: "None",
            durationSec: 6 * 60,
          },
        ];
      }
    }

    // Determine rest based on dominant type to guide rest timer
    const dominantType = inferWorkoutType(entries[0]?.muscleGroups || []);
    return { entries, restAfterEachSec: variedRest(dominantType) };
  }

  const handleJoinCalendar = async () => {
    const code = joinCode.trim();
    if (!/^ProFit-\w{3,}$/i.test(code)) {
      alert("Invalid code. Format ProFit-XXXX");
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
        alert("No calendar found for this ID");
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
    } catch (e: any) {
      alert(e.message || "Failed to load calendar");
    }
  };

  const handleCreateCalendar = async () => {
    if (selectedDays.length === 0) {
      alert(t("dashboard.pickAtLeastOneDay"));
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

      // Update selectedWorkoutGoal based on the created calendar
      setSelectedWorkoutGoal(cal.goal);

      // Update freeDays to match the number of selected days
      const newFreeDays = selectedDays.length;
      setFreeDays(newFreeDays);
      persistTraineeSettings({ freeDays: newFreeDays });
    } catch (e: any) {
      alert(e.message || "Failed to create calendar");
    }
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
    persistTraineeSettings({ weight: newWeight });
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    persistTraineeSettings({ height: newHeight });
  };

  const handleFreeDaysChange = (newFreeDays: number) => {
    setFreeDays(newFreeDays);
    persistTraineeSettings({ freeDays: newFreeDays });
  };

  const handleWorkoutGoalPress = (goalId: string) => {
    setSelectedWorkoutGoal(goalId);
    setShowAllPlans(false); // Hide all plans and show only selected one
    persistTraineeSettings({ goal: goalId });
  };

  const handleVideoPress = (exerciseName: string, equipment?: string) => {
    const video = getVideoByExerciseName(exerciseName);
    if (video) {
      // attach equipment info temporarily on the video object for modal
      (video as any)._equipment = equipment;
      setSelectedVideo(video);
      setShowVideoPlayer(true);
    }
  };

  // Monthly Goals Functions
  const loadMonthlyGoals = async () => {
    try {
      const { data: userInfo } = await supabase.auth.getUser();
      const userId = userInfo.user?.id;
      if (!userId) return;

      // Calculate workouts in current month only
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
      let calendarWorkoutCount = 0;

      if (userCalendar?.plan) {
        // Count only workouts in the current month
        Object.values(userCalendar.plan).forEach((dayPlan: any) => {
          const dayDate = new Date(dayPlan.date);
          const dayMonth = dayDate.toISOString().substring(0, 7);
          if (dayMonth === currentMonth) {
            calendarWorkoutCount++;
          }
        });
      }

      // Debug: Log the counts
      console.log("Current month:", currentMonth);
      console.log("Workouts in current month:", calendarWorkoutCount);
      console.log(
        "Total calendar entries:",
        userCalendar?.plan ? Object.keys(userCalendar.plan).length : 0
      );

      const { data, error } = await supabase.rpc(
        "get_or_create_monthly_goals",
        {
          p_user_id: userId,
        }
      );

      if (error) throw error;
      if (data && data.length > 0) {
        const goals = {
          workoutGoal:
            calendarWorkoutCount > 0
              ? calendarWorkoutCount
              : data[0].workout_goal,
          calorieGoal: data[0].calorie_goal,
          minuteGoal: data[0].minute_goal,
        };

        setMonthlyGoals(goals);

        // Update the database with the calculated workout goal if it's different
        if (
          calendarWorkoutCount > 0 &&
          calendarWorkoutCount !== data[0].workout_goal
        ) {
          await supabase
            .from("monthly_goals")
            .update({ workout_goal: calendarWorkoutCount })
            .eq("user_id", userId)
            .eq("month_year", currentMonth);
        }
      }
    } catch (error) {
      console.error("Error loading monthly goals:", error);
    }
  };

  const loadMonthlyProgress = async () => {
    try {
      const { data: userInfo } = await supabase.auth.getUser();
      const userId = userInfo.user?.id;
      if (!userId) return;

      const { data, error } = await supabase.rpc("get_monthly_progress", {
        p_user_id: userId,
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setMonthlyProgress({
          workoutsCompleted: data[0].workouts_completed,
          caloriesBurned: data[0].calories_burned,
          minutesExercised: data[0].minutes_exercised,
        });
      }
    } catch (error) {
      console.error("Error loading monthly progress:", error);
    }
  };

  const loadWeeklyProgress = async () => {
    try {
      const { data: userInfo } = await supabase.auth.getUser();
      const userId = userInfo.user?.id;
      if (!userId) return;

      const { data, error } = await supabase.rpc("get_weekly_progress", {
        p_user_id: userId,
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setWeeklyProgress({
          workoutsCompleted: data[0].workouts_completed,
          caloriesBurned: data[0].calories_burned,
          minutesExercised: data[0].minutes_exercised,
        });
      }
    } catch (error) {
      console.error("Error loading weekly progress:", error);
    }
  };

  const updateProgress = async (
    workouts: number,
    calories: number,
    minutes: number
  ) => {
    try {
      const { data: userInfo } = await supabase.auth.getUser();
      const userId = userInfo.user?.id;
      if (!userId) return;

      // Update monthly progress
      const { error: monthlyError } = await supabase.rpc(
        "update_monthly_progress",
        {
          p_user_id: userId,
          p_workouts: workouts,
          p_calories: calories,
          p_minutes: minutes,
        }
      );

      if (monthlyError) throw monthlyError;

      // Update weekly progress
      const { error: weeklyError } = await supabase.rpc(
        "update_weekly_progress",
        {
          p_user_id: userId,
          p_workouts: workouts,
          p_calories: calories,
          p_minutes: minutes,
        }
      );

      if (weeklyError) throw weeklyError;

      // Reload progress data
      await Promise.all([loadMonthlyProgress(), loadWeeklyProgress()]);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom", "right", "left"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        {/* Title */}
        <View
          style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Create Your Workout Calendar
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.text,
              opacity: 0.7,
            }}
          >
            Build a personalized schedule that fits your goals and lifestyle
          </Text>
        </View>

        {/* Calendar */}
        <View style={[styles.calendarContainer, { marginTop: 10 }]}>
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
                onPress={() => alert(`Share: ${userCalendar.shareCode}`)}
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
                    // Clear local calendar data
                    await AsyncStorage.removeItem("userCalendar");
                    setUserCalendar(null);
                    // Reset selectedDays when clearing calendar
                    setSelectedDays([]);

                    // Clear monthly goals and progress data from Supabase
                    const { data: userInfo } = await supabase.auth.getUser();
                    const userId = userInfo.user?.id;
                    if (userId) {
                      // Use the new clear_all_progress function for thorough cleanup
                      await supabase.rpc("clear_all_progress", {
                        p_user_id: userId,
                      });

                      // Reset progress state immediately
                      setMonthlyProgress({
                        workoutsCompleted: 0,
                        caloriesBurned: 0,
                        minutesExercised: 0,
                      });
                      setWeeklyProgress({
                        workoutsCompleted: 0,
                        caloriesBurned: 0,
                        minutesExercised: 0,
                      });

                      // Reload goals and progress to ensure clean state
                      await Promise.all([
                        loadMonthlyGoals(),
                        loadMonthlyProgress(),
                        loadWeeklyProgress(),
                      ]);
                    }
                  } catch (error) {
                    console.error("Error clearing calendar data:", error);
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

            {!workoutRunning && (
              <TouchableOpacity
                style={[
                  styles.timerButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => setWorkoutRunning(true)}
                activeOpacity={0.9}
              >
                <Ionicons name="play" size={16} color={colors.black} />
                <Text style={[styles.timerButtonText, { color: colors.black }]}>
                  {t("dashboard.startWorkout")}
                </Text>
              </TouchableOpacity>
            )}

            {workoutRunning && selectedWorkout && (
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
                      source={require("../../assets/images/gym.png")}
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

            {workoutRunning && (
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
                            onPress={() =>
                              handleVideoPress(
                                exercise.name,
                                exercise.equipment as any
                              )
                            }
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
                                  source={require("../../assets/images/gym.png")}
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
                                  source={require("../../assets/images/gym.png")}
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
                              style={[
                                styles.detailLabel,
                                { color: colors.text },
                              ]}
                            >
                              {t("dashboard.sets")}:
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
                              style={[
                                styles.detailLabel,
                                { color: colors.text },
                              ]}
                            >
                              {t("dashboard.reps")}:
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
                              style={[
                                styles.detailLabel,
                                { color: colors.text },
                              ]}
                            >
                              {t("dashboard.rest")}:
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
                            { backgroundColor: colors.darkGray },
                          ]}
                          onPress={() => toggleExerciseCompleted(index)}
                        >
                          <Ionicons
                            name={
                              completedExerciseIdxs.has(index)
                                ? "checkbox"
                                : "square-outline"
                            }
                            size={16}
                            color={colors.primary}
                          />
                          <Text
                            style={[
                              styles.timerButtonText,
                              { color: colors.primary },
                            ]}
                          >
                            {completedExerciseIdxs.has(index)
                              ? t("dashboard.completed")
                              : t("dashboard.markCompleted")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )
                  )}
              </ScrollView>
            )}

            {workoutRunning && (
              <TouchableOpacity
                style={[
                  styles.timerButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleFinishWorkout}
              >
                <Ionicons name="flag" size={16} color={colors.black} />
                <Text style={[styles.timerButtonText, { color: colors.black }]}>
                  {t("dashboard.finishWorkout")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Completed Day Summary Modal */}
      <Modal
        visible={showSummaryModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSummaryModal(false)}
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
                Workout Summary
              </Text>
              <TouchableOpacity onPress={() => setShowSummaryModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              {summaryData.selectedDate && (
                <Text style={{ color: colors.text }}>
                  Date: {summaryData.selectedDate}
                </Text>
              )}
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons name="fitness" size={18} color={colors.primary} />
                <Text style={{ color: colors.text }}>
                  {t("dashboard.completed")} workouts:{" "}
                  {summaryData.totalCompleted}
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={colors.secondary}
                />
                <Text style={{ color: colors.text }}>
                  Total minutes: {summaryData.totalMinutes}
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons name="flame" size={18} color={colors.accent} />
                <Text style={{ color: colors.text }}>
                  Total calories: {summaryData.totalCalories}
                </Text>
              </View>

              {(summaryData.selectedMinutes ||
                summaryData.selectedCalories) && (
                <View style={{ marginTop: 10 }}>
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: colors.text, fontSize: 16 },
                    ]}
                  >
                    Selected Day
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 6,
                    }}
                  >
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.secondary}
                    />
                    <Text style={{ color: colors.text }}>
                      Minutes: {summaryData.selectedMinutes ?? 0}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <Ionicons name="flame" size={16} color={colors.accent} />
                    <Text style={{ color: colors.text }}>
                      Calories: {summaryData.selectedCalories ?? 0}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setShowSummaryModal(false)}
              style={{
                marginTop: 16,
                alignSelf: "flex-end",
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: colors.black, fontWeight: "600" }}>
                Close
              </Text>
            </TouchableOpacity>
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
                {t("dashboard.editFreeDays")}
              </Text>
              <TouchableOpacity onPress={() => setShowFreeDaysModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.editModalBody}>
              <Text style={[styles.editModalLabel, { color: colors.text }]}>
                {t("dashboard.freeDaysPerWeek")}: {freeDays}
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

      {/* Video Player Modal */}
      <VideoPlayer
        visible={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
        video={selectedVideo}
        equipment={(selectedVideo as any)?._equipment}
      />

      {/* Custom Alert Modal */}
      <Modal
        visible={showCustomAlert}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCustomAlert(false)}
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
                {alertData.title}
              </Text>
              <TouchableOpacity onPress={() => setShowCustomAlert(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.alertMessage, { color: colors.text }]}>
              {alertData.message}
            </Text>

            <View style={styles.alertButtons}>
              {alertData.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.alertButton,
                    {
                      backgroundColor:
                        button.style === "destructive"
                          ? colors.secondary
                          : button.style === "cancel"
                          ? colors.lightGray
                          : colors.primary,
                    },
                  ]}
                  onPress={() => {
                    setShowCustomAlert(false);
                    if (button.onPress) {
                      button.onPress();
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.alertButtonText,
                      {
                        color:
                          button.style === "destructive"
                            ? colors.black
                            : button.style === "cancel"
                            ? colors.text
                            : colors.black,
                      },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Chat Button removed */}
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
  greetingText: {
    fontSize: 20,
    fontWeight: "600",
  },
  greeting: {
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 42,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
  // Progress mirror styles from progress tab, names prefixed to avoid clashes
  progressChartContainer: {
    padding: 20,
    paddingTop: 10,
  },
  progressChartCard: {
    padding: 20,
    borderRadius: 12,
  },
  progressChartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    marginBottom: 20,
  },
  progressBarContainer: {
    alignItems: "center",
    marginHorizontal: 6,
  },
  progressBarWrapper: {
    height: 100,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  progressBar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  progressBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  progressChartStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressChartStat: {
    alignItems: "center",
  },
  progressChartStatValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressChartStatLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  progressGoalsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  progressGoalCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  progressGoalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  progressGoalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 255, 136, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  progressGoalInfo: {
    flex: 1,
  },
  progressGoalTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressGoalProgress: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  progressGoalPercentage: {
    fontSize: 16,
    fontWeight: "bold",
  },
  progressBarOuter: {
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    borderRadius: 3,
  },
  progressAchievementsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  progressAchievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  progressAchievementCard: {
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  progressAchievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  progressAchievementTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
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
  alertMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  alertButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  alertButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  changePlanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  changePlanButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
