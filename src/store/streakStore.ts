import { create } from 'zustand';
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
  fetchStreak: (userId: string) => Promise<void>;
  recordPractice: (userId: string) => Promise<void>;
  checkAndUpdateStreak: (userId: string) => Promise<void>;
  fetchBadges: (userId: string) => Promise<void>;
  checkBadgeConditions: (userId: string, streak: number) => Promise<void>;
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateString(d);
}

export const useStreakStore = create<StreakState>((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  freezeTokens: 0,
  lastPracticeDate: null,
  badges: [],
  earnedBadges: [],
  isLoading: false,

  fetchStreak: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        set({
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          freezeTokens: data.freeze_tokens,
          lastPracticeDate: data.last_practice_date,
          isLoading: false,
        });
      } else {
        // Create initial streak record
        const { error: insertError } = await supabase
          .from('streaks')
          .insert({
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            freeze_tokens: 3,
            last_practice_date: null,
          });
        if (insertError) throw insertError;
        set({ freezeTokens: 3, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
      set({ isLoading: false });
    }
  },

  checkAndUpdateStreak: async (userId) => {
    const state = get();
    if (!state.lastPracticeDate) return;

    const today = getDateString(new Date());
    const yesterday = getYesterday();

    // Already practiced today — no action needed
    if (state.lastPracticeDate === today) return;

    // Practiced yesterday — streak continues, nothing to do until they practice
    if (state.lastPracticeDate === yesterday) return;

    // Missed yesterday (lastPracticeDate is older than yesterday)
    if (state.lastPracticeDate < yesterday) {
      if (state.freezeTokens > 0) {
        // Use a freeze token to preserve streak
        const newFreezeTokens = state.freezeTokens - 1;
        const { error } = await supabase
          .from('streaks')
          .update({
            freeze_tokens: newFreezeTokens,
            last_practice_date: yesterday, // pretend they practiced yesterday
          })
          .eq('user_id', userId);

        if (!error) {
          set({
            freezeTokens: newFreezeTokens,
            lastPracticeDate: yesterday,
          });
        }
      } else {
        // Reset streak
        const { error } = await supabase
          .from('streaks')
          .update({ current_streak: 0 })
          .eq('user_id', userId);

        if (!error) {
          set({ currentStreak: 0 });
        }
      }
    }
  },

  recordPractice: async (userId) => {
    const today = getDateString(new Date());
    const state = get();

    // Don't double-count same-day practice
    if (state.lastPracticeDate === today) return;

    const newStreak = state.currentStreak + 1;
    const newLongest = Math.max(newStreak, state.longestStreak);

    try {
      const { error } = await supabase
        .from('streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_practice_date: today,
        })
        .eq('user_id', userId);

      if (error) throw error;

      set({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastPracticeDate: today,
      });

      // Check badge conditions
      await get().checkBadgeConditions(userId, newStreak);
    } catch (error) {
      console.error('Error recording practice:', error);
    }
  },

  checkBadgeConditions: async (userId, streak) => {
    const { badges, earnedBadges } = get();
    const earnedIds = new Set(earnedBadges.map((eb) => eb.badge_id));

    for (const badge of badges) {
      if (earnedIds.has(badge.id)) continue;

      let earned = false;
      if (badge.condition_type === 'streak' && streak >= badge.condition_value) {
        earned = true;
      }

      if (earned) {
        const { error } = await supabase
          .from('user_badges')
          .insert({ user_id: userId, badge_id: badge.id });

        if (!error) {
          set((s) => ({
            earnedBadges: [
              ...s.earnedBadges,
              { user_id: userId, badge_id: badge.id, earned_at: new Date().toISOString() },
            ],
          }));
        }
      }
    }
  },

  fetchBadges: async (userId) => {
    try {
      const [badgesRes, earnedRes] = await Promise.all([
        supabase.from('badges').select('*'),
        supabase
          .from('user_badges')
          .select('*, badge:badges(*)')
          .eq('user_id', userId),
      ]);

      if (badgesRes.error) throw badgesRes.error;
      if (earnedRes.error) throw earnedRes.error;

      set({
        badges: (badgesRes.data ?? []) as Badge[],
        earnedBadges: (earnedRes.data ?? []) as UserBadge[],
      });
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  },
}));

