import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { Badge, UserBadge } from '../utils/types';

// --------------- Local Achievement Badges ---------------

export const LOCAL_BADGES: Badge[] = [
  // Quiz Mastery
  { id: 'local_perfect_lesson', name: 'First Perfect Lesson', description: '100% accuracy on a lesson', icon: '\uD83C\uDFAF', condition_type: 'quiz', condition_value: 1 },
  { id: 'local_combo_king', name: 'Combo King', description: 'Hit a x4 combo', icon: '\uD83D\uDD25', condition_type: 'quiz', condition_value: 4 },
  { id: 'local_speed_demon', name: 'Speed Demon', description: 'Complete a lesson under 30 seconds', icon: '\u26A1', condition_type: 'quiz', condition_value: 30 },
  // Trading Sim
  { id: 'local_first_trade', name: 'First Trade', description: 'Complete your first sim trade', icon: '\uD83D\uDCC8', condition_type: 'trading', condition_value: 1 },
  { id: 'local_profit_master', name: 'Profit Master', description: 'Reach $10K target in trading sim', icon: '\uD83D\uDCB0', condition_type: 'trading', condition_value: 10000 },
  // Social
  { id: 'local_social_butterfly', name: 'Social Butterfly', description: 'Play your first live game', icon: '\uD83E\uDD8B', condition_type: 'social', condition_value: 1 },
  { id: 'local_rivalry', name: 'Rivalry', description: 'Beat a friend in league', icon: '\u2694\uFE0F', condition_type: 'social', condition_value: 1 },
  // Content
  { id: 'local_knowledge_seeker', name: 'Knowledge Seeker', description: 'Complete 50 lessons', icon: '\uD83D\uDCDA', condition_type: 'content', condition_value: 50 },
  { id: 'local_skill_collector', name: 'Skill Collector', description: 'Try 5 different skills', icon: '\uD83C\uDFA8', condition_type: 'content', condition_value: 5 },
  { id: 'local_century', name: 'Century', description: 'Complete 100 lessons', icon: '\uD83D\uDCAF', condition_type: 'content', condition_value: 100 },
];

const STORAGE_LOCAL_BADGES = 'local_earned_badges';
const STORAGE_ACHIEVEMENT_STATS = 'achievement_stats';

export interface AchievementStats {
  perfectLessons: number;
  maxComboEver: number;
  fastestLesson: number; // seconds, 9999 means not set
  tradeCount: number;
  tradingProfitReached: boolean;
  liveGamesPlayed: number;
  leagueFriendsBeaten: number;
  lessonsCompleted: number;
  skillsTried: string[];
}

const DEFAULT_STATS: AchievementStats = {
  perfectLessons: 0,
  maxComboEver: 0,
  fastestLesson: 9999,
  tradeCount: 0,
  tradingProfitReached: false,
  liveGamesPlayed: 0,
  leagueFriendsBeaten: 0,
  lessonsCompleted: 0,
  skillsTried: [],
};

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  freezeTokens: number;
  lastPracticeDate: string | null;
  badges: Badge[];
  earnedBadges: UserBadge[];
  isLoading: boolean;
  achievementStats: AchievementStats;
  lastEarnedBadge: Badge | null;
  fetchStreak: () => Promise<void>;
  recordPractice: () => Promise<void>;
  checkAndUpdateStreak: () => Promise<void>;
  fetchBadges: () => Promise<void>;
  updateAchievementStats: (partial: Partial<AchievementStats>) => Promise<void>;
  checkLocalBadges: () => Promise<Badge | null>;
  dismissBadgeToast: () => void;
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateString(d);
}

async function persistStreak(data: any) {
  await AsyncStorage.setItem('streak_data', JSON.stringify(data));
}

