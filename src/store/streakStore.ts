import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { Badge, UserBadge } from '../utils/types';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  freezeTokens: number;
  lastPracticeDate: string | null;
  badges: Badge[];
  earnedBadges: UserBadge[];
  isLoading: boolean;
  fetchStreak: () => Promise<void>;
  recordPractice: () => Promise<void>;
  checkAndUpdateStreak: () => Promise<void>;
  fetchBadges: () => Promise<void>;
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

  fetchStreak: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem('streak_data');
      if (stored) {
        set({ ...JSON.parse(stored), isLoading: false });
      } else {
        set({ currentStreak: 0, longestStreak: 0, freezeTokens: 3, lastPracticeDate: null, isLoading: false });
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
      // Earned badges from local storage
      const earnedStr = await AsyncStorage.getItem('earned_badges');
      const earned: UserBadge[] = earnedStr ? JSON.parse(earnedStr) : [];

      set({
        badges: (badgesData ?? []) as Badge[],
        earnedBadges: earned,
      });
    } catch {
      set({ badges: [], earnedBadges: [] });
    }
  },
}));
