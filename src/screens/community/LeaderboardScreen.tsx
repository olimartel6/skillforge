import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { GlassCard } from '../../components/GlassCard';
import { useGameStore } from '../../store/gameStore';
import { useUserStore } from '../../store/userStore';
import { AVATAR_GRADIENTS } from './fakeData';
import { t } from '../../i18n';

interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  skill: string;
  isCurrentUser: boolean;
}

const FAKE_USERS: { name: string; skill: string }[] = [
  { name: 'Maya', skill: 'Drawing' },
  { name: 'Jake', skill: 'Guitar' },
  { name: 'Sofia', skill: 'Magic Tricks' },
  { name: 'Leo', skill: 'Beatboxing' },
  { name: 'Aria', skill: 'Dance' },
  { name: 'Marcus', skill: 'Photography' },
  { name: 'Zara', skill: 'Singing' },
  { name: 'Kai', skill: 'Stand-up Comedy' },
  { name: 'Nina', skill: 'Piano' },
  { name: 'Alex', skill: 'Calligraphy' },
  { name: 'Priya', skill: 'Trading' },
  { name: 'Derek', skill: 'Business' },
  { name: 'Hana', skill: 'Cooking' },
  { name: 'Tyrone', skill: 'Fitness' },
  { name: 'Elise', skill: 'Chess' },
  { name: 'Ravi', skill: 'Coding' },
  { name: 'Lina', skill: 'Marketing' },
  { name: 'Omar', skill: 'Meditation' },
  { name: 'Vera', skill: 'Fashion Design' },
];

// Generate deterministic weekly XP for fake users based on current week
function generateFakeXp(): number[] {
  const weekSeed = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const xpValues: number[] = [];
  for (let i = 0; i < FAKE_USERS.length; i++) {
    // Deterministic pseudo-random based on user index + week
    const hash = ((weekSeed * 31 + i * 17) * 2654435761) >>> 0;
    const xp = 50 + (hash % 2000);
    xpValues.push(xp);
  }
  return xpValues.sort((a, b) => b - a);
}

export function LeaderboardScreen() {
  const navigation = useNavigation<any>();
  const userXp = useGameStore((s) => s.xp);
  const profile = useUserStore((s) => s.profile);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fakeXps = generateFakeXp();
    const username = profile?.username || 'You';

    // Build list with fake users
    const list: LeaderboardEntry[] = FAKE_USERS.map((u, i) => ({
      id: `fake-${i}`,
      username: u.name,
      xp: fakeXps[i],
      skill: u.skill,
      isCurrentUser: false,
    }));

    // Insert current user at correct position
    const userEntry: LeaderboardEntry = {
      id: 'current-user',
      username,
      xp: userXp,
      skill: profile?.selected_skill_id || 'Learning',
      isCurrentUser: true,
    };

    list.push(userEntry);
    list.sort((a, b) => b.xp - a.xp);

    // Take top 20
    setEntries(list.slice(0, 20));
  }, [userXp, profile]);

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rank = index + 1;
    const gradientColors = item.isCurrentUser
      ? ['#FF6B35', '#FF3D00'] as [string, string]
      : AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('PublicProfile', {
            userId: item.id,
            username: item.username,
            xp: item.xp,
            skill: item.skill,
            isCurrentUser: item.isCurrentUser,
          });
        }}
      >
        <GlassCard
          strong={item.isCurrentUser}
          glowColor={item.isCurrentUser ? colors.primary : undefined}
          style={[
            styles.row,
            item.isCurrentUser && styles.rowHighlight,
          ]}
        >
          {/* Rank */}
          <View style={styles.rankContainer}>
            {rank <= 3 ? (
              <Text style={styles.rankMedal}>
                {rank === 1 ? '\uD83E\uDD47' : rank === 2 ? '\uD83E\uDD48' : '\uD83E\uDD49'}
              </Text>
            ) : (
              <Text style={[styles.rankText, item.isCurrentUser && styles.rankTextHighlight]}>
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

          {/* Name + Skill */}
          <View style={styles.infoContainer}>
            <Text
              style={[styles.username, item.isCurrentUser && styles.usernameHighlight]}
              numberOfLines={1}
            >
              {item.username}
              {item.isCurrentUser ? ` (${t('leaderboard.you')})` : ''}
            </Text>
            <Text style={styles.skill} numberOfLines={1}>{item.skill}</Text>
          </View>

          {/* XP */}
          <View style={styles.xpContainer}>
            <Text style={[styles.xpValue, item.isCurrentUser && styles.xpValueHighlight]}>
              {item.xp.toLocaleString()}
            </Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title}>{t('leaderboard.title')}</Text>
        <Text style={styles.subtitle}>{t('leaderboard.weekly')}</Text>

        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('leaderboard.noData')}</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowHighlight: {
    borderColor: 'rgba(255,107,53,0.3)',
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
  },
  rankMedal: {
    fontSize: 20,
  },
  rankText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '700',
  },
  rankTextHighlight: {
    color: colors.primary,
  },
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
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  username: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  usernameHighlight: {
    color: colors.primary,
  },
  skill: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  xpContainer: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  xpValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  xpValueHighlight: {
    color: colors.primary,
  },
  xpLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptyContainer: {
    paddingVertical: spacing['5xl'],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
