import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { Challenge, UserRoadmap } from '../utils/types';

interface ChallengeState {
  currentChallenge: Challenge | null;
  timerState: { remaining: number; isRunning: boolean; isPaused: boolean };
  roadmap: UserRoadmap[];
  isLoading: boolean;
  fetchTodayChallenge: (skillId: string) => Promise<void>;
  fetchRoadmap: () => Promise<void>;
  setTimerState: (state: Partial<ChallengeState['timerState']>) => void;
  resetTimer: () => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  currentChallenge: null,
  timerState: { remaining: 300, isRunning: false, isPaused: false },
  roadmap: [],
  isLoading: false,

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
    } catch (error) {
      console.error('Error fetching today challenge:', error);
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
}));
