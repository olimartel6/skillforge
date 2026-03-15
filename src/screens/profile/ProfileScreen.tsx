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
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../components/GlassCard';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { supabase } from '../../services/supabase';
import { useUserStore } from '../../store/userStore';
import { useStreakStore } from '../../store/streakStore';
import { Skill } from '../../utils/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const profile = useUserStore((s) => s.profile);
  const signOut = useUserStore((s) => s.signOut);
  const { currentStreak, fetchStreak } = useStreakStore();
  const [practiceCount, setPracticeCount] = useState(0);
  const [skillName, setSkillName] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;

    fetchStreak(profile.id);

    const load = async () => {
      try {
        const { count } = await supabase
          .from('practice_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        setPracticeCount(count || 0);

        if (profile.selected_skill_id) {
          const { data } = await supabase
            .from('skills')
            .select('name')
            .eq('id', profile.selected_skill_id)
            .single();
          if (data) setSkillName((data as Skill).name);
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      }
    };

    load();
  }, [profile?.id, profile?.selected_skill_id]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const username = profile?.username || 'User';
  const memberSince = profile?.created_at ? formatDate(profile.created_at) : '';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.avatarCircle}
            >
              <Text style={styles.avatarLetter}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <Text style={styles.username}>{username}</Text>
            {memberSince ? (
              <Text style={styles.memberSince}>Member since {memberSince}</Text>
            ) : null}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{practiceCount}</Text>
              <Text style={styles.statLabel}>Practices</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValueSmall}>{skillName || '—'}</Text>
              <Text style={styles.statLabel}>Current Skill</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </GlassCard>
          </View>

          {/* Menu Items */}
          <View style={styles.menu}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings')}
            >
              <GlassCard style={styles.menuItem}>
                <Text style={styles.menuText}>Settings</Text>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Subscription')}
            >
              <GlassCard style={styles.menuItem}>
                <Text style={styles.menuText}>Subscription</Text>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={handleSignOut}>
              <GlassCard style={styles.menuItem}>
                <Text style={[styles.menuText, { color: colors.error }]}>Sign Out</Text>
                <Text style={[styles.chevron, { color: colors.error }]}>›</Text>
              </GlassCard>
            </TouchableOpacity>
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

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    marginBottom: spacing['3xl'],
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  username: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  memberSince: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Stats
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
  statValueSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // Menu
  menu: {
    gap: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  menuText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    color: colors.textSecondary,
    fontWeight: '300',
  },
});
