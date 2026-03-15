import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import type { GameQuestion } from '../../utils/gameQuestions';

interface GameProps {
  question: GameQuestion;
  onAnswer: (correct: boolean) => void;
  skillName: string;
}

export function TrueFalseGame({ question, onAnswer }: GameProps) {
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const scaleTrue = useRef(new Animated.Value(1)).current;
  const scaleFalse = useRef(new Animated.Value(1)).current;

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setSelected(answer);
    setAnswered(true);
    const correct = answer === question.correctAnswer;

    const scale = answer === 'True' ? scaleTrue : scaleFalse;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.05, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    setTimeout(() => onAnswer(correct), 800);
  };

  const getBtnStyle = (value: string) => {
    if (!answered) return {};
    if (value === question.correctAnswer) return { borderColor: colors.success, borderWidth: 2 };
    if (value === selected) return { borderColor: colors.error, borderWidth: 2 };
    return { opacity: 0.3 };
  };

  return (
    <View style={styles.container}>
      <View style={styles.statementContainer}>
        <Text style={styles.label}>TRUE OR FALSE?</Text>
        <Text style={styles.statement}>{question.prompt}</Text>
      </View>

      <View style={styles.buttons}>
        <Animated.View style={[styles.btnWrap, { transform: [{ scale: scaleTrue }] }]}>
          <TouchableOpacity
            onPress={() => handleAnswer('True')}
            disabled={answered}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={answered && 'True' === question.correctAnswer
                ? [colors.success, colors.successDark]
                : ['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0.05)']}
              style={[styles.btn, getBtnStyle('True')]}
            >
              <Text style={styles.btnEmoji}>&#10003;</Text>
              <Text style={styles.btnText}>True</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.btnWrap, { transform: [{ scale: scaleFalse }] }]}>
          <TouchableOpacity
            onPress={() => handleAnswer('False')}
            disabled={answered}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={answered && 'False' === question.correctAnswer
                ? [colors.success, colors.successDark]
                : ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']}
              style={[styles.btn, getBtnStyle('False')]}
            >
              <Text style={styles.btnEmoji}>&#10007;</Text>
              <Text style={styles.btnText}>False</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  statementContainer: { alignItems: 'center', marginBottom: spacing['5xl'] },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.lg },
  statement: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  buttons: { flexDirection: 'row', gap: spacing.lg },
  btnWrap: { flex: 1 },
  btn: {
    padding: spacing['3xl'],
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  btnEmoji: { fontSize: 36, marginBottom: spacing.sm, color: colors.textPrimary },
  btnText: { ...typography.h3, color: colors.textPrimary },
});
