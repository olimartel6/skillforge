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
