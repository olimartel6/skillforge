import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { AmbientGlow } from '../../components/AmbientGlow';
import { colors, spacing, borderRadius, typography, shadows } from '../../utils/theme';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { useChallengeStore } from '../../store/challengeStore';
import { useStreakStore } from '../../store/streakStore';
import { useUserStore } from '../../store/userStore';
import { useGameStore } from '../../store/gameStore';
import { SKILL_LESSONS } from '../games/GamesHomeScreen';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from '../../i18n';

const DAILY_TIPS = [
  "Consistency beats intensity. 5 minutes daily > 2 hours once a week.",
  "Your brain consolidates learning during sleep. Practice before bed.",
  "The Pomodoro Technique: 25 min focus + 5 min break = maximum retention.",
  "Teaching someone else is the best way to solidify your knowledge.",
  "Mistakes are proof you're trying. Every error is a lesson.",
  "Review yesterday's material before starting something new.",
  "Set a specific time each day to practice. Routine beats motivation.",
  "Break complex skills into tiny sub-skills. Master each one.",
  "Celebrate small wins. Progress is progress, no matter how small.",
  "Spaced repetition: review at increasing intervals for long-term memory.",
  "Visualize yourself performing the skill before you practice.",
  "Focus on one thing at a time. Multitasking kills deep learning.",
  "Take notes by hand. It improves memory retention vs typing.",
  "The 80/20 rule: 20% of concepts give you 80% of results.",
  "Don't compare your day 1 to someone's day 100.",
  "Active recall: test yourself instead of re-reading material.",
  "Your environment shapes your habits. Design it for success.",
  "Growth mindset: ability is built, not born. Keep going.",
  "Struggling is learning. If it feels easy, you're not growing.",
  "Connect new knowledge to what you already know for faster learning.",
  "Take breaks. Your brain processes information during rest.",
  "Set process goals, not just outcome goals. Focus on the journey.",
  "Curiosity is your superpower. Ask 'why' more often.",
  "Track your progress. What gets measured gets improved.",
  "Learn from multiple sources. Different perspectives deepen understanding.",
  "Practice retrieval: close the book and recall what you learned.",
  "Embrace boredom. Deep skills require repetitive practice.",
  "Your future self will thank you for today's 5 minutes.",
  "Interleave your practice: mix different types of exercises.",
  "Feedback is a gift. Seek it out and act on it.",
  "Start with the hardest task. Willpower is highest in the morning.",
  "Reward yourself after practice. Your brain loves positive reinforcement.",
];

