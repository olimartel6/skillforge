import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { generateChallenge } from '../services/aiCoach';
import { Challenge, UserRoadmap } from '../utils/types';

interface ChallengeState {
  currentChallenge: Challenge | null;
  timerState: { remaining: number; isRunning: boolean; isPaused: boolean };
  roadmap: UserRoadmap[];
  isLoading: boolean;
  fetchTodayChallenge: (userId: string, skillId: string) => Promise<void>;
  fetchRoadmap: (userId: string) => Promise<void>;
  setTimerState: (state: Partial<ChallengeState['timerState']>) => void;
  resetTimer: () => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  currentChallenge: null,
  timerState: { remaining: 300, isRunning: false, isPaused: false },
  roadmap: [],
  isLoading: false,

  fetchTodayChallenge: async (userId, skillId) => {
    set({ isLoading: true });
    try {
      // Fetch or ensure roadmap is loaded
      let roadmap = get().roadmap;
      if (roadmap.length === 0) {
        await get().fetchRoadmap(userId);
        roadmap = get().roadmap;
      }

      if (roadmap.length === 0) {
        set({ isLoading: false });
        return;
      }

      // Determine today's day number based on roadmap creation date
      const createdAt = new Date(roadmap[0].created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const dayNumber = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

      // Find today's roadmap node
      const todayNode = roadmap.find((r) => r.day_number === dayNumber);
      if (!todayNode) {
        // If we've exceeded the roadmap length, use the last node
        const lastNode = roadmap[roadmap.length - 1];
        set({ isLoading: false });
        // Try to get an existing challenge for this node
        const { data: existing } = await supabase
          .from('challenges')
          .select('*')
          .eq('node_id', lastNode.node_id)
          .eq('skill_id', skillId)
          .limit(1)
          .single();

        if (existing) {
          set({ currentChallenge: existing as Challenge });
        }
        return;
      }

      // Check if a challenge already exists for today's node
      const { data: existingChallenge } = await supabase
        .from('challenges')
        .select('*')
        .eq('node_id', todayNode.node_id)
        .eq('skill_id', skillId)
        .limit(1)
        .single();

      if (existingChallenge) {
        set({
          currentChallenge: existingChallenge as Challenge,
          timerState: {
            remaining: (existingChallenge.duration_minutes || 5) * 60,
            isRunning: false,
            isPaused: false,
          },
          isLoading: false,
        });
        return;
      }

      // Generate a new challenge via AI
      const challenge = await generateChallenge(skillId, todayNode.node_id, 'intermediate');
      set({
        currentChallenge: challenge,
        timerState: {
          remaining: (challenge.duration_minutes || 5) * 60,
          isRunning: false,
          isPaused: false,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching today challenge:', error);
      set({ isLoading: false });
    }
  },

  fetchRoadmap: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roadmap')
        .select('*')
        .eq('user_id', userId)
        .order('day_number', { ascending: true });

      if (error) throw error;
      set({ roadmap: (data ?? []) as UserRoadmap[] });
    } catch (error) {
      console.error('Error fetching roadmap:', error);
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
}));
