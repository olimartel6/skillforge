import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
import { GamesHomeScreen } from '../screens/games/GamesHomeScreen';
import { GameSessionScreen } from '../screens/games/GameSessionScreen';
import { GameResultScreen } from '../screens/games/GameResultScreen';

// Stacks
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

const GamesStack = createNativeStackNavigator();
function GamesNavigator() {
  return (
    <GamesStack.Navigator screenOptions={{ headerShown: false }}>
      <GamesStack.Screen name="GamesHome" component={GamesHomeScreen} />
      <GamesStack.Screen name="GameSession" component={GameSessionScreen} />
      <GamesStack.Screen name="GameResult" component={GameResultScreen} />
    </GamesStack.Navigator>
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

// Premium Tab Icon
const TAB_ICONS: Record<string, { default: string; active: string }> = {
  Home: { default: 'home-outline', active: 'home' },
  Games: { default: 'game-controller-outline', active: 'game-controller' },
  Tree: { default: 'git-branch-outline', active: 'git-branch' },
  Community: { default: 'people-outline', active: 'people' },
  Stats: { default: 'flame-outline', active: 'flame' },
  Profile: { default: 'person-outline', active: 'person' },
};

function TabIcon({ label, active }: { label: string; active: boolean }) {
  const scaleAnim = useRef(new Animated.Value(active ? 1 : 0.85)).current;
  const opacityAnim = useRef(new Animated.Value(active ? 1 : 0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: active ? 1 : 0.85,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: active ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active]);

  const icon = TAB_ICONS[label] || { default: '•', active: '•' };

  return (
    <Animated.View
      style={[
        styles.tabIconContainer,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      {/* Active glow */}
      {active && (
        <View style={styles.activeGlow}>
          <LinearGradient
            colors={[colors.primary + '30', 'transparent']}
            style={styles.glowGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
      )}

      {/* Icon */}
      <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
        <Ionicons
          name={active ? icon.active as any : icon.default as any}
          size={22}
          color={active ? colors.primary : 'rgba(255,255,255,0.6)'}
        />
      </View>

      {/* Active indicator dot */}
      {active && (
        <View style={styles.activeDot}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.dotGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
      )}

      {/* Label */}
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </Animated.View>
  );
}

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBg}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.tabBarOverlay} />
            <View style={styles.tabBarTopBorder} />
          </View>
        ),
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'DailyChallenge';
          const hideOnScreens = ['PracticeSession', 'AIFeedback'];
          return {
            tabBarIcon: ({ focused }) => <TabIcon label="Home" active={focused} />,
            tabBarStyle: hideOnScreens.includes(routeName)
              ? { display: 'none' as const }
              : {
                  position: 'absolute' as const,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: Platform.OS === 'ios' ? 88 : 70,
                  backgroundColor: 'transparent',
                  borderTopWidth: 0,
                  elevation: 0,
                },
          };
        }}
      />
      <Tab.Screen
        name="GamesTab"
        component={GamesNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'GamesHome';
          const hideOnScreens = ['GameSession', 'GameResult'];
          return {
            tabBarIcon: ({ focused }) => <TabIcon label="Games" active={focused} />,
            tabBarStyle: hideOnScreens.includes(routeName)
              ? { display: 'none' as const }
              : {
                  position: 'absolute' as const,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: Platform.OS === 'ios' ? 88 : 70,
                  backgroundColor: 'transparent',
                  borderTopWidth: 0,
                  elevation: 0,
                },
          };
        }}
      />
      <Tab.Screen
        name="TreeTab"
        component={SkillTreeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Tree" active={focused} /> }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Community" active={focused} /> }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Stats" active={focused} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Profile" active={focused} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  // Tab bar background
  tabBarBg: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  tabBarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 11, 0.75)',
  },
  tabBarTopBorder: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  // Tab icon
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    width: 64,
  },

  // Active glow behind icon
  activeGlow: {
    position: 'absolute',
    top: -4,
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },

  // Icon circle
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconCircleActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },

  // Active dot indicator
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
    overflow: 'hidden',
  },
  dotGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 2.5,
  },

  // Label
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
