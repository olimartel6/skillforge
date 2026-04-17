import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Share,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../components/GlassCard';
import { AmbientGlow } from '../../components/AmbientGlow';
import { leaveRoom, getDeviceIdSync, LivePlayer } from '../../services/liveGame';
import { useStreakStore } from '../../store/streakStore';
import { colors, spacing, typography, borderRadius, glowShadow } from '../../utils/theme';
import { t } from '../../i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONFETTI_COLORS = ['#FF6B35', '#6C63FF', '#34D399', '#F59E0B', '#EC4899', '#8B5CF6'];
const CONFETTI_COUNT = 30;

interface ConfettiPiece {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
}

export function LiveResultScreen({ navigation, route }: { navigation: any; route: any }) {
  const { players, roomCode, playerName, totalQuestions } = route.params as {
    players: LivePlayer[];
    roomCode: string;
    playerName: string;
    myScore: number;
    myCorrect: number;
    totalQuestions: number;
  };

  const myDeviceId = getDeviceIdSync();
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex((p) => p.deviceId === myDeviceId) + 1;
  const isWinner = myRank === 1;
  const updateAchievementStats = useStreakStore((s) => s.updateAchievementStats);

  // Podium entries
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  // Animations
  const podiumAnims = useRef(
    [0, 1, 2].map(() => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    })),
  ).current;

  const confettiPieces = useRef<ConfettiPiece[]>(
    Array.from({ length: CONFETTI_COUNT }, () => ({
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      y: new Animated.Value(-20),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
    })),
  ).current;

  useEffect(() => {
    Haptics.notificationAsync(
      isWinner
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    );

    // Track live game achievement (Social Butterfly badge)
    const currentStats = useStreakStore.getState().achievementStats;
    updateAchievementStats({ liveGamesPlayed: currentStats.liveGamesPlayed + 1 });

    // Podium animation - staggered
    podiumAnims.forEach((anim, i) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(anim.scale, { toValue: 1, friction: 5, useNativeDriver: true }),
          Animated.timing(anim.opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
      }, i * 200);
    });

    // Confetti
    if (isWinner) {
      confettiPieces.forEach((piece, i) => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(piece.y, {
              toValue: 800,
              duration: 2000 + Math.random() * 1500,
              useNativeDriver: true,
            }),
            Animated.timing(piece.x, {
              toValue: (piece.x as any)._value + (Math.random() - 0.5) * 100,
              duration: 2000 + Math.random() * 1500,
              useNativeDriver: true,
            }),
            Animated.timing(piece.rotate, {
              toValue: Math.random() * 10,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(piece.opacity, {
              toValue: 0,
              duration: 2500,
              delay: 500,
              useNativeDriver: true,
            }),
          ]).start();
        }, i * 50);
      });
    }
  }, []);

  const handlePlayAgain = async () => {
    await leaveRoom();
    navigation.replace('LiveLobby');
  };

  const handleShareResults = async () => {
    const me = sorted.find((p) => p.deviceId === myDeviceId);
    const shareText = `I got #${myRank} with ${me?.score || 0} points in a Skilly Live quiz! Challenge me: skilly://live`;
    try {
      await Share.share({ message: shareText });
    } catch (e) { console.warn('Share results failed:', e); }
  };

  const handleGoHome = async () => {
    await leaveRoom();
    navigation.popToTop();
  };

  const MEDAL_COLORS: Record<number, { bg: string; border: string; text: string }> = {
    0: { bg: '#FFD700' + '20', border: '#FFD700', text: '#FFD700' },
    1: { bg: '#C0C0C0' + '20', border: '#C0C0C0', text: '#C0C0C0' },
    2: { bg: '#CD7F32' + '20', border: '#CD7F32', text: '#CD7F32' },
  };

  const PODIUM_HEIGHTS = [120, 90, 70];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Confetti */}
      {isWinner &&
        confettiPieces.map((piece, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.size / 4,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rotate.interpolate({
                    inputRange: [0, 10],
                    outputRange: ['0deg', '3600deg'],
                  }),
                },
              ],
              opacity: piece.opacity,
              zIndex: 100,
            }}
          />
        ))}

      <AmbientGlow color={isWinner ? '#FFD700' : colors.primary} size={350} opacity={0.08} top={-80} left="50%" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>{t('live.finalResults')}</Text>
        {isWinner && <Text style={styles.winnerText}>{t('live.youWon')}</Text>}

        {/* Podium */}
        <View style={styles.podiumContainer}>
          {/* 2nd place */}
          {second && (
            <Animated.View
              style={[
                styles.podiumItem,
                { opacity: podiumAnims[1].opacity, transform: [{ scale: podiumAnims[1].scale }] },
              ]}
            >
              <View
                style={[
                  styles.podiumAvatar,
                  {
                    backgroundColor: MEDAL_COLORS[1].bg,
                    borderColor: MEDAL_COLORS[1].border,
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                  },
                ]}
              >
                <Text style={[styles.podiumInitials, { color: MEDAL_COLORS[1].text }]}>
                  {second.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {second.name}
              </Text>
              <Text style={[styles.podiumMedal, { color: MEDAL_COLORS[1].text }]}>2nd</Text>
              <View style={[styles.podiumBar, { height: PODIUM_HEIGHTS[1] }]}>
                <LinearGradient
                  colors={[MEDAL_COLORS[1].border + '40', MEDAL_COLORS[1].border + '10']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.podiumScore}>{second.score}</Text>
              </View>
            </Animated.View>
          )}

          {/* 1st place */}
          {first && (
            <Animated.View
              style={[
                styles.podiumItem,
                { opacity: podiumAnims[0].opacity, transform: [{ scale: podiumAnims[0].scale }] },
              ]}
            >
              <View
                style={[
                  styles.podiumAvatar,
                  {
                    backgroundColor: MEDAL_COLORS[0].bg,
                    borderColor: MEDAL_COLORS[0].border,
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                  },
                ]}
              >
                <Text style={[styles.podiumInitials, { color: MEDAL_COLORS[0].text, fontSize: 24 }]}>
                  {first.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.podiumName, { fontWeight: '800' }]} numberOfLines={1}>
                {first.name}
              </Text>
              <Text style={[styles.podiumMedal, { color: MEDAL_COLORS[0].text, fontSize: 16 }]}>
                1st
              </Text>
              <View style={[styles.podiumBar, { height: PODIUM_HEIGHTS[0] }]}>
                <LinearGradient
                  colors={[MEDAL_COLORS[0].border + '40', MEDAL_COLORS[0].border + '10']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={[styles.podiumScore, { fontSize: 22 }]}>{first.score}</Text>
              </View>
            </Animated.View>
          )}

          {/* 3rd place */}
          {third && (
            <Animated.View
              style={[
                styles.podiumItem,
                { opacity: podiumAnims[2].opacity, transform: [{ scale: podiumAnims[2].scale }] },
              ]}
            >
              <View
                style={[
                  styles.podiumAvatar,
                  {
                    backgroundColor: MEDAL_COLORS[2].bg,
                    borderColor: MEDAL_COLORS[2].border,
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                  },
                ]}
              >
                <Text style={[styles.podiumInitials, { color: MEDAL_COLORS[2].text, fontSize: 16 }]}>
                  {third.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {third.name}
              </Text>
              <Text style={[styles.podiumMedal, { color: MEDAL_COLORS[2].text }]}>3rd</Text>
              <View style={[styles.podiumBar, { height: PODIUM_HEIGHTS[2] }]}>
                <LinearGradient
                  colors={[MEDAL_COLORS[2].border + '40', MEDAL_COLORS[2].border + '10']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.podiumScore}>{third.score}</Text>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Full ranking */}
        <View style={styles.rankingSection}>
          <Text style={styles.rankingTitle}>{t('live.fullRanking')}</Text>
          {sorted.map((player, idx) => (
            <GlassCard
              key={player.deviceId}
              strong={player.deviceId === myDeviceId}
              style={styles.rankRow}
            >
              <Text style={styles.rankNumber}>#{idx + 1}</Text>
              <View style={styles.rankInfo}>
                <Text
                  style={[
                    styles.rankName,
                    player.deviceId === myDeviceId && { color: colors.primary },
                  ]}
                >
                  {player.name}
                  {player.deviceId === myDeviceId ? ` (${t('leaderboard.you')})` : ''}
                </Text>
                <Text style={styles.rankSub}>
                  {player.correctCount}/{totalQuestions} {t('live.correctAnswers')}
                </Text>
              </View>
              <Text style={styles.rankScore}>{player.score}</Text>
              <Text style={styles.rankPts}>{t('live.points')}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={handlePlayAgain} activeOpacity={0.7}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.primaryBtn}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>{t('live.playAgain')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShareResults} activeOpacity={0.7}>
            <GlassCard strong style={styles.secondaryBtn}>
              <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
              <Text style={styles.secondaryBtnText}>{t('live.shareResults')}</Text>
            </GlassCard>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleGoHome} activeOpacity={0.7}>
            <Text style={styles.goHomeText}>{t('gameResult.continue')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
  },

  // Title
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
  winnerText: {
    ...typography.h3,
    color: '#FFD700',
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Podium
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: spacing['3xl'],
    marginBottom: spacing['3xl'],
    height: 260,
  },
  podiumItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - spacing.xl * 2) / 3 - 8,
  },
  podiumAvatar: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  podiumInitials: {
    fontSize: 20,
    fontWeight: '900',
  },
  podiumName: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
    maxWidth: 80,
    textAlign: 'center',
  },
  podiumMedal: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  podiumBar: {
    width: '80%',
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumScore: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },

  // Ranking
  rankingSection: {
    marginTop: spacing.lg,
  },
  rankingTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    width: 36,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  rankSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rankScore: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    marginRight: 4,
  },
  rankPts: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Buttons
  buttonsContainer: {
    marginTop: spacing['3xl'],
    gap: spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    ...glowShadow(colors.primary),
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  secondaryBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  goHomeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
