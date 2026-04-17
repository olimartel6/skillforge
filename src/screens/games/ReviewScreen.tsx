import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useGameStore, MissedQuestion } from '../../store/gameStore';
import { GlassCard } from '../../components/GlassCard';
import { MultipleChoiceGame } from '../../components/games/MultipleChoiceGame';
import { TrueFalseGame } from '../../components/games/TrueFalseGame';
import { FillGapGame } from '../../components/games/FillGapGame';
import { ChartQuestionGame } from '../../components/games/ChartQuestionGame';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { t } from '../../i18n';
import type { GameQuestion } from '../../utils/gameQuestions';

const SCREEN_WIDTH = Dimensions.get('window').width;

export function ReviewScreen({ navigation }: { navigation: any }) {
  const { missedQuestions, removeMissedQuestion } = useGameStore();
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [feedbackExplanation, setFeedbackExplanation] = useState('');
  const [feedbackAnswer, setFeedbackAnswer] = useState('');

  // Group missed questions by skill
  const grouped: Record<string, MissedQuestion[]> = {};
  missedQuestions.forEach((mq) => {
    if (!grouped[mq.skillName]) grouped[mq.skillName] = [];
    grouped[mq.skillName].push(mq);
  });

  const skillQuestions = activeSkill ? (grouped[activeSkill] || []) : [];
  const currentMissed = skillQuestions[currentIdx];
  const question = currentMissed?.question;

  const handleAnswer = useCallback((correct: boolean) => {
    if (!question) return;
    setShowFeedback(true);
    setFeedbackCorrect(correct);
    setFeedbackExplanation(question.explanation || '');

    if (correct) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setCorrectCount((prev) => prev + 1);
      removeMissedQuestion(question.prompt);

      setTimeout(() => {
        advanceOrFinish();
      }, 1500);
    } else {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      const correctAns = typeof question.correctAnswer === 'string'
        ? question.correctAnswer
        : String(question.correctAnswer);
      setFeedbackAnswer(correctAns);
    }
  }, [question, currentIdx, skillQuestions.length]);

  const advanceOrFinish = useCallback(() => {
    setShowFeedback(false);
    setFeedbackAnswer('');
    if (currentIdx >= skillQuestions.length - 1) {
      setActiveSkill(null);
      setCurrentIdx(0);
      setCorrectCount(0);
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  }, [currentIdx, skillQuestions.length]);

  const handleContinue = () => {
    advanceOrFinish();
  };

  // Active review session
  if (activeSkill && question) {
    const progress = (currentIdx + 1) / skillQuestions.length;

    const renderGame = () => {
      const key = `review_${currentIdx}_${question.prompt.substring(0, 20)}`;
      const gameProps = { question, onAnswer: handleAnswer, skillName: activeSkill };

      switch (question.type) {
        case 'true_false':
          return <TrueFalseGame key={key} {...gameProps} />;
        case 'fill_gap':
          return <FillGapGame key={key} {...gameProps} />;
        case 'chart_question':
          return <ChartQuestionGame key={key} {...gameProps} />;
        default:
          return <MultipleChoiceGame key={key} {...gameProps} />;
      }
    };

    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        {/* Header */}
        <View style={styles.sessionHeader}>
          <TouchableOpacity onPress={() => { setActiveSkill(null); setCurrentIdx(0); }}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentIdx + 1}/{skillQuestions.length}
          </Text>
        </View>

        {/* Game */}
        <View style={styles.gameContainer}>
          {renderGame()}
        </View>

        {/* Feedback Banner */}
        {showFeedback && (
          <View style={[styles.feedbackBanner, feedbackCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackTitle}>
              {feedbackCorrect ? '✓ Correct!' : '✗ Wrong'}
            </Text>
            {!feedbackCorrect && feedbackAnswer ? (
              <Text style={styles.feedbackText}>Answer: {feedbackAnswer}</Text>
            ) : null}
            {feedbackExplanation ? (
              <Text style={styles.feedbackExplanation}>{feedbackExplanation}</Text>
            ) : null}
            {!feedbackCorrect && (
              <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
                <Text style={styles.continueBtnText}>Continue</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Skill list view
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('review.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {missedQuestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          <Text style={styles.emptyTitle}>{t('review.noMissedQuestions')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {Object.entries(grouped).map(([skill, questions]) => {
            const lastDate = questions[questions.length - 1]?.date;
            const dateStr = lastDate ? new Date(lastDate).toLocaleDateString() : '';

            return (
              <TouchableOpacity
                key={skill}
                activeOpacity={0.7}
                onPress={() => {
                  setActiveSkill(skill);
                  setCurrentIdx(0);
                  setCorrectCount(0);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <GlassCard style={styles.skillCard}>
                  <View style={styles.skillCardLeft}>
                    <View style={styles.skillIconCircle}>
                      <Ionicons name="refresh" size={22} color={colors.error} />
                    </View>
                    <View>
                      <Text style={styles.skillName}>{skill}</Text>
                      <Text style={styles.skillCount}>
                        {questions.length} {t('review.questionsToReview')}
                      </Text>
                      {dateStr ? (
                        <Text style={styles.skillDate}>{t('review.lastMissed')}: {dateStr}</Text>
                      ) : null}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => {
                      setActiveSkill(skill);
                      setCurrentIdx(0);
                      setCorrectCount(0);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    <Text style={styles.startBtnText}>{t('review.startReview')}</Text>
                  </TouchableOpacity>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  listContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  skillCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  skillIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillName: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  skillCount: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginTop: 2,
  },
  skillDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  startBtn: {
    backgroundColor: colors.error + '25',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  startBtnText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
    color: colors.error,
  },
  // Session styles
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  gameContainer: {
    flex: 1,
  },
  feedbackBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: 50,
  },
  feedbackCorrect: {
    backgroundColor: colors.success + 'E0',
  },
  feedbackWrong: {
    backgroundColor: colors.error + 'E0',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: typography.body.fontSize,
    color: '#fff',
    fontWeight: '600',
  },
  feedbackExplanation: {
    fontSize: typography.caption.fontSize,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  continueBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  continueBtnText: {
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    color: '#fff',
  },
});
