import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';

import Colors from '../constants/Colors';

interface WorkoutTimerProps {
  visible: boolean;
  onClose: () => void;
  duration: number; // in seconds
  title: string;
}

export default function WorkoutTimer({ visible, onClose, duration, title }: WorkoutTimerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(false);
  }, [duration, visible]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(duration);
    setIsRunning(false);
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.timerContainer}>
            <Text style={[
              styles.timerText, 
              { 
                color: colors.primary,
                fontSize: 48,
              }
            ]}>
              {formatTime(timeLeft)}
            </Text>
          </View>

          <View style={styles.controls}>
            {!isRunning ? (
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.lightGray }]}
                onPress={handleStart}
              >
                <Ionicons name="play" size={24} color={colors.primary} />
                <Text style={[styles.controlButtonText, { color: colors.primary }]}>Start</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.lightGray }]}
                onPress={handlePause}
              >
                <Ionicons name="pause" size={24} color={colors.secondary} />
                <Text style={[styles.controlButtonText, { color: colors.secondary }]}>Pause</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.lightGray }]}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={24} color={colors.accent} />
              <Text style={[styles.controlButtonText, { color: colors.accent }]}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.lightGray }]}
              onPress={handleSkip}
            >
              <Ionicons name="play-forward" size={24} color={colors.darkGreen} />
              <Text style={[styles.controlButtonText, { color: colors.darkGreen }]}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerContainer: {
    marginBottom: 40,
  },
  timerText: {
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 5,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 