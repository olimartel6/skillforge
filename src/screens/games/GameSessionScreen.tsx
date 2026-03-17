import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../../store/gameStore';
import { getQuestionsForLesson, getLessonGameCount } from '../../utils/gameQuestions';
import type { GameQuestion } from '../../utils/gameQuestions';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

import { MultipleChoiceGame } from '../../components/games/MultipleChoiceGame';
import { TrueFalseGame } from '../../components/games/TrueFalseGame';
import { MatchPairsGame } from '../../components/games/MatchPairsGame';
import { SpeedSortGame } from '../../components/games/SpeedSortGame';
import { FillGapGame } from '../../components/games/FillGapGame';
import { SwipeJudgeGame } from '../../components/games/SwipeJudgeGame';
import { MemoryCardsGame } from '../../components/games/MemoryCardsGame';
import { DragLabelGame } from '../../components/games/DragLabelGame';
import { SpotDifferenceGame } from '../../components/games/SpotDifferenceGame';
import { TimedChallengeGame } from '../../components/games/TimedChallengeGame';
import { ListenPickGame } from '../../components/games/ListenPickGame';
import { BeforeAfterGame } from '../../components/games/BeforeAfterGame';

const XP_PER_CORRECT = 15;
const SCREEN_WIDTH = Dimensions.get('window').width;

