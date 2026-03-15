import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Dimensions } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import type { GameQuestion } from '../../utils/gameQuestions';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

interface GameProps {
  question: GameQuestion;
  onAnswer: (correct: boolean) => void;
  skillName: string;
}

export function SwipeJudgeGame({ question, onAnswer }: GameProps) {
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setAnswered(true);
    const correct = answer === question.correctAnswer;
    setResult(correct ? 'correct' : 'wrong');

    const direction = answer === (question.options?.[0] || 'Good technique') ? 1 : -1;
    Animated.timing(translateX, {
      toValue: direction * SCREEN_WIDTH * 0.8,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => onAnswer(correct), 800);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10,
      onPanResponderMove: (_, gs) => {
        translateX.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > SWIPE_THRESHOLD) {
          handleAnswer(question.options?.[0] || 'Good technique');
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          handleAnswer(question.options?.[1] || 'Bad technique');
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  const goodLabel = question.options?.[0] || 'Good technique';
  const badLabel = question.options?.[1] || 'Bad technique';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SWIPE OR TAP TO JUDGE</Text>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.cardWrapper, { transform: [{ translateX }, { rotate }] }]}
      >
        <GlassCard
          strong
          style={[
            styles.card,
            result === 'correct' && styles.correctCard,
            result === 'wrong' && styles.wrongCard,
          ]}
        >
          <Text style={styles.cardText}>{question.prompt}</Text>
        </GlassCard>
      </Animated.View>

      <View style={styles.buttons}>
        <TouchableOpacity
          onPress={() => handleAnswer(badLabel)}
          disabled={answered}
          activeOpacity={0.7}
          style={[styles.judgeBtn, styles.badBtn]}
        >
          <Text style={styles.judgeBtnEmoji}>&#128078;</Text>
          <Text style={styles.badText}>{badLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAnswer(goodLabel)}
          disabled={answered}
          activeOpacity={0.7}
          style={[styles.judgeBtn, styles.goodBtn]}
        >
          <Text style={styles.judgeBtnEmoji}>&#128077;</Text>
          <Text style={styles.goodText}>{goodLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  label: { ...typography.label, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing['2xl'] },
  cardWrapper: { marginBottom: spacing['3xl'] },
  card: { padding: spacing['3xl'], minHeight: 160, justifyContent: 'center' },
  cardText: { ...typography.h3, color: colors.textPrimary, textAlign: 'center', lineHeight: 28 },
  correctCard: { borderColor: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.1)' },
  wrongCard: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  buttons: { flexDirection: 'row', gap: spacing.lg },
  judgeBtn: {
    flex: 1,
    padding: spacing.xl,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    borderWidth: 1,
  },
  goodBtn: {
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  badBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  judgeBtnEmoji: { fontSize: 28, marginBottom: spacing.xs },
  goodText: { color: colors.success, fontWeight: '600', fontSize: 13 },
  badText: { color: colors.error, fontWeight: '600', fontSize: 13 },
});
