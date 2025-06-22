import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/Colors';

interface WorkoutDay {
  date: string;
  workout: string;
  type: 'chest' | 'legs' | 'cardio' | 'shoulders' | 'back';
}

interface CalendarProps {
  workoutDays: WorkoutDay[];
  onDatePress?: (date: string) => void;
}

export default function Calendar({ workoutDays, onDatePress }: CalendarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getMonthName = (date: Date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[date.getMonth()];
  };

  const isWorkoutDay = (day: number) => {
    const dateString = `${day.toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    return workoutDays.some(workout => workout.date === dateString);
  };

  const getWorkoutForDay = (day: number) => {
    const dateString = `${day.toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    return workoutDays.find(workout => workout.date === dateString);
  };

  const handleDatePress = (day: number) => {
    const dateString = `${day.toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
    onDatePress?.(dateString);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWorkoutIcon = (type: string) => {
    switch(type) {
      case 'chest': return 'body';
      case 'legs': return 'fitness';
      case 'cardio': return 'heart';
      case 'shoulders': return 'barbell';
      case 'back': return 'body';
      default: return 'fitness';
    }
  };

  const getWorkoutIconColor = (type: string) => {
    switch(type) {
      case 'chest': return colors.primary;
      case 'legs': return colors.secondary;
      case 'cardio': return colors.accent;
      case 'shoulders': return colors.darkGreen;
      case 'back': return colors.primary;
      default: return colors.primary;
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isWorkout = isWorkoutDay(day);
      const workout = getWorkoutForDay(day);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={styles.dayCell}
          onPress={() => handleDatePress(day)}
        >
          <Text style={[
            styles.dayText,
            { color: colors.text },
            isWorkout && styles.workoutDayText
          ]}>
            {day}
          </Text>
          {isWorkout && workout && (
            <View style={styles.workoutIconContainer}>
              <Ionicons 
                name={getWorkoutIcon(workout.type) as any} 
                size={12} 
                color={getWorkoutIconColor(workout.type)} 
              />
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.lightGray }]}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={[styles.navButton, { color: colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.monthYear, { color: colors.text }]}>
          {getMonthName(currentDate)} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={[styles.navButton, { color: colors.primary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Days of Week */}
      <View style={styles.daysOfWeek}>
        {daysOfWeek.map(day => (
          <Text key={day} style={[styles.dayOfWeek, { color: colors.text }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {renderCalendarDays()}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>Workout Types:</Text>
        <View style={styles.legendGrid}>
          <View style={styles.legendItem}>
            <Ionicons name="body" size={16} color={colors.primary} />
            <Text style={[styles.legendText, { color: colors.text }]}>Chest/Back</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="fitness" size={16} color={colors.secondary} />
            <Text style={[styles.legendText, { color: colors.text }]}>Legs</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="heart" size={16} color={colors.accent} />
            <Text style={[styles.legendText, { color: colors.text }]}>Cardio</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="barbell" size={16} color={colors.darkGreen} />
            <Text style={[styles.legendText, { color: colors.text }]}>Shoulders</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  navButton: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  daysOfWeek: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeek: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  workoutDayText: {
    fontWeight: 'bold',
  },
  workoutIconContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  legend: {
    marginTop: 15,
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legendGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendText: {
    fontSize: 12,
    opacity: 0.8,
  },
}); 