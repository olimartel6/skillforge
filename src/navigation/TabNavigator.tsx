import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../utils/theme';
import { DailyChallengeScreen } from '../screens/home/DailyChallengeScreen';
import { PracticeSessionScreen } from '../screens/home/PracticeSessionScreen';
import { AIFeedbackScreen } from '../screens/home/AIFeedbackScreen';
import { SkillTreeScreen } from '../screens/skilltree/SkillTreeScreen';
import { FeedScreen } from '../screens/community/FeedScreen';
import { PostDetailScreen } from '../screens/community/PostDetailScreen';
import { StreakDashboardScreen } from '../screens/stats/StreakDashboardScreen';
import { BadgesScreen } from '../screens/stats/BadgesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { SubscriptionScreen } from '../screens/profile/SubscriptionScreen';

const HomeStack = createNativeStackNavigator();
function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
      <HomeStack.Screen name="PracticeSession" component={PracticeSessionScreen} />
      <HomeStack.Screen name="AIFeedback" component={AIFeedbackScreen} />
    </HomeStack.Navigator>
  );
}

const CommunityStack = createNativeStackNavigator();
function CommunityNavigator() {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
      <CommunityStack.Screen name="Feed" component={FeedScreen} />
      <CommunityStack.Screen name="PostDetail" component={PostDetailScreen} />
    </CommunityStack.Navigator>
  );
}

const StatsStack = createNativeStackNavigator();
function StatsNavigator() {
  return (
    <StatsStack.Navigator screenOptions={{ headerShown: false }}>
      <StatsStack.Screen name="StreakDashboard" component={StreakDashboardScreen} />
      <StatsStack.Screen name="Badges" component={BadgesScreen} />
    </StatsStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator();
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Subscription" component={SubscriptionScreen} />
    </ProfileStack.Navigator>
  );
}

function TabIcon({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={tabStyles.iconContainer}>
      {active && <View style={tabStyles.indicator} />}
      <Text style={[tabStyles.label, active && tabStyles.labelActive]}>{label}</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: 'rgba(255,255,255,0.04)',
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" active={focused} /> }} />
      <Tab.Screen name="TreeTab" component={SkillTreeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Tree" active={focused} /> }} />
      <Tab.Screen name="CommunityTab" component={CommunityNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Community" active={focused} /> }} />
      <Tab.Screen name="StatsTab" component={StatsNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Stats" active={focused} /> }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Profile" active={focused} /> }} />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: { alignItems: 'center', gap: 4 },
  indicator: { width: 20, height: 3, borderRadius: 1.5, backgroundColor: colors.primary },
  label: { fontSize: 10, color: colors.textDark, fontWeight: '500' },
  labelActive: { color: colors.primary, fontWeight: '600' },
});
