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

export function MultipleChoiceGame({ question, onAnswer }: GameProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);

    const correct = option === question.correctAnswer;

    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.timing(flashAnim, { toValue: 0.6, duration: 300, useNativeDriver: false }),
    ]).start();

    setTimeout(() => onAnswer(correct), 800);
  };

  const getOptionStyle = (option: string) => {
    if (!answered) return {};
    if (option === question.correctAnswer) {
      return { borderColor: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.15)' };
    }
    if (option === selected && option !== question.correctAnswer) {
      return { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.15)' };
    }
    return { opacity: 0.4 };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <View style={styles.options}>
        {(question.options || []).map((option, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleSelect(option)}
            disabled={answered}
            activeOpacity={0.7}
          >
            <GlassCard
              strong
              style={[styles.optionCard, getOptionStyle(option)]}
              glowColor={
                answered && option === question.correctAnswer
                  ? colors.success
                  : answered && option === selected
                    ? colors.error
                    : undefined
              }
            >
              <View style={styles.optionRow}>
                <View style={styles.optionLetter}>
                  <Text style={styles.letterText}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option}</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  prompt: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
    lineHeight: 28,
  },
  options: { gap: spacing.md },
  optionCard: { padding: spacing.lg },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { color: colors.textSecondary, fontWeight: '700', fontSize: 14 },
  optionText: { color: colors.textPrimary, fontSize: 15, fontWeight: '500', flex: 1 },
});
