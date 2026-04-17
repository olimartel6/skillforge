import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getQuestionsForLesson } from '../../utils/gameQuestions';
import type { GameQuestion } from '../../utils/gameQuestions';
import { colors, spacing, typography, borderRadius, glowShadow } from '../../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;

export function FlashcardsScreen({ route, navigation }: { route: any; navigation: any }) {
  const { skillName } = route.params;

  // Pull questions from multiple lessons to build a full deck
  const buildDeck = useCallback((): GameQuestion[] => {
    const allQuestions: GameQuestion[] = [];
    const seen = new Set<string>();
    // Grab questions from up to 24 lessons
    for (let lesson = 1; lesson <= 24; lesson++) {
      const qs = getQuestionsForLesson(skillName, lesson, 8);
      for (const q of qs) {
        if (!seen.has(q.prompt)) {
          seen.add(q.prompt);
          allQuestions.push(q);
        }
      }
    }
    // Shuffle
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    return allQuestions.slice(0, 30);
  }, [skillName]);

  const [deck, setDeck] = useState<GameQuestion[]>(() => buildDeck());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const totalCards = deck.length;

  // Animation values
  const flipAnim = useRef(new Animated.Value(0)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const isAnimating = useRef(false);

  const flipCard = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}

    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
    setIsFlipped(!isFlipped);
  }, [isFlipped, flipAnim]);

  const handleSwipe = useCallback((direction: 'right' | 'left') => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const isGotIt = direction === 'right';
    try {
      Haptics.impactAsync(
        isGotIt ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      );
    } catch {}

    const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

    Animated.parallel([
      Animated.timing(panX, {
        toValue: targetX,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset card position
      panX.setValue(0);
      panY.setValue(0);
      cardOpacity.setValue(1);
      flipAnim.setValue(0);
      setIsFlipped(false);

      if (isGotIt) {
        // Card mastered - remove from deck
        setMasteredCount((prev) => prev + 1);
        setDeck((prev) => {
          const newDeck = [...prev];
          newDeck.splice(currentIndex, 1);
          if (newDeck.length === 0) {
            setIsComplete(true);
          } else {
            setCurrentIndex((ci) => (ci >= newDeck.length ? 0 : ci));
          }
          return newDeck;
        });
      } else {
        // Review again - move to end of deck
        setDeck((prev) => {
          const newDeck = [...prev];
          const [card] = newDeck.splice(currentIndex, 1);
          newDeck.push(card);
          if (currentIndex >= newDeck.length) {
            setCurrentIndex(0);
          }
          return newDeck;
        });
      }

      isAnimating.current = false;
    });
  }, [currentIndex, panX, panY, cardOpacity, flipAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10,
      onPanResponderMove: (_, gs) => {
        panX.setValue(gs.dx);
        panY.setValue(gs.dy * 0.3);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > SWIPE_THRESHOLD) {
          handleSwipe('right');
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          handleSwipe('left');
        } else {
          Animated.spring(panX, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }).start();
          Animated.spring(panY, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const handleRestart = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setDeck(buildDeck());
    setCurrentIndex(0);
    setMasteredCount(0);
    setIsFlipped(false);
    setIsComplete(false);
    flipAnim.setValue(0);
    panX.setValue(0);
    panY.setValue(0);
    cardOpacity.setValue(1);
  }, [buildDeck, flipAnim, panX, panY, cardOpacity]);

  // Interpolations for 3D flip
  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  // Card tilt based on pan
  const cardRotateZ = panX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  // Swipe indicator opacity
  const gotItOpacity = panX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const reviewOpacity = panX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const progress = totalCards > 0 ? masteredCount / totalCards : 0;
  const currentCard = deck[currentIndex];

  const getAnswerText = (q: GameQuestion): string => {
    if (Array.isArray(q.correctAnswer)) {
      return q.correctAnswer.join(', ');
    }
    return String(q.correctAnswer);
  };

  if (isComplete) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.completionContainer}>
          <View style={styles.completionContent}>
            <View style={styles.completionIconContainer}>
              <LinearGradient
                colors={[colors.success + '30', colors.success + '10']}
                style={styles.completionIconBg}
              >
                <Text style={styles.completionEmoji}>🎉</Text>
              </LinearGradient>
            </View>
            <Text style={styles.completionTitle}>All Cards Mastered!</Text>
            <Text style={styles.completionSubtitle}>
              You reviewed {totalCards} concepts for {skillName}
            </Text>

            <TouchableOpacity
              onPress={handleRestart}
              activeOpacity={0.8}
              style={styles.completionButton}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.completionButtonGradient}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.completionButtonText}>Restart Deck</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Back to Games</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Flashcards</Text>
            <Text style={styles.headerSubtitle}>{skillName}</Text>
          </View>
          <View style={styles.closeButton} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[colors.success, colors.successDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {masteredCount}/{totalCards} mastered
          </Text>
        </View>

        {/* Card area */}
        <View style={styles.cardArea}>
          {currentCard && (
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.cardWrapper,
                {
                  transform: [
                    { translateX: panX },
                    { translateY: panY },
                    { rotate: cardRotateZ },
                  ],
                  opacity: cardOpacity,
                },
              ]}
            >
              {/* Swipe indicators */}
              <Animated.View style={[styles.swipeIndicator, styles.gotItIndicator, { opacity: gotItOpacity }]}>
                <Text style={styles.gotItText}>GOT IT ✓</Text>
              </Animated.View>
              <Animated.View style={[styles.swipeIndicator, styles.reviewIndicator, { opacity: reviewOpacity }]}>
                <Text style={styles.reviewText}>REVIEW ↻</Text>
              </Animated.View>

              <TouchableWithoutFeedback onPress={flipCard}>
                <View style={styles.cardPerspective}>
                  {/* Front of card */}
                  <Animated.View
                    style={[
                      styles.card,
                      styles.cardFront,
                      {
                        transform: [{ perspective: 1000 }, { rotateY: frontRotateY }],
                        opacity: frontOpacity,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.glassStrongBg, colors.glassBg]}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardTypeTag}>
                        <Text style={styles.cardTypeText}>
                          {currentCard.type.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.questionText}>{currentCard.prompt}</Text>
                      <View style={styles.tapHint}>
                        <Ionicons name="hand-left-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.tapHintText}>Tap to reveal answer</Text>
                      </View>
                    </LinearGradient>
                  </Animated.View>

                  {/* Back of card */}
                  <Animated.View
                    style={[
                      styles.card,
                      styles.cardBack,
                      {
                        transform: [{ perspective: 1000 }, { rotateY: backRotateY }],
                        opacity: backOpacity,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.primary + '15', colors.secondary + '10']}
                      style={styles.cardGradient}
                    >
                      <Text style={styles.answerLabel}>ANSWER</Text>
                      <Text style={styles.answerText}>{getAnswerText(currentCard)}</Text>
                      {currentCard.explanation ? (
                        <View style={styles.explanationBox}>
                          <Text style={styles.explanationText}>{currentCard.explanation}</Text>
                        </View>
                      ) : null}
                      <View style={styles.swipeHint}>
                        <Text style={styles.swipeHintText}>← Review again | Got it →</Text>
                      </View>
                    </LinearGradient>
                  </Animated.View>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          )}
        </View>

        {/* Bottom action buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            onPress={() => handleSwipe('left')}
            activeOpacity={0.7}
            style={[styles.actionButton, styles.reviewButton]}
          >
            <Ionicons name="refresh" size={24} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>Review</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={flipCard}
            activeOpacity={0.7}
            style={[styles.actionButton, styles.flipButton]}
          >
            <Ionicons name="sync" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSwipe('right')}
            activeOpacity={0.7}
            style={[styles.actionButton, styles.gotItButton]}
          >
            <Ionicons name="checkmark" size={24} color={colors.success} />
            <Text style={[styles.actionButtonText, { color: colors.success }]}>Got it</Text>
          </TouchableOpacity>
        </View>

        {/* Cards remaining */}
        <Text style={styles.remainingText}>
          {deck.length} card{deck.length !== 1 ? 's' : ''} remaining
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Progress
  progressContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.glassBg,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Card area
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
  },
  cardPerspective: {
    width: '100%',
    height: '100%',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: borderRadius['3xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassStrongBorder,
    backfaceVisibility: 'hidden',
    ...glowShadow(colors.primary),
  },
  cardFront: {},
  cardBack: {},
  cardGradient: {
    flex: 1,
    padding: spacing['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card front
  cardTypeTag: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  cardTypeText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 9,
  },
  questionText: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  tapHint: {
    position: 'absolute',
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tapHintText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Card back
  answerLabel: {
    ...typography.label,
    color: colors.success,
    marginBottom: spacing.md,
  },
  answerText: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: spacing.lg,
  },
  explanationBox: {
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    width: '100%',
  },
  explanationText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  swipeHint: {
    position: 'absolute',
    bottom: spacing.xl,
  },
  swipeHintText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Swipe indicators
  swipeIndicator: {
    position: 'absolute',
    top: spacing['3xl'],
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
  },
  gotItIndicator: {
    right: spacing.xl,
    borderColor: colors.success,
    backgroundColor: colors.success + '15',
  },
  reviewIndicator: {
    left: spacing.xl,
    borderColor: colors.error,
    backgroundColor: colors.error + '15',
  },
  gotItText: {
    ...typography.label,
    color: colors.success,
    fontSize: 14,
    fontWeight: '900',
  },
  reviewText: {
    ...typography.label,
    color: colors.error,
    fontSize: 14,
    fontWeight: '900',
  },

  // Bottom actions
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['3xl'],
    paddingVertical: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.error + '15',
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  gotItButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.success + '15',
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  actionButtonText: {
    ...typography.caption,
    marginTop: 2,
    fontWeight: '700',
    position: 'absolute',
    bottom: -18,
  },
  remainingText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingBottom: spacing.md,
  },

  // Completion screen
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionContent: {
    alignItems: 'center',
    paddingHorizontal: spacing['4xl'],
  },
  completionIconContainer: {
    marginBottom: spacing['3xl'],
  },
  completionIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionEmoji: {
    fontSize: 48,
  },
  completionTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  completionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['4xl'],
  },
  completionButton: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  completionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  completionButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '800',
  },
  backButton: {
    paddingVertical: spacing.md,
  },
  backButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
