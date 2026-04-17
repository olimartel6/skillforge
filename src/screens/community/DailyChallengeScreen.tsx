import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { GlassCard } from '../../components/GlassCard';
import { AmbientGlow } from '../../components/AmbientGlow';
import * as Haptics from 'expo-haptics';
import { t } from '../../i18n';

const STORAGE_KEY_CHALLENGE = 'daily_challenge_result';

interface ChallengeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

// Daily challenges rotate by day of year
const CHALLENGE_POOL: { title: string; questions: ChallengeQuestion[] }[] = [
  {
    title: 'Speed Round: General Knowledge',
    questions: [
      { question: 'What is deliberate practice?', options: ['Repeating the same thing', 'Practicing for fun', 'Focused practice on weaknesses', 'Group practice'], correctIndex: 2 },
      { question: 'How long does it take to form a habit?', options: ['7 days', '21 days', '66 days', '90 days'], correctIndex: 2 },
      { question: 'What is the 80/20 rule?', options: ['80% effort, 20% rest', '80 min practice, 20 min break', '80% theory, 20% practice', '80% results from 20% effort'], correctIndex: 3 },
      { question: 'What is "flow state"?', options: ['Full immersion in activity', 'A meditation pose', 'A breathing technique', 'A water exercise'], correctIndex: 0 },
      { question: 'Best way to retain new information?', options: ['Read it once', 'Highlight everything', 'Listen to music', 'Spaced repetition'], correctIndex: 3 },
    ],
  },
  {
    title: 'Learning Science Challenge',
    questions: [
      { question: 'What is the Pomodoro Technique?', options: ['A cooking method', 'A memory game', '25 min work + 5 min break', 'A speed reading method'], correctIndex: 2 },
      { question: 'Interleaving practice means...', options: ['Mixing different skills/topics', 'Practicing one skill at a time', 'Taking long breaks', 'Practicing at night'], correctIndex: 0 },
      { question: 'Growth mindset believes...', options: ['Talent is fixed', 'Practice is useless', 'Only some can learn', 'Abilities can be developed'], correctIndex: 3 },
      { question: 'What boosts memory consolidation?', options: ['Caffeine', 'Stress', 'Sleep', 'Multitasking'], correctIndex: 2 },
      { question: 'Active recall means...', options: ['Re-reading notes', 'Listening to lectures', 'Testing yourself from memory', 'Copying notes'], correctIndex: 2 },
    ],
  },
  {
    title: 'Motivation & Mindset',
    questions: [
      { question: 'What is "compound learning"?', options: ['Learning multiple subjects', 'Group study sessions', 'Learning finance', 'Small daily gains accumulating'], correctIndex: 3 },
      { question: 'Best time to practice difficult skills?', options: ['Late at night', 'Right after eating', 'When you feel peak energy', 'It does not matter'], correctIndex: 2 },
      { question: 'What kills motivation fastest?', options: ['Small goals', 'Short sessions', 'Morning practice', 'Lack of progress visibility'], correctIndex: 3 },
      { question: 'Visualization helps because...', options: ['It replaces practice', 'It is relaxing', 'Brain activates similar pathways', 'It is fun'], correctIndex: 2 },
      { question: 'A streak helps you by...', options: ['Adding pressure', 'Competing with others', 'Getting rewards', 'Building identity & consistency'], correctIndex: 3 },
    ],
  },
];

