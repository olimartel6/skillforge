import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { AmbientGlow } from '../../components/AmbientGlow';
import { colors, spacing, typography } from '../../utils/theme';
import { SkillLevel } from '../../utils/types';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import * as Haptics from 'expo-haptics';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'LevelSelection'>;
type Route = RouteProp<OnboardingStackParamList, 'LevelSelection'>;

const LEVELS: { value: SkillLevel; icon: string; title: string; subtitle: string }[] = [
  { value: 'beginner', icon: '🌱', title: 'Beginner', subtitle: 'Starting from scratch' },
  { value: 'intermediate', icon: '⚡', title: 'Intermediate', subtitle: 'I know the fundamentals' },
  { value: 'advanced', icon: '🔥', title: 'Advanced', subtitle: 'Ready to master it' },
];

export function LevelSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { skillId } = route.params;

  const [selected, setSelected] = useState<SkillLevel | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientGlow color={colors.secondary} size={250} top="10%" left="60%" opacity={0.08} />

      <View style={styles.content}>
        <Text style={styles.step}>STEP 2 OF 3</Text>
        <Text style={styles.heading}>Your experience?</Text>

        <View style={styles.options}>
          {LEVELS.map((level) => {
            const isSelected = selected === level.value;
            return (
              <TouchableOpacity
                key={level.value}
                activeOpacity={0.8}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  setSelected(level.value);
                }}
              >
                <GlassCard
                  strong={isSelected}
                  glowColor={isSelected ? colors.secondary : undefined}
                  style={styles.card}
                >
                  <Text style={styles.icon}>{level.icon}</Text>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {level.title}
                    </Text>
                    <Text style={styles.cardSubtitle}>{level.subtitle}</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => {
            if (selected) {
              navigation.navigate('GoalSelection', { skillId, level: selected });
            }
          }}
          disabled={!selected}
        />
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
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
});
