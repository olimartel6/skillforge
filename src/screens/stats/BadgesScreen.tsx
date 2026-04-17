import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/GlassCard';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { useUserStore } from '../../store/userStore';
import { useStreakStore } from '../../store/streakStore';
import { Badge } from '../../utils/types';
import { t } from '../../i18n';

function getBadgeColor(conditionType: string): string {
  switch (conditionType) {
    case 'streak':
      return colors.primary;
    case 'practice':
      return colors.secondary;
    case 'skill':
      return colors.success;
    case 'quiz':
      return '#FFD700';
    case 'trading':
      return '#34D399';
    case 'social':
      return '#60A5FA';
    case 'content':
      return '#A78BFA';
    default:
      return colors.primary;
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function BadgesScreen() {
  const profile = useUserStore((s) => s.profile);
  const { badges, earnedBadges, fetchBadges } = useStreakStore();

  useEffect(() => {
    if (profile?.id) {
      fetchBadges();
    }
  }, [profile?.id]);

  const earnedMap = new Map(earnedBadges.map((eb) => [eb.badge_id, eb.earned_at]));

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('badges.title')}</Text>

          <View style={styles.grid}>
            {badges.map((badge: Badge) => {
              const earnedAt = earnedMap.get(badge.id);
              const isEarned = !!earnedAt;
              const badgeColor = getBadgeColor(badge.condition_type);

              return (
                <View key={badge.id} style={styles.gridItem}>
                  {isEarned ? (
                    <GlassCard
                      strong
                      glowColor={badgeColor}
                      style={[
                        styles.badgeCard,
                        { borderColor: badgeColor, borderWidth: 1 },
                      ]}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: `${badgeColor}20` }]}>
                        <Text style={styles.badgeIcon}>{badge.icon}</Text>
                      </View>
                      <Text style={styles.badgeName}>{badge.name}</Text>
                      {badge.description ? (
                        <Text style={styles.badgeDesc}>{badge.description}</Text>
                      ) : null}
                      <Text style={styles.earnedDate}>{formatDate(earnedAt!)}</Text>
                    </GlassCard>
                  ) : (
                    <View style={styles.lockedCard}>
                      <View style={styles.iconCircleLocked}>
                        <Text style={styles.badgeIconLocked}>{badge.icon}</Text>
                      </View>
                      <Text style={styles.badgeNameLocked}>{badge.name}</Text>
                      {badge.description ? (
                        <Text style={styles.badgeDescLocked}>{badge.description}</Text>
                      ) : null}
                      <Text style={styles.lockedLabel}>{t('badges.locked')}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
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
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: '47%',
  },

  // Earned Badge
  badgeCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  badgeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 14,
  },
  earnedDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Locked Badge
  lockedCard: {
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.xl,
    opacity: 0.5,
  },
  iconCircleLocked: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  badgeIconLocked: {
    fontSize: 24,
    opacity: 0.4,
  },
  badgeNameLocked: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  badgeDescLocked: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 14,
  },
  lockedLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
