import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import type { GameQuestion } from '../../utils/gameQuestions';

interface GameProps {
  question: GameQuestion;
  onAnswer: (correct: boolean) => void;
  skillName: string;
}

export function MatchPairsGame({ question, onAnswer }: GameProps) {
  const pairs = useMemo(() => {
    const opts = question.options || [];
    const result: { left: string; right: string }[] = [];
    for (let i = 0; i < opts.length - 1; i += 2) {
      result.push({ left: opts[i], right: opts[i + 1] });
    }
    return result;
  }, [question.options]);

  const shuffledRight = useMemo(() => {
    const rights = pairs.map((p) => p.right);
    for (let i = rights.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rights[i], rights[j]] = [rights[j], rights[i]];
    }
    return rights;
  }, [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);

  const handleLeftTap = (item: string) => {
    if (matched.includes(item)) return;
    setSelectedLeft(item);
    if (selectedRight) tryMatch(item, selectedRight);
  };

  const handleRightTap = (item: string) => {
    if (matched.includes(item)) return;
    setSelectedRight(item);
    if (selectedLeft) tryMatch(selectedLeft, item);
  };

  const tryMatch = (left: string, right: string) => {
    const isCorrect = pairs.some((p) => p.left === left && p.right === right);

    if (isCorrect) {
      const newMatched = [...matched, left, right];
      setMatched(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (newMatched.length === pairs.length * 2) {
        setTimeout(() => onAnswer(true), 500);
      }
    } else {
      setWrongPair({ left, right });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 600);
    }
  };

  const getLeftStyle = (item: string) => {
    if (matched.includes(item)) return styles.matchedItem;
    if (wrongPair?.left === item) return styles.wrongItem;
    if (selectedLeft === item) return styles.selectedItem;
    return {};
  };

  const getRightStyle = (item: string) => {
    if (matched.includes(item)) return styles.matchedItem;
    if (wrongPair?.right === item) return styles.wrongItem;
    if (selectedRight === item) return styles.selectedItem;
    return {};
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <Text style={styles.hint}>Tap one from each column to match</Text>

      <View style={styles.columns}>
        <View style={styles.column}>
          {pairs.map((p, idx) => (
            <TouchableOpacity
              key={`l-${idx}`}
              onPress={() => handleLeftTap(p.left)}
              disabled={matched.includes(p.left)}
              activeOpacity={0.7}
            >
              <GlassCard style={[styles.item, getLeftStyle(p.left)]}>
                <Text style={[styles.itemText, matched.includes(p.left) && styles.matchedText]}>
                  {p.left}
                </Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.column}>
          {shuffledRight.map((item, idx) => (
            <TouchableOpacity
              key={`r-${idx}`}
              onPress={() => handleRightTap(item)}
              disabled={matched.includes(item)}
              activeOpacity={0.7}
            >
              <GlassCard style={[styles.item, getRightStyle(item)]}>
                <Text style={[styles.itemText, matched.includes(item) && styles.matchedText]}>
                  {item}
                </Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  prompt: { ...typography.h3, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  hint: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  columns: { flexDirection: 'row', gap: spacing.sm },
  column: { flex: 1, gap: spacing.sm },
  item: { padding: spacing.md, minHeight: 50, justifyContent: 'center' },
  itemText: { ...typography.bodySmall, color: colors.textPrimary, textAlign: 'center' },
  selectedItem: { borderColor: colors.secondary, backgroundColor: 'rgba(108, 99, 255, 0.15)' },
  matchedItem: { borderColor: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.1)', opacity: 0.6 },
  matchedText: { color: colors.success },
  wrongItem: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.15)' },
});
