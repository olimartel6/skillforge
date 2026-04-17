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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import * as Haptics from 'expo-haptics';
import { t } from '../../i18n';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'GoalSelection'>;
type Route = RouteProp<OnboardingStackParamList, 'GoalSelection'>;

const GOALS: { value: Goal; icon: string; titleKey: string; subtitleKey: string }[] = [
  { value: 'creativity', icon: '🎨', titleKey: 'goalSelection.creativity', subtitleKey: 'goalSelection.creativitySub' },
  { value: 'learn_faster', icon: '⚡', titleKey: 'goalSelection.learnFaster', subtitleKey: 'goalSelection.learnFasterSub' },
  { value: 'discipline', icon: '🧱', titleKey: 'goalSelection.discipline', subtitleKey: 'goalSelection.disciplineSub' },
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
      // Don't complete onboarding yet — wait until after paywall
      // Save skill selection without marking onboarding complete
      const { updateProfile } = useUserStore.getState();
      await updateProfile({ selected_skill_id: skillId, skill_level: level as any, goal: selected });

      // Generate a simple local roadmap from skill tree nodes
      const { data: nodes } = await supabase
        .from('skill_tree_nodes')
        .select('*')
        .eq('skill_id', skillId)
        .order('order');

      if (nodes && nodes.length > 0) {
        const roadmap = Array.from({ length: 30 }, (_, i) => {
          const node = nodes[i % nodes.length];
          return {
            id: `day-${i + 1}`,
            user_id: 'local-user',
            day_number: i + 1,
            node_id: node.id,
            challenge_title: `Day ${i + 1}: ${node.name} Practice`,
            challenge_description: `Practice ${node.name} for 5 minutes. Focus on building your skills step by step.`,
            completed_at: null,
            created_at: new Date().toISOString(),
          };
        });
        await AsyncStorage.setItem('user_roadmap', JSON.stringify(roadmap));
      }

      navigation.navigate('Tutorial', { skillId, level, goal: selected });
    } catch (e: any) {
      setError(e.message || t('goalSelection.failedGenerate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientGlow color={colors.primary} size={250} top="10%" left="40%" opacity={0.08} />

      <View style={styles.content}>
        <Text style={styles.step}>{t('goalSelection.step')}</Text>
        <Text style={styles.heading}>{t('goalSelection.heading')}</Text>

        <View style={styles.options}>
          {GOALS.map((goal) => {
            const isSelected = selected === goal.value;
            return (
              <TouchableOpacity
                key={goal.value}
                activeOpacity={0.8}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  setSelected(goal.value);
                }}
              >
                <GlassCard
                  strong={isSelected}
                  glowColor={isSelected ? colors.primary : undefined}
                  style={styles.card}
                >
                  <Text style={styles.icon}>{goal.icon}</Text>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {t(goal.titleKey)}
                    </Text>
                    <Text style={styles.cardSubtitle}>{t(goal.subtitleKey)}</Text>
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
          title={loading ? '' : t('goalSelection.generate')}
          onPress={() => {
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
            handleGenerate();
          }}
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
