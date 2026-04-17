import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/theme';
import * as Haptics from 'expo-haptics';
import { t } from '../i18n';
import { DailyChallengeScreen } from '../screens/home/DailyChallengeScreen';
import { PracticeSessionScreen } from '../screens/home/PracticeSessionScreen';
import { AIFeedbackScreen } from '../screens/home/AIFeedbackScreen';
import { AICoachScreen } from '../screens/home/AICoachScreen';
import { SkillTreeScreen } from '../screens/skilltree/SkillTreeScreen';
import { ModesScreen } from '../screens/modes/ModesScreen';
import { FeedScreen } from '../screens/community/FeedScreen';
import { PostDetailScreen } from '../screens/community/PostDetailScreen';
import { PublicProfileScreen } from '../screens/community/PublicProfileScreen';
import { StreakDashboardScreen } from '../screens/stats/StreakDashboardScreen';
import { BadgesScreen } from '../screens/stats/BadgesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { PublicProfileScreen as MyPublicProfileScreen } from '../screens/profile/PublicProfileScreen';
import { CertificateScreen } from '../screens/profile/CertificateScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { SubscriptionScreen } from '../screens/profile/SubscriptionScreen';
import { ChangeSkillScreen } from '../screens/profile/ChangeSkillScreen';
import { GamesHomeScreen } from '../screens/games/GamesHomeScreen';
import { GameSessionScreen } from '../screens/games/GameSessionScreen';
import { GameResultScreen } from '../screens/games/GameResultScreen';
import { ReviewScreen } from '../screens/games/ReviewScreen';
import { TradingSimScreen } from '../screens/games/TradingSimScreen';
import { MasterSimScreen } from '../screens/games/MasterSimScreen';
import { LiveLobbyScreen } from '../screens/live/LiveLobbyScreen';
import { LiveGameScreen } from '../screens/live/LiveGameScreen';
import { LiveResultScreen } from '../screens/live/LiveResultScreen';
import { Challenge1v1Screen } from '../screens/live/Challenge1v1Screen';
import { FlashcardsScreen } from '../screens/games/FlashcardsScreen';
import { StoryModeScreen } from '../screens/games/StoryModeScreen';

// Stacks
const HomeStack = createNativeStackNavigator();
function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <HomeStack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
      <HomeStack.Screen name="PracticeSession" component={PracticeSessionScreen} options={{ animation: 'slide_from_bottom' }} />
      <HomeStack.Screen name="AIFeedback" component={AIFeedbackScreen} options={{ animation: 'slide_from_bottom' }} />
      <HomeStack.Screen name="AICoach" component={AICoachScreen} options={{ animation: 'slide_from_bottom' }} />
    </HomeStack.Navigator>
  );
}

const GamesStack = createNativeStackNavigator();
function GamesNavigator() {
  return (
    <GamesStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <GamesStack.Screen name="GamesHome" component={GamesHomeScreen} />
      <GamesStack.Screen name="GameSession" component={GameSessionScreen} options={{ animation: 'slide_from_bottom' }} />
      <GamesStack.Screen name="GameResult" component={GameResultScreen} options={{ animation: 'fade' }} />
      <GamesStack.Screen name="ReviewMode" component={ReviewScreen} options={{ animation: 'slide_from_bottom' }} />
      <GamesStack.Screen name="TradingSim" component={TradingSimScreen} options={{ animation: 'slide_from_bottom' }} />
      <GamesStack.Screen name="MasterSim" component={MasterSimScreen} options={{ animation: 'slide_from_bottom' }} />
      <GamesStack.Screen name="Flashcards" component={FlashcardsScreen} options={{ animation: 'slide_from_bottom' }} />
      <GamesStack.Screen name="StoryMode" component={StoryModeScreen} options={{ animation: 'slide_from_bottom' }} />
      <GamesStack.Screen name="LiveLobby" component={LiveLobbyScreen} options={{ animation: 'slide_from_bottom' }} />
      <GamesStack.Screen name="LiveGame" component={LiveGameScreen} options={{ animation: 'fade' }} />
      <GamesStack.Screen name="LiveResult" component={LiveResultScreen} options={{ animation: 'fade' }} />
      <GamesStack.Screen name="Challenge1v1" component={Challenge1v1Screen} options={{ animation: 'slide_from_bottom' }} />
    </GamesStack.Navigator>
  );
}

const CommunityStack = createNativeStackNavigator();
function CommunityNavigator() {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <CommunityStack.Screen name="Feed" component={FeedScreen} />
      <CommunityStack.Screen name="PostDetail" component={PostDetailScreen} options={{ animation: 'slide_from_bottom' }} />
      <CommunityStack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ animation: 'slide_from_right' }} />
    </CommunityStack.Navigator>
  );
}

const StatsStack = createNativeStackNavigator();
function StatsNavigator() {
  return (
    <StatsStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <StatsStack.Screen name="StreakDashboard" component={StreakDashboardScreen} />
      <StatsStack.Screen name="Badges" component={BadgesScreen} options={{ animation: 'slide_from_bottom' }} />
    </StatsStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator();
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="PublicProfile" component={MyPublicProfileScreen} options={{ animation: 'slide_from_bottom' }} />
      <ProfileStack.Screen name="Certificate" component={CertificateScreen} options={{ animation: 'slide_from_bottom' }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
      <ProfileStack.Screen name="Subscription" component={SubscriptionScreen} options={{ animation: 'slide_from_bottom' }} />
      <ProfileStack.Screen name="ChangeSkill" component={ChangeSkillScreen} options={{ animation: 'slide_from_right' }} />
    </ProfileStack.Navigator>
  );
}

// Premium Tab Icon
const TAB_ICONS: Record<string, { default: string; active: string }> = {
  Home: { default: 'home-outline', active: 'home' },
  Games: { default: 'game-controller-outline', active: 'game-controller' },
  Modes: { default: 'game-controller-outline', active: 'game-controller' },
  Community: { default: 'people-outline', active: 'people' },
  Stats: { default: 'flame-outline', active: 'flame' },
  Profile: { default: 'person-outline', active: 'person' },
};

const TAB_LABEL_KEYS: Record<string, string> = {
  Home: 'tab.home',
  Games: 'tab.games',
  Modes: 'tab.modes',
  Community: 'tab.community',
  Stats: 'tab.stats',
  Profile: 'tab.profile',
};

function TabIcon({ label, active }: { label: string; active: boolean }) {
  const scaleAnim = useRef(new Animated.Value(active ? 1 : 0.85)).current;
  const opacityAnim = useRef(new Animated.Value(active ? 1 : 0.7)).current;

  useEffect(() => {
    if (active) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      // Bounce: scale up to 1.15, then spring back to 1.0
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
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
        {t(TAB_LABEL_KEYS[label] || label)}
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
            {Platform.OS === 'ios' ? (
              <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,10,11,0.95)' }]} />
            )}
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
          const hideOnScreens = ['PracticeSession', 'AIFeedback', 'AICoach'];
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
          const hideOnScreens = ['GameSession', 'GameResult', 'LiveLobby', 'LiveGame', 'LiveResult', 'Challenge1v1', 'TradingSim', 'MasterSim', 'ReviewMode', 'Flashcards', 'StoryMode'];
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
        name="ModesTab"
        component={ModesScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Modes" active={focused} /> }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label={t('tab.community')} active={focused} /> }}
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
