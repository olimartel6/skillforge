# SkillForge Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete AI micro-learning coach mobile app with daily 5-min challenges, camera-based AI feedback, skill tree progression, streaks, community feed, and premium subscriptions.

**Architecture:** React Native Expo client → Supabase (auth, DB, storage) → Supabase Edge Functions (Deno) → Claude API. Dark glassmorphic UI with Reanimated animations.

**Tech Stack:** React Native Expo, TypeScript, Zustand, React Navigation, Expo Camera/AV, Reanimated, Supabase, Claude API, RevenueCat, expo-blur, expo-linear-gradient

**Spec:** `docs/superpowers/specs/2026-03-15-skillforge-design.md`

---

## Chunk 1: Project Scaffold & Design System

### Task 1: Initialize Expo Project

**Files:**
- Create: `app.json`, `package.json`, `tsconfig.json`, `App.tsx`, `.env.example`
- Create: `src/utils/types.ts`

- [ ] **Step 1: Create Expo project**

```bash
cd "/Users/oli/Desktop/skill forge"
npx create-expo-app@latest . --template blank-typescript
```

- [ ] **Step 2: Install core dependencies**

```bash
npx expo install expo-blur expo-linear-gradient expo-camera expo-av expo-notifications expo-image-picker expo-secure-store expo-font @expo-google-fonts/inter react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @supabase/supabase-js zustand @react-native-async-storage/async-storage react-native-purchases
```

- [ ] **Step 3: Create .env.example**

```
EXPO_PUBLIC_SUPABASE_URL=https://karztsksjqohxhgxdeje.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

- [ ] **Step 4: Create src/utils/types.ts with all shared types**

```typescript
// Enums
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'creativity' | 'learn_faster' | 'discipline';
export type Tier = 'basics' | 'intermediate' | 'advanced';
export type MediaType = 'photo' | 'video' | 'audio'; // audio reserved for future use; MVP uses video for audio-centric skills
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Database types
export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  selected_skill_id: string | null;
  skill_level: SkillLevel | null;
  goal: Goal | null;
  premium_expires_at: string | null;
  onboarding_complete: boolean;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

export interface SkillTreeNode {
  id: string;
  skill_id: string;
  name: string;
  tier: Tier;
  order: number;
  unlock_after_streak: number;
}

export interface Challenge {
  id: string;
  skill_id: string;
  node_id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  duration_minutes: number;
  is_generated: boolean;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  challenge_id: string;
  skill_id: string;
  media_url: string | null;
  media_type: MediaType;
  ai_feedback: AIFeedback | null;
  is_shared: boolean;
  created_at: string;
}

export interface AIFeedback {
  strengths: string[];
  mistakes: string[];
  improvement_tip: string;
  encouragement: string;
  score: number;
  error?: boolean;
  message?: string;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  freeze_tokens: number;
  last_practice_date: string | null;
}

