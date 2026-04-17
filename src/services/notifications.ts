import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour: number = 20, minute: number = 0) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Skilly', body: 'Your 5-minute practice is waiting \uD83D\uDD25' },
    trigger: { type: 'daily' as any, hour, minute },
  });
}

/**
 * Schedule streak reminder at 8 PM daily.
 * Only fires if user hasn't practiced today.
 */
export async function scheduleStreakReminder() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // Cancel existing streak reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === 'streak_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    // Schedule new streak reminder at 8 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Skilly',
        body: "Your streak will expire! Don't forget your 5 min today \uD83D\uDD25",
        data: { type: 'streak_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });
  } catch (e) { console.warn('scheduleStreakReminder failed:', e); }
}

/**
 * Re-schedule notifications on app launch if enabled.
 */
export async function rescheduleNotificationsOnLaunch() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // Check if user has practiced today
    const today = new Date().toISOString().split('T')[0];
    const lastPracticeDate = await AsyncStorage.getItem('skilly_daily_lesson_date');

    if (lastPracticeDate === today) {
      // Already practiced today, cancel streak reminders
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        if (notif.content.data?.type === 'streak_reminder') {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
      return;
    }

    // Haven't practiced today, ensure streak reminder is scheduled
    await scheduleStreakReminder();
  } catch (e) { console.warn('rescheduleNotificationsOnLaunch failed:', e); }
}

/**
 * Send a local "friend passed you" notification.
 * Called when we detect (via Supabase Realtime or polling) that a friend overtook the user.
 */
export async function sendFriendPassedNotification(friendName: string) {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    const { t } = require('../i18n');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('social.friendPassedTitle'),
        body: t('social.friendPassedBody', { friendName }),
        data: { type: 'friend_passed_you', screen: 'Leaderboard' },
      },
      trigger: null, // fire immediately
    });
  } catch (e) { console.warn('sendFriendPassedNotification failed:', e); }
}

/**
 * ──────────────────────────────────────────────────────────────
 * Supabase Edge Function — social_competition_notify
 * ──────────────────────────────────────────────────────────────
 * Deploy as: supabase functions deploy social_competition_notify
 *
 * This function is triggered by a Postgres database trigger that fires
 * whenever a user's weekly_xp is updated in the `profiles` table.
 * It compares the new XP with the user's friends and sends a push
 * notification to any friend who was just overtaken.
 *
 * --- supabase/functions/social_competition_notify/index.ts ---
 *
 * import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
 * import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
 *
 * const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
 *
 * serve(async (req) => {
 *   const { record, old_record } = await req.json();
 *   const userId = record.id;
 *   const newXp = record.weekly_xp;
 *   const oldXp = old_record?.weekly_xp ?? 0;
 *
 *   if (newXp <= oldXp) return new Response('no change', { status: 200 });
 *
 *   const supabase = createClient(
 *     Deno.env.get('SUPABASE_URL')!,
 *     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
 *   );
 *
 *   // Get user's friends who were just overtaken
 *   const { data: friends } = await supabase
 *     .from('friends')
 *     .select('friend_id')
 *     .eq('user_id', userId);
 *
 *   if (!friends?.length) return new Response('no friends', { status: 200 });
 *
 *   const friendIds = friends.map((f: any) => f.friend_id);
 *
 *   // Find friends whose XP the user just passed (was below, now above)
 *   const { data: overtaken } = await supabase
 *     .from('profiles')
 *     .select('id, push_token, username, weekly_xp, language')
 *     .in('id', friendIds)
 *     .gt('weekly_xp', oldXp)     // they were above old XP
 *     .lte('weekly_xp', newXp);   // but now user's XP >= theirs
 *
 *   if (!overtaken?.length) return new Response('no overtakes', { status: 200 });
 *
 *   const userName = record.username ?? 'Someone';
 *
 *   // Send push to each overtaken friend via Expo Push API
 *   const messages = overtaken
 *     .filter((f: any) => f.push_token)
 *     .map((f: any) => {
 *       const lang = f.language ?? 'en';
 *       const title = lang === 'fr' ? 'Tu t\'es fait dépasser!'
 *                   : lang === 'es' ? 'Te han superado!'
 *                   : 'You\'ve been passed!';
 *       const body = lang === 'fr' ? `${userName} vient de te dépasser au classement!`
 *                  : lang === 'es' ? `${userName} te acaba de superar en la clasificación!`
 *                  : `${userName} just passed you in the rankings!`;
 *       return {
 *         to: f.push_token,
 *         title,
 *         body,
 *         data: { type: 'friend_passed_you', screen: 'Leaderboard' },
 *         sound: 'default',
 *       };
 *     });
 *
 *   if (messages.length) {
 *     await fetch(EXPO_PUSH_URL, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(messages),
 *     });
 *   }
 *
 *   return new Response(JSON.stringify({ sent: messages.length }), { status: 200 });
 * });
 *
 * --- Database trigger (run via Supabase SQL editor) ---
 *
 * CREATE OR REPLACE FUNCTION notify_social_competition()
 * RETURNS trigger AS $$
 * BEGIN
 *   IF NEW.weekly_xp > OLD.weekly_xp THEN
 *     PERFORM net.http_post(
 *       url := current_setting('app.settings.edge_function_url') || '/social_competition_notify',
 *       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
 *       body := jsonb_build_object('record', row_to_json(NEW), 'old_record', row_to_json(OLD))
 *     );
 *   END IF;
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql;
 *
 * CREATE TRIGGER on_weekly_xp_update
 *   AFTER UPDATE OF weekly_xp ON profiles
 *   FOR EACH ROW
 *   EXECUTE FUNCTION notify_social_competition();
 *
 * ──────────────────────────────────────────────────────────────
 */

