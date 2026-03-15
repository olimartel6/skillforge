import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { AmbientGlow } from '../../components/AmbientGlow';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../../store/userStore';
import { useStreakStore } from '../../store/streakStore';

export function StreakDashboardScreen() {
  const navigation = useNavigation<any>();
  const profile = useUserStore((s) => s.profile);
  const { currentStreak, longestStreak, freezeTokens, fetchStreak } = useStreakStore();
  const [totalMinutes, setTotalMinutes] = useState(0);

  useEffect(() => {
    fetchStreak();

    // Load practice count from local storage
    const loadMinutes = async () => {
      try {
        const stored = await AsyncStorage.getItem('practice_count');
        setTotalMinutes((stored ? parseInt(stored, 10) : 0) * 5);
      } catch {}
    };
    loadMinutes();
  }, []);

  return (
    <View style={styles.root}>
      <AmbientGlow color={colors.primary} size={160} opacity={0.15} top={120} left="50%" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.flameEmoji}>🔥</Text>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{freezeTokens}</Text>
              <Text style={styles.statLabel}>Freeze Tokens</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{totalMinutes}</Text>
              <Text style={styles.statLabel}>Total Minutes</Text>
            </GlassCard>
          </View>

          {/* Badges Link */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Badges')}
          >
            <GlassCard strong style={styles.badgesLink}>
              <View style={styles.badgesLinkContent}>
                <Text style={styles.badgesIcon}>🏆</Text>
                <View style={styles.badgesTextContainer}>
                  <Text style={styles.badgesTitle}>View Badges</Text>
                  <Text style={styles.badgesSubtitle}>
                    See all your achievements
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
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

  // Hero
  hero: {
    alignItems: 'center',
    marginTop: spacing['4xl'],
    marginBottom: spacing['4xl'],
  },
  flameEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -2,
  },
  streakLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    ...typography.stat,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // Badges Link
  badgesLink: {
    padding: spacing.lg,
  },
  badgesLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badgesIcon: {
    fontSize: 28,
  },
  badgesTextContainer: {
    flex: 1,
  },
  badgesTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  badgesSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: '300',
  },
});