export function GameSessionScreen({ navigation, route }: { navigation: any; route: any }) {
  const { lessonNumber, skillName } = route.params;
  const { lives, combo, addXp, incrementCombo, resetCombo, loseLife, resetLives } =
    useGameStore();

  const gameCount = getLessonGameCount(lessonNumber);

  // Queue: initial questions + missed ones get re-added at the end
  const [queue, setQueue] = useState<GameQuestion[]>(() =>
    getQuestionsForLesson(skillName, lessonNumber, gameCount),
  );
  const totalOriginal = useRef(gameCount);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [sessionMaxCombo, setSessionMaxCombo] = useState(0);
  const [startTime] = useState(Date.now());

  // Feedback banner state (interactive)
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(true);
  const [feedbackAnswer, setFeedbackAnswer] = useState('');
  const feedbackSlide = useRef(new Animated.Value(200)).current;

  // Flash + XP popup
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const flashColor = useRef('transparent');
  const xpPopAnim = useRef(new Animated.Value(0)).current;
  const xpPopValue = useRef(0);
  const [showXpPop, setShowXpPop] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    resetLives();
    resetCombo();
  }, [resetLives, resetCombo]);

  const showFlash = (color: string) => {
    flashColor.current = color;
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.25, duration: 80, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const showXpPopup = (amount: number) => {
    xpPopValue.current = amount;
    setShowXpPop(true);
    xpPopAnim.setValue(1);
    Animated.timing(xpPopAnim, { toValue: 0, duration: 1200, useNativeDriver: true }).start(() => {
      setShowXpPop(false);
    });
  };

  const showFeedbackBanner = (correct: boolean, answer: string) => {
    setFeedbackCorrect(correct);
    setFeedbackAnswer(answer);
    setFeedbackVisible(true);
    feedbackSlide.setValue(200);
    Animated.spring(feedbackSlide, {
      toValue: 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const hideFeedbackAndAdvance = () => {
    setFeedbackVisible(false);
    setIsTransitioning(false);

    // Check if lesson is complete
    if (currentIdx + 1 >= queue.length) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      navigation.replace('GameResult', {
        xpEarned,
        correctCount,
        totalCount: totalOriginal.current,
        maxCombo: sessionMaxCombo,
        lessonNumber,
        elapsed,
        mistakeCount,
      });
    } else {
      setCurrentIdx((prev) => prev + 1);
      setGameKey((prev) => prev + 1);
    }
  };

  const handleAnswer = useCallback(
    async (correct: boolean) => {
      if (isTransitioning) return;
      setIsTransitioning(true);

      const question = queue[currentIdx];

      if (correct) {
        // Haptic success
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}

        showFlash(colors.success);
        incrementCombo();
        const newCombo = combo + 1;
        const bonus = newCombo >= 3 ? XP_PER_CORRECT * 2 : XP_PER_CORRECT;
        await addXp(XP_PER_CORRECT);
        setXpEarned((prev) => prev + bonus);
        setCorrectCount((prev) => prev + 1);
        setSessionMaxCombo((prev) => Math.max(prev, newCombo));
        showXpPopup(bonus);

        // Show green banner briefly then auto-advance
        showFeedbackBanner(true, '');
        setTimeout(() => {
          hideFeedbackAndAdvance();
        }, 800);
      } else {
        // Haptic error
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}

        showFlash(colors.error);
        resetCombo();
        setMistakeCount((prev) => prev + 1);
        loseLife();

        // Add this question back to the end of the queue (spaced repetition)
        setQueue((prev) => [...prev, question]);

        // Show red banner with correct answer — user must tap "Continue"
        const correctAns = typeof question.correctAnswer === 'string'
          ? question.correctAnswer
          : Array.isArray(question.correctAnswer)
            ? question.correctAnswer.join(', ')
            : String(question.correctAnswer);

        showFeedbackBanner(false, correctAns);
        // Don't auto-advance — wait for user to tap "Continue"
      }
    },
    [currentIdx, combo, lives, isTransitioning, queue],
  );

  const handleClose = () => {
    navigation.goBack();
  };

  const question = queue[currentIdx];
  // Progress: show progress through the original question count
  const progress = Math.min(correctCount / totalOriginal.current, 1);

  const renderGame = () => {
    if (!question || feedbackVisible) return null;
    const gameProps = { question, onAnswer: handleAnswer, skillName };

    switch (question.type) {
      case 'multiple_choice': return <MultipleChoiceGame key={gameKey} {...gameProps} />;
      case 'true_false': return <TrueFalseGame key={gameKey} {...gameProps} />;
      case 'match_pairs': return <MatchPairsGame key={gameKey} {...gameProps} />;
      case 'speed_sort': return <SpeedSortGame key={gameKey} {...gameProps} />;
      case 'fill_gap': return <FillGapGame key={gameKey} {...gameProps} />;
      case 'swipe_judge': return <SwipeJudgeGame key={gameKey} {...gameProps} />;
      case 'memory_cards': return <MemoryCardsGame key={gameKey} {...gameProps} />;
      case 'drag_label': return <DragLabelGame key={gameKey} {...gameProps} />;
      case 'spot_difference': return <SpotDifferenceGame key={gameKey} {...gameProps} />;
      case 'timed_challenge': return <TimedChallengeGame key={gameKey} {...gameProps} />;
      case 'listen_pick': return <ListenPickGame key={gameKey} {...gameProps} />;
      case 'before_after': return <BeforeAfterGame key={gameKey} {...gameProps} />;
      default: return <MultipleChoiceGame key={gameKey} {...gameProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.flashOverlay,
          { opacity: flashOpacity, backgroundColor: flashColor.current },
        ]}
      />

      {/* XP Pop */}
      {showXpPop && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.xpPop,
            {
              opacity: xpPopAnim,
              transform: [{
                translateY: xpPopAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-60, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.xpPopText}>+{xpPopValue.current} XP</Text>
        </Animated.View>
      )}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>&#10005;</Text>
        </TouchableOpacity>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>

        {/* Lives */}
        <View style={styles.livesContainer}>
          {[0, 1, 2].map((i) => (
            <Text key={i} style={[styles.heart, i >= lives && styles.heartEmpty]}>
              &#9829;
            </Text>
          ))}
        </View>
      </View>

      {/* Combo */}
      {combo >= 2 && !feedbackVisible && (
        <View style={styles.comboContainer}>
          <LinearGradient
            colors={combo >= 3 ? [colors.primary, colors.primaryDark] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
            style={styles.comboBadge}
          >
            <Text style={styles.comboText}>
              {combo >= 3 ? `🔥 ${combo}x COMBO · 2x XP!` : `${combo}x combo`}
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Game Area */}
      <View style={styles.gameArea}>{renderGame()}</View>

      {/* Feedback Banner (interactive bottom sheet) */}
      {feedbackVisible && (
        <Animated.View
          style={[
            styles.feedbackBanner,
            feedbackCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
            { transform: [{ translateY: feedbackSlide }] },
          ]}
        >
          <View style={styles.feedbackContent}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackEmoji}>
                {feedbackCorrect ? '🎉' : '😔'}
              </Text>
              <Text style={[styles.feedbackTitle, feedbackCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleWrong]}>
                {feedbackCorrect ? 'Correct!' : 'Not quite...'}
              </Text>
            </View>

            {!feedbackCorrect && feedbackAnswer && (
              <View style={styles.correctAnswerBox}>
                <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
                <Text style={styles.correctAnswerText}>{feedbackAnswer}</Text>
              </View>
            )}

            {!feedbackCorrect && (
              <Text style={styles.feedbackHint}>
                This question will come back later so you can practice it again.
              </Text>
            )}
          </View>

          {/* Continue button (only for wrong answers — correct auto-advances) */}
          {!feedbackCorrect && (
            <TouchableOpacity
              onPress={hideFeedbackAndAdvance}
              activeOpacity={0.8}
              style={styles.continueBtn}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  xpPop: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 99,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  xpPopText: { ...typography.h3, color: colors.primary },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.textSecondary, fontSize: 16 },
  progressBarContainer: { flex: 1 },
  progressBarBg: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 5 },
  livesContainer: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 18, color: colors.error },
  heartEmpty: { opacity: 0.2 },

  comboContainer: { alignItems: 'center', marginBottom: spacing.sm },
  comboBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  comboText: { ...typography.caption, color: '#fff', fontWeight: '700', fontSize: 12 },

  gameArea: { flex: 1, justifyContent: 'center' },

  // Feedback banner
  feedbackBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: spacing['2xl'],
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing['2xl'],
    paddingHorizontal: spacing.xl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(52, 211, 153, 0.2)',
  },
  feedbackWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
  },
  feedbackContent: {
    marginBottom: spacing.lg,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  feedbackEmoji: {
    fontSize: 28,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  feedbackTitleCorrect: {
    color: colors.success,
  },
  feedbackTitleWrong: {
    color: colors.error,
  },
  correctAnswerBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  correctAnswerLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  correctAnswerText: {
    fontSize: 15,
    color: colors.success,
    fontWeight: '600',
    lineHeight: 22,
  },
  feedbackHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontStyle: 'italic',
  },
  continueBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  continueBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