export async function recordPracticeTime() {
  const hour = new Date().getHours();
  const raw = await AsyncStorage.getItem('practice_times');
  const times: number[] = raw ? JSON.parse(raw) : [];
  times.push(hour);
  if (times.length > 7) times.shift();
  await AsyncStorage.setItem('practice_times', JSON.stringify(times));
}

// ──────────────────────────────────────────────────────────────
// Smart Notification System
// ──────────────────────────────────────────────────────────────

const NOTIF_TIMESTAMPS_KEY = 'smart_notif_timestamps';

/** Read last-sent timestamps for each notification type to prevent spam. */
async function getNotifTimestamps(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_TIMESTAMPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

/** Record that a notification type was scheduled now. */
async function setNotifTimestamp(type: string) {
  const stamps = await getNotifTimestamps();
  stamps[type] = new Date().toISOString();
  await AsyncStorage.setItem(NOTIF_TIMESTAMPS_KEY, JSON.stringify(stamps));
}

/** Check if a notification type was already sent today. */
async function wasSentToday(type: string): Promise<boolean> {
  const stamps = await getNotifTimestamps();
  if (!stamps[type]) return false;
  const today = new Date().toISOString().split('T')[0];
  return stamps[type].startsWith(today);
}

/** Cancel all scheduled notifications matching a given data type. */
async function cancelByType(type: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === type) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// 1. Streak at Risk — 9 PM if no practice today & streak > 0
// ──────────────────────────────────────────────────────────────

export async function scheduleStreakAtRisk() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    await cancelByType('streak_at_risk');

    // Only schedule if user has an active streak and hasn't practiced today
    const streakRaw = await AsyncStorage.getItem('streak_data');
    if (!streakRaw) return;
    const streak = JSON.parse(streakRaw);
    if (!streak.currentStreak || streak.currentStreak <= 0) return;

    const today = new Date().toISOString().split('T')[0];
    const lastPractice = await AsyncStorage.getItem('skilly_daily_lesson_date');
    if (lastPractice === today) return; // already practiced

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Skilly',
        body: `You're about to lose your ${streak.currentStreak}-day streak! 🔥 Complete a lesson before midnight`,
        data: { type: 'streak_at_risk' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 21,
        minute: 0,
      },
    });

    await setNotifTimestamp('streak_at_risk');
  } catch (e) { console.warn('scheduleStreakAtRisk failed:', e); }
}

// ──────────────────────────────────────────────────────────────
// 2. Milestone Celebrations — immediate on level-up or streak milestone
// ──────────────────────────────────────────────────────────────

const STREAK_MILESTONES = [3, 7, 14, 30, 100];

export async function sendLevelUpNotification(newLevel: number) {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Skilly',
        body: `You just hit Level ${newLevel}! 🎉 Keep going!`,
        data: { type: 'milestone_level', level: newLevel },
      },
      trigger: null, // fire immediately
    });

    await setNotifTimestamp(`milestone_level_${newLevel}`);
  } catch (e) { console.warn('sendLevelUpNotification failed:', e); }
}

export async function sendStreakMilestoneNotification(streakDays: number) {
  try {
    if (!STREAK_MILESTONES.includes(streakDays)) return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // Don't send same milestone twice
    const alreadySent = await wasSentToday(`milestone_streak_${streakDays}`);
    if (alreadySent) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Skilly',
        body: `${streakDays}-day streak! 🔥🎉 You're on fire!`,
        data: { type: 'milestone_streak', streak: streakDays },
      },
      trigger: null,
    });

    await setNotifTimestamp(`milestone_streak_${streakDays}`);
  } catch (e) { console.warn('sendStreakMilestoneNotification failed:', e); }
}

// ──────────────────────────────────────────────────────────────
// 3. Come Back — schedule when user hasn't opened in 2+ days
// ──────────────────────────────────────────────────────────────