export interface UserProgress {
  user_id: string;
  node_id: string;
  unlocked_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface UserRoadmap {
  id: string;
  user_id: string;
  day_number: number;
  node_id: string;
  challenge_title: string;
  challenge_description: string;
  completed_at: string | null;
  created_at: string;
}

export interface CommunityPost extends PracticeSession {
  user: Pick<User, 'id' | 'username' | 'avatar_url'>;
  skill: Pick<Skill, 'name' | 'icon'>;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
}

export interface Comment {
  id: string;
  user_id: string;
  practice_id: string;
  text: string;
  created_at: string;
  user?: Pick<User, 'id' | 'username' | 'avatar_url'>;
}
```

- [ ] **Step 5: Configure Reanimated babel plugin**

In `babel.config.js`, add `'react-native-reanimated/plugin'` to plugins array.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: initialize Expo project with dependencies and shared types"
```

---

### Task 2: Theme & Design System Components

**Files:**
- Create: `src/utils/theme.ts`
- Create: `src/components/GlassCard.tsx`
- Create: `src/components/Button.tsx`
- Create: `src/components/AmbientGlow.tsx`

- [ ] **Step 1: Create src/utils/theme.ts**

```typescript
export const colors = {
  background: '#0a0a0b',
  primary: '#FF6B35',
  primaryDark: '#FF3D00',
  secondary: '#6C63FF',
  secondaryDark: '#4F46E5',
  success: '#34D399',
  successDark: '#059669',
  error: '#EF4444',
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textMuted: '#444444',
  textDark: '#333333',
  glassBg: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.06)',
  glassStrongBg: 'rgba(255, 255, 255, 0.07)',
  glassStrongBorder: 'rgba(255, 255, 255, 0.1)',
  cardBg: 'rgba(255, 255, 255, 0.03)',
  cardBorder: 'rgba(255, 255, 255, 0.05)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '900' as const, letterSpacing: -1 },
  h2: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '500' as const },
  label: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 2, textTransform: 'uppercase' as const },
  stat: { fontSize: 24, fontWeight: '900' as const },
  timer: { fontSize: 42, fontWeight: '200' as const, letterSpacing: 4 },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  button: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};

export function glowShadow(color: string) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  };
}
```

- [ ] **Step 2: Create src/components/GlassCard.tsx**

```typescript
import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, borderRadius } from '../utils/theme';
// Note: expo-blur BlurView can be added for true blur effect but
// semi-transparent backgrounds are used for MVP performance

interface GlassCardProps extends ViewProps {
  strong?: boolean;
  glowColor?: string;
  children: React.ReactNode;
}

export function GlassCard({ strong, glowColor, style, children, ...props }: GlassCardProps) {
  const bgColor = strong ? colors.glassStrongBg : colors.glassBg;
  const borderColor = strong ? colors.glassStrongBorder : colors.glassBorder;
  const glowShadow = glowColor
    ? { shadowColor: glowColor, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 }
    : {};

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor, borderColor },
        glowShadow,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
});
```

- [ ] **Step 3: Create src/components/Button.tsx**

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows } from '../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled, style, textStyle }: ButtonProps) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8} style={style}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primary, shadows.button, disabled && styles.disabled]}
        >
          <Text style={[styles.primaryText, textStyle]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[styles.secondary, disabled && styles.disabled, style]}
      >
        <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.ghost, disabled && styles.disabled, style]}
    >
      <Text style={[styles.ghostText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primary: {
    padding: 16,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondary: {
    padding: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  secondaryText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  ghost: {
    padding: 14,
    alignItems: 'center',
  },
  ghostText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
});
```

- [ ] **Step 4: Create src/components/AmbientGlow.tsx**

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AmbientGlowProps {
  color: string;
  size?: number;
  opacity?: number;
  top?: number | string;
  left?: number | string;
}

export function AmbientGlow({ color, size = 200, opacity = 0.1, top = '50%', left = '50%' }: AmbientGlowProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          width: size,
          height: size,
          top,
          left,
          transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }],
        },
      ]}
    >
      <LinearGradient
        colors={[color, 'transparent']}
        style={[styles.gradient, { opacity }]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0.5, y: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 9999,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
});
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/theme.ts src/components/GlassCard.tsx src/components/Button.tsx src/components/AmbientGlow.tsx
git commit -m "feat: add design system - theme, GlassCard, Button, AmbientGlow"
```

---

### Task 3: Supabase Client & Auth Service

**Files:**
- Create: `src/services/supabase.ts`
- Create: `src/store/userStore.ts`

- [ ] **Step 1: Create src/services/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 2: Create src/store/userStore.ts**

```typescript
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { User, SkillLevel, Goal } from '../utils/types';

interface UserState {
  profile: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  completeOnboarding: (skillId: string, level: SkillLevel, goal: Goal) => Promise<void>;
  setAuth: (isAuthenticated: boolean) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isAuthenticated: false,
  isOnboarded: false,
  isLoading: true,

  setAuth: (isAuthenticated) => set({ isAuthenticated }),

  signUp: async (email, password, username) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Sign up failed');

    const { error: profileError } = await supabase
      .from('users')
      .insert({ id: authData.user.id, username });
    if (profileError) throw profileError;

    await get().fetchProfile();
    set({ isAuthenticated: true });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await get().fetchProfile();
    set({ isAuthenticated: true });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null, isAuthenticated: false, isOnboarded: false });
  },

  fetchProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ isLoading: false }); return; }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) { set({ isLoading: false }); return; }

    set({
      profile: data as User,
      isAuthenticated: true,
      isOnboarded: data.onboarding_complete,
      isLoading: false,
    });
  },

  updateProfile: async (updates) => {
    const userId = get().profile?.id;
    if (!userId) return;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;

    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    }));
  },

  completeOnboarding: async (skillId, level, goal) => {
    const userId = get().profile?.id;
    if (!userId) return;

    const { error } = await supabase
      .from('users')
      .update({
        selected_skill_id: skillId,
        skill_level: level,
        goal,
        onboarding_complete: true,
      })
      .eq('id', userId);
    if (error) throw error;

    set((state) => ({
      profile: state.profile
        ? { ...state.profile, selected_skill_id: skillId, skill_level: level, goal, onboarding_complete: true }
        : null,
      isOnboarded: true,
    }));
  },
}));
```

- [ ] **Step 3: Commit**

```bash
git add src/services/supabase.ts src/store/userStore.ts
git commit -m "feat: add Supabase client and user auth store"
```

---

### Task 4: Navigation Structure

**Files:**
- Create: `src/navigation/OnboardingNavigator.tsx`
- Create: `src/navigation/TabNavigator.tsx`
- Create: `src/navigation/RootNavigator.tsx`
- Create placeholder screens for each navigator

- [ ] **Step 1: Create placeholder screens**

Create minimal placeholder files for all screens. Each file follows this pattern:

```typescript
// src/screens/onboarding/WelcomeScreen.tsx (and all other screens)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

export function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.textPrimary, fontSize: 18 },
});
```

Create these files:
- `src/screens/onboarding/WelcomeScreen.tsx`
- `src/screens/onboarding/SkillSelectionScreen.tsx`
- `src/screens/onboarding/LevelSelectionScreen.tsx`
- `src/screens/onboarding/GoalSelectionScreen.tsx`
- `src/screens/onboarding/RoadmapPreviewScreen.tsx`
- `src/screens/home/DailyChallengeScreen.tsx`
- `src/screens/home/PracticeSessionScreen.tsx`
- `src/screens/home/AIFeedbackScreen.tsx`
- `src/screens/skilltree/SkillTreeScreen.tsx`
- `src/screens/community/FeedScreen.tsx`
- `src/screens/community/PostDetailScreen.tsx`
- `src/screens/stats/StreakDashboardScreen.tsx`
- `src/screens/stats/BadgesScreen.tsx`
- `src/screens/profile/ProfileScreen.tsx`
- `src/screens/profile/SettingsScreen.tsx`
- `src/screens/profile/SubscriptionScreen.tsx`

- [ ] **Step 2: Create src/navigation/OnboardingNavigator.tsx**

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SkillSelectionScreen } from '../screens/onboarding/SkillSelectionScreen';
import { LevelSelectionScreen } from '../screens/onboarding/LevelSelectionScreen';
import { GoalSelectionScreen } from '../screens/onboarding/GoalSelectionScreen';
import { RoadmapPreviewScreen } from '../screens/onboarding/RoadmapPreviewScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  SkillSelection: undefined;
  LevelSelection: { skillId: string };
  GoalSelection: { skillId: string; level: string };
  RoadmapPreview: { skillId: string; level: string; goal: string };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator({ skipWelcome = false }: { skipWelcome?: boolean }) {
  return (
    <Stack.Navigator
      initialRouteName={skipWelcome ? 'SkillSelection' : 'Welcome'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SkillSelection" component={SkillSelectionScreen} />
      <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="RoadmapPreview" component={RoadmapPreviewScreen} />
    </Stack.Navigator>
  );
}
```

- [ ] **Step 3: Create src/navigation/TabNavigator.tsx**

```typescript
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

// Home stack
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

// Community stack
const CommunityStack = createNativeStackNavigator();
function CommunityNavigator() {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
      <CommunityStack.Screen name="Feed" component={FeedScreen} />
      <CommunityStack.Screen name="PostDetail" component={PostDetailScreen} />
    </CommunityStack.Navigator>
  );
}

// Stats stack
const StatsStack = createNativeStackNavigator();
function StatsNavigator() {
  return (
    <StatsStack.Navigator screenOptions={{ headerShown: false }}>
      <StatsStack.Screen name="StreakDashboard" component={StreakDashboardScreen} />
      <StatsStack.Screen name="Badges" component={BadgesScreen} />
    </StatsStack.Navigator>
  );
}

// Profile stack
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
  const icons: Record<string, string> = {
    Home: '🏠', Tree: '🌳', Community: '👥', Stats: '📊', Profile: '👤',
  };
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
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" active={focused} /> }}
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

const tabStyles = StyleSheet.create({
  iconContainer: { alignItems: 'center', gap: 4 },
  indicator: { width: 20, height: 3, borderRadius: 1.5, backgroundColor: colors.primary },
  label: { fontSize: 10, color: colors.textDark, fontWeight: '500' },
  labelActive: { color: colors.primary, fontWeight: '600' },
});
```

- [ ] **Step 4: Create src/navigation/RootNavigator.tsx**

```typescript
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNavigator } from './OnboardingNavigator';
import { TabNavigator } from './TabNavigator';
import { useUserStore } from '../store/userStore';
import { supabase } from '../services/supabase';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { isAuthenticated, isOnboarded, isLoading, fetchProfile, setAuth } = useUserStore();

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(!!session);
      if (session) fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated || !isOnboarded ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingNavigator skipWelcome={isAuthenticated && !isOnboarded} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
});
```

- [ ] **Step 5: Update App.tsx**

```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 6: Verify app launches**

