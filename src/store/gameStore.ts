import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveBackupDebounced } from '../services/cloudSync';
import { useUserStore } from './userStore';
import { useLeagueStore } from './leagueStore';
import type { GameQuestion } from '../utils/gameQuestions';

export interface MissedQuestion {
  skillName: string;
  moduleName: string;
  question: GameQuestion;
  date: string;
}

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
  missedQuestions: MissedQuestion[];
  isLoading: boolean;

  initialize: () => Promise<void>;
  addXp: (amount: number) => Promise<void>;
  incrementCombo: () => void;
  resetCombo: () => void;
  loseLife: () => void;
  resetLives: () => void;
  completeLesson: (lessonNumber: number) => Promise<void>;
  resetDailyXp: () => Promise<void>;
  addMissedQuestion: (skillName: string, moduleName: string, question: GameQuestion) => Promise<void>;
  removeMissedQuestion: (prompt: string) => Promise<void>;
  getMissedQuestions: () => MissedQuestion[];
}

const STORAGE_KEY_XP = 'game_xp';
const STORAGE_KEY_DAILY_XP = 'game_daily_xp';
const STORAGE_KEY_DAILY_DATE = 'game_daily_date';
const STORAGE_KEY_COMPLETED = 'game_completed_lessons';
const STORAGE_KEY_MISSED = 'missed_questions';

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
  missedQuestions: [],
  isLoading: true,

  initialize: async () => {
    try {
      const [storedXp, storedDailyXp, storedDate, storedCompleted, storedMissed] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_XP),
          AsyncStorage.getItem(STORAGE_KEY_DAILY_XP),
          AsyncStorage.getItem(STORAGE_KEY_DAILY_DATE),
          AsyncStorage.getItem(STORAGE_KEY_COMPLETED),
          AsyncStorage.getItem(STORAGE_KEY_MISSED),
        ]);

      const xp = storedXp ? parseInt(storedXp, 10) : 0;
      const completedLessons: number[] = storedCompleted
        ? JSON.parse(storedCompleted)
        : [];
      const missedQuestions: MissedQuestion[] = storedMissed
        ? JSON.parse(storedMissed)
        : [];

      const today = new Date().toISOString().split('T')[0];
      let dailyXp = 0;
      if (storedDate === today && storedDailyXp) {
        dailyXp = parseInt(storedDailyXp, 10);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_DAILY_DATE, today);
        await AsyncStorage.setItem(STORAGE_KEY_DAILY_XP, '0');
      }

      let currentLesson: number;
      if (completedLessons.length > 0) {
        currentLesson = Math.max(...completedLessons) + 1;
      } else {
        // Adaptive start based on skill_level (only on first load with no progress)
        const userProfile = useUserStore.getState().profile;
        const skillLevel = userProfile?.skill_level;
        if (skillLevel === 'advanced') {
          currentLesson = 9;
        } else {
          currentLesson = 1;
        }
      }

      set({
        xp,
        dailyXp,
        level: calculateLevel(xp),
        completedLessons,
        missedQuestions,
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
    const oldLevel = state.level;
    // amount already includes combo bonus from GameSessionScreen
    const newXp = state.xp + amount;
    const newDailyXp = state.dailyXp + amount;
    const newLevel = calculateLevel(newXp);

    set({
      xp: newXp,
      dailyXp: newDailyXp,
      level: newLevel,
    });

    await AsyncStorage.setItem(STORAGE_KEY_XP, String(newXp));
    await AsyncStorage.setItem(STORAGE_KEY_DAILY_XP, String(newDailyXp));
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(STORAGE_KEY_DAILY_DATE, today);
    saveBackupDebounced();

    // Update iOS home screen widget
    try { const { syncWidgetFromStores } = require('../services/widgetData'); syncWidgetFromStores(); } catch {}

    // Update weekly league XP
    try { useLeagueStore.getState().addWeeklyXp(amount); } catch {}

    // Track per-skill XP for global leaderboard
    try {
      const { addSkillXp } = require('../screens/community/GlobalLeaderboardScreen');
      const cachedSkillName = await AsyncStorage.getItem('skilly_current_skill_name');
      if (cachedSkillName) {
        addSkillXp(cachedSkillName, amount);
      }
    } catch {}

    // Send level-up milestone notification
    if (newLevel > oldLevel) {
      try {
        const { sendLevelUpNotification } = require('../services/notifications');
        sendLevelUpNotification(newLevel);
      } catch {}
    }
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
    saveBackupDebounced();
  },

  resetDailyXp: async () => {
    set({ dailyXp: 0 });
    await AsyncStorage.setItem(STORAGE_KEY_DAILY_XP, '0');
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(STORAGE_KEY_DAILY_DATE, today);
  },

  addMissedQuestion: async (skillName: string, moduleName: string, question: GameQuestion) => {
    const state = get();
    // Deduplicate by prompt
    const exists = state.missedQuestions.some((mq) => mq.question.prompt === question.prompt);
    if (exists) return;

    const today = new Date().toISOString().split('T')[0];
    const entry: MissedQuestion = { skillName, moduleName, question, date: today };
    const updated = [...state.missedQuestions, entry].slice(-200); // max 200

    set({ missedQuestions: updated });
    await AsyncStorage.setItem(STORAGE_KEY_MISSED, JSON.stringify(updated));
  },

  removeMissedQuestion: async (prompt: string) => {
    const state = get();
    const updated = state.missedQuestions.filter((mq) => mq.question.prompt !== prompt);
    set({ missedQuestions: updated });
    await AsyncStorage.setItem(STORAGE_KEY_MISSED, JSON.stringify(updated));
  },

  getMissedQuestions: () => {
    return get().missedQuestions;
  },
}));
