import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SkillLevel, Goal } from '../utils/types';

interface UserState {
  profile: User | null;
  isOnboarded: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  completeOnboarding: (skillId: string, level: SkillLevel, goal: Goal) => Promise<void>;
  signOut: () => Promise<void>;
}

const DEFAULT_USER: User = {
  id: 'local-user',
  username: 'Forger',
  avatar_url: null,
  selected_skill_id: null,
  skill_level: null,
  goal: null,
  premium_expires_at: null,
  onboarding_complete: false,
  created_at: new Date().toISOString(),
};

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isOnboarded: false,
  isLoading: true,

  initialize: async () => {
    try {
      const stored = await AsyncStorage.getItem('user_profile');
      if (stored) {
        const profile = JSON.parse(stored) as User;
        set({
          profile,
          isOnboarded: profile.onboarding_complete,
          isLoading: false,
        });
      } else {
        set({
          profile: { ...DEFAULT_USER },
          isOnboarded: false,
          isLoading: false,
        });
      }
    } catch {
      set({ profile: { ...DEFAULT_USER }, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const profile = get().profile;
    if (!profile) return;

    const updated = { ...profile, ...updates };
    set({ profile: updated });
    await AsyncStorage.setItem('user_profile', JSON.stringify(updated));
  },

  completeOnboarding: async (skillId, level, goal) => {
    const profile = get().profile;
    if (!profile) return;

    const updated: User = {
      ...profile,
      selected_skill_id: skillId,
      skill_level: level,
      goal,
      onboarding_complete: true,
    };

    set({ profile: updated, isOnboarded: true });
    await AsyncStorage.setItem('user_profile', JSON.stringify(updated));
  },

  signOut: async () => {
    await AsyncStorage.removeItem('user_profile');
    set({ profile: { ...DEFAULT_USER }, isOnboarded: false });
  },
}));
