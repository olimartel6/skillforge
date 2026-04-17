import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Share,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
let ViewShot: any = ({ children, ...p }: any) => children;
let captureRef: any = async () => '';
try { const vs = require('react-native-view-shot'); ViewShot = vs.default; captureRef = vs.captureRef; } catch (e) { console.warn('react-native-view-shot import failed:', e); }
let Sharing: any = { shareAsync: async () => {} };
try { Sharing = require('expo-sharing'); } catch (e) { console.warn('expo-sharing import failed:', e); }
import { ScrollView } from 'react-native';
import { AmbientGlow } from '../../components/AmbientGlow';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { ShareCard } from '../../components/ShareCard';
import { useGameStore } from '../../store/gameStore';
import { useStreakStore } from '../../store/streakStore';
import { useChallengeStore } from '../../store/challengeStore';
import { useUserStore } from '../../store/userStore';
import { colors, spacing, typography, borderRadius, glowShadow } from '../../utils/theme';
import { t } from '../../i18n';
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONFETTI_COUNT = 30;
const CELEBRATION_CONFETTI_COUNT = 20;

// Tier milestones
const TIER_MILESTONES: Record<number, { tierKey: string; nextTierKey: string }> = {
  8: { tierKey: 'celebration.basicsComplete', nextTierKey: 'celebration.unlockedIntermediate' },
  16: { tierKey: 'celebration.intermediateComplete', nextTierKey: 'celebration.unlockedAdvanced' },
  24: { tierKey: 'celebration.advancedComplete', nextTierKey: 'celebration.unlockedMaster' },
};

