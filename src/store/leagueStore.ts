/*
 * ============================================================
 * SUPABASE SQL — Run this migration in the Supabase SQL Editor
 * ============================================================
 *
 * -- League members table: tracks each user's weekly XP per league
 * CREATE TABLE IF NOT EXISTS league_members (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
 *   league TEXT NOT NULL DEFAULT 'bronze',
 *   weekly_xp INTEGER NOT NULL DEFAULT 0,
 *   week_start DATE NOT NULL DEFAULT (date_trunc('week', now())::date),
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   updated_at TIMESTAMPTZ DEFAULT now(),
 *   UNIQUE(user_id, week_start)
 * );
 *
 * -- Index for fast ranking queries
 * CREATE INDEX idx_league_members_ranking
 *   ON league_members(week_start, league, weekly_xp DESC);
 *
 * CREATE INDEX idx_league_members_user
 *   ON league_members(user_id, week_start DESC);
 *
 * -- Enable RLS
 * ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY "Users can read league members in their league"
 *   ON league_members FOR SELECT
 *   USING (true);
 *
 * CREATE POLICY "Users can update their own league row"
 *   ON league_members FOR UPDATE
 *   USING (auth.uid() = user_id);
 *
 * CREATE POLICY "Users can insert their own league row"
 *   ON league_members FOR INSERT
 *   WITH CHECK (auth.uid() = user_id);
 *
 * -- View: rankings per league for current week
 * CREATE OR REPLACE VIEW league_rankings AS
 * SELECT
 *   lm.*,
 *   ROW_NUMBER() OVER (
 *     PARTITION BY lm.league, lm.week_start
 *     ORDER BY lm.weekly_xp DESC
 *   ) AS rank
 * FROM league_members lm
 * WHERE lm.week_start = date_trunc('week', now())::date;
 *
 * -- Function: process promotions/relegations (run via cron every Monday)
 * CREATE OR REPLACE FUNCTION process_league_promotions()
 * RETURNS void AS $$
 * DECLARE
 *   prev_week DATE := (date_trunc('week', now()) - interval '7 days')::date;
 *   leagues TEXT[] := ARRAY['bronze','silver','gold','platinum','diamond'];
 *   i INTEGER;
 *   total_in_league INTEGER;
 * BEGIN
 *   FOR i IN 1..array_length(leagues, 1) LOOP
 *     SELECT COUNT(*) INTO total_in_league
 *     FROM league_members
 *     WHERE week_start = prev_week AND league = leagues[i];
 *
 *     IF total_in_league = 0 THEN CONTINUE; END IF;
 *
 *     -- Promote top 10 (not from diamond)
 *     IF i < array_length(leagues, 1) THEN
 *       UPDATE league_members SET league = leagues[i + 1]
 *       WHERE user_id IN (
 *         SELECT user_id FROM league_members
 *         WHERE week_start = prev_week AND league = leagues[i]
 *         ORDER BY weekly_xp DESC LIMIT 10
 *       ) AND week_start = prev_week;
 *     END IF;
 *
 *     -- Relegate bottom 3 (not from bronze)
 *     IF i > 1 THEN
 *       UPDATE league_members SET league = leagues[i - 1]
 *       WHERE user_id IN (
 *         SELECT user_id FROM league_members
 *         WHERE week_start = prev_week AND league = leagues[i]
 *         ORDER BY weekly_xp ASC LIMIT 3
 *       ) AND week_start = prev_week;
 *     END IF;
 *   END LOOP;
 * END;
 * $$ LANGUAGE plpgsql;
 *
 * ============================================================
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --------------- Types ---------------

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface LeagueMember {
  id: string;
  username: string;
  weekly_xp: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface LeagueInfo {
  tier: LeagueTier;
  label: string;
  icon: string;
  color: string;
  gradient: [string, string];
}

export type PromotionStatus = 'promoted' | 'relegated' | 'safe' | null;

export interface LeagueState {
  currentLeague: LeagueTier;
  weeklyXp: number;
  rank: number;
  totalMembers: number;
  members: LeagueMember[];
  promotionStatus: PromotionStatus;
  weekStart: string; // ISO date string (Monday)
  isLoading: boolean;

  initialize: () => Promise<void>;
  addWeeklyXp: (amount: number) => Promise<void>;
  checkWeekReset: () => Promise<void>;
  refreshMembers: () => void;
}

// --------------- Constants ---------------

export const LEAGUES: LeagueInfo[] = [
  { tier: 'bronze',   label: 'Bronze',   icon: '\uD83E\uDD49', color: '#CD7F32', gradient: ['#CD7F32', '#8B5A2B'] },
  { tier: 'silver',   label: 'Silver',   icon: '\uD83E\uDD48', color: '#C0C0C0', gradient: ['#C0C0C0', '#808080'] },
  { tier: 'gold',     label: 'Gold',     icon: '\uD83E\uDD47', color: '#FFD700', gradient: ['#FFD700', '#DAA520'] },
  { tier: 'platinum', label: 'Platinum', icon: '\uD83D\uDC8E', color: '#E5E4E2', gradient: ['#E5E4E2', '#B0ACA8'] },
  { tier: 'diamond',  label: 'Diamond',  icon: '\uD83D\uDC51', color: '#B9F2FF', gradient: ['#B9F2FF', '#00CED1'] },
];

export function getLeagueInfo(tier: LeagueTier): LeagueInfo {
  return LEAGUES.find((l) => l.tier === tier) || LEAGUES[0];
}

export const PROMOTION_THRESHOLD = 10; // Top 10 get promoted
export const RELEGATION_COUNT = 3;     // Bottom 3 get relegated

// --------------- Fake members for offline ---------------

const FAKE_LEAGUE_NAMES = [
  'Luna', 'Phoenix', 'Atlas', 'Nova', 'Zephyr',
  'Ember', 'Storm', 'Sage', 'Orion', 'Vega',
  'Titan', 'Lyra', 'Blaze', 'Ivy', 'Rex',
  'Echo', 'Jade', 'Nyx', 'Cleo', 'Kai',
  'Ren', 'Mira', 'Axel', 'Wren', 'Juno',
  'Finn', 'Thea', 'Rowan', 'Skye', 'Vale',
];

function generateFakeMembers(weeklyXp: number, league: LeagueTier): LeagueMember[] {
  const weekSeed = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const leagueMultiplier = LEAGUES.findIndex((l) => l.tier === league) + 1;

  const fakeMembers: LeagueMember[] = FAKE_LEAGUE_NAMES.map((name, i) => {
    const hash = ((weekSeed * 31 + i * 17 + leagueMultiplier * 7) * 2654435761) >>> 0;
    const xp = 20 + (hash % (800 * leagueMultiplier));
    return {
      id: `league-fake-${i}`,
      username: name,
      weekly_xp: xp,
      rank: 0,
      isCurrentUser: false,
    };
  });

  // Add current user
  fakeMembers.push({
    id: 'current-user',
    username: 'You',
    weekly_xp: weeklyXp,
    rank: 0,
    isCurrentUser: true,
  });

  // Sort descending by XP
  fakeMembers.sort((a, b) => b.weekly_xp - a.weekly_xp);

  // Assign ranks, take top 30
  return fakeMembers.slice(0, 30).map((m, i) => ({ ...m, rank: i + 1 }));
}

// --------------- Week helpers ---------------

function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

// --------------- Storage keys ---------------

const STORAGE_LEAGUE = 'league_current';
const STORAGE_WEEKLY_XP = 'league_weekly_xp';
const STORAGE_WEEK_START = 'league_week_start';

// --------------- Store ---------------

export const useLeagueStore = create<LeagueState>((set, get) => ({
  currentLeague: 'bronze',
  weeklyXp: 0,
  rank: 0,
  totalMembers: 30,
  members: [],
  promotionStatus: null,
  weekStart: getCurrentWeekStart(),
  isLoading: true,

  initialize: async () => {
    try {
      const [storedLeague, storedXp, storedWeek] = await Promise.all([
        AsyncStorage.getItem(STORAGE_LEAGUE),
        AsyncStorage.getItem(STORAGE_WEEKLY_XP),
        AsyncStorage.getItem(STORAGE_WEEK_START),
      ]);

      const league = (storedLeague as LeagueTier) || 'bronze';
      const weeklyXp = storedXp ? parseInt(storedXp, 10) : 0;
      const weekStart = storedWeek || getCurrentWeekStart();
      const currentWeek = getCurrentWeekStart();

      // Check if we need to reset for a new week
      if (weekStart !== currentWeek) {
        // Process promotion/relegation based on last week's standings
        const members = generateFakeMembers(weeklyXp, league);
        const userMember = members.find((m) => m.isCurrentUser);
        const userRank = userMember?.rank || members.length;
        const totalMembers = members.length;

        let newLeague = league;
        let status: PromotionStatus = 'safe';

        if (userRank <= PROMOTION_THRESHOLD && league !== 'diamond') {
          const leagueIndex = LEAGUES.findIndex((l) => l.tier === league);
          newLeague = LEAGUES[leagueIndex + 1].tier;
          status = 'promoted';
        } else if (userRank > totalMembers - RELEGATION_COUNT && league !== 'bronze') {
          const leagueIndex = LEAGUES.findIndex((l) => l.tier === league);
          newLeague = LEAGUES[leagueIndex - 1].tier;
          status = 'relegated';
        }

        // Reset for new week
        const newMembers = generateFakeMembers(0, newLeague);
        await Promise.all([
          AsyncStorage.setItem(STORAGE_LEAGUE, newLeague),
          AsyncStorage.setItem(STORAGE_WEEKLY_XP, '0'),
          AsyncStorage.setItem(STORAGE_WEEK_START, currentWeek),
        ]);

        set({
          currentLeague: newLeague,
          weeklyXp: 0,
          weekStart: currentWeek,
          members: newMembers,
          rank: newMembers.find((m) => m.isCurrentUser)?.rank || newMembers.length,
          totalMembers: newMembers.length,
          promotionStatus: status,
          isLoading: false,
        });
      } else {
        const members = generateFakeMembers(weeklyXp, league);
        const userMember = members.find((m) => m.isCurrentUser);

        set({
          currentLeague: league,
          weeklyXp,
          weekStart,
          members,
          rank: userMember?.rank || members.length,
          totalMembers: members.length,
          promotionStatus: null,
          isLoading: false,
        });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addWeeklyXp: async (amount: number) => {
    const state = get();
    const newXp = state.weeklyXp + amount;

    // Regenerate members with updated XP
    const members = generateFakeMembers(newXp, state.currentLeague);
    const userMember = members.find((m) => m.isCurrentUser);

    set({
      weeklyXp: newXp,
      members,
      rank: userMember?.rank || members.length,
    });

    await AsyncStorage.setItem(STORAGE_WEEKLY_XP, String(newXp));
    await AsyncStorage.setItem('league_rank', String(userMember?.rank || members.length));
  },

  checkWeekReset: async () => {
    const state = get();
    const currentWeek = getCurrentWeekStart();
    if (state.weekStart !== currentWeek) {
      await state.initialize();
    }
  },

  refreshMembers: () => {
    const state = get();
    const members = generateFakeMembers(state.weeklyXp, state.currentLeague);
    const userMember = members.find((m) => m.isCurrentUser);
    set({
      members,
      rank: userMember?.rank || members.length,
      totalMembers: members.length,
    });
  },
}));
