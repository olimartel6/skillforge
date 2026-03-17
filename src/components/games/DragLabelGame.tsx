import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import type { GameQuestion } from '../../utils/gameQuestions';

interface GameProps {
  question: GameQuestion;
  onAnswer: (correct: boolean) => void;
  skillName: string;
}

export function DragLabelGame({ question, onAnswer }: GameProps) {
  const correctLabels = Array.isArray(question.correctAnswer)
    ? question.correctAnswer
    : [String(question.correctAnswer)];
  const availableLabels = useMemo(() => {
    const labels = [...(question.options || correctLabels)];
    for (let i = labels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [labels[i], labels[j]] = [labels[j], labels[i]];
    }
    return labels;
  }, [question.options, correctLabels]);

  const [placements, setPlacements] = useState<(string | null)[]>(
    new Array(correctLabels.length).fill(null),
  );
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const usedLabels = placements.filter(Boolean) as string[];

  const handleSpotTap = (idx: number) => {
    if (submitted) return;

    if (selectedLabel) {
      // Place label
      const newPlacements = [...placements];
      // If spot already has a label, swap it back
      newPlacements[idx] = selectedLabel;
      setPlacements(newPlacements);
      setSelectedLabel(null);
    } else if (placements[idx]) {
      // Pick up placed label
      setSelectedLabel(placements[idx]);
      const newPlacements = [...placements];
      newPlacements[idx] = null;
      setPlacements(newPlacements);
    }
  };

  const handleLabelTap = (label: string) => {
    if (submitted) return;
    if (usedLabels.includes(label)) return;
    setSelectedLabel(selectedLabel === label ? null : label);
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    const allCorrect = placements.every(
      (p, idx) => p === correctLabels[idx],
    );
    setTimeout(() => onAnswer(allCorrect), 800);
  };

  const allPlaced = placements.every((p) => p !== null);

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <Text style={styles.hint}>Select a label, then tap a numbered spot to place it</Text>

      <View style={styles.spots}>
        {correctLabels.map((_, idx) => {
          const placed = placements[idx];
          const isCorrect = submitted && placed === correctLabels[idx];
          const isWrong = submitted && placed !== correctLabels[idx];

          return (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSpotTap(idx)}
              disabled={submitted}
              activeOpacity={0.7}
            >
              <GlassCard
                style={[
                  styles.spot,
                  selectedLabel && !placed && styles.spotHighlight,
                  isCorrect && styles.correctSpot,
                  isWrong && styles.wrongSpot,
                ]}
              >
                <View style={styles.spotNumber}>
                  <Text style={styles.spotNumberText}>{idx + 1}</Text>
                </View>
                <Text style={[
                  styles.spotLabel,
                  !placed && styles.emptyLabel,
                  isCorrect && { color: colors.success },
                  isWrong && { color: colors.error },
                ]}>
                  {placed || 'Tap to place'}
                </Text>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.labels}>
        {availableLabels.map((label, idx) => {
          const isUsed = usedLabels.includes(label);
          const isSelected = selectedLabel === label;

          return (
            <TouchableOpacity
              key={idx}
              onPress={() => handleLabelTap(label)}
              disabled={submitted || isUsed}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.labelChip,
                  isSelected && styles.selectedChip,
                  isUsed && styles.usedChip,
                ]}
              >
                <Text style={[
                  styles.labelText,
                  isSelected && { color: colors.secondary },
                  isUsed && { color: colors.textMuted },
                ]}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {!submitted && (
        <Button
          title="Check Labels"
          onPress={handleSubmit}
          disabled={!allPlaced}
          style={styles.submitBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  prompt: { ...typography.h3, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  hint: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  spots: { gap: spacing.sm, marginBottom: spacing.xl },
  spot: { padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  spotHighlight: { borderColor: colors.secondary, borderStyle: 'dashed' },
  spotNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,107,53,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotNumberText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  spotLabel: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  emptyLabel: { color: colors.textMuted, fontStyle: 'italic' },
  correctSpot: { borderColor: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.1)' },
  wrongSpot: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  labels: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  labelChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  selectedChip: { borderColor: colors.secondary, backgroundColor: 'rgba(108, 99, 255, 0.15)' },
  usedChip: { opacity: 0.3 },
  labelText: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },
  submitBtn: { marginTop: spacing.xl },
});
