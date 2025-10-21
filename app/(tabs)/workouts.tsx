import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useMemo, useState } from "react";
import {
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

import VideoPlayer from "../../components/VideoPlayer";
import WorkoutTimer from "../../components/WorkoutTimer";
import Colors from "../../constants/Colors";
import {
  getVideoByExerciseName,
  workoutVideos,
} from "../../constants/WorkoutVideos";
import { useLanguage } from "../../contexts/LanguageContext";

export default function WorkoutsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<"gym" | "home">("gym");
  const [mode, setMode] = useState<"body" | "category">("body");
  const [selectedBody, setSelectedBody] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFlowIndex, setExpandedFlowIndex] = useState<number | null>(
    null
  );
  const [videoVisible, setVideoVisible] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [timerVisible, setTimerVisible] = useState(false);
  const [timerSpec, setTimerSpec] = useState<{
    title: string;
    duration: number;
  }>({ title: "", duration: 0 });

  const bodyParts = useMemo(
    () => [
      { key: "chest", title: "Chest", icon: "body", color: colors.primary },
      { key: "back", title: "Back", icon: "barbell", color: colors.secondary },
      {
        key: "shoulders",
        title: "Shoulders",
        icon: "fitness",
        color: colors.accent,
      },
      { key: "legs", title: "Legs", icon: "walk", color: colors.darkGreen },
      { key: "core", title: "Core", icon: "trail-sign", color: colors.blue },
    ],
    [colors]
  );

  const categories = useMemo(
    () => [
      {
        key: "strength",
        title: "Strength",
        icon: "barbell",
        color: colors.primary,
      },
      {
        key: "cardio",
        title: "Cardio",
        icon: "heart",
        color: colors.secondary,
      },
      { key: "hiit", title: "HIIT", icon: "flash", color: colors.accent },
      { key: "yoga", title: "Yoga", icon: "leaf", color: colors.darkGreen },
    ],
    [colors]
  );

  // Simple mapping of videos by body part
  const videosByBody: Record<string, string[]> = useMemo(
    () => ({
      chest: ["bench-press", "dumbbell-fly", "push-ups", "incline-press"],
      back: ["pull-ups", "bent-over-rows", "lat-pulldowns"],
      shoulders: ["military-press", "lateral-raises", "front-raises"],
      legs: ["squats", "lunges", "deadlifts", "calf-raises"],
      core: ["push-ups", "plank"].filter(
        (id) => workoutVideos[id as keyof typeof workoutVideos]
      ),
    }),
    []
  );

  // Simple mapping of videos by category
  const videosByCategory: Record<string, string[]> = useMemo(
    () => ({
      strength: [
        "bench-press",
        "dumbbell-fly",
        "deadlifts",
        "lat-pulldowns",
        "military-press",
        "squats",
        "bent-over-rows",
      ],
      cardio: ["running", "cycling", "jump-rope"],
      hiit: ["jump-rope", "push-ups", "lunges"],
      yoga: [],
    }),
    []
  );

  // Simple mapping of Gym vs Home
  const locationAllowed: Record<"gym" | "home", Set<string>> = useMemo(
    () => ({
      gym: new Set([
        "bench-press",
        "dumbbell-fly",
        "incline-press",
        "deadlifts",
        "lat-pulldowns",
        "military-press",
        "bent-over-rows",
        "cycling",
      ]),
      home: new Set([
        "push-ups",
        "squats",
        "lunges",
        "jump-rope",
        "running",
        "calf-raises",
      ]),
    }),
    []
  );

  const flows = useMemo(
    () => [
      {
        title: "Popular: Full Body Starter",
        color: colors.primary,
        steps: [
          { name: "Jump Rope", duration: 60 },
          { name: "Push-ups", duration: 45 },
          { name: "Squats", duration: 60 },
          { name: "Lunges", duration: 45 },
        ],
      },
      {
        title: "Popular: Upper Body Strength",
        color: colors.secondary,
        steps: [
          { name: "Bench Press", duration: 60 },
          { name: "Dumbbell Fly", duration: 45 },
          { name: "Military Press", duration: 60 },
          { name: "Lateral Raises", duration: 45 },
        ],
      },
      {
        title: "Popular: Cardio Focus",
        color: colors.accent,
        steps: [
          { name: "Running", duration: 120 },
          { name: "Jump Rope", duration: 60 },
          { name: "Cycling", duration: 120 },
        ],
      },
    ],
    [colors]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredBodies = bodyParts.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentVideoIds = useMemo(() => {
    const base =
      mode === "body"
        ? selectedBody
          ? videosByBody[selectedBody] || []
          : []
        : selectedCategory
        ? videosByCategory[selectedCategory] || []
        : [];
    const allowed = locationAllowed[locationFilter];
    return base.filter((id) => allowed.size === 0 || allowed.has(id));
  }, [mode, selectedBody, selectedCategory, locationFilter]);

  const currentVideos = useMemo(
    () =>
      currentVideoIds
        .map((id) => workoutVideos[id as keyof typeof workoutVideos])
        .filter(Boolean)
        .filter((v) =>
          !searchQuery
            ? true
            : v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              v.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [currentVideoIds, searchQuery]
  );

  const openVideo = (name: string) => {
    const v = getVideoByExerciseName(name);
    if (!v) return;
    setActiveVideoId(v.id);
    setVideoVisible(true);
  };

  const openTimer = (title: string, duration: number) => {
    setTimerSpec({ title, duration });
    setTimerVisible(true);
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
          <Text style={[styles.subtitle, { color: colors.text }]}>
            {t("workouts.subtitle")}
          </Text>
        </View>

        {/* Location Filter */}
        <View style={styles.segmentContainer}>
          <View style={[styles.segment, { backgroundColor: colors.lightGray }]}>
            {(["gym", "home"] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.segmentButton,
                  {
                    backgroundColor:
                      locationFilter === opt ? colors.primary : "transparent",
                  },
                ]}
                onPress={() => setLocationFilter(opt)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    {
                      color:
                        locationFilter === opt ? colors.black : colors.text,
                    },
                  ]}
                >
                  {opt === "gym"
                    ? t("workouts.inGym")
                    : t("workouts.withoutGym")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mode Toggle */}
        <View style={styles.segmentContainer}>
          <View style={[styles.segment, { backgroundColor: colors.lightGray }]}>
            {(["body", "category"] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.segmentButton,
                  {
                    backgroundColor:
                      mode === opt ? colors.secondary : "transparent",
                  },
                ]}
                onPress={() => {
                  setMode(opt);
                  setSelectedBody(null);
                  setSelectedCategory(null);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    { color: mode === opt ? colors.black : colors.text },
                  ]}
                >
                  {opt === "body" ? t("workouts.body") : t("workouts.category")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selector Grid */}
        <View style={styles.categoriesContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {mode === "body"
              ? t("workouts.bodySelection")
              : t("workouts.categories")}
          </Text>
          <View style={styles.categoriesGrid}>
            {(mode === "body" ? filteredBodies : filteredCategories).map(
              (item) => {
                const isActive =
                  mode === "body"
                    ? selectedBody === item.key
                    : selectedCategory === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: isActive
                          ? item.color
                          : colors.lightGray,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (mode === "body") {
                        setSelectedBody(item.key);
                      } else {
                        setSelectedCategory(item.key);
                      }
                    }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={32}
                      color={isActive ? colors.black : item.color}
                    />
                    <Text
                      style={[styles.categoryTitle, { color: colors.text }]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        </View>

        {/* Videos List based on selection */}
        {(selectedBody || selectedCategory) && (
          <View style={styles.popularContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("workouts.videos")}
            </Text>
            {currentVideos.length === 0 ? (
              <Text style={{ color: colors.text, opacity: 0.7 }}>
                {t("workouts.noVideos")}
              </Text>
            ) : (
              currentVideos.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.workoutCard,
                    { backgroundColor: colors.lightGray },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => openVideo(v.title)}
                >
                  <View style={styles.workoutHeader}>
                    <View
                      style={[
                        styles.workoutIcon,
                        { backgroundColor: colors.darkGray },
                      ]}
                    >
                      <Ionicons
                        name="videocam"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.workoutInfo}>
                      <Text
                        style={[styles.workoutTitle, { color: colors.text }]}
                      >
                        {v.title}
                      </Text>
                      <Text
                        style={[styles.workoutSubtitle, { color: colors.text }]}
                      >
                        {v.duration}
                      </Text>
                    </View>
                    <Ionicons name="play" size={18} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Expandable Flows (replace Popular Workouts) */}
        <View style={styles.popularContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("workouts.popularWorkouts")}
          </Text>
          {flows
            .filter((f) =>
              f.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((flow, idx) => {
              const isOpen = expandedFlowIndex === idx;
              return (
                <View key={flow.title}>
                  <TouchableOpacity
                    style={[
                      styles.workoutCard,
                      { backgroundColor: colors.lightGray },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setExpandedFlowIndex(isOpen ? null : idx)}
                  >
                    <View style={styles.workoutHeader}>
                      <View
                        style={[
                          styles.workoutIcon,
                          { backgroundColor: flow.color },
                        ]}
                      >
                        <Ionicons
                          name="fitness"
                          size={24}
                          color={colors.black}
                        />
                      </View>
                      <View style={styles.workoutInfo}>
                        <Text
                          style={[styles.workoutTitle, { color: colors.text }]}
                        >
                          {flow.title}
                        </Text>
                        <Text
                          style={[
                            styles.workoutSubtitle,
                            { color: colors.text },
                          ]}
                        >
                          Tap to{" "}
                          {isOpen
                            ? t("workouts.tapToCollapse")
                            : t("workouts.tapToExpand")}
                        </Text>
                      </View>
                      <Ionicons
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={colors.text}
                      />
                    </View>
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={{ marginBottom: 12 }}>
                      {flow.steps.map((s, sIdx) => (
                        <View
                          key={sIdx}
                          style={[
                            styles.stepRow,
                            { backgroundColor: colors.darkGray },
                          ]}
                        >
                          <View style={styles.stepLeft}>
                            <Text
                              style={[
                                styles.stepIndex,
                                { color: colors.primary },
                              ]}
                            >
                              {sIdx + 1}
                            </Text>
                            <Text
                              style={[styles.stepTitle, { color: colors.text }]}
                            >
                              {s.name}
                            </Text>
                          </View>
                          <View style={styles.stepActions}>
                            <TouchableOpacity
                              style={[
                                styles.stepButton,
                                { backgroundColor: colors.lightGray },
                              ]}
                              onPress={() => openVideo(s.name)}
                            >
                              <Ionicons
                                name="play"
                                size={16}
                                color={colors.primary}
                              />
                              <Text
                                style={[
                                  styles.stepButtonText,
                                  { color: colors.text },
                                ]}
                              >
                                {t("workouts.video")}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.stepButton,
                                { backgroundColor: colors.lightGray },
                              ]}
                              onPress={() => openTimer(s.name, s.duration)}
                            >
                              <Ionicons
                                name="time"
                                size={16}
                                color={colors.secondary}
                              />
                              <Text
                                style={[
                                  styles.stepButtonText,
                                  { color: colors.text },
                                ]}
                              >
                                {s.duration}s
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
        </View>
      </ScrollView>

      {/* Floating Search Bar */}
      <KeyboardAvoidingView
        style={styles.floatingSearchContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <BlurView intensity={20} tint="dark" style={styles.searchBarBlur}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={colors.primary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t("workouts.searchPlaceholder")}
              placeholderTextColor={colors.text + "80"}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </KeyboardAvoidingView>

      {/* Video Player Modal */}
      <VideoPlayer
        visible={videoVisible}
        onClose={() => setVideoVisible(false)}
        video={activeVideoId ? workoutVideos[activeVideoId] : null}
      />

      {/* Timer Modal */}
      <WorkoutTimer
        visible={timerVisible}
        onClose={() => setTimerVisible(false)}
        duration={timerSpec.duration}
        title={timerSpec.title}
      />
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  searchContainer: {
    padding: 20,
    paddingTop: 10,
  },
  searchBarBlur: {
    borderRadius: 12,
    padding: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
  },
  categoriesContainer: {
    padding: 20,
    paddingTop: 10,
  },
  segmentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    gap: 6,
    alignItems: "center",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  categoryCount: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  popularContainer: {
    padding: 20,
    paddingTop: 10,
  },
  workoutCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  workoutSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  workoutStats: {
    flexDirection: "row",
    gap: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  stepLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "800",
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  stepActions: {
    flexDirection: "row",
    gap: 8,
  },
  stepButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stepButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 12,
  },
  floatingSearchContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 20,
    zIndex: 1000,
  },
});
