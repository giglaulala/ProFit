import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

interface ThemedLoaderProps {
  message?: string;
}

export default function ThemedLoader({ message = "Creating your personalized plan..." }: ThemedLoaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(120)).current; // 60% of 200px

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Progress bar animation
    const progressAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(progressValue, {
          toValue: 160, // 80% of 200px
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(progressValue, {
          toValue: 120, // 60% of 200px
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();
    progressAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
      progressAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={[
          styles.loaderContainer,
          { opacity: fadeValue }
        ]}
      >
        {/* Main spinning icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <Ionicons name="fitness" size={48} color={colors.primary} />
        </Animated.View>

        {/* Pulsing dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: colors.primary,
                  transform: [
                    {
                      scale: pulseValue.interpolate({
                        inputRange: [1, 1.2],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                  opacity: pulseValue.interpolate({
                    inputRange: [1, 1.2],
                    outputRange: [0.6, 1],
                  }),
                },
              ]}
            />
          ))}
        </View>

        {/* Loading message */}
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>

        {/* Progress bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.darkGray }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.primary,
                width: progressValue,
              },
            ]}
          />
        </View>

        {/* App branding */}
        <View style={styles.brandingContainer}>
          <Text style={[styles.brandText, { color: colors.primary }]}>ProFit</Text>
          <Text style={[styles.brandSubtext, { color: colors.text }]}>VOLUME UP YOUR BODY GOALS</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(226, 255, 0, 0.1)',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: 200,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 40,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  brandingContainer: {
    alignItems: 'center',
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    letterSpacing: 1,
  },
  brandSubtext: {
    fontSize: 12,
    opacity: 0.7,
    letterSpacing: 0.5,
  },
}); 