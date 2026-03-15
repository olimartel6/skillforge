import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import type { GameQuestion } from '../../utils/gameQuestions';

interface GameProps {
  question: GameQuestion;
  onAnswer: (correct: boolean) => void;
  skillName: string;
}

export function SpeedSortGame({ question, onAnswer }: GameProps) {
  const correctOrder = question.correctAnswer as string[];

  const shuffled = useMemo(() => {
    const arr = [...(question.options || correctOrder)];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [question.options, correctOrder]);

  const [items, setItems] = useState(shuffled);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(30);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (timedOut && !submitted) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedOut]);

  const handleTap = (idx: number) => {
    if (submitted) return;
    if (selected === null) {
      setSelected(idx);
    } else {
      const newItems = [...items];
      [newItems[selected], newItems[idx]] = [newItems[idx], newItems[selected]];
      setItems(newItems);
      setSelected(null);
    }
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    clearInterval(timerRef.current);

    const isCorrect = items.every((item, idx) => item === correctOrder[idx]);
    setTimeout(() => onAnswer(isCorrect), 800);
  };

  const getItemStyle = (idx: number) => {
    if (submitted) {
      return items[idx] === correctOrder[idx]
        ? styles.correctItem
        : styles.wrongItem;
    }
    if (selected === idx) return styles.selectedItem;
    return {};
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.prompt}>{question.prompt}</Text>
        <View style={styles.timerBadge}>
          <Text style={[styles.timerText, timer <= 10 && { color: colors.error }]}>
            {timer}s
          </Text>
        </View>
      </View>

      <Text style={styles.hint}>Tap two items to swap their positions</Text>

      <View style={styles.items}>
        {items.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleTap(idx)}
            disabled={submitted}
            activeOpacity={0.7}
          >
            <GlassCard strong style={[styles.item, getItemStyle(idx)]}>
              <View style={styles.itemRow}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}
      </View>

      {!submitted && (
        <Button title="Check Order" onPress={handleSubmit} style={styles.submitBtn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  prompt: { ...typography.h3, color: colors.textPrimary, flex: 1, lineHeight: 26 },
  timerBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  timerText: { ...typography.body, color: colors.primary, fontWeight: '700' },
  hint: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xl },
  items: { gap: spacing.sm },
  item: { padding: spacing.lg },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { color: colors.textSecondary, fontWeight: '700', fontSize: 13 },
  itemText: { color: colors.textPrimary, fontSize: 14, fontWeight: '500', flex: 1 },
  selectedItem: { borderColor: colors.secondary, backgroundColor: 'rgba(108, 99, 255, 0.15)' },
  correctItem: { borderColor: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.12)' },
  wrongItem: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.12)' },
  submitBtn: { marginTop: spacing.xl },
});
