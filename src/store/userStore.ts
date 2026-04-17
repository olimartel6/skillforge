import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SkillLevel, Goal } from '../utils/types';
import { saveBackupDebounced } from '../services/cloudSync';

interface SkillProgress {
  roadmap: any[];
  streakData: any;
  earnedBadges: any[];
  practiceCount: number;
  gameData: any;
}

interface UserState {
  profile: User | null;
  isOnboarded: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  completeOnboarding: (skillId: string, level: SkillLevel, goal: Goal) => Promise<void>;
  changeSkill: (newSkillId: string) => Promise<void>;
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

// Keys that hold per-skill progress
const PROGRESS_KEYS = ['user_roadmap', 'streak_data', 'earned_badges', 'practice_count', 'game_xp', 'game_daily_xp', 'game_daily_date', 'game_completed_lessons'];

async function saveCurrentSkillProgress(skillId: string) {
  const progress: Record<string, string | null> = {};
  for (const key of PROGRESS_KEYS) {
    progress[key] = await AsyncStorage.getItem(key);
  }
  await AsyncStorage.setItem(`skill_progress_${skillId}`, JSON.stringify(progress));
}

async function loadSkillProgress(skillId: string) {
  const stored = await AsyncStorage.getItem(`skill_progress_${skillId}`);
  if (stored) {
    const progress = JSON.parse(stored) as Record<string, string | null>;
    for (const key of PROGRESS_KEYS) {
      if (progress[key]) {
        await AsyncStorage.setItem(key, progress[key]!);
      } else {
        await AsyncStorage.removeItem(key);
      }
    }
  } else {
    // New skill — clear progress keys
    for (const key of PROGRESS_KEYS) {
      await AsyncStorage.removeItem(key);
    }
  }
}

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
    saveBackupDebounced();
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
    saveBackupDebounced();
  },

  changeSkill: async (newSkillId) => {
    const profile = get().profile;
    if (!profile) return;

    // Save current skill progress
    if (profile.selected_skill_id) {
      await saveCurrentSkillProgress(profile.selected_skill_id);
    }

    // Load new skill progress (or clear if new)
    await loadSkillProgress(newSkillId);

    // Update profile
    const updated: User = {
      ...profile,
      selected_skill_id: newSkillId,
    };
    set({ profile: updated });
    await AsyncStorage.setItem('user_profile', JSON.stringify(updated));
    saveBackupDebounced();
  },

  signOut: async () => {
    await AsyncStorage.removeItem('user_profile');
    set({ profile: { ...DEFAULT_USER }, isOnboarded: false });
  },
}));
