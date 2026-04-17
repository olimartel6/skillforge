import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { GlassCard } from '../../components/GlassCard';
import { AmbientGlow } from '../../components/AmbientGlow';
import { useGameStore } from '../../store/gameStore';
import { useUserStore } from '../../store/userStore';
import { t } from '../../i18n';

// Fake profile data for other users
const FAKE_PROFILES: Record<string, {
  memberSince: string;
  streak: number;
  level: number;
  badges: string[];
}> = {
  Maya: { memberSince: '2025-11-15', streak: 23, level: 8, badges: ['First Practice', '7-Day Streak', 'Speed Learner'] },
  Jake: { memberSince: '2025-12-01', streak: 14, level: 5, badges: ['First Practice', '3-Day Streak'] },
  Sofia: { memberSince: '2025-10-20', streak: 45, level: 12, badges: ['First Practice', '7-Day Streak', '30-Day Streak', 'Master'] },
  Leo: { memberSince: '2026-01-05', streak: 9, level: 4, badges: ['First Practice', '7-Day Streak'] },
  Aria: { memberSince: '2025-09-10', streak: 67, level: 15, badges: ['First Practice', '7-Day Streak', '30-Day Streak', 'Master', 'Legend'] },
  Marcus: { memberSince: '2026-02-14', streak: 5, level: 3, badges: ['First Practice'] },
  Zara: { memberSince: '2025-11-25', streak: 31, level: 9, badges: ['First Practice', '7-Day Streak', '30-Day Streak'] },
  Kai: { memberSince: '2025-10-01', streak: 52, level: 14, badges: ['First Practice', '7-Day Streak', '30-Day Streak', 'Master'] },
  Nina: { memberSince: '2026-01-20', streak: 18, level: 6, badges: ['First Practice', '7-Day Streak'] },
  Alex: { memberSince: '2025-12-10', streak: 27, level: 7, badges: ['First Practice', '7-Day Streak'] },
  Priya: { memberSince: '2026-02-01', streak: 8, level: 3, badges: ['First Practice'] },
  Derek: { memberSince: '2025-11-05', streak: 35, level: 10, badges: ['First Practice', '7-Day Streak', '30-Day Streak'] },
  Hana: { memberSince: '2026-01-10', streak: 12, level: 5, badges: ['First Practice', '7-Day Streak'] },
  Tyrone: { memberSince: '2025-10-15', streak: 42, level: 11, badges: ['First Practice', '7-Day Streak', '30-Day Streak', 'Master'] },
  Elise: { memberSince: '2026-02-20', streak: 6, level: 2, badges: ['First Practice'] },
  Ravi: { memberSince: '2025-09-25', streak: 58, level: 13, badges: ['First Practice', '7-Day Streak', '30-Day Streak', 'Master'] },
  Lina: { memberSince: '2026-03-01', streak: 4, level: 2, badges: ['First Practice'] },
  Omar: { memberSince: '2025-12-20', streak: 20, level: 7, badges: ['First Practice', '7-Day Streak'] },
  Vera: { memberSince: '2025-11-10', streak: 38, level: 11, badges: ['First Practice', '7-Day Streak', '30-Day Streak'] },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export function PublicProfileScreen() {
  const route = useRoute<any>();
  const { username, xp, skill, isCurrentUser } = route.params;
  const gameState = useGameStore();
  const profile = useUserStore((s) => s.profile);

  // Use real data for current user, fake for others
  const fakeProfile = FAKE_PROFILES[username];
  const memberSince = isCurrentUser
    ? formatDate(profile?.created_at || new Date().toISOString())
    : fakeProfile
    ? formatDate(fakeProfile.memberSince)
    : formatDate('2026-01-01');
  const streak = isCurrentUser ? 0 : (fakeProfile?.streak || 5);
  const level = isCurrentUser ? gameState.level : (fakeProfile?.level || 3);
  const badges = isCurrentUser ? [] : (fakeProfile?.badges || ['First Practice']);
  const displayXp = isCurrentUser ? gameState.xp : xp;
  const displaySkill = isCurrentUser ? (profile?.selected_skill_id || 'Learning') : skill;

  return (
    <View style={styles.root}>
      <AmbientGlow color={colors.primary} size={300} opacity={0.06} top="5%" left="50%" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar + Name */}
          <View style={styles.headerSection}>
            <LinearGradient
              colors={isCurrentUser ? ['#FF6B35', '#FF3D00'] : ['#6C63FF', '#4F46E5']}
              style={styles.avatarLarge}
            >
              <Text style={styles.avatarLargeText}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <Text style={styles.profileName}>{username}</Text>
            <Text style={styles.profileMeta}>
              {t('profile.memberSince')} {memberSince}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{level}</Text>
              <Text style={styles.statLabel}>{t('profile.level')}</Text>
            </GlassCard>
            <GlassCard style={styles.statCard} glowColor={colors.primary}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {displayXp.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>{t('profile.xp')}</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>{t('profile.streak')}</Text>
            </GlassCard>
          </View>

          {/* Current Skill */}
          <GlassCard style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('profile.currentSkill')}</Text>
            <Text style={styles.infoValue}>{displaySkill}</Text>
          </GlassCard>

          {/* Badges */}
          <GlassCard style={styles.infoCard}>
            <Text style={styles.infoLabel}>{t('profile.public')}</Text>
            {badges.length > 0 ? (
              <View style={styles.badgesContainer}>
                {badges.map((badge, i) => (
                  <View key={i} style={styles.badgeChip}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noBadgesText}>{t('badges.locked')}</Text>
            )}
          </GlassCard>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  profileName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  profileMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    ...typography.stat,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeChip: {
    backgroundColor: 'rgba(108,99,255,0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.2)',
  },
  badgeText: {
    ...typography.bodySmall,
    color: colors.secondary,
    fontWeight: '600',
  },
  noBadgesText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
