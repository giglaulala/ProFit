import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

import Colors from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function TrackingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const trackingFeatures = [
    { title: 'Start Workout', icon: 'play-circle', color: colors.primary, action: 'start' },
    { title: 'Take Progress Photo', icon: 'camera', color: colors.secondary, action: 'photo' },
    { title: 'Record Weight', icon: 'scale', color: colors.accent, action: 'weight' },
    { title: 'Body Measurements', icon: 'resize', color: colors.darkGreen, action: 'measurements' },
  ];

  const recentActivities = [
    { type: 'Workout', title: 'Upper Body Strength', time: '2 hours ago', icon: 'fitness' },
    { type: 'Photo', title: 'Progress Photo', time: '1 day ago', icon: 'camera' },
    { type: 'Weight', title: '75.2 kg', time: '2 days ago', icon: 'scale' },
    { type: 'Measurement', title: 'Chest: 95cm', time: '3 days ago', icon: 'resize' },
  ];

  const handleTrackingAction = (action: string) => {
    console.log('Tracking action:', action);
    // Implement tracking functionality here
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>ProFit Tracking</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Monitor your fitness journey
          </Text>
        </View>

        {/* Tracking Features */}
        <View style={styles.featuresContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.featuresGrid}>
            {trackingFeatures.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.featureCard, { backgroundColor: colors.lightGray }]}
                activeOpacity={0.7}
                onPress={() => handleTrackingAction(feature.action)}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Camera Section */}
        <View style={styles.cameraContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Progress Photos</Text>
          <TouchableOpacity
            style={[styles.cameraCard, { backgroundColor: colors.lightGray }]}
            activeOpacity={0.8}
            onPress={() => handleTrackingAction('photo')}
          >
            <View style={styles.cameraContent}>
              <View style={[styles.cameraIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={32} color={colors.black} />
              </View>
              <View style={styles.cameraInfo}>
                <Text style={[styles.cameraTitle, { color: colors.text }]}>Take Progress Photo</Text>
                <Text style={[styles.cameraSubtitle, { color: colors.text }]}>
                  Document your transformation
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </View>
          </TouchableOpacity>
          
          {/* Video Monitoring Button */}
          <TouchableOpacity
            style={[styles.videoCard, { backgroundColor: colors.lightGray }]}
            activeOpacity={0.8}
            onPress={() => handleTrackingAction('video')}
          >
            <View style={styles.videoContent}>
              <View style={[styles.videoIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name="videocam" size={32} color={colors.black} />
              </View>
              <View style={styles.videoInfo}>
                <Text style={[styles.videoTitle, { color: colors.text }]}>Let Us Monitor You</Text>
                <Text style={[styles.videoSubtitle, { color: colors.text }]}>
                  AI-powered form analysis
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activities</Text>
          <View style={styles.activitiesList}>
            {recentActivities.map((activity, index) => (
              <View key={index} style={[styles.activityCard, { backgroundColor: colors.lightGray }]}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityIcon}>
                    <Ionicons name={activity.icon as any} size={20} color={colors.primary} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityType, { color: colors.primary }]}>{activity.type}</Text>
                    <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                  </View>
                  <Text style={[styles.activityTime, { color: colors.text }]}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.lightGray }]}>
              <Ionicons name="fitness" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>5</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Workouts</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.lightGray }]}>
              <Ionicons name="camera" size={24} color={colors.secondary} />
              <Text style={[styles.statValue, { color: colors.secondary }]}>3</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Photos</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.lightGray }]}>
              <Ionicons name="scale" size={24} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.accent }]}>2</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Weigh-ins</Text>
            </View>
          </View>
        </View>
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
  featuresContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cameraContainer: {
    padding: 20,
    paddingTop: 10,
  },
  cameraCard: {
    borderRadius: 12,
    padding: 20,
  },
  cameraContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  cameraInfo: {
    flex: 1,
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cameraSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  activitiesContainer: {
    padding: 20,
    paddingTop: 10,
  },
  activitiesList: {
    gap: 10,
  },
  activityCard: {
    padding: 15,
    borderRadius: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(226, 255, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  statsContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 3,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  videoCard: {
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  videoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 