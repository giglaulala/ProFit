import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, useColorScheme, View } from "react-native";

import Colors from "../../constants/Colors";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

function CameraTabBarIcon() {
  return (
    <View style={styles.cameraTabContainer}>
      <View style={styles.cameraCircle}>
        <Ionicons name="camera" size={24} color="#000000" />
      </View>
    </View>
  );
}

function ChatTabBarIcon() {
  return (
    <View style={styles.cameraTabContainer}>
      <View style={styles.cameraCircle}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#000000" />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].primary,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="fitness" color={color} />
          ),
        }}
      />
      {/* 2. Calendar */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />
      {/* 3. Chat (center floating) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "",
          tabBarIcon: () => <ChatTabBarIcon />,
        }}
      />
      {/* 4. Workouts */}
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="barbell" color={color} />
          ),
        }}
      />
      {/* 5. Scan */}
      <Tabs.Screen
        name="tracking"
        options={{
          title: "",
          tabBarLabel: "Scan",
          tabBarIcon: ({ color }) => <TabBarIcon name="camera" color={color} />,
        }}
      />
      {/* Hide Profile from tab bar */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          href: null,
        }}
      />
      {/* Hide Progress from tab bar */}
      <Tabs.Screen
        name="progress"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cameraTabContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  cameraCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E2FF00",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  cameraLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#E2FF00",
  },
});
