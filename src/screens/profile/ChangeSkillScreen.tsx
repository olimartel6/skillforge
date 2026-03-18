import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { AmbientGlow } from '../../components/AmbientGlow';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { Skill } from '../../utils/types';
import { supabase } from '../../services/supabase';
import { useUserStore } from '../../store/userStore';
import * as Haptics from 'expo-haptics';

const CARD_GAP = spacing.sm;
const SCREEN_PADDING = spacing.xl;
const CARD_WIDTH = (Dimensions.get('window').width - SCREEN_PADDING * 2 - CARD_GAP * 2) / 3;

export function ChangeSkillScreen() {
  const navigation = useNavigation<any>();
  const { profile, changeSkill } = useUserStore();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(profile?.selected_skill_id || null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const isPremium = profile?.premium_expires_at
    ? new Date(profile.premium_expires_at) > new Date()
    : false;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('skills').select('*').order('name');
      if (data) setSkills(data as Skill[]);
      setLoading(false);
    })();
  }, []);

  const handleSwitch = async () => {
    if (!selectedId || selectedId === profile?.selected_skill_id) {
      navigation.goBack();
      return;
    }

    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Free users can only learn 1 skill. Upgrade to Premium to switch between unlimited skills.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go Premium', onPress: () => navigation.navigate('Subscription') },
        ]
      );
      return;
    }

    Alert.alert(
      'Switch Skill?',
      'Your progress on your current skill will be saved. You can switch back anytime without losing progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          style: 'default',
          onPress: async () => {
            setSwitching(true);
            await changeSkill(selectedId);
            setSwitching(false);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AmbientGlow color={colors.secondary} size={250} top="5%" left="70%" opacity={0.08} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.heading}>Change Skill</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>Your progress is saved for each skill. Switch back anytime.</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {skills.map((skill) => {
              const isSelected = skill.id === selectedId;
              const isCurrent = skill.id === profile?.selected_skill_id;
              return (
                <TouchableOpacity
                  key={skill.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                    setSelectedId(skill.id);
                  }}
                >
                  <GlassCard
                    strong={isSelected}
                    glowColor={isSelected ? colors.primary : undefined}
                    style={styles.card}
                  >
                    <Text style={styles.cardIcon}>{skill.icon}</Text>
                    <Text style={[styles.cardName, isSelected && styles.cardNameSelected]} numberOfLines={2}>
                      {skill.name}
                    </Text>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Button
          title={switching ? 'Switching...' : selectedId === profile?.selected_skill_id ? 'Already Selected' : 'Switch Skill'}
          onPress={() => {
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
            handleSwitch();
          }}
          disabled={!selectedId || switching || selectedId === profile?.selected_skill_id}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  heading: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: spacing.xl,
  },
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 120,
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
  currentBadge: {
    marginTop: spacing.xs,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
