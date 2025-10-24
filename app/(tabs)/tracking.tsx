import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useLanguage } from "../../contexts/LanguageContext";

export default function TrackingScreen() {
  const { t } = useLanguage();

  // Camera state
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(true); // Start with scanner visible
  const [permissionRequested, setPermissionRequested] = useState(false);

  useEffect(() => {
    // Automatically open QR scanner when tab is accessed
    openQRScanner();
  }, []);

  const openQRScanner = async () => {
    if (!permission) {
      if (!permissionRequested) {
        setPermissionRequested(true);
        Alert.alert(
          t("tracking.scanWorkoutQR"),
          t("tracking.requestingPermission"),
          [{ text: t("common.ok") }]
        );
      }
      return;
    }
    if (!permission.granted) {
      if (!permissionRequested) {
        setPermissionRequested(true);
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert(
            t("tracking.scanWorkoutQR"),
            t("tracking.cameraPermissionDenied"),
            [{ text: t("common.ok") }]
          );
          setShowScanner(false);
          return;
        }
      }
    }
    setScanned(false);
    setShowScanner(true);
  };

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

  return (
    <View style={styles.container}>
      {/* Camera Scanner */}
      {showScanner && permission?.granted ? (
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
      ) : (
        /* Fallback when camera permission is denied or not available */
        <View style={styles.fallbackContainer}>
          <View style={styles.fallbackContent}>
            <Ionicons name="camera-off" size={64} color="#666" />
            <Text style={styles.fallbackTitle}>Camera Access Required</Text>
            <Text style={styles.fallbackMessage}>
              Please allow camera access to scan QR codes
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setPermissionRequested(false);
                openQRScanner();
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeFallbackButton}
              onPress={() => setShowScanner(false)}
            >
              <Text style={styles.closeFallbackButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  fallbackContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackContent: {
    alignItems: "center",
    padding: 40,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  fallbackMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  closeFallbackButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  closeFallbackButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});
