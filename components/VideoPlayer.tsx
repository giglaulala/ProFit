import { Ionicons } from "@expo/vector-icons";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";
import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Colors from "../constants/Colors";
import { WorkoutVideo } from "../constants/WorkoutVideos";

interface VideoPlayerProps {
  visible: boolean;
  onClose: () => void;
  video: WorkoutVideo | null;
  equipment?: string;
}

const { width, height } = Dimensions.get("window");

export default function VideoPlayer({
  visible,
  onClose,
  video,
  equipment,
}: VideoPlayerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVideo = async () => {
    if (!video) return;

    if (video.type === "local" && video.localPath) {
      // For local videos, start playing
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pauseAsync();
        } else {
          videoRef.current.playAsync();
        }
      }
    } else if (video.type === "remote" && video.remoteUrl) {
      // For remote videos, open in YouTube app or browser
      try {
        const canOpen = await Linking.canOpenURL(video.remoteUrl);
        if (canOpen) {
          await Linking.openURL(video.remoteUrl);
        } else {
          Alert.alert(
            "Cannot Open Video",
            "Unable to open the video. Please check your internet connection.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        Alert.alert("Error", "Failed to open video. Please try again.", [
          { text: "OK" },
        ]);
      }
    }
  };

  const handleVideoStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    if (playbackStatus.isLoaded) {
      setIsPlaying(playbackStatus.isPlaying);
    }
  };

  const handleClose = () => {
    // Stop video playback when closing
    if (videoRef.current && isPlaying) {
      videoRef.current.stopAsync();
    }
    setIsPlaying(false);
    setStatus(null);
    onClose();
  };

  const handleDownloadVideo = () => {
    Alert.alert(
      "Video Information",
      `Title: ${video?.title}\nDuration: ${video?.duration}\nType: ${video?.type}\n\nThis video is stored locally on your device.`,
      [{ text: "OK" }]
    );
  };

  if (!video) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {video.title}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Video Player */}
          <View
            style={[
              styles.videoContainer,
              { backgroundColor: colors.darkGray },
            ]}
          >
            {video.type === "local" && video.localPath ? (
              <Video
                ref={videoRef}
                style={styles.video}
                source={video.localPath as any}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
                onPlaybackStatusUpdate={handleVideoStatusUpdate}
                shouldPlay={false}
              />
            ) : (
              <View style={styles.remoteVideoContainer}>
                <Ionicons name="globe" size={60} color={colors.secondary} />
                <Text
                  style={[styles.videoTypeText, { color: colors.secondary }]}
                >
                  ONLINE VIDEO
                </Text>
                <Text style={[styles.duration, { color: colors.text }]}>
                  {video.duration}
                </Text>
                <View
                  style={[
                    styles.videoInfo,
                    { backgroundColor: colors.secondary + "20" },
                  ]}
                >
                  <Ionicons name="wifi" size={16} color={colors.secondary} />
                  <Text
                    style={[styles.videoInfoText, { color: colors.secondary }]}
                  >
                    Requires internet connection
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Video Info */}
          <View style={styles.videoInfoSection}>
            <Text style={[styles.description, { color: colors.text }]}>
              {video.description}
            </Text>
            {equipment && equipment.toLowerCase() !== "none" && (
              <View style={styles.machineRow}>
                <Ionicons name="barbell" size={16} color={colors.primary} />
                <Text style={[styles.machineText, { color: colors.text }]}>
                  Machine: {equipment}
                </Text>
              </View>
            )}

            <View style={styles.videoStats}>
              <View style={styles.stat}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {video.duration}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons
                  name={
                    video.type === "local" ? "phone-portrait" : "globe-outline"
                  }
                  size={16}
                  color={
                    video.type === "local" ? colors.primary : colors.secondary
                  }
                />
                <Text style={[styles.statText, { color: colors.text }]}>
                  {video.type === "local" ? "Local" : "Online"}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {video.type === "local" && video.localPath ? (
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: colors.primary }]}
                onPress={handlePlayVideo}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={20}
                  color={colors.black}
                />
                <Text style={[styles.playButtonText, { color: colors.black }]}>
                  {isPlaying ? "Pause Video" : "Play Video"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: colors.primary }]}
                onPress={handlePlayVideo}
                activeOpacity={0.8}
              >
                <Ionicons name="open-outline" size={20} color={colors.black} />
                <Text style={[styles.playButtonText, { color: colors.black }]}>
                  Open Video
                </Text>
              </TouchableOpacity>
            )}

            {video.type === "local" && (
              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  { backgroundColor: colors.lightGray },
                ]}
                onPress={handleDownloadVideo}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={colors.text}
                />
                <Text
                  style={[styles.downloadButtonText, { color: colors.text }]}
                >
                  Video Info
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <Text
              style={[styles.infoText, { color: colors.text, opacity: 0.7 }]}
            >
              {video.type === "local"
                ? "This video is stored locally on your device and can be played offline."
                : "This video requires an internet connection to play."}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  videoContainer: {
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  localVideoContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  remoteVideoContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  videoTypeText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  duration: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  videoInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 10,
  },
  videoInfoText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "500",
  },
  videoInfoSection: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  videoStats: {
    flexDirection: "row",
    gap: 20,
  },
  machineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  machineText: {
    fontSize: 14,
    fontWeight: "500",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  additionalInfo: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  infoText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
