import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { AmbientGlow } from '../../components/AmbientGlow';
import { colors, spacing, typography } from '../../utils/theme';
import { Skill } from '../../utils/types';
import { supabase } from '../../services/supabase';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import * as Haptics from 'expo-haptics';
import { t } from '../../i18n';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'SkillSelection'>;

const INITIAL_VISIBLE = 9;
const CARD_GAP = spacing.sm;
const SCREEN_PADDING = spacing.xl;
const CARD_WIDTH =
  (Dimensions.get('window').width - SCREEN_PADDING * 2 - CARD_GAP * 2) / 3;

export function SkillSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('sort_order').order('name');
      if (!error && data) setSkills(data as Skill[]);
      setLoading(false);
    })();
  }, []);

  const visibleSkills = showAll ? skills : skills.slice(0, INITIAL_VISIBLE);

  // Staggered card entrance animations
  const cardAnims = useRef<Animated.Value[]>([]).current;
  while (cardAnims.length < visibleSkills.length) {
    cardAnims.push(new Animated.Value(0));
  }

  useEffect(() => {
    if (loading || visibleSkills.length === 0) return;
    // Reset all to 0
    cardAnims.forEach((a) => a.setValue(0));
    const animations = visibleSkills.map((_, i) =>
      Animated.timing(cardAnims[i], {
        toValue: 1,
        duration: 300,
        delay: i * 50,
        useNativeDriver: true,
      })
    );
    Animated.stagger(50, animations).start();
  }, [loading, visibleSkills.length, showAll]);

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientGlow color={colors.primary} size={250} top="5%" left="70%" opacity={0.08} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.step}>{t('skillSelection.step')}</Text>
        <Text style={styles.heading}>{t('skillSelection.heading')}</Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {visibleSkills.map((skill, index) => {
              const selected = skill.id === selectedId;
              const anim = cardAnims[index];
              return (
                <Animated.View
                  key={skill.id}
                  style={{
                    opacity: anim || 0,
                    transform: [
                      {
                        translateY: anim
                          ? anim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0],
                            })
                          : 20,
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                      setSelectedId(skill.id);
                    }}
                  >
                    <GlassCard
                      strong={selected}
                      glowColor={selected ? colors.primary : undefined}
                      style={[styles.card, selected && styles.cardSelected]}
                    >
                      <Text style={styles.cardIcon}>{skill.icon}</Text>
                      <Text
                        style={[styles.cardName, selected && styles.cardNameSelected]}
                        numberOfLines={2}
                      >
                        {skill.name}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}

        {!showAll && skills.length > INITIAL_VISIBLE && (
          <TouchableOpacity onPress={() => setShowAll(true)} activeOpacity={0.7}>
            <Text style={styles.seeAll}>{t('skillSelection.seeAll', { count: skills.length })}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('skillSelection.continue')}
          onPress={() => {
            try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
            if (selectedId) navigation.navigate('LevelSelection', { skillId: selectedId });
          }}
          disabled={!selectedId}
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
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing['3xl'],
    paddingBottom: 100,
  },
  step: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelected: {},
  cardIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  cardName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cardNameSelected: {
    color: colors.textPrimary,
  },
  seeAll: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: spacing['4xl'],
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
});
