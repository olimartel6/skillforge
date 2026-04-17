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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../../store/gameStore';
import { getQuestionsForLesson, getLessonGameCount } from '../../utils/gameQuestions';
import type { GameQuestion } from '../../utils/gameQuestions';
import { translateQuestions } from '../../utils/questionTranslations';
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
import { ChartQuestionGame } from '../../components/games/ChartQuestionGame';
import { t } from '../../i18n';

const XP_PER_CORRECT = 15;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONFETTI_COLORS = ['#FF6B35', '#6C63FF', '#34D399', '#F59E0B'];
const CONFETTI_PARTICLE_COUNT = 10;

// Combo system config
function getComboLevel(streak: number): { multiplier: number; label: string; color: string; glowColor: string; icon: string } {
  if (streak >= 5) return { multiplier: 4, label: 'x4 COMBO!', color: '#A855F7', glowColor: 'rgba(168, 85, 247, 0.35)', icon: '\u26A1' };
  if (streak >= 4) return { multiplier: 3, label: 'x3 COMBO!', color: '#EF4444', glowColor: 'rgba(239, 68, 68, 0.30)', icon: '\uD83D\uDD25' };
  if (streak >= 3) return { multiplier: 2, label: 'x2 COMBO!', color: '#F59E0B', glowColor: 'rgba(245, 158, 11, 0.25)', icon: '\uD83D\uDD25' };
  return { multiplier: 1, label: '', color: 'transparent', glowColor: 'transparent', icon: '' };
}

