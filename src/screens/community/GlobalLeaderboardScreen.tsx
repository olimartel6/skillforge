import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { GlassCard } from '../../components/GlassCard';
import { useGameStore } from '../../store/gameStore';
import { useUserStore } from '../../store/userStore';
import { AVATAR_GRADIENTS } from './fakeData';
import { t } from '../../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --------------- Skill pills ---------------

interface SkillPill {
  id: string;
  label: string;
  icon: string;
}

const SKILL_PILLS: SkillPill[] = [
  { id: 'all', label: 'All', icon: '' },
  { id: 'Trading', label: 'Trading', icon: '' },
  { id: 'Sales', label: 'Sales', icon: '' },
  { id: 'Business', label: 'Business', icon: '' },
  { id: 'Coding', label: 'Coding', icon: '' },
  { id: 'Marketing', label: 'Marketing', icon: '' },
  { id: 'AI Tools', label: 'AI Tools', icon: '' },
  { id: 'Online Business', label: 'Online Biz', icon: '' },
  { id: 'Real Estate', label: 'Real Estate', icon: '' },
  { id: 'Side Hustles', label: 'Side Hustles', icon: '' },
  { id: 'Negotiation', label: 'Negotiation', icon: '' },
  { id: 'Persuasion', label: 'Persuasion', icon: '' },
  { id: 'Chess', label: 'Chess', icon: '' },
  { id: 'Fitness', label: 'Fitness', icon: '' },
  { id: 'Cooking', label: 'Cooking', icon: '' },
  { id: 'Guitar', label: 'Guitar', icon: '' },
  { id: 'Piano', label: 'Piano', icon: '' },
  { id: 'Drawing', label: 'Drawing', icon: '' },
  { id: 'Photography', label: 'Photography', icon: '' },
  { id: 'Dance', label: 'Dance', icon: '' },
];

// --------------- Bot generation ---------------

const BOT_FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery',
  'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Harper', 'Kai', 'Logan',
  'Noel', 'Parker', 'Reese', 'Sage', 'Luna', 'Phoenix', 'Atlas', 'Nova',
  'Zephyr', 'Ember', 'Storm', 'Orion', 'Vega', 'Titan', 'Lyra', 'Blaze',
  'Ivy', 'Rex', 'Echo', 'Jade', 'Nyx', 'Cleo', 'Ren', 'Mira',
  'Axel', 'Wren', 'Juno', 'Finn', 'Thea', 'Rowan', 'Skye', 'Vale',
  'Aria', 'Marcus', 'Zara', 'Nina', 'Priya', 'Derek', 'Hana', 'Tyrone',
  'Elise', 'Ravi', 'Lina', 'Omar', 'Vera', 'Soren', 'Kira', 'Dante',
  'Milo', 'Freya', 'Hugo', 'Isla', 'Leon', 'Nora', 'Oscar', 'Piper',
  'Seth', 'Tara', 'Yuki', 'Zion', 'Abel', 'Clara', 'Demi', 'Felix',
  'Gina', 'Hector', 'Iris', 'Joel', 'Kara', 'Lance', 'Maya', 'Neil',
  'Olga', 'Ray', 'Selma', 'Troy', 'Uma', 'Vince', 'Wendy', 'Xander',
  'Yara', 'Zeke', 'Bria', 'Chase',
];

interface BotEntry {
  id: string;
  username: string;
  xp: number;
  level: number;
  isCurrentUser: boolean;
}

