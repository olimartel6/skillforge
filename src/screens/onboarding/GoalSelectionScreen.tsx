import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { AmbientGlow } from '../../components/AmbientGlow';
import { colors, spacing, typography } from '../../utils/theme';
import { Goal } from '../../utils/types';
import { useUserStore } from '../../store/userStore';
import { generateRoadmap } from '../../services/aiCoach';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'GoalSelection'>;
type Route = RouteProp<OnboardingStackParamList, 'GoalSelection'>;

const GOALS: { value: Goal; icon: string; title: string; subtitle: string }[] = [
  { value: 'creativity', icon: '🎨', title: 'Unlock creativity', subtitle: 'Express yourself freely' },
  { value: 'learn_faster', icon: '⚡', title: 'Learn faster', subtitle: 'Accelerate your growth' },
  { value: 'discipline', icon: '🧱', title: 'Build discipline', subtitle: 'Show up every day' },
];

export function GoalSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { skillId, level } = route.params;
  const { completeOnboarding, profile } = useUserStore();

  const [selected, setSelected] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!selected || !profile) return;
    setError('');
    setLoading(true);
    try {
      await completeOnboarding(skillId, level as any, selected);
      await generateRoadmap(skillId, level, selected, profile.id);
      navigation.navigate('RoadmapPreview', { skillId, level, goal: selected });
    } catch (e: any) {
      setError(e.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientGlow color={colors.primary} size={250} top="10%" left="40%" opacity={0.08} />

      <View style={styles.content}>
        <Text style={styles.step}>STEP 3 OF 3</Text>
        <Text style={styles.heading}>What drives you?</Text>

        <View style={styles.options}>
          {GOALS.map((goal) => {
            const isSelected = selected === goal.value;
            return (
              <TouchableOpacity
                key={goal.value}
                activeOpacity={0.8}
                onPress={() => setSelected(goal.value)}
              >
                <GlassCard
                  strong={isSelected}
                  glowColor={isSelected ? colors.primary : undefined}
                  style={styles.card}
                >
                  <Text style={styles.icon}>{goal.icon}</Text>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {goal.title}
                    </Text>
                    <Text style={styles.cardSubtitle}>{goal.subtitle}</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.footer}>
        <Button
          title={loading ? '' : 'Generate My Roadmap →'}
          onPress={handleGenerate}
          disabled={!selected || loading}
        />
        {loading && (
          <ActivityIndicator
            color={colors.textPrimary}
            style={styles.loader}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  step: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing['3xl'],
  },
  options: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  icon: {
    fontSize: 28,
    marginRight: spacing.lg,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardTitleSelected: {
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  loader: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
  },
});