```bash
npx expo start
```

Expected: App launches, shows loading spinner then Welcome placeholder screen.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add navigation structure with all placeholder screens"
```

---

## Chunk 2: Supabase Database & Edge Functions

### Task 5: Database Migration

**Files:**
- Apply via Supabase MCP tool

- [ ] **Step 1: Create all tables via Supabase SQL**

Run this SQL via `mcp__claude_ai_Supabase__execute_sql` or `apply_migration`:

```sql
-- Enums
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE user_goal AS ENUM ('creativity', 'learn_faster', 'discipline');
CREATE TYPE tier_type AS ENUM ('basics', 'intermediate', 'advanced');
CREATE TYPE media_type AS ENUM ('photo', 'video', 'audio');
CREATE TYPE difficulty_type AS ENUM ('beginner', 'intermediate', 'advanced');

-- Users profile
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  selected_skill_id UUID,
  skill_level skill_level,
  goal user_goal,
  premium_expires_at TIMESTAMPTZ,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills catalog
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL
);

-- Skill tree nodes
CREATE TABLE skill_tree_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier tier_type NOT NULL,
  "order" INTEGER NOT NULL,
  unlock_after_streak INTEGER NOT NULL DEFAULT 0
);

-- FK for users.selected_skill_id
ALTER TABLE users ADD CONSTRAINT fk_selected_skill FOREIGN KEY (selected_skill_id) REFERENCES skills(id);

-- Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES skill_tree_nodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty difficulty_type NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 5,
  is_generated BOOLEAN NOT NULL DEFAULT FALSE,
  tips JSONB DEFAULT '[]'::jsonb
);

-- Practice sessions
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  skill_id UUID NOT NULL REFERENCES skills(id),
  media_url TEXT,
  media_type media_type NOT NULL DEFAULT 'photo',
  ai_feedback JSONB,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streaks
CREATE TABLE streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  freeze_tokens INTEGER DEFAULT 1,
  last_practice_date DATE
);

-- User progress
CREATE TABLE user_progress (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES skill_tree_nodes(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, node_id)
);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL
);

-- User badges
CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Follows
CREATE TABLE follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Likes
CREATE TABLE likes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practice_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, practice_id)
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practice_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roadmap
CREATE TABLE user_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 30),
  node_id UUID NOT NULL REFERENCES skill_tree_nodes(id),
  challenge_title TEXT NOT NULL,
  challenge_description TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, day_number)
);

-- Indexes
CREATE INDEX idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_skill ON practice_sessions(skill_id);
CREATE INDEX idx_practice_sessions_shared ON practice_sessions(is_shared) WHERE is_shared = TRUE;
CREATE INDEX idx_comments_practice ON comments(practice_id);
CREATE INDEX idx_likes_practice ON likes(practice_id);
CREATE INDEX idx_skill_tree_nodes_skill ON skill_tree_nodes(skill_id);
CREATE INDEX idx_user_roadmap_user ON user_roadmap(user_id);
```

- [ ] **Step 2: Enable RLS and create policies**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_tree_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmap ENABLE ROW LEVEL SECURITY;

-- Users: own data for full access
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Community: create a view for public user info (username, avatar only)
-- MVP tradeoff: allow all authenticated users to SELECT from users table
-- since all columns are non-sensitive. Premium status is not a secret.
CREATE POLICY "Authenticated users can read basic info" ON users FOR SELECT TO authenticated USING (TRUE);

-- Skills & nodes: readable by all authenticated
CREATE POLICY "Skills readable" ON skills FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Nodes readable" ON skill_tree_nodes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Challenges readable" ON challenges FOR SELECT TO authenticated USING (TRUE);

-- Practice sessions
CREATE POLICY "Own sessions" ON practice_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Shared sessions readable" ON practice_sessions FOR SELECT USING (is_shared = TRUE);

-- Streaks
CREATE POLICY "Own streaks" ON streaks FOR ALL USING (auth.uid() = user_id);

-- User progress
CREATE POLICY "Own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);

-- Badges
CREATE POLICY "Badges readable" ON badges FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Own user badges" ON user_badges FOR ALL USING (auth.uid() = user_id);

-- Social
CREATE POLICY "Follows own" ON follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Follows readable" ON follows FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Likes own" ON likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Likes readable" ON likes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Comments own" ON comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Comments readable" ON comments FOR SELECT TO authenticated USING (TRUE);

-- Roadmap
CREATE POLICY "Own roadmap" ON user_roadmap FOR ALL USING (auth.uid() = user_id);
```

- [ ] **Step 3: Seed skills and skill tree data**

