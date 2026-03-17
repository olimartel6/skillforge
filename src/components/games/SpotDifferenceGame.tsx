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

export function SpotDifferenceGame({ question, onAnswer }: GameProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const descriptions = question.options || [];
  const correctDescription = typeof question.correctAnswer === 'string'
    ? question.correctAnswer
    : Array.isArray(question.correctAnswer)
      ? question.correctAnswer[0]
      : String(question.correctAnswer);

  const handleSelect = (desc: string) => {
    if (answered) return;
    setSelected(desc);
    setAnswered(true);

    const correct = desc === correctDescription;
    setTimeout(() => onAnswer(correct), 800);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>SPOT THE ERROR</Text>
      <Text style={styles.prompt}>{question.prompt}</Text>

      <View style={styles.cards}>
        {descriptions.map((desc, idx) => {
          const isCorrectAnswer = desc === correctDescription;
          const isSelected = desc === selected;

          return (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSelect(desc)}
              disabled={answered}
              activeOpacity={0.7}
            >
              <GlassCard
                strong
                style={[
                  styles.card,
                  answered && isCorrectAnswer && styles.errorCard,
                  answered && isSelected && !isCorrectAnswer && styles.wrongSelection,
                  answered && !isSelected && !isCorrectAnswer && styles.correctCard,
                ]}
                glowColor={
                  answered && isCorrectAnswer
                    ? colors.error
                    : answered && !isCorrectAnswer
                      ? colors.success
                      : undefined
                }
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.badge, idx === 0 ? styles.badgeA : styles.badgeB]}>
                    <Text style={styles.badgeText}>{idx === 0 ? 'A' : 'B'}</Text>
                  </View>
                  {answered && isCorrectAnswer && (
                    <View style={styles.errorBadge}>
                      <Text style={styles.errorBadgeText}>HAS ERROR</Text>
                    </View>
                  )}
                  {answered && !isCorrectAnswer && (
                    <View style={styles.correctBadge}>
                      <Text style={styles.correctBadgeText}>CORRECT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.descText}>{desc}</Text>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.instruction}>Tap the description that contains the error</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  label: { ...typography.label, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
  prompt: { ...typography.h3, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xl },
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
  errorBadge: { backgroundColor: 'rgba(239, 68, 68, 0.2)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  errorBadgeText: { ...typography.caption, color: colors.error },
  correctBadge: { backgroundColor: 'rgba(52, 211, 153, 0.2)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  correctBadgeText: { ...typography.caption, color: colors.success },
  errorCard: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.08)' },
  wrongSelection: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.08)' },
  correctCard: { borderColor: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.06)' },
  descText: { ...typography.body, color: colors.textPrimary, lineHeight: 22 },
  instruction: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
