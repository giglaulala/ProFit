import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

export default function TrackingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { t } = useLanguage();
  const [inputCode, setInputCode] = useState("");

  // Supabase data state
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [userWeight, setUserWeight] = useState<number | null>(null);
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Camera state
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const trackingFeatures = [
    {
      title: t("tracking.scanWorkoutQR"),
      icon: "qr-code-outline",
      color: colors.primary,
      action: "scan",
    },
    {
      title: t("tracking.recordWeight"),
      icon: "scale",
      color: colors.accent,
      action: "weight",
    },
    {
      title: t("tracking.bodyMeasurements"),
      icon: "resize",
      color: colors.darkGreen,
      action: "measurements",
    },
  ];

  // Load data from Supabase
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const { data: userInfo } = await supabase.auth.getUser();
      const userId = userInfo.user?.id;

      if (userId) {
        // Load user settings (weight, height)
        const { data: settings } = await supabase
          .from("trainee_settings")
          .select("weight, height")
          .eq("id", userId)
          .maybeSingle();

        if (settings) {
          setUserWeight(settings.weight);
          setUserHeight(settings.height);
        }

        // Load recent activities from monthly progress
        const { data: progress } = await supabase
          .from("monthly_progress")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(5);

        if (progress && progress.length > 0) {
          const activities = progress.map((p: any) => ({
            type: "Workout",
            title: `${p.workouts_completed} workouts completed`,
            time: new Date(p.updated_at).toLocaleDateString(),
            icon: "fitness",
            calories: p.calories_burned,
            minutes: p.minutes_exercised,
          }));
          setRecentActivities(activities);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setShowScanner(false);

    // Process the scanned QR code
    if (/^ProFit-\w{3,}$/i.test(data)) {
      Alert.alert(
        t("tracking.scanWorkoutQR"),
        `${t("tracking.detected")}: ${data}`,
        [{ text: t("common.ok") }]
      );
    } else if (/^[a-z0-9-]{3,}$/i.test(data)) {
      Alert.alert(
        t("tracking.scanWorkoutQR"),
        `${t("tracking.detected")}: ${data}`,
        [{ text: t("common.ok") }]
      );
    } else {
      Alert.alert(t("tracking.scanWorkoutQR"), t("tracking.invalidQRCode"), [
        { text: t("common.ok") },
      ]);
    }
  };

  const handleTrackingAction = async (action: string) => {
    if (action === "scan") {
      if (!permission) {
        Alert.alert(
          t("tracking.scanWorkoutQR"),
          t("tracking.requestingPermission"),
          [{ text: t("common.ok") }]
        );
        return;
      }
      if (!permission.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert(
            t("tracking.scanWorkoutQR"),
            t("tracking.cameraPermissionDenied"),
            [{ text: t("common.ok") }]
          );
          return;
        }
      }
      setScanned(false);
      setShowScanner(true);
    } else {
      console.log("Tracking action:", action);
    }
  };

  const handleSubmitCode = () => {
    const code = inputCode.trim();
    if (!code) return;
    if (/^ProFit-\w{3,}$/i.test(code)) {
      Alert.alert("Calendar Code", `Detected: ${code}`, [{ text: "OK" }]);
      return;
    }
    if (/^[a-z0-9-]{3,}$/i.test(code)) {
      Alert.alert("Workout Code", `Detected workout/video: ${code}`, [
        { text: "OK" },
      ]);
      return;
    }
    Alert.alert("Invalid Code", "Enter a valid ProFit code or workout id.");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("tracking.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            {t("tracking.subtitle")}
          </Text>
        </View>

        {/* Tracking Features */}
        <View style={styles.featuresContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("tracking.quickActions")}
          </Text>
          <View style={styles.featuresGrid}>
            {trackingFeatures.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.featureCard,
                  { backgroundColor: colors.lightGray },
                ]}
                activeOpacity={0.7}
                onPress={() => handleTrackingAction(feature.action)}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color={feature.color}
                  />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Code Entry Section (SDK53 fallback) */}
        <View style={styles.cameraContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Enter Workout/Calendar Code
          </Text>
          <View
            style={[styles.cameraCard, { backgroundColor: colors.lightGray }]}
          >
            <View style={styles.cameraContent}>
              <View
                style={[styles.cameraIcon, { backgroundColor: colors.primary }]}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={32}
                  color={colors.black}
                />
              </View>
              <View style={[styles.cameraInfo, { flex: 1 }]}>
                <Text style={[styles.cameraTitle, { color: colors.text }]}>
                  Enter code
                </Text>
                <TextInput
                  style={{
                    marginTop: 8,
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor: colors.darkGray,
                    color: colors.text,
                  }}
                  placeholder="ProFit-XXX or workout-id"
                  placeholderTextColor={colors.text}
                  value={inputCode}
                  onChangeText={setInputCode}
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity onPress={handleSubmitCode}>
                <Ionicons
                  name="arrow-forward-circle"
                  size={32}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activities
          </Text>
          <View style={styles.activitiesList}>
            {/* Weight Card */}
            {userWeight && (
              <View
                style={[
                  styles.activityCard,
                  { backgroundColor: colors.lightGray },
                ]}
              >
                <View style={styles.activityHeader}>
                  <View style={styles.activityIcon}>
                    <Ionicons name="scale" size={20} color={colors.accent} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text
                      style={[styles.activityType, { color: colors.accent }]}
                    >
                      Weight
                    </Text>
                    <Text
                      style={[styles.activityTitle, { color: colors.text }]}
                    >
                      {userWeight} kg
                    </Text>
                  </View>
                  <Text style={[styles.activityTime, { color: colors.text }]}>
                    Current
                  </Text>
                </View>
              </View>
            )}

            {/* Recent Workouts */}
            {recentActivities.map((activity, index) => (
              <View
                key={index}
                style={[
                  styles.activityCard,
                  { backgroundColor: colors.lightGray },
                ]}
              >
                <View style={styles.activityHeader}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={activity.icon as any}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text
                      style={[styles.activityType, { color: colors.primary }]}
                    >
                      {activity.type}
                    </Text>
                    <Text
                      style={[styles.activityTitle, { color: colors.text }]}
                    >
                      {activity.title}
                    </Text>
                    {activity.calories && (
                      <Text
                        style={[
                          styles.activitySubtitle,
                          { color: colors.text },
                        ]}
                      >
                        {activity.calories} calories • {activity.minutes} min
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.activityTime, { color: colors.text }]}>
                    {activity.time}
                  </Text>
                </View>
              </View>
            ))}

            {/* Empty state */}
            {recentActivities.length === 0 && !userWeight && (
              <View
                style={[
                  styles.activityCard,
                  { backgroundColor: colors.lightGray },
                ]}
              >
                <View style={styles.activityHeader}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color={colors.text}
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityType, { color: colors.text }]}>
                      No Activities
                    </Text>
                    <Text
                      style={[styles.activityTitle, { color: colors.text }]}
                    >
                      Complete workouts to see activity history
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Camera Scanner Modal */}
      {showScanner && (
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.scanner}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerHeader}>
              <TouchableOpacity
                onPress={() => setShowScanner(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.scannerTitle}>
                {t("tracking.scanWorkoutQR")}
              </Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.scannerFrame}>
              <View style={styles.scannerCorner} />
              <View
                style={[styles.scannerCorner, styles.scannerCornerTopRight]}
              />
              <View
                style={[styles.scannerCorner, styles.scannerCornerBottomLeft]}
              />
              <View
                style={[styles.scannerCorner, styles.scannerCornerBottomRight]}
              />
            </View>
            <Text style={styles.scannerInstruction}>
              {t("tracking.scanInstruction")}
            </Text>
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
  featuresContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "48%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  cameraContainer: {
    padding: 20,
    paddingTop: 10,
  },
  cameraCard: {
    borderRadius: 12,
    padding: 20,
  },
  cameraContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cameraIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  cameraInfo: {
    flex: 1,
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cameraSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  activitiesContainer: {
    padding: 20,
    paddingTop: 10,
  },
  activitiesList: {
    gap: 10,
  },
  activityCard: {
    padding: 15,
    borderRadius: 12,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(226, 255, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  activitySubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  videoCard: {
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  videoContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  videoSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  scannerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    alignItems: "center",
  },
  scannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    width: "100%",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  scannerCorner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "white",
    borderWidth: 3,
  },
  scannerCornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  scannerCornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  scannerCornerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scannerInstruction: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
});