```sql
-- Insert 20 skills
INSERT INTO skills (name, icon, description, category) VALUES
('Drawing', '✏️', 'Learn to draw from basics to advanced illustration', 'Visual Arts'),
('Painting', '🎨', 'Master painting techniques and color theory', 'Visual Arts'),
('Guitar', '🎸', 'Play guitar from first chords to full songs', 'Music'),
('Piano', '🎹', 'Learn piano from scales to compositions', 'Music'),
('Singing', '🎤', 'Develop your vocal range and technique', 'Music'),
('Public Speaking', '🎙️', 'Speak confidently in any setting', 'Communication'),
('Storytelling', '📖', 'Craft compelling narratives', 'Communication'),
('Photography', '📸', 'Capture stunning photos with any camera', 'Visual Arts'),
('Video Editing', '🎬', 'Edit videos like a professional', 'Digital'),
('Acting', '🎭', 'Express emotions and embody characters', 'Performance'),
('Stand-up Comedy', '😂', 'Write and deliver jokes that land', 'Performance'),
('Writing', '✍️', 'Write clearly and creatively', 'Communication'),
('Calligraphy', '🖊️', 'Master beautiful lettering styles', 'Visual Arts'),
('Animation', '🎞️', 'Bring drawings and ideas to life', 'Digital'),
('3D Modeling', '🧊', 'Create 3D objects and environments', 'Digital'),
('Dance', '💃', 'Move with rhythm and expression', 'Performance'),
('Magic Tricks', '🪄', 'Learn sleight of hand and illusions', 'Performance'),
('Beatboxing', '🥁', 'Create beats and rhythms with your voice', 'Music'),
('Filmmaking', '🎥', 'Direct and produce short films', 'Digital'),
('Language Pronunciation', '🗣️', 'Perfect your accent in any language', 'Communication');

-- Insert skill tree nodes for Drawing (as example — repeat pattern for all skills)
WITH drawing AS (SELECT id FROM skills WHERE name = 'Drawing')
INSERT INTO skill_tree_nodes (skill_id, name, tier, "order", unlock_after_streak) VALUES
((SELECT id FROM drawing), 'Lines', 'basics', 1, 0),
((SELECT id FROM drawing), 'Shapes', 'basics', 2, 3),
((SELECT id FROM drawing), 'Shading', 'basics', 3, 7),
((SELECT id FROM drawing), 'Perspective', 'intermediate', 1, 10),
((SELECT id FROM drawing), 'Anatomy', 'intermediate', 2, 14),
((SELECT id FROM drawing), 'Lighting', 'intermediate', 3, 18),
((SELECT id FROM drawing), 'Character Design', 'advanced', 1, 21),
((SELECT id FROM drawing), 'Storyboarding', 'advanced', 2, 25),
((SELECT id FROM drawing), 'Portfolio Piece', 'advanced', 3, 28);

-- Guitar
WITH guitar AS (SELECT id FROM skills WHERE name = 'Guitar')
INSERT INTO skill_tree_nodes (skill_id, name, tier, "order", unlock_after_streak) VALUES
((SELECT id FROM guitar), 'Open Chords', 'basics', 1, 0),
((SELECT id FROM guitar), 'Strumming Patterns', 'basics', 2, 3),
((SELECT id FROM guitar), 'Finger Exercises', 'basics', 3, 7),
((SELECT id FROM guitar), 'Barre Chords', 'intermediate', 1, 10),
((SELECT id FROM guitar), 'Scales', 'intermediate', 2, 14),
((SELECT id FROM guitar), 'Fingerpicking', 'intermediate', 3, 18),
((SELECT id FROM guitar), 'Improvisation', 'advanced', 1, 21),
((SELECT id FROM guitar), 'Song Writing', 'advanced', 2, 25),
((SELECT id FROM guitar), 'Performance', 'advanced', 3, 28);

-- Piano
WITH piano AS (SELECT id FROM skills WHERE name = 'Piano')
INSERT INTO skill_tree_nodes (skill_id, name, tier, "order", unlock_after_streak) VALUES
((SELECT id FROM piano), 'Basic Scales', 'basics', 1, 0),
((SELECT id FROM piano), 'Simple Chords', 'basics', 2, 3),
((SELECT id FROM piano), 'Hand Independence', 'basics', 3, 7),
((SELECT id FROM piano), 'Chord Progressions', 'intermediate', 1, 10),
((SELECT id FROM piano), 'Sight Reading', 'intermediate', 2, 14),
((SELECT id FROM piano), 'Dynamics', 'intermediate', 3, 18),
((SELECT id FROM piano), 'Jazz Voicings', 'advanced', 1, 21),
((SELECT id FROM piano), 'Composition', 'advanced', 2, 25),
((SELECT id FROM piano), 'Performance', 'advanced', 3, 28);

-- Singing
WITH singing AS (SELECT id FROM skills WHERE name = 'Singing')
INSERT INTO skill_tree_nodes (skill_id, name, tier, "order", unlock_after_streak) VALUES
((SELECT id FROM singing), 'Breathing', 'basics', 1, 0),
((SELECT id FROM singing), 'Pitch Control', 'basics', 2, 3),
((SELECT id FROM singing), 'Vocal Range', 'basics', 3, 7),
((SELECT id FROM singing), 'Vibrato', 'intermediate', 1, 10),
((SELECT id FROM singing), 'Harmonizing', 'intermediate', 2, 14),
((SELECT id FROM singing), 'Style', 'intermediate', 3, 18),
((SELECT id FROM singing), 'Runs & Riffs', 'advanced', 1, 21),
((SELECT id FROM singing), 'Song Interpretation', 'advanced', 2, 25),
((SELECT id FROM singing), 'Stage Presence', 'advanced', 3, 28);

-- Public Speaking
WITH ps AS (SELECT id FROM skills WHERE name = 'Public Speaking')
INSERT INTO skill_tree_nodes (skill_id, name, tier, "order", unlock_after_streak) VALUES
((SELECT id FROM ps), 'Eye Contact', 'basics', 1, 0),
((SELECT id FROM ps), 'Voice Projection', 'basics', 2, 3),
((SELECT id FROM ps), 'Body Language', 'basics', 3, 7),
((SELECT id FROM ps), 'Storytelling', 'intermediate', 1, 10),
((SELECT id FROM ps), 'Audience Engagement', 'intermediate', 2, 14),
((SELECT id FROM ps), 'Improvisation', 'intermediate', 3, 18),
((SELECT id FROM ps), 'Persuasion', 'advanced', 1, 21),
((SELECT id FROM ps), 'Debate', 'advanced', 2, 25),
((SELECT id FROM ps), 'Keynote Delivery', 'advanced', 3, 28);

-- Seed badges
INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES
('First Flame', 'Complete your first practice', '🔥', 'practices', 1),
('Week Warrior', 'Maintain a 7-day streak', '⚡', 'streak', 7),
('Fortnight Fighter', 'Maintain a 14-day streak', '💪', 'streak', 14),
('Monthly Master', 'Maintain a 30-day streak', '🏆', 'streak', 30),
('First Upload', 'Share your first practice', '📸', 'shares', 1),
('Ten Timer', 'Complete 10 practices', '🎯', 'practices', 10),
('Half Century', 'Complete 50 practices', '⭐', 'practices', 50),
('Century Club', 'Complete 100 practices', '💯', 'practices', 100),
('Node Unlocker', 'Unlock your first skill tree node', '🔓', 'nodes', 1),
('Tree Climber', 'Unlock 5 skill tree nodes', '🌳', 'nodes', 5);

-- Create a storage bucket for practice media
-- (This needs to be done via Supabase dashboard or API)
```