const COMEBACK_MESSAGES: { days: number; body: string }[] = [
  { days: 2, body: "It's been 2 days since your last lesson. Your skills are getting rusty! 📉" },
  { days: 5, body: "5 days without practice — don't let your progress slip away! 📉 Come back for a quick lesson" },
  { days: 7, body: "A whole week without Skilly! 😢 Your streak is waiting — jump back in today" },
];

export async function scheduleComebackNotifications() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    await cancelByType('comeback');

    const now = new Date();

    for (const msg of COMEBACK_MESSAGES) {
      const triggerDate = new Date(now);
      triggerDate.setDate(triggerDate.getDate() + msg.days);
      triggerDate.setHours(18, 0, 0, 0); // 6 PM

      // Only schedule if trigger date is in the future
      if (triggerDate.getTime() <= now.getTime()) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Skilly',
          body: msg.body,
          data: { type: 'comeback', days: msg.days },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }

    await setNotifTimestamp('comeback');
  } catch (e) { console.warn('scheduleComebackNotifications failed:', e); }
}

/** Cancel comeback notifications (call when user opens app or completes a lesson). */
export async function cancelComebackNotifications() {
  try {
    await cancelByType('comeback');
  } catch (e) { console.warn('cancelComebackNotifications failed:', e); }
}

// ──────────────────────────────────────────────────────────────
// 4. League Updates — Saturday evening if near promotion/relegation
// ──────────────────────────────────────────────────────────────

export async function scheduleLeagueEndNotification() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    await cancelByType('league_update');

    // Read league state from AsyncStorage
    const [storedLeague, storedXp] = await Promise.all([
      AsyncStorage.getItem('league_current'),
      AsyncStorage.getItem('league_weekly_xp'),
    ]);

    if (!storedLeague) return;

    const weeklyXp = storedXp ? parseInt(storedXp, 10) : 0;

    // Find next Saturday at 7 PM
    const now = new Date();
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
    if (daysUntilSaturday === 0 && now.getHours() >= 19) return; // already past Saturday 7 PM

    const saturday = new Date(now);
    saturday.setDate(now.getDate() + (daysUntilSaturday === 0 ? 0 : daysUntilSaturday));
    saturday.setHours(19, 0, 0, 0);

    if (saturday.getTime() <= now.getTime()) return;

    // We always schedule — the message adapts based on current rank
    // The rank info will be approximate since we compute it at schedule time
    const rankRaw = await AsyncStorage.getItem('league_rank');
    const rank = rankRaw ? parseInt(rankRaw, 10) : 15;

    let body: string;
    if (rank <= 10) {
      body = `The league ends tomorrow! You're #${rank} — one more lesson could clinch promotion 🏆`;
    } else if (rank > 27) {
      body = `The league ends tomorrow! You're at risk of relegation (#${rank}) — a quick lesson could save you ⚠️`;
    } else {
      body = `The league ends tomorrow! Push for the top 10 to get promoted 🏆`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Skilly',
        body,
        data: { type: 'league_update', screen: 'Leaderboard' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: saturday,
      },
    });

    await setNotifTimestamp('league_update');
  } catch (e) { console.warn('scheduleLeagueEndNotification failed:', e); }
}

// ──────────────────────────────────────────────────────────────
// 5. Daily Challenge Reminder — noon if not yet completed
// ──────────────────────────────────────────────────────────────

export async function scheduleDailyChallengeReminder() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    await cancelByType('daily_challenge');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Skilly',
        body: "Today's Daily Challenge is waiting! 🎯 Can you beat yesterday's score?",
        data: { type: 'daily_challenge' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 12,
        minute: 0,
      },
    });

    await setNotifTimestamp('daily_challenge');
  } catch (e) { console.warn('scheduleDailyChallengeReminder failed:', e); }
}

/** Cancel daily challenge reminder (call when user completes the daily challenge). */
export async function cancelDailyChallengeReminder() {
  try {
    await cancelByType('daily_challenge');
  } catch (e) { console.warn('cancelDailyChallengeReminder failed:', e); }
}

// ──────────────────────────────────────────────────────────────
// Master Rescheduler — call on app launch
// ──────────────────────────────────────────────────────────────

/**
 * Set up all conditional smart notifications.
 * Called from App.tsx on launch after rescheduleNotificationsOnLaunch().
 */
export async function rescheduleSmartNotifications() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // Cancel comeback notifications since user just opened the app
    await cancelComebackNotifications();

    // Re-schedule all smart notifications in parallel
    await Promise.all([
      scheduleStreakAtRisk(),
      scheduleComebackNotifications(),
      scheduleLeagueEndNotification(),
      scheduleDailyChallengeReminder(),
    ]);
  } catch (e) { console.warn('rescheduleSmartNotifications failed:', e); }
}
