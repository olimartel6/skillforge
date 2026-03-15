import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import type { GameQuestion } from '../../utils/gameQuestions';

interface GameProps {
  question: GameQuestion;
  onAnswer: (correct: boolean) => void;
  skillName: string;
}

export function BeforeAfterGame({ question, onAnswer }: GameProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const scaleA = useRef(new Animated.Value(1)).current;
  const scaleB = useRef(new Animated.Value(1)).current;

  const options = question.options || [];
  const correct = question.correctAnswer as string;

  const handleSelect = (option: string, idx: number) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);

    const scale = idx === 0 ? scaleA : scaleB;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.03, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    const isCorrect = option === correct;
    setTimeout(() => onAnswer(isCorrect), 800);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>WHICH IS BETTER?</Text>
      <Text style={styles.prompt}>{question.prompt}</Text>

      <View style={styles.cards}>
        {options.map((option, idx) => {
          const isCorrect = option === correct;
          const isSelected = option === selected;
          const scale = idx === 0 ? scaleA : scaleB;

          return (
            <Animated.View key={idx} style={{ transform: [{ scale }] }}>
              <TouchableOpacity
                onPress={() => handleSelect(option, idx)}
                disabled={answered}
                activeOpacity={0.7}
              >
                <GlassCard
                  strong
                  style={[
                    styles.card,
                    answered && isCorrect && styles.correctCard,
                    answered && isSelected && !isCorrect && styles.wrongCard,
                    answered && !isSelected && !isCorrect && styles.fadedCard,
                  ]}
                  glowColor={
                    answered && isCorrect
                      ? colors.success
                      : answered && isSelected
                        ? colors.error
                        : undefined
                  }
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.badge, idx === 0 ? styles.badgeA : styles.badgeB]}>
                      <Text style={styles.badgeText}>{idx === 0 ? 'A' : 'B'}</Text>
                    </View>
                    {answered && isCorrect && (
                      <Text style={styles.betterText}>BETTER</Text>
                    )}
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  label: { ...typography.label, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
  prompt: { ...typography.h3, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing['3xl'], lineHeight: 28 },
  cards: { gap: spacing.lg },
  card: { padding: spacing.xl },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeA: { backgroundColor: 'rgba(108, 99, 255, 0.2)' },
  badgeB: { backgroundColor: 'rgba(255, 107, 53, 0.2)' },
  badgeText: { color: colors.textPrimary, fontWeight: '700', fontSize: 13 },
  betterText: { ...typography.caption, color: colors.success, fontWeight: '700' },
  optionText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  correctCard: { borderColor: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.08)' },
  wrongCard: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.08)' },
  fadedCard: { opacity: 0.5 },
});