- [ ] **Step 4: Commit migration files locally**

Save the SQL as local reference:

```bash
mkdir -p supabase/migrations
# Save migration SQL to file for reference
git add supabase/
git commit -m "feat: add database schema, RLS policies, and seed data"
```

---

### Task 6: Deploy Edge Functions

**Files:**
- Deploy via Supabase MCP: `generate-challenge`, `analyze-practice`, `generate-roadmap`

- [ ] **Step 1: Deploy generate-challenge edge function**

Deploy via `mcp__claude_ai_Supabase__deploy_edge_function`:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skill_id, node_id, difficulty } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check cache
    const { data: cached } = await supabase
      .from("challenges")
      .select("*")
      .eq("skill_id", skill_id)
      .eq("node_id", node_id)
      .eq("difficulty", difficulty)
      .limit(5);

    if (cached && cached.length > 0) {
      const random = cached[Math.floor(Math.random() * cached.length)];
      return new Response(JSON.stringify(random), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get skill and node names
    const { data: skill } = await supabase.from("skills").select("name").eq("id", skill_id).single();
    const { data: node } = await supabase.from("skill_tree_nodes").select("name").eq("id", node_id).single();

    const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `Generate a 5-minute ${difficulty} ${skill?.name} practice challenge for the topic '${node?.name}'. Return ONLY valid JSON with this exact structure: { "title": "short title", "description": "detailed instructions for the 5-minute practice", "tips": ["tip1", "tip2", "tip3"], "duration": 5 }`
      }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const challenge = JSON.parse(content.text);

    // Cache it
    const { data: saved } = await supabase
      .from("challenges")
      .insert({
        skill_id,
        node_id,
        title: challenge.title,
        description: challenge.description,
        difficulty,
        duration_minutes: 5,
        is_generated: true,
      })
      .select()
      .single();

    return new Response(JSON.stringify({ ...saved, tips: challenge.tips }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

> **Note on video analysis:** MVP sends a single photo/frame to Claude Vision. The client captures a photo at the end of video recording and uploads that for analysis. Full multi-frame extraction is deferred to post-MVP.

- [ ] **Step 2: Deploy analyze-practice edge function**

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { media_url, media_type, challenge_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get challenge description
    const { data: challenge } = await supabase
      .from("challenges")
      .select("title, description")
      .eq("id", challenge_id)
      .single();

    // Download media
    const { data: fileData } = await supabase.storage
      .from("practices")
      .download(media_url);

    if (!fileData) throw new Error("Could not download media");

    const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

    // Convert to base64 (chunked to avoid stack overflow on large files)
    const buffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);
    const mediaTypeMap: Record<string, string> = {
      photo: "image/jpeg",
      video: "image/jpeg", // We send extracted frames as images
    };

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaTypeMap[media_type] || "image/jpeg", data: base64 },
          },
          {
            type: "text",
            text: `You are an encouraging AI coach. Analyze this practice attempt for the challenge: "${challenge?.title} - ${challenge?.description}". Return ONLY valid JSON: { "strengths": ["strength1", "strength2"], "mistakes": ["mistake1"], "improvement_tip": "one specific actionable tip", "encouragement": "brief encouraging message", "score": 7 }. Score 1-10. Be specific and constructive.`,
          },
        ],
      }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const feedback = JSON.parse(content.text);

    return new Response(JSON.stringify(feedback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: true,
        message: "Feedback unavailable — your practice is still saved. We'll retry shortly.",
        strengths: [],
        mistakes: [],
        improvement_tip: "",
        encouragement: "Great job practicing today! Keep it up.",
        score: 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

- [ ] **Step 3: Deploy generate-roadmap edge function**

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skill_id, skill_level, goal, user_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: skill } = await supabase.from("skills").select("name").eq("id", skill_id).single();
    const { data: nodes } = await supabase
      .from("skill_tree_nodes")
      .select("*")
      .eq("skill_id", skill_id)
      .order("order");

    if (!nodes || !skill) throw new Error("Skill or nodes not found");

    const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

    const nodeNames = nodes.map((n: any) => `${n.tier}: ${n.name}`).join(", ");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `Create a 30-day practice roadmap for a ${skill_level} learner studying ${skill.name} with the goal of "${goal}". Skill tree nodes: ${nodeNames}. Return ONLY a JSON array of 30 objects: [{ "day_number": 1, "node_name": "Lines", "challenge_title": "short title", "challenge_description": "5-minute practice instructions" }, ...]. Map each day to the appropriate skill tree node based on progression. Start with basics for beginners, skip to intermediate for intermediate learners, etc.`,
      }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const roadmap = JSON.parse(content.text);

    // Map node names to IDs and insert
    const nodeMap = new Map(nodes.map((n: any) => [n.name.toLowerCase(), n.id]));

    const rows = roadmap.map((day: any) => ({
      user_id,
      day_number: day.day_number,
      node_id: nodeMap.get(day.node_name?.toLowerCase()) || nodes[0].id,
      challenge_title: day.challenge_title,
      challenge_description: day.challenge_description,
    }));

    const { error } = await supabase.from("user_roadmap").insert(rows);
    if (error) throw error;

    return new Response(JSON.stringify(roadmap), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

- [ ] **Step 4: Set ANTHROPIC_API_KEY as Supabase secret**

Via Supabase dashboard or CLI: set `ANTHROPIC_API_KEY` in project secrets.

- [ ] **Step 5: Create storage bucket for practices**

Via Supabase dashboard: create bucket `practices` with public read access and RLS policies for upload.

- [ ] **Step 6: Commit edge function source locally**

```bash
mkdir -p supabase/functions/generate-challenge supabase/functions/analyze-practice supabase/functions/generate-roadmap
# Save function source files
git add supabase/functions/
git commit -m "feat: add edge functions for AI challenge generation, practice analysis, and roadmap"
```

---

### Task 7: AI Coach Service

**Files:**
- Create: `src/services/aiCoach.ts`

- [ ] **Step 1: Create src/services/aiCoach.ts**

```typescript
import { supabase } from './supabase';
import { AIFeedback, Challenge } from '../utils/types';

export async function generateChallenge(
  skillId: string,
  nodeId: string,
  difficulty: string
): Promise<Challenge> {
  const { data, error } = await supabase.functions.invoke('generate-challenge', {
    body: { skill_id: skillId, node_id: nodeId, difficulty },
  });
  if (error) throw error;
  return data;
}

export async function analyzePractice(
  mediaUrl: string,
  mediaType: 'photo' | 'video',
  challengeId: string
): Promise<AIFeedback> {
  const { data, error } = await supabase.functions.invoke('analyze-practice', {
    body: { media_url: mediaUrl, media_type: mediaType, challenge_id: challengeId },
  });
  if (error) throw error;
  return data;
}

export async function generateRoadmap(
  skillId: string,
  skillLevel: string,
  goal: string,
  userId: string
): Promise<any[]> {
  const { data, error } = await supabase.functions.invoke('generate-roadmap', {
    body: { skill_id: skillId, skill_level: skillLevel, goal, user_id: userId },
  });
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/aiCoach.ts
git commit -m "feat: add AI coach service with challenge generation and practice analysis"
```

---

## Chunk 3: Onboarding Screens

### Task 8: Welcome Screen with Auth

**Files:**
- Modify: `src/screens/onboarding/WelcomeScreen.tsx`

- [ ] **Step 1: Implement WelcomeScreen**

Build the premium welcome screen with email/password auth form, matching the dark glassmorphic mockup: centered logo with ambient glow, tagline "Talent is practice", email/password inputs, "Begin Your Journey" button, and "Already forging? Sign in" toggle.

Use `GlassCard` for the input containers, `Button` for primary CTA, `AmbientGlow` behind the logo. Use `LinearGradient` for the logo background. Include loading state on submit. Handle sign up / sign in toggle.

- [ ] **Step 2: Commit**

```bash
git add src/screens/onboarding/WelcomeScreen.tsx
git commit -m "feat: implement premium Welcome screen with auth"
```

### Task 9: Skill Selection Screen

**Files:**
- Modify: `src/screens/onboarding/SkillSelectionScreen.tsx`

- [ ] **Step 1: Implement SkillSelectionScreen**

Grid of skill cards (3 columns). Fetch skills from Supabase. Selected skill has `GlassCard strong` with orange glow. Step indicator "STEP 1 OF 3". "See all 20+ skills" link expands grid. Continue button at bottom.

- [ ] **Step 2: Commit**

```bash
git add src/screens/onboarding/SkillSelectionScreen.tsx
git commit -m "feat: implement Skill Selection screen"
```

### Task 10: Level Selection Screen

**Files:**
- Modify: `src/screens/onboarding/LevelSelectionScreen.tsx`

- [ ] **Step 1: Implement LevelSelectionScreen**

Three level options as `GlassCard` items with icon, title, subtitle. Selected item has `strong` variant with purple glow. Step indicator "STEP 2 OF 3". Receives `skillId` from navigation params.

- [ ] **Step 2: Commit**

```bash
git add src/screens/onboarding/LevelSelectionScreen.tsx
git commit -m "feat: implement Level Selection screen"
```

### Task 11: Goal Selection Screen

**Files:**
- Modify: `src/screens/onboarding/GoalSelectionScreen.tsx`

- [ ] **Step 1: Implement GoalSelectionScreen**

Three goal options as `GlassCard` items. "STEP 3 OF 3". "Generate My Roadmap →" button calls `completeOnboarding()` on userStore and triggers roadmap generation via edge function. Shows loading state during generation. Navigates to RoadmapPreview on success.

- [ ] **Step 2: Commit**

```bash
git add src/screens/onboarding/GoalSelectionScreen.tsx
git commit -m "feat: implement Goal Selection screen with roadmap generation"
```

### Task 12: Roadmap Preview Screen

**Files:**
- Modify: `src/screens/onboarding/RoadmapPreviewScreen.tsx`

- [ ] **Step 1: Implement RoadmapPreviewScreen**

Scrollable list of 30 days with challenge titles. Each day card shows day number, node name, challenge title. "Start Day 1" button at bottom transitions user to main app. Fetches roadmap from `user_roadmap` table.

- [ ] **Step 2: Commit**

```bash
git add src/screens/onboarding/RoadmapPreviewScreen.tsx
git commit -m "feat: implement Roadmap Preview screen"
```

---

## Chunk 4: Core Practice Loop

### Task 13: Remaining Zustand Stores

**Files:**
- Create: `src/store/challengeStore.ts`
- Create: `src/store/streakStore.ts`
- Create: `src/store/communityStore.ts`

- [ ] **Step 1: Create challengeStore**

State: `currentChallenge`, `timerState` ({ remaining, isRunning, isPaused }), `roadmap`, `isLoading`.
Actions: `fetchTodayChallenge()` (gets today's day from roadmap, fetches/generates challenge), `startTimer()`, `pauseTimer()`, `resetTimer()`, `submitPractice()` (upload media, call analyze-practice, save session).

- [ ] **Step 2: Create streakStore**

State: `currentStreak`, `longestStreak`, `freezeTokens`, `lastPracticeDate`, `badges`, `earnedBadges`.
Actions: `fetchStreak()`, `recordPractice()` (updates streak, checks for badge awards), `useFreeze()`, `checkAndUpdateStreak()` (runs on app open — implements streak rules from spec), `fetchBadges()`.

- [ ] **Step 3: Create communityStore**

State: `feed` (paginated), `userPosts`, `isLoading`.
Actions: `fetchFeed(page)`, `likePractice(id)`, `unlikePractice(id)`, `addComment(practiceId, text)`, `fetchComments(practiceId)`, `followUser(id)`, `unfollowUser(id)`, `sharePractice(sessionId)`.

- [ ] **Step 4: Commit**

```bash
git add src/store/
git commit -m "feat: add challenge, streak, and community Zustand stores"
```

### Task 14: Daily Challenge Screen

**Files:**
- Modify: `src/screens/home/DailyChallengeScreen.tsx`

- [ ] **Step 1: Implement DailyChallengeScreen**

Top section: greeting + streak counter (flame badge with `AmbientGlow`). Main: challenge card with `LinearGradient` (orange), showing title, description, duration/skill/tier tags, "START PRACTICE" button. Stats row below: three `GlassCard` items (streak, unlocked nodes, badges). Recent practice item at bottom. Tab bar at bottom (handled by navigator).

Calls `fetchTodayChallenge()` on mount. Calls `checkAndUpdateStreak()` on mount.

- [ ] **Step 2: Commit**

```bash
git add src/screens/home/DailyChallengeScreen.tsx
git commit -m "feat: implement Daily Challenge home screen"
```

### Task 15: Practice Session Screen

**Files:**
- Modify: `src/screens/home/PracticeSessionScreen.tsx`
- Create: `src/hooks/useTimer.ts`

- [ ] **Step 1: Create useTimer hook**

Custom hook using Reanimated shared values. Returns: `{ remaining, isRunning, isPaused, start, pause, resume, reset }`. Counts down from 300 seconds (5 min). Calls `onComplete` callback when timer hits 0. Animated color shift: white → orange at 60s remaining.

- [ ] **Step 2: Implement PracticeSessionScreen**

Dark screen (#000). Top: close button, large timer display (200 weight), pause button. Progress bar below timer. Camera preview area (Expo Camera). Challenge text. Bottom controls: photo capture, video record, audio record buttons. Center button is large with orange gradient + glow.

On capture: saves media, navigates to AIFeedback. On timer complete: prompts to submit.

- [ ] **Step 3: Commit**

```bash
git add src/screens/home/PracticeSessionScreen.tsx src/hooks/useTimer.ts
git commit -m "feat: implement Practice Session screen with camera and timer"
```

### Task 16: AI Feedback Screen

**Files:**
- Modify: `src/screens/home/AIFeedbackScreen.tsx`

- [ ] **Step 1: Implement AIFeedbackScreen**

Header: checkmark icon, "Practice Complete", day/skill/duration info. Four feedback cards with staggered fade-in animation (Reanimated): Strengths (green), To Improve (orange), Pro Tip (purple), Encouragement (neutral). Each card has colored border, label, and text. Bottom: Save and Share buttons. Loading state while waiting for AI response. Error state with retry button if AI fails.

Uses `Animated.FadeInDown` with delay per card (0, 200, 400, 600ms).

- [ ] **Step 2: Commit**

```bash
git add src/screens/home/AIFeedbackScreen.tsx
git commit -m "feat: implement AI Feedback screen with staggered animations"
```

---

## Chunk 5: Skill Tree, Stats, Community

### Task 17: Skill Tree Screen

**Files:**
- Modify: `src/screens/skilltree/SkillTreeScreen.tsx`

- [ ] **Step 1: Implement SkillTreeScreen**

Header: skill icon + name, progress count. Three tier sections (Basics, Intermediate, Advanced) with colored labels. Nodes as 64px rounded squares: unlocked = gradient fill (orange/purple/green by tier) with glow shadow, locked = dashed border + low opacity. Connector lines between nodes (gradient for unlocked, dim for locked). Fetches `skill_tree_nodes` and `user_progress` from Supabase.

Node unlock animation: `withSpring` scale 0 → 1 when newly unlocked.

- [ ] **Step 2: Commit**

```bash
git add src/screens/skilltree/SkillTreeScreen.tsx
git commit -m "feat: implement Skill Tree screen with node progression"
```

### Task 18: Streak Dashboard & Badges Screens

**Files:**
- Modify: `src/screens/stats/StreakDashboardScreen.tsx`
- Modify: `src/screens/stats/BadgesScreen.tsx`

- [ ] **Step 1: Implement StreakDashboardScreen**

Hero section: large flame emoji, streak number (48px, 900 weight, orange), "Day Streak" label. Ambient glow behind. Stats row: best streak, freeze tokens, total minutes (three `GlassCard` items). Badges section with grid of earned/locked badges.

Streak flame pulsing animation: `withRepeat(withSequence(withTiming(1.05), withTiming(1.0)))`.

- [ ] **Step 2: Implement BadgesScreen**

Grid of all badges. Earned: colored background with date earned. Locked: dashed border, low opacity, "Locked" label. Fetches from `badges` joined with `user_badges`.

- [ ] **Step 3: Commit**

```bash
git add src/screens/stats/StreakDashboardScreen.tsx src/screens/stats/BadgesScreen.tsx
git commit -m "feat: implement Streak Dashboard and Badges screens"
```

### Task 19: Community Feed & Post Detail

**Files:**
- Modify: `src/screens/community/FeedScreen.tsx`
- Modify: `src/screens/community/PostDetailScreen.tsx`

- [ ] **Step 1: Implement FeedScreen**

Header: "Community" title. FlatList of shared practice posts. Each post card: user avatar circle (initial letter, gradient bg), username, day/skill/streak info, media placeholder, like/comment counts. Like toggle on tap. Infinite scroll pagination. Premium gate check.

Posts fetched via Supabase query joining practice_sessions (is_shared=true) with users and skills, plus like/comment counts.

- [ ] **Step 2: Implement PostDetailScreen**

Full post view with comments list below. Comment input at bottom with send button. FlatList for comments. Each comment: avatar, username, text, timestamp.

- [ ] **Step 3: Commit**

```bash
git add src/screens/community/FeedScreen.tsx src/screens/community/PostDetailScreen.tsx
git commit -m "feat: implement Community Feed and Post Detail screens"
```

---

## Chunk 6: Profile, Settings, Subscription, Notifications

### Task 20: Profile Screen

**Files:**
- Modify: `src/screens/profile/ProfileScreen.tsx`

- [ ] **Step 1: Implement ProfileScreen**

User avatar (large circle with initial), username, member since date. Stats section: total practices, current skill, streak. Menu items as GlassCards: Settings, Subscription, Sign Out. Tap navigates to respective screens.

- [ ] **Step 2: Commit**

```bash
git add src/screens/profile/ProfileScreen.tsx
git commit -m "feat: implement Profile screen"
```

### Task 21: Settings Screen

**Files:**
- Modify: `src/screens/profile/SettingsScreen.tsx`
- Create: `src/services/notifications.ts`

- [ ] **Step 1: Create notifications service**

```typescript
// src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour: number = 20, minute: number = 0) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SkillForge',
      body: 'Your 5-minute practice is waiting 🔥',
    },
    trigger: { type: 'daily', hour, minute },
  });
}

export async function scheduleStreakReminder(streak: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SkillForge',
      body: `Don't break your ${streak}-day streak! Practice now 💪`,
    },
    trigger: { hour: 21, minute: 0, repeats: true },
  });
}

