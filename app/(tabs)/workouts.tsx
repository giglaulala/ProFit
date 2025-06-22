import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useState } from 'react';
import { BlurView } from 'expo-blur';

import Colors from '../../constants/Colors';

export default function WorkoutsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');

  const workoutCategories = [
    { title: 'Strength Training', icon: 'barbell', count: 15, color: colors.primary },
    { title: 'Cardio', icon: 'heart', count: 12, color: colors.secondary },
    { title: 'Yoga & Stretching', icon: 'body', count: 8, color: colors.accent },
    { title: 'HIIT', icon: 'flash', count: 10, color: colors.darkGreen },
  ];

  const popularWorkouts = [
    {
      title: 'Full Body Blast',
      duration: '45 min',
      difficulty: 'Intermediate',
      calories: '350',
      exercises: 12,
      color: colors.primary,
    },
    {
      title: 'Core Crusher',
      duration: '30 min',
      difficulty: 'Beginner',
      calories: '250',
      exercises: 8,
      color: colors.secondary,
    },
    {
      title: 'Cardio Kickboxing',
      duration: '40 min',
      difficulty: 'Advanced',
      calories: '400',
      exercises: 15,
      color: colors.accent,
    },
    {
      title: 'Yoga Flow',
      duration: '60 min',
      difficulty: 'Beginner',
      calories: '200',
      exercises: 20,
      color: colors.darkGreen,
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Here you can implement search functionality
    console.log('Searching workouts for:', query);
  };

  const filteredWorkouts = popularWorkouts.filter(workout =>
    workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = workoutCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderWorkoutCard = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[styles.workoutCard, { backgroundColor: colors.lightGray }]}
      activeOpacity={0.7}
    >
      <View style={styles.workoutHeader}>
        <View style={[styles.workoutIcon, { backgroundColor: item.color }]}>
          <Ionicons name="fitness" size={24} color={colors.black} />
        </View>
        <View style={styles.workoutInfo}>
          <Text style={[styles.workoutTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.workoutSubtitle, { color: colors.text }]}>
            {item.duration} • {item.difficulty}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </View>
      <View style={styles.workoutStats}>
        <View style={styles.stat}>
          <Ionicons name="flame" size={16} color={colors.primary} />
          <Text style={[styles.statText, { color: colors.text }]}>{item.calories} cal</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="list" size={16} color={colors.secondary} />
          <Text style={[styles.statText, { color: colors.text }]}>{item.exercises} exercises</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>ProFit Workouts</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Choose your next challenge
          </Text>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {filteredCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.categoryCard, { backgroundColor: colors.lightGray }]}
                activeOpacity={0.7}
              >
                <Ionicons name={category.icon as any} size={32} color={category.color} />
                <Text style={[styles.categoryTitle, { color: colors.text }]}>
                  {category.title}
                </Text>
                <Text style={[styles.categoryCount, { color: colors.text }]}>
                  {category.count} workouts
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Workouts */}
        <View style={styles.popularContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Workouts</Text>
          <FlatList
            data={filteredWorkouts}
            renderItem={renderWorkoutCard}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Quick Start */}
        <View style={styles.quickStartContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Start</Text>
          <TouchableOpacity
            style={[styles.quickStartCard, { backgroundColor: colors.lightGray }]}
            activeOpacity={0.8}
          >
            <View style={styles.quickStartContent}>
              <View>
                <Text style={[styles.quickStartTitle, { color: colors.text }]}>Start Random Workout</Text>
                <Text style={[styles.quickStartSubtitle, { color: colors.text }]}>
                  Let us choose the perfect workout for you
                </Text>
              </View>
              <Ionicons name="shuffle" size={24} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Search Bar */}
      <KeyboardAvoidingView 
        style={styles.floatingSearchContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <BlurView intensity={20} tint="dark" style={styles.searchBarBlur}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="SEARCH WORKOUTS..."
              placeholderTextColor={colors.text + '80'}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </KeyboardAvoidingView>
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
  searchContainer: {
    padding: 20,
    paddingTop: 10,
  },
  searchBarBlur: {
    borderRadius: 12,
    padding: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
  },
  categoriesContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  popularContainer: {
    padding: 20,
    paddingTop: 10,
  },
  workoutCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  workoutSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 12,
  },
  quickStartContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  quickStartCard: {
    borderRadius: 12,
    padding: 20,
  },
  quickStartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  quickStartSubtitle: {
    fontSize: 14,
    color: '#000',
    opacity: 0.7,
    marginTop: 4,
  },
  floatingSearchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 20,
    zIndex: 1000,
  },
}); 