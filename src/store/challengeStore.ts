import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { Challenge, UserRoadmap } from '../utils/types';

// --------------- Daily Leaderboard Bots ---------------

export interface DailyLeaderboardEntry {
  id: string;
  username: string;
  score: number;
  time: number; // seconds
  isCurrentUser: boolean;
}

const BOT_NAMES_DAILY = [
  'Luna', 'Phoenix', 'Atlas', 'Nova', 'Zephyr',
  'Ember', 'Storm', 'Sage', 'Orion', 'Vega',
  'Titan', 'Lyra', 'Blaze', 'Ivy', 'Rex',
  'Echo', 'Jade', 'Nyx', 'Cleo', 'Kai',
];

function getTodaySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function generateDailyBotScores(): DailyLeaderboardEntry[] {
  const seed = getTodaySeed();
  return BOT_NAMES_DAILY.map((name, i) => {
    const hash = ((seed * 31 + i * 17) * 2654435761) >>> 0;
    const score = 4 + (hash % 5); // 4-8 out of 8
    const time = 25 + (hash % 90); // 25-114 seconds
    return {
      id: `daily-bot-${i}`,
      username: name,
      score,
      time,
      isCurrentUser: false,
    };
  });
}

// --------------- Store ---------------

const STORAGE_CHALLENGE_STREAK = 'challenge_streak';
const STORAGE_CHALLENGE_LAST_DATE = 'challenge_last_date';

interface ChallengeState {
  currentChallenge: Challenge | null;
  timerState: { remaining: number; isRunning: boolean; isPaused: boolean };
  roadmap: UserRoadmap[];
  isLoading: boolean;
  challengeStreak: number;
  challengeLastDate: string | null;
  dailyLeaderboard: DailyLeaderboardEntry[];
  userDailyRank: number;
  fetchTodayChallenge: (skillId: string) => Promise<void>;
  fetchRoadmap: () => Promise<void>;
  setTimerState: (state: Partial<ChallengeState['timerState']>) => void;
  resetTimer: () => void;
  fetchChallengeStreak: () => Promise<void>;
  recordChallengeCompletion: () => Promise<void>;
  buildDailyLeaderboard: (userScore: number, userTime: number, username: string) => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  currentChallenge: null,
  timerState: { remaining: 300, isRunning: false, isPaused: false },
  roadmap: [],
  isLoading: false,
  challengeStreak: 0,
  challengeLastDate: null,
  dailyLeaderboard: [],
  userDailyRank: 0,

  fetchTodayChallenge: async (skillId) => {
    set({ isLoading: true });
    try {
      // Load roadmap from local storage
      let roadmap = get().roadmap;
      if (roadmap.length === 0) {
        await get().fetchRoadmap();
        roadmap = get().roadmap;
      }

      if (roadmap.length === 0) {
        // No roadmap yet — fetch a random challenge from Supabase for this skill
        const { data: nodes } = await supabase
          .from('skill_tree_nodes')
          .select('*')
          .eq('skill_id', skillId)
          .order('order')
          .limit(1);

        if (nodes && nodes.length > 0) {
          const { data: challenge } = await supabase
            .from('challenges')
            .select('*')
            .eq('skill_id', skillId)
            .eq('node_id', nodes[0].id)
            .limit(1)
            .maybeSingle();

          if (challenge) {
            set({ currentChallenge: challenge as Challenge, isLoading: false });
            return;
          }
        }

        // Create a default challenge
        set({
          currentChallenge: {
            id: 'default',
            skill_id: skillId,
            node_id: '',
            title: 'Free Practice',
            description: 'Practice your skill for 5 minutes. Focus on the fundamentals and have fun!',
            difficulty: 'beginner',
            duration_minutes: 5,
            is_generated: false,
            tips: ['Focus on the basics', 'Take your time', 'Have fun!'],
          },
          isLoading: false,
        });
        return;
      }

      // Determine today's day number
      const createdAt = new Date(roadmap[0].created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const dayNumber = Math.min(Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1, 30);

      const todayNode = roadmap.find((r) => r.day_number === dayNumber) || roadmap[0];

      set({
        currentChallenge: {
          id: todayNode.id,
          skill_id: skillId,
          node_id: todayNode.node_id,
          title: todayNode.challenge_title,
          description: todayNode.challenge_description,
          difficulty: 'beginner',
          duration_minutes: 5,
          is_generated: true,
        },
        timerState: { remaining: 300, isRunning: false, isPaused: false },
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchRoadmap: async () => {
    try {
      const stored = await AsyncStorage.getItem('user_roadmap');
      if (stored) {
        set({ roadmap: JSON.parse(stored) as UserRoadmap[] });
      }
    } catch {
      // Roadmap not available yet
    }
  },

  setTimerState: (partial) => {
    set((state) => ({
      timerState: { ...state.timerState, ...partial },
    }));
  },

  resetTimer: () => {
    const challenge = get().currentChallenge;
    const duration = challenge ? challenge.duration_minutes * 60 : 300;
    set({
      timerState: { remaining: duration, isRunning: false, isPaused: false },
    });
  },

  fetchChallengeStreak: async () => {
    try {
      const [storedStreak, storedDate] = await Promise.all([
        AsyncStorage.getItem(STORAGE_CHALLENGE_STREAK),
        AsyncStorage.getItem(STORAGE_CHALLENGE_LAST_DATE),
      ]);

      const streak = storedStreak ? parseInt(storedStreak, 10) : 0;
      const lastDate = storedDate || null;

      // Check if streak is still valid (yesterday or today)
      if (lastDate) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate !== today && lastDate !== yesterdayStr) {
          // Streak broken
          set({ challengeStreak: 0, challengeLastDate: lastDate });
          await AsyncStorage.setItem(STORAGE_CHALLENGE_STREAK, '0');
          return;
        }
      }

      set({ challengeStreak: streak, challengeLastDate: lastDate });
    } catch {
      // ignore
    }
  },

  recordChallengeCompletion: async () => {
    const today = new Date().toISOString().split('T')[0];
    const state = get();

    if (state.challengeLastDate === today) return; // Already completed today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak: number;
    if (state.challengeLastDate === yesterdayStr) {
      newStreak = state.challengeStreak + 1;
    } else {
      newStreak = 1;
    }

    set({ challengeStreak: newStreak, challengeLastDate: today });
    await AsyncStorage.setItem(STORAGE_CHALLENGE_STREAK, String(newStreak));
    await AsyncStorage.setItem(STORAGE_CHALLENGE_LAST_DATE, today);
  },

  buildDailyLeaderboard: (userScore: number, userTime: number, username: string) => {
    const bots = generateDailyBotScores();

    // Add user
    const userEntry: DailyLeaderboardEntry = {
      id: 'current-user',
      username,
      score: userScore,
      time: userTime,
      isCurrentUser: true,
    };
    bots.push(userEntry);

    // Sort: higher score first, then faster time
    bots.sort((a, b) => b.score - a.score || a.time - b.time);

    // Take top 15
    const leaderboard = bots.slice(0, 15);
    const userRank = leaderboard.findIndex((e) => e.isCurrentUser) + 1;

    set({ dailyLeaderboard: leaderboard, userDailyRank: userRank || leaderboard.length });
  },
}));
