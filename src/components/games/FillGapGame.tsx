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

export function FillGapGame({ question, onAnswer }: GameProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);

    const correct = option === question.correctAnswer;
    setTimeout(() => onAnswer(correct), 800);
  };

  const parts = question.prompt.split('___');

  return (
    <View style={styles.container}>
      <View style={styles.sentenceContainer}>
        <Text style={styles.sentence}>
          {parts[0]}
          <Text style={[styles.gap, answered && selected === question.correctAnswer && styles.correctGap, answered && selected !== question.correctAnswer && styles.wrongGap]}>
            {selected || '___'}
          </Text>
          {parts[1] || ''}
        </Text>
      </View>

      <Text style={styles.hint}>Choose the correct word to fill the gap</Text>

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
                style={[
                  styles.option,
                  answered && isCorrect && styles.correctOption,
                  answered && isSelected && !isCorrect && styles.wrongOption,
                  answered && !isCorrect && !isSelected && styles.fadedOption,
                ]}
              >
                <Text style={[
                  styles.optionText,
                  answered && isCorrect && { color: colors.success },
                  answered && isSelected && !isCorrect && { color: colors.error },
                ]}>
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
  sentenceContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sentence: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },
  gap: {
    color: colors.primary,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  correctGap: { color: colors.success },
  wrongGap: { color: colors.error },
  hint: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  option: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  optionText: { ...typography.body, color: colors.textPrimary, fontWeight: '600', textAlign: 'center' },
  correctOption: { borderColor: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.12)' },
  wrongOption: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.12)' },
  fadedOption: { opacity: 0.3 },
});
