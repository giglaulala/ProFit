import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useState } from 'react';

import Colors from '../../constants/Colors';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

  const userStats = [
    { label: 'Total Workouts', value: '156' },
    { label: 'Calories Burned', value: '45,230' },
    { label: 'Workout Time', value: '89h 30m' },
    { label: 'Current Streak', value: '7 days' },
  ];

  const menuItems = [
    { title: 'Edit Profile', icon: 'person', action: 'edit' },
    { title: 'Fitness Goals', icon: 'target', action: 'goals' },
    { title: 'Workout History', icon: 'time', action: 'history' },
    { title: 'Achievements', icon: 'trophy', action: 'achievements' },
    { title: 'Settings', icon: 'settings', action: 'settings' },
    { title: 'Help & Support', icon: 'help-circle', action: 'help' },
    { title: 'About', icon: 'information-circle', action: 'about' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={40} color={colors.black} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>John Doe</Text>
          <Text style={[styles.userLevel, { color: colors.primary }]}>ProFit Member</Text>
          <Text style={[styles.userBio, { color: colors.text }]}>
            Committed to staying active and healthy
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            {userStats.map((stat, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: colors.lightGray }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.text }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.lightGray }]}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Log Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.lightGray }]}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={24} color={colors.secondary} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.lightGray }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
                <Text style={[styles.settingTitle, { color: colors.text }]}>Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.darkGray, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon" size={20} color={colors.secondary} />
                <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: colors.darkGray, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.lightGray }]}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.darkGray },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                  <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error }]}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out" size={20} color={colors.background} />
            <Text style={[styles.logoutText, { color: colors.background }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userLevel: {
    fontSize: 16,
    color: '#00ff88',
    fontWeight: '600',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  statsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  settingsCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
  },
  menuContainer: {
    padding: 20,
    paddingTop: 10,
  },
  menuCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 16,
  },
  logoutContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 