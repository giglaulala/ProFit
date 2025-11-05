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
import { router } from "expo-router";
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

  const isYouTubeUrl = (url: string): boolean => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const handlePlayVideo = async () => {
    if (!video) return;

    // Check if it's a YouTube URL - these can't be played inline
    if (
      video.type === "remote" &&
      video.remoteUrl &&
      isYouTubeUrl(video.remoteUrl)
    ) {
      router.push({
        pathname: "/video-webview",
        params: { url: video.remoteUrl, title: video.title },
      });
      return;
    }

    // For local videos and non-YouTube remote videos, use the video player
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        try {
          await videoRef.current.playAsync();
        } catch (error) {
          Alert.alert("Error", "Failed to play video. Please try again.", [
            { text: "OK" },
          ]);
        }
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
              {
                backgroundColor: colors.darkGray,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                borderWidth: 4,
                borderColor: colors.primary + "40",
              },
            ]}
          >
            {/* Inner frame border */}
            <View
              style={[
                styles.innerFrame,
                {
                  borderColor: colors.primary,
                },
              ]}
            />
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
            ) : video.type === "remote" &&
              video.remoteUrl &&
              !isYouTubeUrl(video.remoteUrl) ? (
              <Video
                ref={videoRef}
                style={styles.video}
                source={{ uri: video.remoteUrl }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
                onPlaybackStatusUpdate={handleVideoStatusUpdate}
                shouldPlay={false}
              />
            ) : (
              <View style={styles.remoteVideoContainer}>
                <View style={styles.videoIconContainer}>
                  <Ionicons
                    name="play-circle"
                    size={80}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.videoTypeText, { color: colors.text }]}>
                  {video.title}
                </Text>
                <Text style={[styles.duration, { color: colors.text }]}>
                  {video.duration}
                </Text>
                
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
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              onPress={handlePlayVideo}
              activeOpacity={0.8}
            >
              <Ionicons
                name={
                  video.type === "remote" &&
                  video.remoteUrl &&
                  isYouTubeUrl(video.remoteUrl)
                    ? "open-outline"
                    : isPlaying
                    ? "pause"
                    : "play"
                }
                size={20}
                color={colors.black}
              />
              <Text style={[styles.playButtonText, { color: colors.black }]}>
                {video.type === "remote" &&
                video.remoteUrl &&
                isYouTubeUrl(video.remoteUrl)
                  ? "Open in App"
                  : isPlaying
                  ? "Pause Video"
                  : "Play Video"}
              </Text>
            </TouchableOpacity>

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
                : "Streaming video requires an internet connection."}
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
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  innerFrame: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 8,
    borderWidth: 2,
    zIndex: 1,
    pointerEvents: "none",
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
    zIndex: 0,
  },
  videoIconContainer: {
    marginBottom: 15,
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
    borderRadius: 10,
    zIndex: 0,
  },
});
