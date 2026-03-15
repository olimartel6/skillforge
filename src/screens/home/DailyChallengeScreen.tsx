import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { AmbientGlow } from '../../components/AmbientGlow';
import { colors, spacing, borderRadius, typography, shadows } from '../../utils/theme';
import { useChallengeStore } from '../../store/challengeStore';
import { useStreakStore } from '../../store/streakStore';
import { useUserStore } from '../../store/userStore';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDayNumber(roadmap: any[]): number {
  if (roadmap.length === 0) return 1;
  const createdAt = new Date(roadmap[0].created_at);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

export function DailyChallengeScreen() {
  const navigation = useNavigation<any>();
  const profile = useUserStore((s) => s.profile);
  const { currentChallenge, roadmap, isLoading, fetchTodayChallenge } = useChallengeStore();
  const {
    currentStreak,
    earnedBadges,
    fetchStreak,
    checkAndUpdateStreak,
    fetchBadges,
  } = useStreakStore();

  useEffect(() => {
    if (!profile?.id) return;
    const userId = profile.id;
    const skillId = profile.selected_skill_id;

    fetchStreak();
    checkAndUpdateStreak();
    fetchBadges();
    if (skillId) {
      fetchTodayChallenge(skillId);
    }
  }, [profile?.id, profile?.selected_skill_id]);

  const dayNumber = getDayNumber(roadmap);
  const unlockedNodes = roadmap.filter((r) => r.completed_at).length;

  return (
    <View style={styles.root}>
      <AmbientGlow color={colors.primary} size={300} opacity={0.06} top={-60} left="70%" />
      <AmbientGlow color={colors.secondary} size={250} opacity={0.04} top="60%" left="-10%" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.dayLabel}>Day {dayNumber}</Text>
            </View>
            <View style={styles.streakPill}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakCount}>{currentStreak}</Text>
            </View>
          </View>

          {/* Challenge Card */}
          {isLoading ? (
            <GlassCard strong style={styles.loadingCard}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>Preparing your challenge...</Text>
            </GlassCard>
          ) : currentChallenge ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('PracticeSession')}
            >
              <View style={[styles.challengeCard, shadows.card]}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.challengeGradient}
                >
                  {/* Decorative circles */}
                  <View style={[styles.decoCircle, styles.decoCircle1]} />
                  <View style={[styles.decoCircle, styles.decoCircle2]} />
                  <View style={[styles.decoCircle, styles.decoCircle3]} />

                  <Text style={styles.challengeLabel}>TODAY'S CHALLENGE</Text>
                  <Text style={styles.challengeTitle}>{currentChallenge.title}</Text>

                  <View style={styles.tagRow}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {currentChallenge.duration_minutes} min
                      </Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {currentChallenge.difficulty}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.startButton}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('PracticeSession')}
                  >
                    <Text style={styles.startButtonText}>START PRACTICE</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          ) : (
            <GlassCard strong style={styles.loadingCard}>
              <Text style={styles.noChallengeText}>
                No challenge available. Complete onboarding to get started!
              </Text>
            </GlassCard>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{unlockedNodes}</Text>
              <Text style={styles.statLabel}>Nodes</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{earnedBadges.length}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </GlassCard>
          </View>

          {/* Recent Practice */}
          {currentChallenge && (
            <GlassCard style={styles.recentCard}>
              <Text style={styles.recentLabel}>RECENT PRACTICE</Text>
              <Text style={styles.recentTitle}>{currentChallenge.title}</Text>
              <Text style={styles.recentMeta}>
                Day {dayNumber} · {currentChallenge.duration_minutes} min
              </Text>
            </GlassCard>
          )}
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
    paddingBottom: spacing['6xl'],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  dayLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakCount: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  // Challenge Card
  challengeCard: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
  },
  challengeGradient: {
    padding: spacing['2xl'],
    paddingBottom: spacing['3xl'],
    position: 'relative',
    overflow: 'hidden',
  },
  decoCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decoCircle1: {
    width: 120,
    height: 120,
    top: -40,
    right: -30,
  },
  decoCircle2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: -20,
  },
  decoCircle3: {
    width: 50,
    height: 50,
    top: 40,
    right: 60,
  },
  challengeLabel: {
    ...typography.label,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing.md,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.lg,
    letterSpacing: -0.3,
  },
  tagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.caption,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Loading / Empty
  loadingCard: {
    padding: spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
    minHeight: 180,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  noChallengeText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    ...typography.stat,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Recent Practice
  recentCard: {
    padding: spacing.lg,
  },
  recentLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  recentTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  recentMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
