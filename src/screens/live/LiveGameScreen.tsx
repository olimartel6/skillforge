import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../components/GlassCard';
import {
  onAnswerReceived,
  onPlayersChanged,
  submitAnswer,
  resetAnswered,
  sendGameEnd,
  getPlayers,
  getDeviceIdSync,
  LivePlayer,
  LiveAnswer,
} from '../../services/liveGame';
import type { GameQuestion } from '../../utils/gameQuestions';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { t } from '../../i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TIME_PER_QUESTION = 15;
const BASE_POINTS = 100;
const MAX_SPEED_BONUS = 50;
const SCOREBOARD_DELAY = 3000;

export function LiveGameScreen({ navigation, route }: { navigation: any; route: any }) {
  const { questions, roomCode, playerName, isHost } = route.params as {
    questions: GameQuestion[];
    roomCode: string;
    playerName: string;
    isHost: boolean;
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [players, setPlayers] = useState<LivePlayer[]>(getPlayers());
  const [myScore, setMyScore] = useState(0);
  const [myCorrect, setMyCorrect] = useState(0);
  const [answeredPlayers, setAnsweredPlayers] = useState<Set<string>>(new Set());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const progressAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;
  const myDeviceId = getDeviceIdSync();

  // Setup listeners
  useEffect(() => {
    onPlayersChanged((p) => setPlayers(p));
    onAnswerReceived((answer: LiveAnswer) => {
      setAnsweredPlayers((prev) => new Set(prev).add(answer.deviceId));
    });
  }, []);

  // Timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    setTimeLeft(TIME_PER_QUESTION);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowScoreboard(false);
    setAnsweredPlayers(new Set());
    progressAnim.setValue(1);

    // Entrance animation
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();

    // Timer animation
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: TIME_PER_QUESTION * 1000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Time's up - auto submit wrong answer
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Reset answered status
    resetAnswered(playerName);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex]);

  const handleTimeUp = useCallback(() => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer('__timeout__');
    setShowResult(true);

    submitAnswer(currentIndex, '__timeout__', TIME_PER_QUESTION * 1000, false, 0, playerName);

    setTimeout(() => {
      showScoreboardAndAdvance();
    }, 1500);
  }, [currentIndex, selectedAnswer]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer !== null) return;
      if (timerRef.current) clearInterval(timerRef.current);

      const timeMs = Date.now() - startTimeRef.current;
      const correct = answer === String(currentQuestion.correctAnswer);
      const speedBonus = correct
        ? Math.round(MAX_SPEED_BONUS * (1 - timeMs / (TIME_PER_QUESTION * 1000)))
        : 0;
      const points = correct ? BASE_POINTS + Math.max(0, speedBonus) : 0;

      setSelectedAnswer(answer);
      setShowResult(true);

      if (correct) {
        setMyScore((prev) => prev + points);
        setMyCorrect((prev) => prev + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      submitAnswer(currentIndex, answer, timeMs, correct, points, playerName);

      setTimeout(() => {
        showScoreboardAndAdvance();
      }, 1500);
    },
    [currentIndex, selectedAnswer, currentQuestion],
  );

  const showScoreboardAndAdvance = useCallback(() => {
    setShowScoreboard(true);

    setTimeout(() => {
      if (isLastQuestion) {
        // Game over
        if (isHost) {
          sendGameEnd();
        }
        const finalPlayers = getPlayers().sort((a, b) => b.score - a.score);
        navigation.replace('LiveResult', {
          players: finalPlayers,
          roomCode,
          playerName,
          myScore,
          myCorrect,
          totalQuestions: questions.length,
        });
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, SCOREBOARD_DELAY);
  }, [isLastQuestion, isHost, myScore, myCorrect]);

  const getOptionStyle = (option: string) => {
    if (!showResult) return {};
    const isCorrect = option === String(currentQuestion.correctAnswer);
    const isSelected = option === selectedAnswer;
    if (isCorrect) return { borderColor: colors.success, borderWidth: 2 };
    if (isSelected && !isCorrect) return { borderColor: colors.error, borderWidth: 2 };
    return { opacity: 0.4 };
  };

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // ---- SCOREBOARD OVERLAY ----
  if (showScoreboard) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.scoreboardContainer}>
          <Text style={styles.scoreboardTitle}>{t('live.scoreboard')}</Text>
          <Text style={styles.scoreboardSub}>
            {t('live.questionOf', { current: currentIndex + 1, total: questions.length })}
          </Text>

          {sortedPlayers.map((player, idx) => (
            <GlassCard
              key={player.deviceId}
              strong={player.deviceId === myDeviceId}
              style={styles.scoreRow}
            >
              <Text style={styles.scoreRank}>#{idx + 1}</Text>
              <View style={styles.scoreInfo}>
                <Text
                  style={[
                    styles.scoreName,
                    player.deviceId === myDeviceId && { color: colors.primary },
                  ]}
                >
                  {player.name}
                  {player.deviceId === myDeviceId ? ` (${t('leaderboard.you')})` : ''}
                </Text>
              </View>
              <Text style={styles.scorePoints}>{player.score}</Text>
            </GlassCard>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // ---- GAME VIEW ----
  const options =
    currentQuestion.type === 'true_false'
      ? ['True', 'False']
      : currentQuestion.options || [];

  const OPTION_COLORS = [
    ['#FF6B35', '#FF3D00'],
    ['#6C63FF', '#4F46E5'],
    ['#34D399', '#059669'],
    ['#F59E0B', '#D97706'],
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.questionCounter}>
          <Text style={styles.questionCounterText}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, timeLeft <= 5 && { color: colors.error }]}>
            {timeLeft}
          </Text>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.myScoreText}>{myScore}</Text>
          <Text style={styles.myScoreLabel}>pts</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.timerBar}>
        <Animated.View
          style={[
            styles.timerFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: timeLeft <= 5 ? colors.error : colors.primary,
            },
          ]}
        />
      </View>

      {/* Player answer indicators */}
      <View style={styles.playerIndicators}>
        {players.map((player) => (
          <View
            key={player.deviceId}
            style={[
              styles.indicator,
              answeredPlayers.has(player.deviceId) && styles.indicatorAnswered,
            ]}
          >
            <Text style={styles.indicatorText}>
              {player.name.charAt(0).toUpperCase()}
            </Text>
            {answeredPlayers.has(player.deviceId) && (
              <View style={styles.indicatorCheck}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Question */}
      <Animated.View
        style={[styles.questionContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.questionText}>{currentQuestion.prompt}</Text>
      </Animated.View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, idx) => {
          const optionColors = OPTION_COLORS[idx % OPTION_COLORS.length];
          return (
            <TouchableOpacity
              key={option}
              onPress={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              activeOpacity={0.7}
              style={[styles.optionWrapper, getOptionStyle(option)]}
            >
              <LinearGradient
                colors={
                  showResult && option === String(currentQuestion.correctAnswer)
                    ? [colors.success, colors.successDark]
                    : showResult && option === selectedAnswer
                      ? [colors.error, '#B91C1C']
                      : [optionColors[0] + '20', optionColors[1] + '20']
                }
                style={styles.optionGradient}
              >
                <Text
                  style={[
                    styles.optionText,
                    showResult &&
                      option === String(currentQuestion.correctAnswer) && {
                        color: '#fff',
                        fontWeight: '800',
                      },
                  ]}
                >
                  {option}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  questionCounter: {
    backgroundColor: colors.glassBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  questionCounterText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  timerContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  myScoreText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  myScoreLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Timer bar
  timerBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: spacing.xl,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  timerFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Player indicators
  playerIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  indicatorAnswered: {
    borderColor: colors.success,
    backgroundColor: colors.success + '20',
  },
  indicatorText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
  },
  indicatorCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Question
  questionContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
    flex: 1,
    justifyContent: 'center',
  },
  questionText: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },

  // Options
  optionsContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },
  optionWrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Scoreboard
  scoreboardContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['4xl'],
  },
  scoreboardTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  scoreboardSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  scoreRank: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    width: 36,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  scorePoints: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
});
