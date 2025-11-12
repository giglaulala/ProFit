import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
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

import Colors from "../../constants/Colors";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

type ChatRole = "system" | "user" | "assistant";

type ExpoExtra = {
  apiBaseUrl?: string;
};

const getExpoExtra = (): ExpoExtra => {
  return (
    (Constants?.expoConfig?.extra ||
      (Constants as any)?.manifest?.extra ||
      {}) as ExpoExtra
  );
};

const sanitizeHostUri = (hostUri?: string | null) => {
  if (!hostUri) {
    return null;
  }

  const cleaned = hostUri.replace(/^https?:\/\//i, "");
  const [host] = cleaned.split(":");
  return host || null;
};

const resolveApiBaseUrl = (): string | null => {
  const extra = getExpoExtra();
  const rawUrl = extra?.apiBaseUrl?.trim();

  if (!rawUrl) {
    console.warn(
      "API base URL is missing. Set expo.extra.apiBaseUrl in app.json to enable chat."
    );
    return null;
  }

  try {
    const url = new URL(rawUrl);
    const localhostHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);
    if (localhostHosts.has(url.hostname)) {
      const hostUri =
        Constants?.expoConfig?.hostUri || (Constants as any)?.manifest?.hostUri;
      const resolvedHost = sanitizeHostUri(hostUri);
      if (resolvedHost) {
        url.hostname = resolvedHost;
      }
    }
    return url.toString().replace(/\/$/, "");
  } catch (error) {
    console.warn(
      "Failed to normalize apiBaseUrl. Falling back to raw value.",
      error
    );
    return rawUrl.replace(/\/$/, "");
  }
};

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const apiBaseUrl = useMemo(() => resolveApiBaseUrl(), []);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your ProFit AI assistant. Ask me anything about workouts, nutrition, or staying motivated and I'll share personalized guidance.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dotAnimations = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  useEffect(() => {
    if (isLoading) {
      const animateDots = () => {
        const animations = dotAnimations.map((anim, index) =>
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim, {
                  toValue: 0.3,
                  duration: 400,
                  useNativeDriver: true,
                }),
                Animated.timing(anim, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }),
              ])
            ),
          ])
        );
        Animated.parallel(animations).start();
      };
      animateDots();
    } else {
      dotAnimations.forEach((anim) => anim.setValue(1));
    }
  }, [isLoading]);

  useEffect(() => {
    if (scrollViewRef.current) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) {
      return;
    }

    const userText = inputText.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      isUser: true,
      timestamp: new Date(),
    };

    const pendingMessages = [...messages, newMessage];
    setMessages(pendingMessages);
    setInputText("");
    setIsLoading(true);

    try {
      if (!apiBaseUrl) {
        throw new Error("API base URL is not configured");
      }

      const endpoint = `${apiBaseUrl}/api/chat`;
      const chatHistory = pendingMessages.map((message) => ({
        role: (message.isUser ? "user" : "assistant") as ChatRole,
        content: message.text,
      }));

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: userText,
          messages: chatHistory,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        throw new Error(
          `Chat request failed: ${
            errorPayload?.error || `HTTP ${response.status}`
          }`
        );
      }

      const { content } = (await response.json()) as { content?: string };

      const aiResponseText =
        typeof content === "string" && content.trim().length > 0
          ? content.trim()
          : "I'm sorry, I couldn't generate a response right now. Please try again.";

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI chat error:", error);
      const fallbackResponse: Message = {
        id: (Date.now() + 2).toString(),
        text: "I'm having trouble connecting to the AI right now. Please check your connection and try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: message.isUser ? colors.primary : colors.lightGray,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: message.isUser ? colors.black : colors.text,
            },
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            {
              color: message.isUser ? colors.black + "80" : colors.text + "80",
            },
          ]}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  const renderLoadingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessage]}>
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: colors.lightGray,
          },
        ]}
      >
        <View style={styles.loadingDots}>
          <Animated.Text
            style={[
              styles.loadingDotText,
              {
                color: colors.text,
                opacity: dotAnimations[0],
              },
            ]}
          >
            ●
          </Animated.Text>
          <Animated.Text
            style={[
              styles.loadingDotText,
              {
                color: colors.text,
                opacity: dotAnimations[1],
              },
            ]}
          >
            ●
          </Animated.Text>
          <Animated.Text
            style={[
              styles.loadingDotText,
              {
                color: colors.text,
                opacity: dotAnimations[2],
              },
            ]}
          >
            ●
          </Animated.Text>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View
              style={[styles.aiAvatar, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="fitness" size={24} color={colors.black} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.aiName, { color: colors.text }]}>
                ProFit AI
              </Text>
              <Text style={[styles.aiStatus, { color: colors.primary }]}>
                Online
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(renderMessage)}
          {isLoading && renderLoadingIndicator()}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View
            style={[styles.inputWrapper, { backgroundColor: colors.lightGray }]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Type your message..."
              placeholderTextColor={colors.text + "80"}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim()
                    ? colors.primary
                    : colors.darkGray,
                },
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons
                name="send"
                size={20}
                color={
                  inputText.trim() && !isLoading ? colors.black : colors.text
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  aiName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  aiStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  aiMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: "rgba(18, 18, 18, 0.95)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 5,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingDotText: {
    fontSize: 12,
    marginHorizontal: 2,
  },
});
