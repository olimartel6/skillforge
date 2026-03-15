import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import type { GameQuestion } from '../../utils/gameQuestions';

interface GameProps {
  question: GameQuestion;
  onAnswer: (correct: boolean) => void;
  skillName: string;
}

export function TimedChallengeGame({ question, onAnswer }: GameProps) {
  const [timer, setTimer] = useState(15);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const progressAnim = useRef(new Animated.Value(1)).current;

  const correctAnswers = question.correctAnswer as string[];
  const requiredCount = correctAnswers.length;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 15000,
      useNativeDriver: false,
    }).start();

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
  }, [progressAnim]);

  useEffect(() => {
    if (timedOut && !submitted) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedOut]);

  const handleToggle = (option: string) => {
    if (submitted) return;
    if (selected.includes(option)) {
      setSelected(selected.filter((s) => s !== option));
    } else {
      const newSelected = [...selected, option];
      setSelected(newSelected);
      if (newSelected.length === requiredCount) {
        setTimeout(() => handleSubmitWith(newSelected), 300);
      }
    }
  };

  const handleSubmitWith = (answers: string[]) => {
    if (submitted) return;
    setSubmitted(true);
    clearInterval(timerRef.current);

    const allCorrect =
      answers.length === requiredCount &&
      correctAnswers.every((a) => answers.includes(a));

    setTimeout(() => onAnswer(allCorrect), 800);
  };

  const handleSubmit = () => {
    handleSubmitWith(selected);
  };

  const widthInterpolation = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.timerBar}>
        <Animated.View
          style={[
            styles.timerFill,
            {
              width: widthInterpolation,
              backgroundColor: timer > 5 ? colors.primary : colors.error,
            },
          ]}
        />
      </View>

      <Text style={styles.timer}>{timer}s</Text>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <Text style={styles.hint}>Select {requiredCount} correct answers</Text>

      <View style={styles.options}>
        {(question.options || []).map((option, idx) => {
          const isSelected = selected.includes(option);
          const isCorrectAnswer = correctAnswers.includes(option);

          return (
            <TouchableOpacity
              key={idx}
              onPress={() => handleToggle(option)}
              disabled={submitted}
              activeOpacity={0.7}
            >
              <GlassCard
                style={[
                  styles.option,
                  isSelected && !submitted && styles.selectedOption,
                  submitted && isCorrectAnswer && styles.correctOption,
                  submitted && isSelected && !isCorrectAnswer && styles.wrongOption,
                ]}
              >
                <View style={styles.optionRow}>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                      submitted && isCorrectAnswer && styles.checkboxCorrect,
                    ]}
                  >
                    {isSelected && <Text style={styles.check}>&#10003;</Text>}
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </View>
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
  timerBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  timerFill: { height: '100%', borderRadius: 2 },
  timer: {
    ...typography.stat,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  prompt: { ...typography.h3, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  hint: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  options: { gap: spacing.sm },
  option: { padding: spacing.lg },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { borderColor: colors.secondary, backgroundColor: 'rgba(108, 99, 255, 0.2)' },
  checkboxCorrect: { borderColor: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.2)' },
  check: { color: '#fff', fontSize: 14, fontWeight: '700' },
  optionText: { ...typography.body, color: colors.textPrimary, flex: 1 },
  selectedOption: { borderColor: colors.secondary },
  correctOption: { borderColor: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.1)' },
  wrongOption: { borderColor: colors.error, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
});
