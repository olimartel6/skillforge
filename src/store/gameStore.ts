import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GameState {
  xp: number;
  dailyXp: number;
  dailyXpGoal: number;
  level: number;
  combo: number;
  maxCombo: number;
  lives: number;
  currentLesson: number;
  completedLessons: number[];
  isLoading: boolean;

  initialize: () => Promise<void>;
  addXp: (amount: number) => Promise<void>;
  incrementCombo: () => void;
  resetCombo: () => void;
  loseLife: () => void;
  resetLives: () => void;
  completeLesson: (lessonNumber: number) => Promise<void>;
  resetDailyXp: () => Promise<void>;
}

const STORAGE_KEY_XP = 'game_xp';
const STORAGE_KEY_DAILY_XP = 'game_daily_xp';
const STORAGE_KEY_DAILY_DATE = 'game_daily_date';
const STORAGE_KEY_COMPLETED = 'game_completed_lessons';

function calculateLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export const useGameStore = create<GameState>((set, get) => ({
  xp: 0,
  dailyXp: 0,
  dailyXpGoal: 100,
  level: 1,
  combo: 0,
  maxCombo: 0,
  lives: 3,
  currentLesson: 1,
  completedLessons: [],
  isLoading: true,

  initialize: async () => {
    try {
      const [storedXp, storedDailyXp, storedDate, storedCompleted] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_XP),
          AsyncStorage.getItem(STORAGE_KEY_DAILY_XP),
          AsyncStorage.getItem(STORAGE_KEY_DAILY_DATE),
          AsyncStorage.getItem(STORAGE_KEY_COMPLETED),
        ]);

      const xp = storedXp ? parseInt(storedXp, 10) : 0;
      const completedLessons: number[] = storedCompleted
        ? JSON.parse(storedCompleted)
        : [];

      const today = new Date().toISOString().split('T')[0];
      let dailyXp = 0;
      if (storedDate === today && storedDailyXp) {
        dailyXp = parseInt(storedDailyXp, 10);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_DAILY_DATE, today);
        await AsyncStorage.setItem(STORAGE_KEY_DAILY_XP, '0');
      }

      const currentLesson =
        completedLessons.length > 0
          ? Math.max(...completedLessons) + 1
          : 1;

      set({
        xp,
        dailyXp,
        level: calculateLevel(xp),
        completedLessons,
        currentLesson,
        isLoading: false,
        lives: 3,
        combo: 0,
        maxCombo: 0,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  addXp: async (amount: number) => {
    const state = get();
    const bonus = state.combo >= 3 ? amount * 2 : amount;
    const newXp = state.xp + bonus;
    const newDailyXp = state.dailyXp + bonus;

    set({
      xp: newXp,
      dailyXp: newDailyXp,
      level: calculateLevel(newXp),
    });

    await AsyncStorage.setItem(STORAGE_KEY_XP, String(newXp));
    await AsyncStorage.setItem(STORAGE_KEY_DAILY_XP, String(newDailyXp));
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(STORAGE_KEY_DAILY_DATE, today);
  },

  incrementCombo: () => {
    const state = get();
    const newCombo = state.combo + 1;
    set({
      combo: newCombo,
      maxCombo: Math.max(newCombo, state.maxCombo),
    });
  },

  resetCombo: () => {
    set({ combo: 0 });
  },

  loseLife: () => {
    set((state) => ({ lives: Math.max(0, state.lives - 1) }));
  },

  resetLives: () => {
    set({ lives: 3, combo: 0 });
  },

  completeLesson: async (lessonNumber: number) => {
    const state = get();
    const completed = state.completedLessons.includes(lessonNumber)
      ? state.completedLessons
      : [...state.completedLessons, lessonNumber];

    const currentLesson = Math.max(...completed) + 1;

    set({ completedLessons: completed, currentLesson });
    await AsyncStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completed));
  },

  resetDailyXp: async () => {
    set({ dailyXp: 0 });
    await AsyncStorage.setItem(STORAGE_KEY_DAILY_XP, '0');
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(STORAGE_KEY_DAILY_DATE, today);
  },
}));
