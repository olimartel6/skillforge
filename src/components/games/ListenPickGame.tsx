import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import type { GameQuestion } from '../../utils/gameQuestions';

interface GameProps {
  question: GameQuestion;
  onAnswer: (correct: boolean) => void;
  skillName: string;
}

export function ListenPickGame({ question, onAnswer }: GameProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);

    const correct = option === question.correctAnswer;
    setTimeout(() => onAnswer(correct), 800);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>&#127911;</Text>
      </View>

      <Text style={styles.label}>IDENTIFY THE TECHNIQUE</Text>
      <Text style={styles.prompt}>{question.prompt}</Text>

      <View style={styles.options}>
        {(question.options || []).map((option, idx) => {
          const isCorrect = option === question.correctAnswer;
          const isSelected = option === selected;

          return (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSelect(option)}
              disabled={answered}
              activeOpacity={0.7}
            >
              <GlassCard
                strong
                style={[
                  styles.option,
                  answered && isCorrect && styles.correctOption,
                  answered && isSelected && !isCorrect && styles.wrongOption,
                  answered && !isCorrect && !isSelected && styles.fadedOption,
                ]}
                glowColor={
                  answered && isCorrect
                    ? colors.success
                    : answered && isSelected
                      ? colors.error
                      : undefined
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    answered && isCorrect && { color: colors.success },
                    answered && isSelected && !isCorrect && { color: colors.error },
                  ]}
                >
                  {option}
                </Text>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  iconContainer: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  icon: { fontSize: 28 },
  label: { ...typography.label, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
  prompt: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
    lineHeight: 28,
  },
  options: { gap: spacing.md },
  option: { padding: spacing.lg },
  optionText: { ...typography.body, color: colors.textPrimary, fontWeight: '500', textAlign: 'center' },
  correctOption: { borderColor: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.12)' },
  wrongOption: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.12)' },
  fadedOption: { opacity: 0.3 },
});