export async function updateAdaptiveReminder() {
  const lastTimesStr = await AsyncStorage.getItem('practice_times');
  if (!lastTimesStr) return;
  const times: number[] = JSON.parse(lastTimesStr);
  if (times.length < 3) return;
  const avgMinutes = Math.round(times.reduce((a, b) => a + b, 0) / times.length * 60);
  // 30 minutes before average practice time per spec
  const reminderMinutes = avgMinutes - 30;
  const reminderHour = Math.max(0, Math.floor(reminderMinutes / 60));
  const reminderMinute = ((reminderMinutes % 60) + 60) % 60;
  await scheduleDailyReminder(reminderHour, reminderMinute);
}

export async function recordPracticeTime() {
  const hour = new Date().getHours();
  const lastTimesStr = await AsyncStorage.getItem('practice_times');
  const times: number[] = lastTimesStr ? JSON.parse(lastTimesStr) : [];
  times.push(hour);
  if (times.length > 7) times.shift(); // Keep last 7
  await AsyncStorage.setItem('practice_times', JSON.stringify(times));
}
```

- [ ] **Step 2: Implement SettingsScreen**

Notification toggle (requests permissions on enable). Reminder time picker. Account section: change username, sign out. Dark glass cards for each section.

- [ ] **Step 3: Commit**

```bash
git add src/screens/profile/SettingsScreen.tsx src/services/notifications.ts
git commit -m "feat: implement Settings screen and notifications service"
```

### Task 22: Subscription Screen

**Files:**
- Modify: `src/screens/profile/SubscriptionScreen.tsx`
- Create: `src/services/purchases.ts`

- [ ] **Step 1: Create purchases service**

```typescript
// src/services/purchases.ts
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEY = Platform.select({
  ios: 'your_revenuecat_ios_key',
  android: 'your_revenuecat_android_key',
}) || '';