// Deterministic seeded PRNG
function seedHash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateBotsForSkill(skillId: string): BotEntry[] {
  const s = seedHash(`global-lb-${skillId}-2026`);
  const rng = mulberry32(s);

  const bots: BotEntry[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 100; i++) {
    // Pick a unique name deterministically
    let nameIdx = Math.floor(rng() * BOT_FIRST_NAMES.length);
    let attempts = 0;
    while (usedNames.has(BOT_FIRST_NAMES[nameIdx]) && attempts < 200) {
      nameIdx = (nameIdx + 1) % BOT_FIRST_NAMES.length;
      attempts++;
    }
    // If all 100 base names used, add a number suffix
    let name = BOT_FIRST_NAMES[nameIdx];
    if (usedNames.has(name)) {
      name = `${name}${i}`;
    }
    usedNames.add(name);

    // XP: top players have 8000-15000, drops off with rank
    // Exponential-ish decay so top 3 are well separated
    const baseXp = Math.floor(15000 * Math.pow(0.97, i) + rng() * 800);
    const xp = Math.max(baseXp, 100 + Math.floor(rng() * 300));
    const level = Math.floor(xp / 500) + 1;

    bots.push({
      id: `global-bot-${skillId}-${i}`,
      username: name,
      xp,
      level,
      isCurrentUser: false,
    });
  }

  // Sort descending
  bots.sort((a, b) => b.xp - a.xp);
  return bots;
}

// --------------- Per-skill XP storage ---------------

const SKILL_XP_KEY = 'global_leaderboard_skill_xp';

async function getSkillXpMap(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(SKILL_XP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function addSkillXp(skillName: string, amount: number): Promise<void> {
  const map = await getSkillXpMap();
  map[skillName] = (map[skillName] || 0) + amount;
  await AsyncStorage.setItem(SKILL_XP_KEY, JSON.stringify(map));
}

// --------------- Component ---------------

export function GlobalLeaderboardScreen() {
  const userXp = useGameStore((s) => s.xp);
  const profile = useUserStore((s) => s.profile);
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [skillXpMap, setSkillXpMap] = useState<Record<string, number>>({});
  const flatListRef = useRef<FlatList>(null);

  // Load per-skill XP
  useEffect(() => {
    getSkillXpMap().then(setSkillXpMap);
  }, []);

  const entries = useMemo(() => {
    const bots = generateBotsForSkill(selectedSkill);
    const username = profile?.username || 'You';
    const userSkillXp = selectedSkill === 'all'
      ? userXp
      : (skillXpMap[selectedSkill] || Math.floor(userXp * 0.3));

    const userEntry: BotEntry = {
      id: 'current-user',
      username,
      xp: userSkillXp,
      level: Math.floor(userSkillXp / 500) + 1,
      isCurrentUser: true,
    };

    // Insert user in sorted position
    const all = [...bots, userEntry];
    all.sort((a, b) => b.xp - a.xp);

    // Take top 100
    return all.slice(0, 100);
  }, [selectedSkill, userXp, profile, skillXpMap]);

  const userRank = useMemo(() => {
    const idx = entries.findIndex((e) => e.isCurrentUser);
    return idx >= 0 ? idx + 1 : entries.length + 1;
  }, [entries]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Reload skill XP
    getSkillXpMap().then((map) => {
      setSkillXpMap(map);
      setTimeout(() => setRefreshing(false), 600);
    });
  }, []);

  const scrollToUser = useCallback(() => {
    const idx = entries.findIndex((e) => e.isCurrentUser);
    if (idx >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
    }
  }, [entries]);

  const renderPill = useCallback(({ item }: { item: SkillPill }) => {
    const isActive = selectedSkill === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelectedSkill(item.id)}
        style={[styles.pill, isActive && styles.pillActive]}
      >
        {isActive ? (
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.full }]}
          />
        ) : null}
        <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedSkill]);

  const renderItem = useCallback(({ item, index }: { item: BotEntry; index: number }) => {
    const rank = index + 1;
    const isTop3 = rank <= 3;
    const isUser = item.isCurrentUser;

    const gradientColors: [string, string] = isUser
      ? [colors.primary, colors.primaryDark]
      : isTop3
        ? rank === 1
          ? ['#FFD700', '#DAA520']
          : rank === 2
            ? ['#C0C0C0', '#808080']
            : ['#CD7F32', '#8B5A2B']
        : AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

    return (
      <GlassCard
        strong={isUser || isTop3}
        glowColor={isUser ? colors.primary : isTop3 ? gradientColors[0] : undefined}
        style={[
          styles.row,
          isUser && styles.rowUser,
          isTop3 && !isUser && styles.rowTop3,
        ]}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          {isTop3 ? (
            <View style={[styles.rankBadge, { backgroundColor: gradientColors[0] }]}>
              <Text style={styles.rankBadgeText}>{rank}</Text>
            </View>
          ) : (
            <Text style={[styles.rankText, isUser && styles.rankTextUser]}>
              #{rank}
            </Text>
          )}
        </View>

        {/* Avatar */}
        <LinearGradient colors={gradientColors} style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>

        {/* Name + Level */}
        <View style={styles.infoContainer}>
          <Text
            style={[styles.username, isUser && styles.usernameUser, isTop3 && !isUser && styles.usernameTop3]}
            numberOfLines={1}
          >
            {item.username}
            {isUser ? ` (${t('leaderboard.you')})` : ''}
          </Text>
          <Text style={styles.levelText}>
            {t('globalLeaderboard.level')} {item.level}
          </Text>
        </View>

        {/* XP */}
        <View style={styles.xpContainer}>
          <Text style={[styles.xpValue, isUser && styles.xpValueUser, isTop3 && !isUser && styles.xpValueTop3]}>
            {item.xp.toLocaleString()}
          </Text>
          <Text style={styles.xpLabel}>XP</Text>
        </View>
      </GlassCard>
    );
  }, []);

  return (
    <View style={styles.root}>
      {/* Skill pills */}
      <FlatList
        data={SKILL_PILLS}
        renderItem={renderPill}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContainer}
        style={styles.pillsRow}
      />

      {/* User rank summary */}
      <TouchableOpacity activeOpacity={0.7} onPress={scrollToUser}>
        <GlassCard strong glowColor={colors.primary} style={styles.userSummary}>
          <Text style={styles.userSummaryLabel}>{t('globalLeaderboard.yourRank')}</Text>
          <Text style={styles.userSummaryRank}>#{userRank}</Text>
          <Text style={styles.userSummaryXp}>
            {(selectedSkill === 'all' ? userXp : (skillXpMap[selectedSkill] || Math.floor(userXp * 0.3))).toLocaleString()} XP
          </Text>
        </GlassCard>
      </TouchableOpacity>

      {/* Leaderboard list */}
      <FlatList
        ref={flatListRef}
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('leaderboard.noData')}</Text>
          </View>
        }
      />
    </View>
  );
}