export function GameSessionScreen({ navigation, route }: { navigation: any; route: any }) {
  const { lessonNumber, skillName } = route.params;
  const { lives, combo, addXp, incrementCombo, resetCombo, loseLife, resetLives, addMissedQuestion } =
    useGameStore();

  const gameCount = getLessonGameCount(lessonNumber);

  // Queue: initial questions + missed ones get re-added at the end
  const [queue, setQueue] = useState<GameQuestion[]>(() =>
    translateQuestions(getQuestionsForLesson(skillName, lessonNumber, gameCount)),
  );
  const totalOriginal = useRef(gameCount);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [sessionMaxCombo, setSessionMaxCombo] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  // Confetti burst state
  const [confettiActive, setConfettiActive] = useState(false);
  const confettiAnims = useRef(
    Array.from({ length: CONFETTI_PARTICLE_COUNT }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  const triggerConfetti = useCallback(() => {
    setConfettiActive(true);
    const animations = confettiAnims.map((anim, i) => {
      anim.translateY.setValue(0);
      anim.translateX.setValue(0);
      anim.opacity.setValue(1);
      anim.scale.setValue(1);
      const angle = (i / CONFETTI_PARTICLE_COUNT) * Math.PI * 2;
      const distance = 60 + Math.random() * 80;
      const targetX = Math.cos(angle) * distance;
      const targetY = -Math.abs(Math.sin(angle) * distance) - 20 - Math.random() * 40;
      return Animated.parallel([
        Animated.timing(anim.translateY, { toValue: targetY, duration: 600, useNativeDriver: true }),
        Animated.timing(anim.translateX, { toValue: targetX, duration: 600, useNativeDriver: true }),
        Animated.timing(anim.opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(anim.scale, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ]);
    });
    Animated.parallel(animations).start(() => setConfettiActive(false));
  }, [confettiAnims]);

  // Feedback banner state (interactive)
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(true);
  const [feedbackAnswer, setFeedbackAnswer] = useState('');
  const [feedbackExplanation, setFeedbackExplanation] = useState('');
  const feedbackSlide = useRef(new Animated.Value(200)).current;

  // Flash + XP popup
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const flashColor = useRef('transparent');
  const xpPopAnim = useRef(new Animated.Value(0)).current;
  const xpPopValue = useRef(0);
  const [showXpPop, setShowXpPop] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Combo system animations
  const comboGlowOpacity = useRef(new Animated.Value(0)).current;
  const comboBadgeScale = useRef(new Animated.Value(0)).current;
  const comboBadgeOpacity = useRef(new Animated.Value(0)).current;
  const comboFlashOpacity = useRef(new Animated.Value(0)).current;
  const screenShakeX = useRef(new Animated.Value(0)).current;
  const [activeComboLevel, setActiveComboLevel] = useState({ multiplier: 1, label: '', color: 'transparent', glowColor: 'transparent', icon: '' });
  const prevComboMultiplier = useRef(1);
  const [gameOver, setGameOver] = useState(false);

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

  const triggerComboEffects = useCallback((newStreak: number) => {
    const level = getComboLevel(newStreak);
    setActiveComboLevel(level);

    if (level.multiplier <= 1) {
      // No combo active — hide glow
      Animated.timing(comboGlowOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      Animated.timing(comboBadgeOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      return;
    }

    // Show glow overlay
    Animated.timing(comboGlowOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    // Badge entrance: scale up then settle
    comboBadgeScale.setValue(0.3);
    comboBadgeOpacity.setValue(1);
    Animated.spring(comboBadgeScale, {
      toValue: 1,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();

    // Level-up flash when multiplier increases
    if (level.multiplier > prevComboMultiplier.current) {
      comboFlashOpacity.setValue(0.4);
      Animated.timing(comboFlashOpacity, { toValue: 0, duration: 500, useNativeDriver: true }).start();

      // Screen shake for x4+
      if (level.multiplier >= 4) {
        Animated.sequence([
          Animated.timing(screenShakeX, { toValue: 6, duration: 40, useNativeDriver: true }),
          Animated.timing(screenShakeX, { toValue: -6, duration: 40, useNativeDriver: true }),
          Animated.timing(screenShakeX, { toValue: 5, duration: 35, useNativeDriver: true }),
          Animated.timing(screenShakeX, { toValue: -5, duration: 35, useNativeDriver: true }),
          Animated.timing(screenShakeX, { toValue: 3, duration: 30, useNativeDriver: true }),
          Animated.timing(screenShakeX, { toValue: -3, duration: 30, useNativeDriver: true }),
          Animated.timing(screenShakeX, { toValue: 0, duration: 25, useNativeDriver: true }),
        ]).start();
      }
    }

    prevComboMultiplier.current = level.multiplier;
  }, [comboGlowOpacity, comboBadgeScale, comboBadgeOpacity, comboFlashOpacity, screenShakeX]);

  const resetComboEffects = useCallback(() => {
    prevComboMultiplier.current = 1;
    setActiveComboLevel({ multiplier: 1, label: '', color: 'transparent', glowColor: 'transparent', icon: '' });
    Animated.parallel([
      Animated.timing(comboGlowOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(comboBadgeOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [comboGlowOpacity, comboBadgeOpacity]);

  const showFeedbackBanner = (correct: boolean, answer: string, explanation?: string) => {
    setFeedbackCorrect(correct);
    setFeedbackAnswer(answer);
    setFeedbackExplanation(explanation || '');
    setFeedbackVisible(true);
    feedbackSlide.setValue(200);
    Animated.spring(feedbackSlide, {
      toValue: 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const incrementDailyLessonCount = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem('skilly_daily_lesson_date', today);
      const stored = await AsyncStorage.getItem('skilly_daily_lesson_count');
      const count = stored ? parseInt(stored, 10) : 0;
      await AsyncStorage.setItem('skilly_daily_lesson_count', String(count + 1));
    } catch (e) { console.warn('Increment daily lesson count failed:', e); }
  }, []);

  const hideFeedbackAndAdvance = () => {
    setFeedbackVisible(false);
    setIsTransitioning(false);

    // Check if lesson is complete
    if (currentIdx + 1 >= queue.length) {
      // Daily lesson count is now incremented at lesson START (in GamesHomeScreen)
      // to prevent bypass by force-closing the app

      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      navigation.replace('GameResult', {
        xpEarned,
        correctCount,
        totalCount: totalOriginal.current,
        maxCombo: sessionMaxCombo,
        lessonNumber,
        elapsed,
        mistakeCount,
        skillName,
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

        triggerConfetti();
        showFlash(colors.success);
        incrementCombo();
        const newCombo = combo + 1;
        const comboLevel = getComboLevel(newCombo);
        const bonus = XP_PER_CORRECT * comboLevel.multiplier;
        await addXp(bonus);
        setXpEarned((prev) => prev + bonus);
        setCorrectCount((prev) => prev + 1);
        setSessionMaxCombo((prev) => Math.max(prev, newCombo));
        showXpPopup(bonus);
        triggerComboEffects(newCombo);

        // Show green banner briefly then auto-advance
        const hasExplanation = !!(question as GameQuestion).explanation;
        showFeedbackBanner(true, '', (question as GameQuestion).explanation);
        setTimeout(() => {
          hideFeedbackAndAdvance();
        }, hasExplanation ? 2500 : 800);
      } else {
        // Haptic error
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}

        showFlash(colors.error);
        resetCombo();
        resetComboEffects();
        setMistakeCount((prev) => prev + 1);
        loseLife();

        // Track missed question for review mode
        addMissedQuestion(skillName, `Lesson ${lessonNumber}`, question);

        // Check for game over (lives was 1 before loseLife, now 0)
        const currentLives = useGameStore.getState().lives;
        if (currentLives <= 0) {
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
          setGameOver(true);
          setFeedbackVisible(false);
          setIsTransitioning(false);
          return;
        }

        // Add this question back to the end of the queue (spaced repetition)
        setQueue((prev) => [...prev, question]);

        // Show red banner with correct answer — user must tap "Continue"
        const correctAns = typeof question.correctAnswer === 'string'
          ? question.correctAnswer
          : Array.isArray(question.correctAnswer)
            ? question.correctAnswer.join(', ')
            : String(question.correctAnswer);

        showFeedbackBanner(false, correctAns, (question as GameQuestion).explanation);
        // Don't auto-advance — wait for user to tap "Continue"
      }
    },
    [currentIdx, combo, lives, isTransitioning, queue],
  );

  const handleClose = () => {
    navigation.goBack();
  };

  const handleRestart = () => {
    setGameOver(false);
    setCurrentIdx(0);
    setGameKey((prev) => prev + 1);
    setCorrectCount(0);
    setXpEarned(0);
    setMistakeCount(0);
    setSessionMaxCombo(0);
    resetLives();
    resetCombo();
    resetComboEffects();
    // Re-shuffle the original questions
    const originalQuestions = getQuestionsForLesson(skillName, lessonNumber, gameCount);
    const translated = translateQuestions(originalQuestions);
    setQueue(translated);
    totalOriginal.current = translated.length;
    setStartTime(Date.now());
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
      case 'chart_question': return <ChartQuestionGame key={gameKey} {...gameProps} />;
      default: return <MultipleChoiceGame key={gameKey} {...gameProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Combo glow overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.comboGlowOverlay,
          {
            opacity: comboGlowOpacity,
            borderColor: activeComboLevel.color,
            shadowColor: activeComboLevel.color,
          },
        ]}
      />

      {/* Combo level-up color flash */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.flashOverlay,
          { opacity: comboFlashOpacity, backgroundColor: activeComboLevel.color },
        ]}
      />

      {/* Flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.flashOverlay,
          { opacity: flashOpacity, backgroundColor: flashColor.current },
        ]}
      />

      {/* Confetti burst */}
      {confettiActive && confettiAnims.map((anim, i) => (
        <Animated.View
          key={`confetti-${i}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            zIndex: 101,
            opacity: anim.opacity,
            transform: [
              { translateY: anim.translateY },
              { translateX: anim.translateX },
              { scale: anim.scale },
            ],
          }}
        />
      ))}

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

      {/* Animated combo badge (center top) */}
      {activeComboLevel.multiplier > 1 && !feedbackVisible && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.comboBadgeCenter,
            {
              opacity: comboBadgeOpacity,
              transform: [{ scale: comboBadgeScale }],
            },
          ]}
        >
          <Text style={[styles.comboBadgeCenterText, { color: activeComboLevel.color }]}>
            {activeComboLevel.icon} {activeComboLevel.label}
          </Text>
          {activeComboLevel.multiplier >= 2 && (
            <Text style={[styles.comboMultiplierSub, { color: activeComboLevel.color }]}>
              {activeComboLevel.multiplier}x XP
            </Text>
          )}
        </Animated.View>
      )}

      <Animated.View style={{ flex: 1, transform: [{ translateX: screenShakeX }] }}>
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

          {/* Combo streak counter (top-right) */}
          {combo > 0 && (
            <View style={[styles.streakCounter, { borderColor: activeComboLevel.multiplier > 1 ? activeComboLevel.color : 'rgba(255,255,255,0.15)' }]}>
              <Text style={[styles.streakCounterText, activeComboLevel.multiplier > 1 && { color: activeComboLevel.color }]}>
                {combo}{activeComboLevel.multiplier > 1 ? ` ${activeComboLevel.icon}` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Game Area */}
        <View style={styles.gameArea}>{renderGame()}</View>
      </Animated.View>

      {/* Game Over Overlay */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <LinearGradient
            colors={['#0a0a0b', '#1a0a0a', '#0a0a0b']}
            style={styles.gameOverGradientBg}
          >
            {/* Red glow at top */}
            <View style={styles.gameOverGlow} />

            {/* Broken hearts */}
            <View style={styles.gameOverHeartsRow}>
              <Text style={styles.gameOverHeartEmpty}>♥</Text>
              <Text style={styles.gameOverHeartEmpty}>♥</Text>
              <Text style={styles.gameOverHeartEmpty}>♥</Text>
            </View>

            <Text style={styles.gameOverTitle}>{t('gameSession.gameOver') || 'Game Over'}</Text>
            <Text style={styles.gameOverSub}>{t('gameSession.outOfLives') || 'You ran out of lives!'}</Text>

            {/* Stats cards */}
            <View style={styles.gameOverStatsRow}>
              <View style={styles.gameOverStatCard}>
                <Text style={styles.gameOverStatValue}>{correctCount}</Text>
                <Text style={styles.gameOverStatLabel}>Correct</Text>
              </View>
              <View style={[styles.gameOverStatCard, { borderColor: 'rgba(239,68,68,0.2)' }]}>
                <Text style={[styles.gameOverStatValue, { color: colors.error }]}>{mistakeCount}</Text>
                <Text style={styles.gameOverStatLabel}>Mistakes</Text>
              </View>
              <View style={styles.gameOverStatCard}>
                <Text style={styles.gameOverStatValue}>{Math.round((correctCount / Math.max(1, correctCount + mistakeCount)) * 100)}%</Text>
                <Text style={styles.gameOverStatLabel}>Accuracy</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleRestart} activeOpacity={0.8} style={styles.restartBtn}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.restartBtnGradient}
              >
                <Text style={styles.restartBtnText}>{t('gameSession.tryAgain') || 'Try Again'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7} style={styles.gameOverQuitBtn}>
              <Text style={styles.gameOverQuitText}>{t('gameSession.quit') || 'Quit'}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

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
                {feedbackCorrect ? t('gameSession.correct') : t('gameSession.notQuite')}
              </Text>
            </View>

            {!feedbackCorrect && feedbackAnswer && (
              <View style={styles.correctAnswerBox}>
                <Text style={styles.correctAnswerLabel}>{t('gameSession.correctAnswer')}</Text>
                <Text style={styles.correctAnswerText}>{feedbackAnswer}</Text>
              </View>
            )}

            {feedbackExplanation ? (
              <Text style={styles.explanationText}>
                {'\uD83D\uDCA1'} {feedbackExplanation}
              </Text>
            ) : null}

            {!feedbackCorrect && (
              <Text style={styles.feedbackHint}>
                {t('gameSession.willComeBack')}
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
              <Text style={styles.continueBtnText}>{t('gameSession.continue')}</Text>
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

  comboGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 98,
    borderWidth: 3,
    borderRadius: 0,
    borderColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
  },
  comboBadgeCenter: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    zIndex: 102,
    alignItems: 'center',
  },
  comboBadgeCenterText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  comboMultiplierSub: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    opacity: 0.8,
  },
  streakCounter: {
    marginLeft: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  streakCounterText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
  },

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
  explanationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: spacing.md,
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
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  gameOverGradientBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  gameOverGlow: {
    position: 'absolute',
    top: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  gameOverHeartsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: spacing.xl,
  },
  gameOverHeartEmpty: {
    fontSize: 48,
    color: 'rgba(239,68,68,0.25)',
  },
  gameOverTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  gameOverSub: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xl * 1.5,
  },
  gameOverStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl * 1.5,
    width: '100%',
  },
  gameOverStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gameOverStatValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  gameOverStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  restartBtn: {
    width: '100%',
    marginBottom: spacing.md,
  },
  restartBtnGradient: {
    paddingVertical: 18,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  restartBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gameOverQuitBtn: {
    paddingVertical: spacing.lg,
  },
  gameOverQuitText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