export async function initPurchases(userId: string) {
  Purchases.configure({ apiKey: API_KEY, appUserID: userId });
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages || [];
  } catch {
    return [];
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function checkPremium(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Implement SubscriptionScreen**

Premium upgrade screen. Header: "Go Premium". Feature comparison: free vs premium tier listed as items. Price: "$6.99/month". Subscribe button (calls `purchasePackage`). Restore purchases link. If already premium, show "You're Premium" with expiry date.

- [ ] **Step 3: Commit**

```bash
git add src/screens/profile/SubscriptionScreen.tsx src/services/purchases.ts
git commit -m "feat: implement Subscription screen with RevenueCat integration"
```

---

## Chunk 7: Polish & Final Integration

### Task 23: Animated Components

**Files:**
- Create: `src/components/StreakFlame.tsx`
- Create: `src/components/Timer.tsx`

- [ ] **Step 1: Create StreakFlame animated component**

Pulsing scale animation with `useSharedValue`, `withRepeat`, `withSequence`, `withTiming`. Scale 1.0 → 1.05 → 1.0. Glow intensity increases with streak count.

- [ ] **Step 2: Create Timer animated component**

Large countdown display using Reanimated. Color interpolation from white to orange at 60s remaining. Tabular nums font variant for stable layout.

- [ ] **Step 3: Commit**

```bash
git add src/components/StreakFlame.tsx src/components/Timer.tsx
git commit -m "feat: add animated StreakFlame and Timer components"
```

### Task 24: Remaining Skill Tree Seed Data

- [ ] **Step 1: Seed remaining 15 skill trees**

Run SQL to insert skill_tree_nodes for all remaining skills (Painting, Storytelling, Photography, Video editing, Acting, Stand-up comedy, Writing, Calligraphy, Animation, 3D modeling, Dance, Magic tricks, Beatboxing, Filmmaking, Language pronunciation). Each gets 9 nodes (3 per tier).

- [ ] **Step 2: Commit seed SQL locally**

```bash
git add supabase/
git commit -m "feat: seed skill tree nodes for all 20 skills"
```

### Task 25: App Entry Point & Final Wiring

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Wire up initialization**

In App.tsx, add: font loading (Inter via expo-font), splash screen handling, RevenueCat init, notification setup, streak check on app foreground (AppState listener).

- [ ] **Step 2: Full smoke test**

```bash
npx expo start
```

Walk through: sign up → select skill → select level → select goal → roadmap generated → daily challenge shows → start practice → capture photo → AI feedback → check skill tree → check stats → check community → check profile.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete SkillForge MVP with all screens and integrations"
```