function CelebrationConfettiParticle({ delay, index }: { delay: number; index: number }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  const angle = (index / CELEBRATION_CONFETTI_COUNT) * Math.PI * 2;
  const distance = 80 + Math.random() * 120;
  const targetX = Math.cos(angle) * distance;
  const targetY = Math.sin(angle) * distance * -1;
  const particleColors = ['#FF6B35', '#6C63FF', '#34D399', '#FFD700', '#FF69B4', '#00BFFF'];
  const color = particleColors[index % particleColors.length];

  useEffect(() => {
    setTimeout(() => {
      opacity.setValue(1);
      scale.setValue(1);
      Animated.parallel([
        Animated.timing(translateY, { toValue: targetY + 200, duration: 1500, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: targetX, duration: 1500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.2, duration: 1500, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        width: 12,
        height: 12,
        borderRadius: index % 2 === 0 ? 6 : 2,
        backgroundColor: color,
        zIndex: 200,
        opacity,
        transform: [{ translateY }, { translateX }, { scale }],
      }}
    />
  );
}

function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const startX = Math.random() * SCREEN_WIDTH;

  useEffect(() => {
    const duration = 2000 + Math.random() * 1500;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 600, duration, useNativeDriver: true }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 150,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, { toValue: 0, duration, useNativeDriver: true }),
        Animated.timing(rotation, { toValue: 1, duration, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, [delay, translateY, translateX, opacity, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${Math.random() * 720}deg`],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: startX,
        top: -20,
        width: 8,
        height: 8,
        borderRadius: 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}

function DailyLeaderboardPreview({ formatTime }: { formatTime: (s: number) => string }) {
  const { dailyLeaderboard, userDailyRank } = useChallengeStore();

  if (dailyLeaderboard.length === 0) return null;

  // Show top 5 + user if not in top 5
  const top5 = dailyLeaderboard.slice(0, 5);
  const userInTop5 = top5.some((e) => e.isCurrentUser);
  const userEntry = dailyLeaderboard.find((e) => e.isCurrentUser);

  return (
    <Animated.View style={{ width: '100%', marginBottom: spacing['2xl'] }}>
      <GlassCard strong style={leaderboardStyles.card}>
        <Text style={leaderboardStyles.header}>{t('dailyChallenge.leaderboard')}</Text>
        {top5.map((entry, index) => (
          <View
            key={entry.id}
            style={[
              leaderboardStyles.row,
              entry.isCurrentUser && leaderboardStyles.rowHighlight,
            ]}
          >
            <View style={leaderboardStyles.rankCol}>
              {index === 0 ? (
                <Text style={{ fontSize: 16 }}>{'\uD83E\uDD47'}</Text>
              ) : index === 1 ? (
                <Text style={{ fontSize: 16 }}>{'\uD83E\uDD48'}</Text>
              ) : index === 2 ? (
                <Text style={{ fontSize: 16 }}>{'\uD83E\uDD49'}</Text>
              ) : (
                <Text style={[leaderboardStyles.rankText, entry.isCurrentUser && { color: colors.primary }]}>
                  #{index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[leaderboardStyles.nameText, entry.isCurrentUser && { color: colors.primary, fontWeight: '700' }]}
              numberOfLines={1}
            >
              {entry.username}
              {entry.isCurrentUser ? ` (${t('leaderboard.you')})` : ''}
            </Text>
            <Text style={[leaderboardStyles.scoreText, entry.isCurrentUser && { color: colors.primary }]}>
              {entry.score}/8
            </Text>
            <Text style={leaderboardStyles.timeText}>
              {formatTime(entry.time)}
            </Text>
          </View>
        ))}
        {!userInTop5 && userEntry && (
          <>
            <View style={leaderboardStyles.separator}>
              <Text style={leaderboardStyles.separatorDots}>...</Text>
            </View>
            <View style={[leaderboardStyles.row, leaderboardStyles.rowHighlight]}>
              <View style={leaderboardStyles.rankCol}>
                <Text style={[leaderboardStyles.rankText, { color: colors.primary }]}>
                  #{userDailyRank}
                </Text>
              </View>
              <Text style={[leaderboardStyles.nameText, { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>
                {userEntry.username} ({t('leaderboard.you')})
              </Text>
              <Text style={[leaderboardStyles.scoreText, { color: colors.primary }]}>
                {userEntry.score}/8
              </Text>
              <Text style={leaderboardStyles.timeText}>
                {formatTime(userEntry.time)}
              </Text>
            </View>
          </>
        )}
      </GlassCard>
    </Animated.View>
  );
}

export function GameResultScreen({ navigation, route }: { navigation: any; route: any }) {
  const { xpEarned, correctCount, totalCount, maxCombo, lessonNumber, elapsed, skillName } =
    route.params;
  const { completeLesson, completedLessons } = useGameStore();
  const { updateAchievementStats, achievementStats } = useStreakStore();
  const { recordChallengeCompletion, buildDailyLeaderboard } = useChallengeStore();
  const profile = useUserStore((s) => s.profile);

  const percentage = Math.round((correctCount / totalCount) * 100);
  const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : percentage > 0 ? 1 : 0;
  const confettiColors = [colors.primary, colors.secondary, colors.success, '#FFD700', '#FF69B4'];

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTier, setCelebrationTier] = useState<{ tierKey: string; nextTierKey: string } | null>(null);
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;

  // Animations
  const xpScale = useRef(new Animated.Value(0)).current;
  const starAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const statsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    completeLesson(lessonNumber);

    // Track achievement stats for local badges
    const newLessonsCompleted = (completedLessons.length || 0) + 1;
    const statsUpdate: Record<string, any> = {
      lessonsCompleted: Math.max(achievementStats.lessonsCompleted, newLessonsCompleted),
    };
    if (percentage === 100) {
      statsUpdate.perfectLessons = achievementStats.perfectLessons + 1;
    }
    if (maxCombo > achievementStats.maxComboEver) {
      statsUpdate.maxComboEver = maxCombo;
    }
    if (elapsed < achievementStats.fastestLesson) {
      statsUpdate.fastestLesson = elapsed;
    }
    if (skillName) {
      statsUpdate.skillsTried = [...achievementStats.skillsTried, skillName];
    }
    updateAchievementStats(statsUpdate);

    // Record daily challenge completion and build leaderboard
    recordChallengeCompletion();
    buildDailyLeaderboard(
      correctCount,
      elapsed,
      profile?.username || 'You',
    );

    // Check tier milestone
    const milestone = TIER_MILESTONES[lessonNumber];
    if (milestone) {
      (async () => {
        const storageKey = `skilly_tier_celebrated_${lessonNumber}`;
        const alreadyCelebrated = await AsyncStorage.getItem(storageKey);
        if (alreadyCelebrated !== 'true') {
          await AsyncStorage.setItem(storageKey, 'true');
          setCelebrationTier(milestone);
          setShowCelebration(true);
          celebrationOpacity.setValue(1);
          Animated.spring(celebrationScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start();
          // Auto-dismiss after 4 seconds
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(celebrationOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
              Animated.timing(celebrationScale, { toValue: 0.8, duration: 500, useNativeDriver: true }),
            ]).start(() => setShowCelebration(false));
          }, 4000);
        }
      })();
    }

    Animated.sequence([
      Animated.spring(xpScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.stagger(200, starAnims.map((anim) =>
        Animated.spring(anim, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
      )),
      Animated.timing(statsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rate app prompt after 5th session
  useEffect(() => {
    (async () => {
      try {
        const neverAsk = await AsyncStorage.getItem('skilly_rate_never');
        const alreadyRated = await AsyncStorage.getItem('skilly_rate_done');
        if (neverAsk === 'true' || alreadyRated === 'true') return;

        const stored = await AsyncStorage.getItem('skilly_completed_sessions');
        const count = stored ? parseInt(stored, 10) : 0;
        const newCount = count + 1;
        await AsyncStorage.setItem('skilly_completed_sessions', String(newCount));

        if (newCount === 5) {
          setTimeout(() => {
            Alert.alert(
              t('rate.title'),
              t('rate.body'),
              [
                {
                  text: t('rate.never'),
                  style: 'cancel',
                  onPress: () => AsyncStorage.setItem('skilly_rate_never', 'true'),
                },
                {
                  text: t('rate.later'),
                  style: 'default',
                },
                {
                  text: t('rate.now'),
                  onPress: () => {
                    AsyncStorage.setItem('skilly_rate_done', 'true');
                    Linking.openURL('https://apps.apple.com/app/id6760734423');
                  },
                },
              ]
            );
          }, 1500);
        }
      } catch (e) { console.warn('Rate prompt failed:', e); }
    })();
  }, []);

  const shareCardRef = useRef<React.ComponentRef<typeof ViewShot>>(null);

  const handleShare = async () => {
    const lessonName = skillName || `Lesson ${lessonNumber}`;
    const shareText = `I scored ${percentage}% on ${lessonName} in Skilly! \u{1F525} Can you beat me? Download: https://olimartel6.github.io/skillforge/`;
    try {
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: t('share.shareScore'),
          UTI: 'public.png',
        });
      } else if (Platform.OS === 'ios') {
        await Share.share({ url: uri, message: shareText });
      } else {
        await Share.share({ message: shareText });
      }
    } catch (e) {
      // Fallback to text-only share
      try {
        await Share.share({ message: shareText });
      } catch (e2) { console.warn('Share fallback failed:', e2); }
    }
  };

  const handleContinue = () => {
    (navigation as any).navigate('GamesHome');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Confetti */}
      {stars >= 2 &&
        Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <ConfettiParticle
            key={i}
            delay={i * 60}
            color={confettiColors[i % confettiColors.length]}
          />
        ))}

      <AmbientGlow color={colors.primary} size={350} opacity={0.08} top="15%" left="50%" />
      <AmbientGlow color={colors.secondary} size={250} opacity={0.05} top="60%" left="30%" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>
          {percentage >= 90 ? t('gameResult.perfect') : percentage >= 60 ? t('gameResult.wellDone') : t('gameResult.keepTrying')}
        </Text>

        {/* XP */}
        <Animated.View style={[styles.xpContainer, { transform: [{ scale: xpScale }] }]}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={[styles.xpCircle, glowShadow(colors.primary)]}
          >
            <Text style={styles.xpPlus}>+</Text>
            <Text style={styles.xpNumber}>{xpEarned}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </LinearGradient>
        </Animated.View>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.starWrapper,
                {
                  transform: [{ scale: starAnims[i] }],
                  opacity: starAnims[i],
                },
              ]}
            >
              <Text style={[styles.star, i < stars ? styles.starActive : styles.starInactive]}>
                &#9733;
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, { opacity: statsOpacity }]}>
          <GlassCard strong style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('gameResult.accuracy')}</Text>
              <Text style={[styles.statValue, percentage >= 80 && { color: colors.success }]}>
                {percentage}%
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('gameResult.score')}</Text>
              <Text style={styles.statValue}>
                {correctCount}/{totalCount}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('gameResult.maxCombo')}</Text>
              <Text style={[styles.statValue, maxCombo >= 3 && { color: colors.primary }]}>
                {maxCombo}x
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('gameResult.time')}</Text>
              <Text style={styles.statValue}>{formatTime(elapsed)}</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Daily Leaderboard */}
        <DailyLeaderboardPreview formatTime={formatTime} />

        {/* Continue Button */}
        <Animated.View style={{ opacity: statsOpacity, width: '100%' }}>
          <Button title={t('gameResult.continue')} onPress={handleContinue} style={styles.continueBtn} />
          <Button
            title={t('share.button')}
            onPress={handleShare}
            style={styles.shareBtn}
            variant="secondary"
          />
        </Animated.View>
      </ScrollView>

      {/* Hidden ShareCard for capture */}
      <ViewShot
        ref={shareCardRef}
        options={{ format: 'png', quality: 1 }}
        style={styles.shareCardHidden}
      >
        <ShareCard
          skillName={skillName || `Lesson ${lessonNumber}`}
          moduleName={`Lesson ${lessonNumber}`}
          correctCount={correctCount}
          totalCount={totalCount}
          percentage={percentage}
          stars={stars}
          maxCombo={maxCombo}
          elapsed={elapsed}
        />
      </ViewShot>

      {/* Tier Celebration Overlay */}
      {showCelebration && celebrationTier && (
        <>
          {Array.from({ length: CELEBRATION_CONFETTI_COUNT }).map((_, i) => (
            <CelebrationConfettiParticle key={`celeb-${i}`} delay={i * 50} index={i} />
          ))}
          <Animated.View
            style={[
              styles.celebrationOverlay,
              {
                opacity: celebrationOpacity,
                transform: [{ scale: celebrationScale }],
              },
            ]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark, '#6C63FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.celebrationGradient}
            >
              <Text style={styles.celebrationEmoji}>{'\uD83C\uDF89'}</Text>
              <Text style={styles.celebrationTitle}>{t(celebrationTier.tierKey)}</Text>
              <Text style={styles.celebrationXp}>+{xpEarned} XP</Text>
              <Text style={styles.celebrationUnlock}>{t(celebrationTier.nextTierKey)}</Text>
            </LinearGradient>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing['2xl'],
    fontSize: 32,
  },
  xpContainer: { marginBottom: spacing['2xl'] },
  xpCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpPlus: { color: 'rgba(255,255,255,0.6)', fontSize: 20, fontWeight: '300', marginBottom: -4 },
  xpNumber: { color: '#fff', fontSize: 42, fontWeight: '900' },
  xpLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginTop: -2 },

  starsRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing['3xl'] },
  starWrapper: {},
  star: { fontSize: 44 },
  starActive: { color: '#FFD700' },
  starInactive: { color: 'rgba(255,255,255,0.1)' },

  statsContainer: { width: '100%', marginBottom: spacing['3xl'] },
  statsCard: { padding: spacing.xl },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statLabel: { ...typography.body, color: colors.textSecondary },
  statValue: { ...typography.h3, color: colors.textPrimary },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  continueBtn: { marginTop: spacing.sm },
  shareBtn: { marginTop: spacing.sm },
  shareCardHidden: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    opacity: 1,
  },

  // Celebration overlay
  celebrationOverlay: {
    position: 'absolute',
    top: '25%',
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 200,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  celebrationGradient: {
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },
  celebrationTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  celebrationXp: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.md,
  },
  celebrationUnlock: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});

const leaderboardStyles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  header: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  rowHighlight: {
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  rankCol: {
    width: 32,
    alignItems: 'center',
  },
  rankText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  nameText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  scoreText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '700',
    marginLeft: spacing.sm,
    width: 36,
    textAlign: 'right',
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.md,
    width: 40,
    textAlign: 'right',
  },
  separator: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  separatorDots: {
    color: colors.textMuted,
    fontSize: 14,
    letterSpacing: 4,
  },
});