function getDailyTip(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return t('home.goodMorning');
  if (hour < 17) return t('home.goodAfternoon');
  return t('home.goodEvening');
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

  const { challengeStreak, fetchChallengeStreak } = useChallengeStore();
  const currentLesson = useGameStore((s) => s.currentLesson);
  const [skillName, setSkillName] = React.useState('');

  useEffect(() => {
    AsyncStorage.getItem('skilly_current_skill_name').then(name => { if (name) setSkillName(name); });
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    const skillId = profile.selected_skill_id;

    fetchStreak();
    checkAndUpdateStreak();
    fetchBadges();
    fetchChallengeStreak();
    if (skillId) {
      fetchTodayChallenge(skillId);
    }
  }, [profile?.id, profile?.selected_skill_id]);

  // Pulse animation for START PRACTICE button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const dayNumber = getDayNumber(roadmap);
  const unlockedNodes = roadmap.filter((r) => r.completed_at).length;

  // Current module info for the challenge card
  const skillLessons = skillName ? (SKILL_LESSONS[skillName] || []) : [];
  const currentModuleIndex = Math.max(0, Math.min(currentLesson, skillLessons.length - 1));
  const currentModuleName = skillLessons[currentModuleIndex]?.title || '';
  const totalModules = skillLessons.length;

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
              <Text style={styles.dayLabel}>{t('home.day')} {dayNumber}</Text>
            </View>
            <View style={styles.streakPill}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakCount}>{currentStreak}</Text>
            </View>
          </View>

          {/* Challenge Card */}
          {isLoading ? (
            <GlassCard strong style={styles.loadingCard}>
              <SkeletonLoader width="60%" height={16} borderRadius={8} style={{ marginBottom: 12 }} />
              <SkeletonLoader width="80%" height={20} borderRadius={8} style={{ marginBottom: 16 }} />
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                <SkeletonLoader width={64} height={28} borderRadius={14} />
                <SkeletonLoader width={80} height={28} borderRadius={14} />
              </View>
              <SkeletonLoader width="100%" height={48} borderRadius={12} />
            </GlassCard>
          ) : currentChallenge ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('GamesTab')}
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

                  <Text style={styles.challengeLabel}>{skillName || t('home.todaysChallenge')}</Text>
                  <Text style={styles.challengeTitle}>
                    {currentModuleName || currentChallenge.title}
                  </Text>

                  <View style={styles.tagRow}>
                    {totalModules > 0 && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>
                          Module {currentModuleIndex + 1} of {totalModules}
                        </Text>
                      </View>
                    )}
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        Continue your lesson
                      </Text>
                    </View>
                    {challengeStreak > 0 && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>
                          {'\uD83C\uDFC6'} {challengeStreak} {t('dailyChallenge.challengeStreak').toLowerCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                      style={styles.startButton}
                      activeOpacity={0.85}
                      onPress={() => {
                        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
                        navigation.navigate('GamesTab');
                      }}
                    >
                      <Text style={styles.startButtonText}>{t('home.startPractice')}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          ) : (
            <GlassCard strong style={styles.loadingCard}>
              <Text style={styles.noChallengeText}>
                {t('home.noChallenge')}
              </Text>
            </GlassCard>
          )}

          {/* AI Coach Card */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
              navigation.navigate('AICoach');
            }}
            style={styles.coachCardWrap}
          >
            <LinearGradient
              colors={['#6C63FF', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.coachCard}
            >
              <View style={styles.coachIconWrap}>
                <Text style={styles.coachIcon}>{'\uD83E\uDD16'}</Text>
              </View>
              <View style={styles.coachTextWrap}>
                <Text style={styles.coachTitle}>AI Coach</Text>
                <Text style={styles.coachSubtitle}>
                  Personal analysis of your weak spots
                </Text>
              </View>
              <Text style={styles.coachArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Tip of the Day */}
          <GlassCard style={styles.tipCard}>
            <View style={styles.tipRow}>
              <Text style={styles.tipIcon}>{'\uD83D\uDCA1'}</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{t('tip.title')}</Text>
                <Text style={styles.tipText}>{getDailyTip()}</Text>
              </View>
            </View>
          </GlassCard>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>{t('home.streak')}</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{challengeStreak}</Text>
              <Text style={styles.statLabel}>{t('dailyChallenge.challengeStreak')}</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{earnedBadges.length}</Text>
              <Text style={styles.statLabel}>{t('home.badges')}</Text>
            </GlassCard>
          </View>

          {/* Recent Practice */}
          {currentChallenge && (
            <GlassCard style={styles.recentCard}>
              <Text style={styles.recentLabel}>{t('home.recentPractice')}</Text>
              <Text style={styles.recentTitle}>{currentChallenge.title}</Text>
              <Text style={styles.recentMeta}>
                {t('home.day')} {dayNumber} · {currentChallenge.duration_minutes} {t('home.min')}
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
    paddingBottom: 120,
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

  // AI Coach Card
  coachCardWrap: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  coachIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachIcon: { fontSize: 26 },
  coachTextWrap: { flex: 1 },
  coachTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  coachSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  coachArrow: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    marginRight: spacing.sm,
  },

  // Tip of the Day
  tipCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  tipIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...typography.caption,
    color: 'rgba(255, 215, 0, 0.8)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 20,
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