// --------------- Styles ---------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Pills
  pillsRow: {
    maxHeight: 48,
    marginTop: spacing.md,
  },
  pillsContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  pill: {
    height: 32,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pillActive: {
    borderColor: 'transparent',
  },
  pillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // User summary
  userSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    gap: spacing.md,
  },
  userSummaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userSummaryRank: {
    ...typography.h2,
    color: colors.primary,
    flex: 1,
  },
  userSummaryXp: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },

  // List
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
    paddingTop: spacing.sm,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowUser: {
    borderColor: 'rgba(255,107,53,0.4)',
  },
  rowTop3: {
    borderColor: 'rgba(255,215,0,0.15)',
  },

  // Rank
  rankContainer: {
    width: 36,
    alignItems: 'center',
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  rankText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '700',
  },
  rankTextUser: {
    color: colors.primary,
  },

  // Avatar
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Info
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  username: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  usernameUser: {
    color: colors.primary,
  },
  usernameTop3: {
    color: '#FFD700',
  },
  levelText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },

  // XP
  xpContainer: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  xpValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  xpValueUser: {
    color: colors.primary,
  },
  xpValueTop3: {
    color: '#FFD700',
  },
  xpLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Empty
  emptyContainer: {
    paddingVertical: spacing['5xl'],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
