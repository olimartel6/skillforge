import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import type { GameQuestion } from '../../utils/gameQuestions';

interface GameProps {
  question: GameQuestion;
  onAnswer: (correct: boolean) => void;
  skillName: string;
}

interface Card {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
}

export function MemoryCardsGame({ question, onAnswer }: GameProps) {
  const pairValues = Array.isArray(question.correctAnswer)
    ? question.correctAnswer
    : [String(question.correctAnswer)];

  const cards = useMemo(() => {
    const allCards: Card[] = [];
    pairValues.forEach((val, idx) => {
      allCards.push({ id: idx * 2, value: val, flipped: false, matched: false });
      allCards.push({ id: idx * 2 + 1, value: val, flipped: false, matched: false });
    });
    // Shuffle
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    return allCards;
  }, [pairValues]);

  const [state, setState] = useState(cards);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTap = (card: Card) => {
    if (locked || card.flipped || card.matched) return;

    const newState = state.map((c) =>
      c.id === card.id ? { ...c, flipped: true } : c,
    );
    setState(newState);

    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);

      const [firstId, secondId] = newFlipped;
      const first = newState.find((c) => c.id === firstId)!;
      const second = newState.find((c) => c.id === secondId)!;

      if (first.value === second.value) {
        const matchedState = newState.map((c) =>
          c.id === firstId || c.id === secondId
            ? { ...c, matched: true }
            : c,
        );
        setState(matchedState);
        setFlippedIds([]);
        setLocked(false);
        const newCount = matchedCount + 1;
        setMatchedCount(newCount);

        if (newCount === pairValues.length) {
          setTimeout(() => onAnswer(true), 600);
        }
      } else {
        setTimeout(() => {
          setState((s) =>
            s.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, flipped: false }
                : c,
            ),
          );
          setFlippedIds([]);
          setLocked(false);
        }, 800);
      }
    }
  };

  const columns = pairValues.length <= 4 ? 3 : 4;

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>Moves: {moves}</Text>
        <Text style={styles.stat}>Time: {elapsed}s</Text>
        <Text style={styles.stat}>
          {matchedCount}/{pairValues.length}
        </Text>
      </View>

      <View style={[styles.grid, { flexDirection: 'row', flexWrap: 'wrap' }]}>
        {state.map((card) => (
          <TouchableOpacity
            key={card.id}
            onPress={() => handleTap(card)}
            disabled={card.flipped || card.matched}
            activeOpacity={0.7}
            style={[
              styles.cardOuter,
              { width: `${Math.floor(100 / columns) - 3}%` },
            ]}
          >
            <View
              style={[
                styles.card,
                card.flipped && styles.flippedCard,
                card.matched && styles.matchedCard,
              ]}
            >
              {card.flipped || card.matched ? (
                <Text style={[styles.cardText, card.matched && { color: colors.success }]}>
                  {card.value}
                </Text>
              ) : (
                <Text style={styles.hiddenText}>?</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.md },
  prompt: { ...typography.h3, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  stat: { ...typography.bodySmall, color: colors.textSecondary },
  grid: { gap: spacing.sm, justifyContent: 'center' },
  cardOuter: { aspectRatio: 0.8, marginBottom: spacing.sm, marginHorizontal: '1%' },
  card: {
    flex: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  flippedCard: {
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    borderColor: colors.secondary,
  },
  matchedCard: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: colors.success,
  },
  cardText: { color: colors.textPrimary, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  hiddenText: { color: colors.textMuted, fontSize: 24, fontWeight: '300' },
});
