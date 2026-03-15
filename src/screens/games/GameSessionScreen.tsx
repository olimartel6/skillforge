import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [questions] = useState<GameQuestion[]>(() =>
    getQuestionsForLesson(skillName, lessonNumber, gameCount),
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [sessionMaxCombo, setSessionMaxCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime] = useState(Date.now());

  // Feedback flash
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const flashColor = useRef('transparent');
  const xpPopAnim = useRef(new Animated.Value(0)).current;
  const xpPopValue = useRef(0);
  const [showXpPop, setShowXpPop] = useState(false);
  // Key to force re-mount game components between questions
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    resetLives();
    resetCombo();
  }, [resetLives, resetCombo]);

  const showFlash = (color: string) => {
    flashColor.current = color;
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.3, duration: 100, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const showXpPopup = (amount: number) => {
    xpPopValue.current = amount;
    setShowXpPop(true);
    xpPopAnim.setValue(1);
    Animated.timing(xpPopAnim, { toValue: 0, duration: 1000, useNativeDriver: true }).start(() => {
      setShowXpPop(false);
    });
  };

  const handleAnswer = useCallback(
    async (correct: boolean) => {
      if (correct) {
        showFlash(colors.success);
        incrementCombo();
        const newCombo = combo + 1;
        const bonus = newCombo >= 3 ? XP_PER_CORRECT * 2 : XP_PER_CORRECT;
        await addXp(XP_PER_CORRECT);
        setXpEarned((prev) => prev + bonus);
        setCorrectCount((prev) => prev + 1);
        setSessionMaxCombo((prev) => Math.max(prev, newCombo));
        showXpPopup(bonus);
      } else {
        showFlash(colors.error);
        resetCombo();
        loseLife();

        if (lives - 1 <= 0) {
          setGameOver(true);
          return;
        }
      }

      // Advance to next question
      setTimeout(() => {
        if (currentIdx + 1 >= questions.length) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          (navigation as any).replace('GameResult', {
            xpEarned: xpEarned + (correct ? (combo + 1 >= 3 ? XP_PER_CORRECT * 2 : XP_PER_CORRECT) : 0),
            correctCount: correctCount + (correct ? 1 : 0),
            totalCount: questions.length,
            maxCombo: Math.max(sessionMaxCombo, correct ? combo + 1 : sessionMaxCombo),
            lessonNumber,
            elapsed,
          });
        } else {
          setCurrentIdx((prev) => prev + 1);
          setGameKey((prev) => prev + 1);
        }
      }, 400);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIdx, combo, lives, correctCount, xpEarned, sessionMaxCombo, questions.length],
  );

  const handleRetry = () => {
    resetLives();
    resetCombo();
    setCurrentIdx(0);
    setCorrectCount(0);
    setXpEarned(0);
    setSessionMaxCombo(0);
    setGameOver(false);
    setGameKey((prev) => prev + 1);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const question = questions[currentIdx];
  const progress = (currentIdx + 1) / questions.length;

  const renderGame = () => {
    if (!question) return null;
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

  if (gameOver) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverEmoji}>&#128148;</Text>
          <Text style={styles.gameOverTitle}>Out of Lives!</Text>
          <Text style={styles.gameOverSub}>
            You got {correctCount}/{questions.length} correct
          </Text>

          <View style={styles.gameOverButtons}>
            <TouchableOpacity onPress={handleRetry} activeOpacity={0.8}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.retryBtn}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <View style={styles.quitBtn}>
                <Text style={styles.quitText}>Quit</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.flashOverlay,
          {
            opacity: flashOpacity,
            backgroundColor: flashColor.current,
          },
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
              transform: [
                {
                  translateY: xpPopAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0],
                  }),
                },
              ],
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
      {combo >= 2 && (
        <View style={styles.comboContainer}>
          <LinearGradient
            colors={combo >= 3 ? [colors.primary, colors.primaryDark] : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
            style={styles.comboBadge}
          >
            <Text style={styles.comboText}>
              {combo >= 3 ? `${combo}x COMBO (2x XP!)` : `${combo}x combo`}
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Game Area */}
      <View style={styles.gameArea}>{renderGame()}</View>
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
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
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
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  livesContainer: { flexDirection: 'row', gap: 2 },
  heart: { fontSize: 18, color: colors.error },
  heartEmpty: { opacity: 0.2 },

  comboContainer: { alignItems: 'center', marginBottom: spacing.sm },
  comboBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  comboText: { ...typography.caption, color: '#fff', fontWeight: '700' },

  gameArea: { flex: 1, justifyContent: 'center' },

  gameOverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  gameOverEmoji: { fontSize: 64, marginBottom: spacing.xl },
  gameOverTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  gameOverSub: { ...typography.body, color: colors.textSecondary, marginBottom: spacing['4xl'] },
  gameOverButtons: { gap: spacing.lg, width: '100%' },
  retryBtn: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  quitBtn: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  quitText: { color: colors.textSecondary, fontWeight: '600', fontSize: 15 },
});
