import React, { useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

import Colors from '../../constants/Colors';
import { useAchievements } from '../../hooks/useAchievements';
import type { AchievementViewModel } from '../../hooks/useAchievements';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const {
    achievements: achievementList,
    loading: achievementsLoading,
    evaluatePlan,
  } = useAchievements();

  const weeklyStats = [
    { day: 'Mon', value: 45, target: 60 },
    { day: 'Tue', value: 60, target: 60 },
    { day: 'Wed', value: 30, target: 60 },
    { day: 'Thu', value: 75, target: 60 },
    { day: 'Fri', value: 50, target: 60 },
    { day: 'Sat', value: 90, target: 60 },
    { day: 'Sun', value: 40, target: 60 },
  ];

  const monthlyGoals = [
    { title: 'Workouts', current: 12, target: 20, icon: 'fitness' },
    { title: 'Calories', current: 8500, target: 12000, icon: 'flame' },
    { title: 'Minutes', current: 540, target: 900, icon: 'time' },
  ];

  const getAchievementProgressLabel = (achievement: AchievementViewModel) => {
    if (achievement.unlocked) {
      return t('achievements.unlocked');
    }
    const unit =
      achievement.id === 'first_workout'
        ? t('achievements.workoutsLabel')
        : t('achievements.daysLabel');
    return `${achievement.progress}/${achievement.target} ${unit}`;
  };

  const syncAchievements = useCallback(async () => {
    try {
      const calStr = await AsyncStorage.getItem('userCalendar');
      if (!calStr) {
        await evaluatePlan(null);
        return;
      }
      const calendar = JSON.parse(calStr);
      if (calendar && typeof calendar.plan === 'string') {
        try {
          calendar.plan = JSON.parse(calendar.plan);
        } catch {}
      }
      await evaluatePlan(calendar?.plan ?? null);
    } catch (err) {
      console.warn('[Progress] Failed to sync achievements:', err);
    }
  }, [evaluatePlan]);

  useEffect(() => {
    syncAchievements();
  }, [syncAchievements]);

  useFocusEffect(
    useCallback(() => {
      syncAchievements();
    }, [syncAchievements])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>ProFit Progress</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Track your fitness journey
          </Text>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.chartContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.lightGray }]}>
            <View style={styles.chartBars}>
              {weeklyStats.map((stat, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (stat.value / stat.target) * 100,
                          backgroundColor: stat.value >= stat.target ? colors.primary : colors.secondary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.text }]}>{stat.day}</Text>
                </View>
              ))}
            </View>
            <View style={styles.chartStats}>
              <View style={styles.chartStat}>
                <Text style={[styles.chartStatValue, { color: colors.primary }]}>390</Text>
                <Text style={[styles.chartStatLabel, { color: colors.text }]}>Minutes</Text>
              </View>
              <View style={styles.chartStat}>
                <Text style={[styles.chartStatValue, { color: colors.secondary }]}>65%</Text>
                <Text style={[styles.chartStatLabel, { color: colors.text }]}>Goal Met</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Monthly Goals */}
        <View style={styles.goalsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Goals</Text>
          {monthlyGoals.map((goal, index) => (
            <View key={index} style={[styles.goalCard, { backgroundColor: colors.lightGray }]}>
              <View style={styles.goalHeader}>
                <View style={styles.goalIcon}>
                  <Ionicons name={goal.icon as any} size={20} color={colors.primary} />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
                  <Text style={[styles.goalProgress, { color: colors.text }]}>
                    {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                  </Text>
                </View>
                <Text style={[styles.goalPercentage, { color: colors.primary }]}>
                  {Math.round((goal.current / goal.target) * 100)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.achievementsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('achievements.title')}
          </Text>
          {achievementsLoading ? (
            <View style={styles.achievementsLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <View style={styles.achievementsGrid}>
              {achievementList.map((achievement) => {
                const accentColor =
                  colors[achievement.colorKey] ?? colors.primary;
                const iconBackground = achievement.unlocked
                  ? accentColor
                  : colors.darkGray;
                const progressLabel = getAchievementProgressLabel(achievement);

                return (
                  <View
                    key={achievement.id}
                    style={[
                      styles.achievementCard,
                      {
                        backgroundColor: colors.lightGray,
                        opacity: achievement.unlocked ? 1 : 0.75,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.achievementIcon,
                        { backgroundColor: iconBackground },
                      ]}
                    >
                      <Ionicons
                        name={achievement.icon as any}
                        size={24}
                        color={achievement.unlocked ? colors.black : colors.text}
                      />
                    </View>
                    <Text style={[styles.achievementTitle, { color: colors.text }]}>
                      {t(achievement.titleKey)}
                    </Text>
                    <Text
                      style={[
                        styles.achievementDescription,
                        { color: colors.text + 'B3' },
                      ]}
                    >
                      {t(achievement.descriptionKey)}
                    </Text>
                    <Text
                      style={[
                        styles.achievementProgress,
                        { color: accentColor },
                      ]}
                    >
                      {progressLabel}
                    </Text>
                    {achievement.unlocked && (
                      <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Personal Records */}
        <View style={styles.recordsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Records</Text>
          <View style={[styles.recordsCard, { backgroundColor: colors.lightGray }]}>
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: colors.text }]}>Longest Workout</Text>
              <Text style={[styles.recordValue, { color: colors.primary }]}>75 minutes</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: colors.text }]}>Most Calories</Text>
              <Text style={[styles.recordValue, { color: colors.secondary }]}>450 cal</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: colors.text }]}>Current Streak</Text>
              <Text style={[styles.recordValue, { color: colors.accent }]}>7 days</Text>
            </View>
          </View>
        </View>

        {/* Workout Card */}
        <TouchableOpacity
          style={[styles.workoutCard, { backgroundColor: colors.lightGray }]}
          activeOpacity={0.8}
        >
          <View style={styles.workoutContent}>
            <View>
              <Text style={[styles.workoutTitle, { color: colors.text }]}>Upper Body Strength</Text>
              <Text style={[styles.workoutSubtitle, { color: colors.text }]}>45 minutes • 8 exercises</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  chartContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chartCard: {
    padding: 20,
    borderRadius: 12,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 100,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  chartStat: {
    alignItems: 'center',
  },
  chartStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartStatLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  goalsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  goalCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalProgress: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  achievementsLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 6,
  },
  achievementProgress: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  recordsContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  recordsCard: {
    padding: 20,
    borderRadius: 12,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recordLabel: {
    fontSize: 16,
  },
  recordValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  workoutCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  workoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  workoutSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 