export const useStreakStore = create<StreakState>((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  freezeTokens: 3,
  lastPracticeDate: null,
  badges: [],
  earnedBadges: [],
  isLoading: false,
  achievementStats: DEFAULT_STATS,
  lastEarnedBadge: null,

  fetchStreak: async () => {
    set({ isLoading: true });
    try {
      const [stored, statsStr] = await Promise.all([
        AsyncStorage.getItem('streak_data'),
        AsyncStorage.getItem(STORAGE_ACHIEVEMENT_STATS),
      ]);
      const stats: AchievementStats = statsStr ? JSON.parse(statsStr) : DEFAULT_STATS;
      if (stored) {
        set({ ...JSON.parse(stored), achievementStats: stats, isLoading: false });
      } else {
        set({ currentStreak: 0, longestStreak: 0, freezeTokens: 3, lastPracticeDate: null, achievementStats: stats, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  checkAndUpdateStreak: async () => {
    const state = get();
    if (!state.lastPracticeDate) return;

    const today = getDateString(new Date());
    const yesterday = getYesterday();

    if (state.lastPracticeDate === today) return;
    if (state.lastPracticeDate === yesterday) return;

    if (state.lastPracticeDate < yesterday) {
      if (state.freezeTokens > 0) {
        const updates = {
          currentStreak: state.currentStreak,
          longestStreak: state.longestStreak,
          freezeTokens: state.freezeTokens - 1,
          lastPracticeDate: yesterday,
        };
        set(updates);
        await persistStreak(updates);
      } else {
        const updates = {
          currentStreak: 0,
          longestStreak: state.longestStreak,
          freezeTokens: 0,
          lastPracticeDate: state.lastPracticeDate,
        };
        set(updates);
        await persistStreak(updates);
      }
    }
  },

  recordPractice: async () => {
    const today = getDateString(new Date());
    const state = get();

    if (state.lastPracticeDate === today) return;

    const newStreak = state.currentStreak + 1;
    const newLongest = Math.max(newStreak, state.longestStreak);

    const updates = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      freezeTokens: state.freezeTokens,
      lastPracticeDate: today,
    };
    set(updates);
    await persistStreak(updates);

    // Send streak milestone notification (3, 7, 14, 30, 100 days)
    try {
      const { sendStreakMilestoneNotification } = require('../services/notifications');
      sendStreakMilestoneNotification(newStreak);
    } catch {}

    // Update iOS home screen widget
    try { const { syncWidgetFromStores } = require('../services/widgetData'); syncWidgetFromStores(); } catch {}

    // Check badge conditions
    const { badges, earnedBadges } = get();
    const earnedIds = new Set(earnedBadges.map((eb) => eb.badge_id));

    for (const badge of badges) {
      if (earnedIds.has(badge.id)) continue;
      if (badge.condition_type === 'streak' && newStreak >= badge.condition_value) {
        const newEarned: UserBadge = {
          user_id: 'local-user',
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
        };
        const updatedEarned = [...get().earnedBadges, newEarned];
        set({ earnedBadges: updatedEarned });
        await AsyncStorage.setItem('earned_badges', JSON.stringify(updatedEarned));
      }
    }
  },

  fetchBadges: async () => {
    try {
      // Badges catalog from Supabase (public)
      const { data: badgesData } = await supabase.from('badges').select('*');
      // Earned badges from local storage (both Supabase badges + local achievement badges)
      const [earnedStr, localEarnedStr] = await Promise.all([
        AsyncStorage.getItem('earned_badges'),
        AsyncStorage.getItem(STORAGE_LOCAL_BADGES),
      ]);
      const earned: UserBadge[] = earnedStr ? JSON.parse(earnedStr) : [];
      const localEarned: UserBadge[] = localEarnedStr ? JSON.parse(localEarnedStr) : [];

      // Merge Supabase badges with local achievement badges
      const allBadges = [...((badgesData ?? []) as Badge[]), ...LOCAL_BADGES];
      const allEarned = [...earned, ...localEarned];

      set({
        badges: allBadges,
        earnedBadges: allEarned,
      });
    } catch {
      set({ badges: LOCAL_BADGES, earnedBadges: [] });
    }
  },

  updateAchievementStats: async (partial: Partial<AchievementStats>) => {
    const current = get().achievementStats;
    const updated = { ...current, ...partial };

    // Special merge for skillsTried (union of arrays)
    if (partial.skillsTried) {
      const existing = new Set(current.skillsTried);
      partial.skillsTried.forEach((s) => existing.add(s));
      updated.skillsTried = Array.from(existing);
    }

    set({ achievementStats: updated });
    await AsyncStorage.setItem(STORAGE_ACHIEVEMENT_STATS, JSON.stringify(updated));

    // After updating stats, check for new badges
    await get().checkLocalBadges();
  },

  checkLocalBadges: async () => {
    const { achievementStats, earnedBadges } = get();
    const earnedIds = new Set(earnedBadges.map((eb) => eb.badge_id));
    let newlyEarned: Badge | null = null;

    for (const badge of LOCAL_BADGES) {
      if (earnedIds.has(badge.id)) continue;

      let earned = false;

      switch (badge.id) {
        case 'local_perfect_lesson':
          earned = achievementStats.perfectLessons >= 1;
          break;
        case 'local_combo_king':
          earned = achievementStats.maxComboEver >= 4;
          break;
        case 'local_speed_demon':
          earned = achievementStats.fastestLesson <= 30;
          break;
        case 'local_first_trade':
          earned = achievementStats.tradeCount >= 1;
          break;
        case 'local_profit_master':
          earned = achievementStats.tradingProfitReached;
          break;
        case 'local_social_butterfly':
          earned = achievementStats.liveGamesPlayed >= 1;
          break;
        case 'local_rivalry':
          earned = achievementStats.leagueFriendsBeaten >= 1;
          break;
        case 'local_knowledge_seeker':
          earned = achievementStats.lessonsCompleted >= 50;
          break;
        case 'local_skill_collector':
          earned = achievementStats.skillsTried.length >= 5;
          break;
        case 'local_century':
          earned = achievementStats.lessonsCompleted >= 100;
          break;
      }

      if (earned) {
        const newEarned: UserBadge = {
          user_id: 'local-user',
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
        };
        const localEarnedStr = await AsyncStorage.getItem(STORAGE_LOCAL_BADGES);
        const localEarned: UserBadge[] = localEarnedStr ? JSON.parse(localEarnedStr) : [];
        localEarned.push(newEarned);
        await AsyncStorage.setItem(STORAGE_LOCAL_BADGES, JSON.stringify(localEarned));

        const updatedAll = [...get().earnedBadges, newEarned];
        set({ earnedBadges: updatedAll, lastEarnedBadge: badge });
        newlyEarned = badge;
        // Only show one badge toast at a time
        break;
      }
    }

    return newlyEarned;
  },

  dismissBadgeToast: () => {
    set({ lastEarnedBadge: null });
  },
}));
