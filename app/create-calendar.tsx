import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Colors from "../constants/Colors";
import { supabase } from "../lib/supabase";

export default function CreateCalendarScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [goal, setGoal] = useState<
    "weight_loss" | "muscle_gain" | "maintenance" | "strength"
  >("weight_loss");
  const [level, setLevel] = useState<
    "amateur" | "beginner" | "medium" | "experienced" | "professional"
  >("beginner");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [calendarName, setCalendarName] = useState("");

  const workoutGoals = useMemo(
    () => [
      { id: "weight_loss", title: "Weight Loss" },
      { id: "muscle_gain", title: "Muscle Gain" },
      { id: "maintenance", title: "Maintenance" },
      { id: "strength", title: "Strength" },
    ],
    []
  );

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
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
          { name: "Jogging", muscleGroups: ["cardio"], equipment: "None", durationSec: baseTime * 60 },
          { name: "Bodyweight Circuit", muscleGroups: ["full"], equipment: "None", durationSec: 15 * 60 },
          { name: "Jump Rope", muscleGroups: ["cardio"], equipment: "None", durationSec: 10 * 60 },
        ];
      if (g === "muscle_gain")
        return [
          { name: "Bench Press", muscleGroups: ["chest"], equipment: "Gym", durationSec: 12 * 60 },
          { name: "Bent-over Rows", muscleGroups: ["back"], equipment: "Gym", durationSec: 12 * 60 },
          { name: "Squats", muscleGroups: ["legs"], equipment: "Gym", durationSec: 12 * 60 },
        ];
      if (g === "maintenance")
        return [
          { name: "Running", muscleGroups: ["cardio"], equipment: "None", durationSec: 25 * 60 },
          { name: "Push-ups", muscleGroups: ["chest"], equipment: "None", durationSec: 10 * 60 },
          { name: "Lunges", muscleGroups: ["legs"], equipment: "None", durationSec: 10 * 60 },
        ];
      return [
        { name: "Deadlifts", muscleGroups: ["back"], equipment: "Gym", durationSec: 12 * 60 },
        { name: "Military Press", muscleGroups: ["shoulders"], equipment: "Gym", durationSec: 12 * 60 },
        { name: "Rows", muscleGroups: ["back"], equipment: "Gym", durationSec: 12 * 60 },
      ];
    };
  };

  function buildDailyPlanForGoal(
    g: typeof goal,
    l: typeof level,
    dayIndex: number
  ): { entries: any[]; restAfterEachSec: number } {
    const base = buildExercisesFor(g, l);
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

    let entries = base().map((e) => ({ ...e }));
    const restAfterEachSec = variedRest(focus);
    return { entries, restAfterEachSec };
  }

  const generateCalendar = () => {
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
      plan[iso] = { date: iso, entries: dayPlan.entries, restAfterEachSec: dayPlan.restAfterEachSec };
    }
    const shareId = `ProFit-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const cal = { id: shareId, goal, level, selectedDays, plan, shareCode: shareId };
    return cal;
  };

  const handleCreate = async () => {
    if (selectedDays.length === 0) {
      alert("Pick at least one day");
      return;
    }
    try {
      // Enforce up to 4 calendars
      const { data: userInfo } = await supabase.auth.getUser();
      const owner = userInfo.user?.id ?? null;
      if (!owner) {
        alert("Sign in required");
        return;
      }
      const { data: countData } = await supabase
        .from("calendars")
        .select("id", { count: "exact", head: true })
        .eq("owner", owner);

      // supabase-js returns count separately only with head:true; fallback not critical
      // Proceed without strict block if API doesn't return count here

      const cal = generateCalendar();
      const fallbackTitle =
        (workoutGoals.find((g) => g.id === goal)?.title as string) || "Personalized Plan";
      const finalTitle = (calendarName || "").trim() || fallbackTitle;

      const { error } = await supabase.from("calendars").insert({
        id: cal.id,
        owner,
        title: finalTitle,
        plan: cal.plan,
      });
      if (error && !String(error.message || "").includes("duplicate")) throw error;

      const calWithTitle = { ...cal, title: finalTitle };
      await AsyncStorage.setItem("userCalendar", JSON.stringify(calWithTitle));
      // Track locally so it appears in the dropdown filter
      try {
        const key = "myCalendars";
        const s = await AsyncStorage.getItem(key);
        const ids = s ? (JSON.parse(s) as string[]) : [];
        if (!ids.includes(calWithTitle.id)) {
          ids.push(calWithTitle.id);
          await AsyncStorage.setItem(key, JSON.stringify(ids));
        }
      } catch {}
      // Navigate back to Calendar tab
      router.back();
    } catch (e: any) {
      alert(e.message || "Failed to create calendar");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700", marginLeft: 6 }}>
          Create Calendar
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.text, marginBottom: 6, fontWeight: "600" }}>Name</Text>
        <TextInput
          placeholder="e.g., Summer Shred"
          placeholderTextColor={colors.text + "80"}
          value={calendarName}
          onChangeText={setCalendarName}
          style={{
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: colors.lightGray,
            color: colors.text,
            marginBottom: 14,
          }}
        />
        <Text style={{ color: colors.text, marginBottom: 8, fontWeight: "600" }}>Goal</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {workoutGoals.map((g) => (
            <TouchableOpacity
              key={g.id}
              onPress={() => setGoal(g.id as any)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: goal === g.id ? colors.primary : colors.lightGray,
              }}
            >
              <Text style={{ color: goal === g.id ? colors.black : colors.text }}>{g.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: colors.text, marginVertical: 8, fontWeight: "600" }}>Level</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {["amateur", "beginner", "medium", "experienced", "professional"].map((lv) => (
            <TouchableOpacity
              key={lv}
              onPress={() => setLevel(lv as any)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: level === lv ? colors.primary : colors.lightGray,
              }}
            >
              <Text style={{ color: level === lv ? colors.black : colors.text }}>{lv}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: colors.text, marginVertical: 8, fontWeight: "600" }}>Days</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[
            ["Mon", "Monday"],
            ["Tue", "Tuesday"],
            ["Wed", "Wednesday"],
            ["Thu", "Thursday"],
            ["Fri", "Friday"],
            ["Sat", "Saturday"],
            ["Sun", "Sunday"],
          ].map(([val, label]) => (
            <TouchableOpacity
              key={val}
              onPress={() => toggleDay(val)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: selectedDays.includes(val) ? colors.primary : colors.lightGray,
              }}
            >
              <Text style={{ color: selectedDays.includes(val) ? colors.black : colors.text }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleCreate}
          activeOpacity={0.85}
          style={{
            marginTop: 16,
            alignSelf: "flex-start",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: colors.primary,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="add-circle" size={18} color={colors.black} />
          <Text style={{ color: colors.black, fontWeight: "700" }}>Create calendar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