export function CommDailyChallengeScreen() {
  const [todayChallenge, setTodayChallenge] = useState(CHALLENGE_POOL[0]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [finished, setFinished] = useState(false);
  const [savedResult, setSavedResult] = useState<{ score: number; rank: number; total: number } | null>(null);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const challengeIndex = dayOfYear % CHALLENGE_POOL.length;
    setTodayChallenge(CHALLENGE_POOL[challengeIndex]);

    // Check if already completed today
    loadSavedResult();
  }, []);

  const loadSavedResult = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_CHALLENGE);
      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        if (data.date === today) {
          setSavedResult(data);
          setFinished(true);
          setScore(data.score);
        }
      }
    } catch (e) { console.warn('Load saved challenge result failed:', e); }
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedIndex(index);
    setAnswered(true);
    const isCorrect = index === todayChallenge.questions[currentQ].correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    } else {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
    }
  };

  const handleNext = async () => {
    if (currentQ < todayChallenge.questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setAnswered(false);
      setSelectedIndex(-1);
    } else {
      // Finished
      const finalScore = score + (selectedIndex === todayChallenge.questions[currentQ].correctIndex ? 0 : 0);
      // Generate fake competitors
      const totalPlayers = 127 + Math.floor(Math.random() * 200);
      const rank = Math.max(1, Math.floor((1 - finalScore / todayChallenge.questions.length) * totalPlayers * 0.7) + Math.floor(Math.random() * 15));

      const result = {
        date: new Date().toISOString().split('T')[0],
        score,
        rank: Math.min(rank, totalPlayers),
        total: totalPlayers,
      };
      setSavedResult(result);
      setFinished(true);
      await AsyncStorage.setItem(STORAGE_KEY_CHALLENGE, JSON.stringify(result));
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: t('challenge.shareText', {
          score: savedResult?.score || score,
          total: todayChallenge.questions.length,
        }),
      });
    } catch (e) { console.warn('Share challenge results failed:', e); }
  };

  // Finished / Results view
  if (finished && savedResult) {
    return (
      <View style={styles.root}>
        <AmbientGlow color={colors.success} size={300} opacity={0.08} top="15%" left="50%" />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t('challenge.title')}</Text>
            <Text style={styles.subtitle}>{t('challenge.daily')}</Text>

            <GlassCard style={styles.resultCard} glowColor={colors.success}>
              <Text style={styles.resultEmoji}>
                {savedResult.score === todayChallenge.questions.length ? '\uD83C\uDFC6' : savedResult.score >= 3 ? '\u2B50' : '\uD83D\uDCAA'}
              </Text>
              <Text style={styles.resultScore}>
                {savedResult.score}/{todayChallenge.questions.length}
              </Text>
              <Text style={styles.resultLabel}>{t('challenge.correctAnswers')}</Text>

              <View style={styles.rankBadge}>
                <LinearGradient
                  colors={['#FF6B35', '#FF3D00']}
                  style={styles.rankGradient}
                >
                  <Text style={styles.rankText}>
                    {t('challenge.ranked', { rank: savedResult.rank, total: savedResult.total })}
                  </Text>
                </LinearGradient>
              </View>
            </GlassCard>

            <TouchableOpacity activeOpacity={0.8} onPress={handleShare}>
              <LinearGradient
                colors={['#6C63FF', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shareButton}
              >
                <Text style={styles.shareButtonText}>{t('challenge.share')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Quiz view
  const question = todayChallenge.questions[currentQ];

  return (
    <View style={styles.root}>
      <AmbientGlow color={colors.secondary} size={250} opacity={0.06} top="10%" left="30%" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('challenge.title')}</Text>
          <Text style={styles.subtitle}>{todayChallenge.title}</Text>

          {/* Progress */}
          <View style={styles.progressRow}>
            {todayChallenge.questions.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i < currentQ && styles.progressDotDone,
                  i === currentQ && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Question */}
          <GlassCard style={styles.questionCard}>
            <Text style={styles.questionNumber}>
              {t('challenge.questionOf', { current: currentQ + 1, total: todayChallenge.questions.length })}
            </Text>
            <Text style={styles.questionText}>{question.question}</Text>
          </GlassCard>

          {/* Options */}
          {question.options.map((option, i) => {
            const isCorrect = i === question.correctIndex;
            const isSelected = i === selectedIndex;
            let optionStyle: any = styles.option;
            let textStyle: any = styles.optionText;
            if (answered) {
              if (isCorrect) {
                optionStyle = { ...styles.option, ...styles.optionCorrect };
                textStyle = { ...styles.optionText, ...styles.optionTextCorrect };
              } else if (isSelected && !isCorrect) {
                optionStyle = { ...styles.option, ...styles.optionWrong };
                textStyle = { ...styles.optionText, ...styles.optionTextWrong };
              }
            }

            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                onPress={() => handleAnswer(i)}
                disabled={answered}
              >
                <View style={optionStyle}>
                  <Text style={textStyle}>{option}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Next button */}
          {answered && (
            <TouchableOpacity activeOpacity={0.8} onPress={handleNext}>
              <LinearGradient
                colors={['#FF6B35', '#FF3D00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextButton}
              >
                <Text style={styles.nextButtonText}>
                  {currentQ < todayChallenge.questions.length - 1
                    ? t('gameSession.continue')
                    : t('challenge.seeResults')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressDotDone: {
    backgroundColor: colors.success,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  questionCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  questionNumber: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  questionText: {
    ...typography.h3,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  option: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionCorrect: {
    borderColor: 'rgba(52,211,153,0.5)',
    backgroundColor: 'rgba(52,211,153,0.1)',
  },
  optionWrong: {
    borderColor: 'rgba(239,68,68,0.5)',
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  optionTextCorrect: {
    color: colors.success,
  },
  optionTextWrong: {
    color: colors.error,
  },
  nextButton: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultCard: {
    alignItems: 'center',
    padding: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  resultScore: {
    ...typography.h1,
    color: colors.textPrimary,
    fontSize: 48,
  },
  resultLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  rankBadge: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  rankGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  rankText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  shareButton: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
