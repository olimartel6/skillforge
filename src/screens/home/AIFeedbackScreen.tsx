import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { colors, spacing, borderRadius, typography, shadows } from '../../utils/theme';
import { useCommunityStore } from '../../store/communityStore';
import { AIFeedback } from '../../utils/types';

interface FeedbackParams {
  feedback: AIFeedback | null;
  sessionId: string;
  challengeTitle: string;
  skillName: string;
  duration: number;
  dayNumber: number;
}

export function AIFeedbackScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as FeedbackParams;
  const { feedback, sessionId, challengeTitle, skillName, duration, dayNumber } = params;

  const sharePractice = useCommunityStore((s) => s.sharePractice);

  const [isSharing, setIsSharing] = useState(false);

  // Staggered entrance animations for the 4 cards
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;
  const anim4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!feedback || feedback.error) return;

    const animations = [anim1, anim2, anim3, anim4].map((anim) =>
      Animated.spring(anim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      })
    );

    Animated.stagger(200, animations).start();
  }, [feedback]);

  const getCardAnimStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  });

  const handleSave = () => {
    navigation.popToTop();
  };

  const handleShare = async () => {
    if (!sessionId) return;
    setIsSharing(true);
    try {
      await sharePractice(sessionId);
    } catch {
      // Share is a no-op locally
    } finally {
      setIsSharing(false);
      navigation.popToTop();
    }
  };

  const handleRetry = () => {
    navigation.goBack();
  };

  // Loading state
  if (!feedback) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Analyzing your practice...</Text>
            <Text style={styles.loadingSubText}>
              Our AI coach is reviewing your session
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Error state
  if (feedback.error) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loadingContainer}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.errorTitle}>Analysis Failed</Text>
            <Text style={styles.errorMessage}>
              {feedback.message || 'Something went wrong. Please try again.'}
            </Text>
            <Button title="Retry" onPress={handleRetry} style={{ marginTop: spacing['2xl'] }} />
            <Button
              title="Skip"
              variant="ghost"
              onPress={handleSave}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.checkContainer}>
              <LinearGradient
                colors={[colors.success, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.checkGradient}
              >
                <Text style={styles.checkIcon}>✓</Text>
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Practice Complete</Text>
            <Text style={styles.headerMeta}>
              Day {dayNumber} · {skillName} · {duration} min
            </Text>
          </View>

          {/* Score */}
          {feedback.score > 0 && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreValue}>{feedback.score}</Text>
              <Text style={styles.scoreLabel}>/ 100</Text>
            </View>
          )}

          {/* Strengths Card */}
          {feedback.strengths.length > 0 && (
            <Animated.View style={getCardAnimStyle(anim1)}>
              <View style={styles.feedbackCard}>
                <View
                  style={[
                    styles.feedbackCardInner,
                    {
                      backgroundColor: 'rgba(52,211,153,0.06)',
                      borderColor: 'rgba(52,211,153,0.1)',
                    },
                  ]}
                >
                  <Text style={[styles.feedbackCardTitle, { color: colors.success }]}>
                    Strengths
                  </Text>
                  {feedback.strengths.map((item, idx) => (
                    <View key={idx} style={styles.feedbackItem}>
                      <Text style={styles.feedbackBullet}>•</Text>
                      <Text style={styles.feedbackText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* To Improve Card */}
          {feedback.mistakes.length > 0 && (
            <Animated.View style={getCardAnimStyle(anim2)}>
              <View style={styles.feedbackCard}>
                <View
                  style={[
                    styles.feedbackCardInner,
                    {
                      backgroundColor: 'rgba(255,107,53,0.06)',
                      borderColor: 'rgba(255,107,53,0.1)',
                    },
                  ]}
                >
                  <Text style={[styles.feedbackCardTitle, { color: colors.primary }]}>
                    To Improve
                  </Text>
                  {feedback.mistakes.map((item, idx) => (
                    <View key={idx} style={styles.feedbackItem}>
                      <Text style={styles.feedbackBullet}>•</Text>
                      <Text style={styles.feedbackText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}

          {/* Pro Tip Card */}
          {feedback.improvement_tip ? (
            <Animated.View style={getCardAnimStyle(anim3)}>
              <View style={styles.feedbackCard}>
                <View
                  style={[
                    styles.feedbackCardInner,
                    {
                      backgroundColor: 'rgba(108,99,255,0.06)',
                      borderColor: 'rgba(108,99,255,0.1)',
                    },
                  ]}
                >
                  <Text style={[styles.feedbackCardTitle, { color: colors.secondary }]}>
                    Pro Tip
                  </Text>
                  <Text style={styles.feedbackText}>{feedback.improvement_tip}</Text>
                </View>
              </View>
            </Animated.View>
          ) : null}

          {/* Encouragement Card */}
          {feedback.encouragement ? (
            <Animated.View style={getCardAnimStyle(anim4)}>
              <View style={styles.feedbackCard}>
                <View
                  style={[
                    styles.feedbackCardInner,
                    {
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderColor: 'rgba(255,255,255,0.06)',
                    },
                  ]}
                >
                  <Text style={[styles.feedbackCardTitle, { color: colors.textPrimary }]}>
                    Keep Going
                  </Text>
                  <Text style={styles.feedbackText}>{feedback.encouragement}</Text>
                </View>
              </View>
            </Animated.View>
          ) : null}

          {/* Bottom Buttons */}
          <View style={styles.buttonRow}>
            <Button
              title="Save"
              variant="secondary"
              onPress={handleSave}
              style={styles.buttonHalf}
            />
            <Button
              title={isSharing ? 'Sharing...' : 'Share'}
              onPress={handleShare}
              disabled={isSharing}
              style={styles.buttonHalf}
            />
          </View>
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
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['4xl'],
  },
  loadingText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing['2xl'],
  },
  loadingSubText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  // Error
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239,68,68,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  errorIconText: {
    color: colors.error,
    fontSize: 24,
    fontWeight: '700',
  },
  errorTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  errorMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    marginBottom: spacing['2xl'],
  },
  checkContainer: {
    marginBottom: spacing.lg,
  },
  checkGradient: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Score
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
  },
  scoreLabel: {
    ...typography.body,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },

  // Feedback Cards
  feedbackCard: {
    marginBottom: spacing.lg,
  },
  feedbackCardInner: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  feedbackCardTitle: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  feedbackItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  feedbackBullet: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  feedbackText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  buttonHalf: {
    flex: 1,
  },
});
