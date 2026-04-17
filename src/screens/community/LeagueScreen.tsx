import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { GlassCard } from '../../components/GlassCard';
import {
  useLeagueStore,
  LeagueMember,
  LEAGUES,
  getLeagueInfo,
  PROMOTION_THRESHOLD,
  RELEGATION_COUNT,
} from '../../store/leagueStore';
import { t } from '../../i18n';

function LeagueHeader() {
  const currentLeague = useLeagueStore((s) => s.currentLeague);
  const weeklyXp = useLeagueStore((s) => s.weeklyXp);
  const rank = useLeagueStore((s) => s.rank);
  const totalMembers = useLeagueStore((s) => s.totalMembers);
  const promotionStatus = useLeagueStore((s) => s.promotionStatus);
  const info = getLeagueInfo(currentLeague);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.headerContainer}>
      {/* League badge */}
      <Animated.View style={[styles.badgeContainer, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={info.gradient}
          style={styles.badgeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.badgeIcon}>{info.icon}</Text>
        </LinearGradient>
      </Animated.View>

      <Text style={[styles.leagueName, { color: info.color }]}>
        {t(`league.${currentLeague}`)}
      </Text>
      <Text style={styles.leagueSubtitle}>{t('league.weekly')}</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{rank}</Text>
          <Text style={styles.statLabel}>{t('league.rank')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {weeklyXp.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalMembers}</Text>
          <Text style={styles.statLabel}>{t('league.players')}</Text>
        </View>
      </View>

      {/* Promotion status banner */}
      {promotionStatus === 'promoted' && (
        <GlassCard style={styles.statusBanner}>
          <Text style={[styles.statusText, { color: colors.success }]}>
            {t('league.promoted')}
          </Text>
        </GlassCard>
      )}
      {promotionStatus === 'relegated' && (
        <GlassCard style={styles.statusBanner}>
          <Text style={[styles.statusText, { color: colors.error }]}>
            {t('league.relegated')}
          </Text>
        </GlassCard>
      )}

      {/* Zone legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>{t('league.promotionZone')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>{t('league.relegationZone')}</Text>
        </View>
      </View>
    </View>
  );
}

function XpProgressBar({ userXp, topXp }: { userXp: number; topXp: number }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const progress = topXp > 0 ? Math.min(userXp / topXp, 1) : 0;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressBarBg}>
      <Animated.View style={[styles.progressBarFill, { width }]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

function MemberRow({ item, index, topXp }: { item: LeagueMember; index: number; topXp: number }) {
  const totalMembers = useLeagueStore((s) => s.totalMembers);
  const rank = item.rank;

  // Zone colors
  const isPromotion = rank <= PROMOTION_THRESHOLD;
  const isRelegation = rank > totalMembers - RELEGATION_COUNT;

  let zoneColor: string | undefined;
  if (isPromotion) zoneColor = 'rgba(52, 211, 153, 0.08)';
  if (isRelegation) zoneColor = 'rgba(239, 68, 68, 0.08)';

  let zoneBorder: string | undefined;
  if (isPromotion) zoneBorder = 'rgba(52, 211, 153, 0.15)';
  if (isRelegation) zoneBorder = 'rgba(239, 68, 68, 0.15)';

  return (
    <GlassCard
      strong={item.isCurrentUser}
      glowColor={item.isCurrentUser ? colors.primary : undefined}
      style={[
        styles.row,
        item.isCurrentUser && styles.rowHighlight,
        zoneColor ? { backgroundColor: zoneColor } : undefined,
        zoneBorder ? { borderColor: zoneBorder } : undefined,
      ]}
    >
      {/* Rank */}
      <View style={styles.rankContainer}>
        {rank <= 3 ? (
          <Text style={styles.rankMedal}>
            {rank === 1 ? '\uD83E\uDD47' : rank === 2 ? '\uD83E\uDD48' : '\uD83E\uDD49'}
          </Text>
        ) : (
          <Text style={[
            styles.rankText,
            item.isCurrentUser && styles.rankTextHighlight,
            isPromotion && { color: colors.success },
            isRelegation && { color: colors.error },
          ]}>
            #{rank}
          </Text>
        )}
      </View>

      {/* Avatar */}
      <LinearGradient
        colors={item.isCurrentUser ? [colors.primary, colors.primaryDark] : ['#444', '#333']}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>
          {item.username.charAt(0).toUpperCase()}
        </Text>
      </LinearGradient>

      {/* Name + Progress */}
      <View style={styles.infoContainer}>
        <Text
          style={[styles.username, item.isCurrentUser && styles.usernameHighlight]}
          numberOfLines={1}
        >
          {item.username}
          {item.isCurrentUser ? ` (${t('leaderboard.you')})` : ''}
        </Text>
        <XpProgressBar userXp={item.weekly_xp} topXp={topXp} />
      </View>

      {/* XP */}
      <View style={styles.xpContainer}>
        <Text style={[styles.xpValue, item.isCurrentUser && styles.xpValueHighlight]}>
          {item.weekly_xp.toLocaleString()}
        </Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>

      {/* Zone indicator */}
      {isPromotion && (
        <View style={[styles.zoneIndicator, { backgroundColor: colors.success }]} />
      )}
      {isRelegation && (
        <View style={[styles.zoneIndicator, { backgroundColor: colors.error }]} />
      )}
    </GlassCard>
  );
}

export function LeagueScreen() {
  const members = useLeagueStore((s) => s.members);
  const initialize = useLeagueStore((s) => s.initialize);
  const checkWeekReset = useLeagueStore((s) => s.checkWeekReset);
  const isLoading = useLeagueStore((s) => s.isLoading);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    checkWeekReset();
  }, []);

  const topXp = members.length > 0 ? members[0].weekly_xp : 1;
  // Show top 20
  const displayMembers = members.slice(0, 20);

  const renderItem = ({ item, index }: { item: LeagueMember; index: number }) => (
    <MemberRow item={item} index={index} topXp={topXp} />
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={displayMembers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<LeagueHeader />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('leaderboard.noData')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  badgeContainer: {
    marginBottom: spacing.md,
  },
  badgeGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 36,
  },
  leagueName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  leagueSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.glassBorder,
  },

  // Status banner
  statusBanner: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
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
    marginBottom: 4,
  },
  usernameHighlight: {
    color: colors.primary,
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

  // Progress bar
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },

  // Zone indicator (left edge stripe)
  zoneIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
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
