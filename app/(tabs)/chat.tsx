import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your ProFit AI assistant. How can I help you with your fitness journey today?",
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

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
      setIsLoading(true);
      try {
        const configuredBaseUrl =
          (Constants?.expoConfig as any)?.extra?.apiBaseUrl ||
          "http://localhost:3000";
        const apiBaseUrl =
          Platform.OS === "android" && configuredBaseUrl.includes("localhost")
            ? configuredBaseUrl.replace("localhost", "10.0.2.2")
            : configuredBaseUrl;
        const response = await fetch(`${apiBaseUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are ProFit AI, a helpful fitness assistant. Be concise, practical, and safe.",
              },
              ...[...messages, newMessage].map((m) => ({
                role: m.isUser ? "user" : "assistant",
                content: m.text,
              })),
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch AI response");
        }

        const data = await response.json();
        const aiText =
          data?.content || "Sorry, I could not generate a response.";
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      } catch (error) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "There was an error contacting the AI. Please try again.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      } finally {
        setIsLoading(false);
      }
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
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
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
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? colors.black : colors.text}
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
