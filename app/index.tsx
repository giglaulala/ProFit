import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is logged in
      const userData = await AsyncStorage.getItem("userData");

      if (!userData) {
        // No user data, redirect to auth
        console.log("No user data found, redirecting to auth");
        router.replace("/auth");
        return;
      }

      const user = JSON.parse(userData);

      if (!user.isLoggedIn) {
        // User not logged in, redirect to auth
        console.log("User not logged in, redirecting to auth");
        router.replace("/auth");
        return;
      }

      // User is logged in, check if they have completed setup
      const setupData = await AsyncStorage.getItem("userSetupData");

      // Skip setup for trainers or if setup already completed
      if (user.role === "trainer" || setupData) {
        // User is trainer or has completed setup, go to main app
        console.log("Trainer or setup complete, redirecting to main app");
        router.replace("/(tabs)");
      } else {
        // User hasn't completed setup, redirect to setup
        console.log("No setup data, redirecting to setup");
        router.replace("/setup");
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      // On error, redirect to auth
      router.replace("/auth");
    }
  };

  return null;
}
