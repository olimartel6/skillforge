/**
 * Widget Data Bridge
 *
 * Saves app state to iOS App Group shared UserDefaults
 * so the home screen widget can read it.
 *
 * Uses react-native-shared-group-preferences on iOS,
 * falls back to a no-op on Android / when unavailable.
 */
import { Platform } from 'react-native';

const APP_GROUP = 'group.com.olimartel6.skilly';
const WIDGET_DATA_KEY = 'widget_data';

export interface WidgetPayload {
  currentStreak: number;
  longestStreak: number;
  dailyXp: number;
  dailyXpGoal: number;
  level: number;
  totalXp: number;
  selectedSkill: string | null;
  lastUpdated: string;
}

/**
 * Write widget data to the shared App Group UserDefaults.
 * Uses NativeModules to call SharedGroupPreferences (installed separately)
 * or falls back to the raw RCTSharedGroupPreferences if available.
 *
 * This is a best-effort operation — it never throws.
 */
export async function updateWidgetData(payload: WidgetPayload): Promise<void> {
  if (Platform.OS !== 'ios') return;

  try {
    const SharedGroupPreferences = requireSharedGroupPreferences();
    if (!SharedGroupPreferences) return;

    const data = { ...payload, lastUpdated: new Date().toISOString() };
    await SharedGroupPreferences.setItem(WIDGET_DATA_KEY, data, APP_GROUP);

    // Request widget timeline reload via WidgetKit
    reloadWidgetTimelines();
  } catch (e) {
    // Best-effort: widget update failures must never crash the app
    console.warn('[WidgetData] Failed to update widget:', e);
  }
}

/**
 * Convenience: pull current state from stores and push to widget.
 * Call this on app launch and after every lesson completion.
 */
export async function syncWidgetFromStores(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  try {
    const { useGameStore } = require('../store/gameStore');
    const { useStreakStore } = require('../store/streakStore');
    const { useUserStore } = require('../store/userStore');

    const game = useGameStore.getState();
    const streak = useStreakStore.getState();
    const user = useUserStore.getState();

    await updateWidgetData({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      dailyXp: game.dailyXp,
      dailyXpGoal: game.dailyXpGoal,
      level: game.level,
      totalXp: game.xp,
      selectedSkill: user.profile?.selected_skill_id ?? null,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[WidgetData] syncWidgetFromStores failed:', e);
  }
}

// --------------- Native Module Helpers ---------------

function requireSharedGroupPreferences(): any {
  try {
    return require('react-native-shared-group-preferences').default;
  } catch {
    // Package not installed — widget data bridge is a no-op
    return null;
  }
}

function reloadWidgetTimelines(): void {
  try {
    const { NativeModules } = require('react-native');
    // The config plugin injects a small native module for WidgetKit reload
    NativeModules.SkillyWidgetModule?.reloadAllTimelines?.();
  } catch {
    // WidgetKit reload unavailable — widget will refresh on its own schedule
  }
}
