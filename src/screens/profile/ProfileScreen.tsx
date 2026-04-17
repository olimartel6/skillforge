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
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/GlassCard';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase';
import { useUserStore } from '../../store/userStore';
import { useGameStore } from '../../store/gameStore';
import { useStreakStore } from '../../store/streakStore';
import { Skill } from '../../utils/types';
import { SKILL_LESSONS } from '../games/GamesHomeScreen';
import * as Haptics from 'expo-haptics';
import { t } from '../../i18n';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const profile = useUserStore((s) => s.profile);
  const signOut = useUserStore((s) => s.signOut);
  const { currentStreak, fetchStreak } = useStreakStore();
  const { completedLessons, xp } = useGameStore();
  const [practiceCount, setPracticeCount] = useState(0);
  const [skillName, setSkillName] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<
    { skillName: string; modulesCompleted: number; totalModules: number; xpEarned: number; completionDate: string }[]
  >([]);

  useEffect(() => {
    if (!profile) return;

    fetchStreak();

    const load = async () => {
      try {
        // Practice count from local storage
        const stored = await AsyncStorage.getItem('practice_count');
        setPracticeCount(stored ? parseInt(stored, 10) : 0);

        // Skill name from Supabase (public data)
        let currentSkillName: string | null = null;
        if (profile.selected_skill_id) {
          const { data } = await supabase
            .from('skills')
            .select('name')
            .eq('id', profile.selected_skill_id)
            .single();
          if (data) {
            currentSkillName = (data as Skill).name;
            setSkillName(currentSkillName);
          }
        }
        // Check for certificates across all skills
        const allKeys = await AsyncStorage.getAllKeys();
        const progressKeys = allKeys.filter((k) => k.startsWith('skill_progress_'));
        const certs: typeof certificates = [];

        for (const key of progressKeys) {
          const skillId = key.replace('skill_progress_', '');
          const stored = await AsyncStorage.getItem(key);
          if (!stored) continue;
          const progress = JSON.parse(stored);
          const completedStr = progress.game_completed_lessons;
          const completed: number[] = completedStr ? JSON.parse(completedStr) : [];
          const xpStr = progress.game_xp;
          const skillXp = xpStr ? parseInt(xpStr, 10) : 0;

          const { data: skillData } = await supabase
            .from('skills')
            .select('name')
            .eq('id', skillId)
            .single();
          const sName = skillData ? (skillData as Skill).name : null;
          if (!sName) continue;

          const totalModules = SKILL_LESSONS[sName]?.length || 24;
          if (completed.length >= totalModules) {
            certs.push({
              skillName: sName,
              modulesCompleted: completed.length,
              totalModules,
              xpEarned: skillXp,
              completionDate: new Date().toISOString(),
            });
          }
        }

        // Also check current skill
        if (currentSkillName) {
          const currentName = currentSkillName;
          const totalModules = SKILL_LESSONS[currentName]?.length || 24;
          if (completedLessons.length >= totalModules) {
            const exists = certs.some((c) => c.skillName === currentName);
            if (!exists) {
              certs.push({
                skillName: currentName,
                modulesCompleted: completedLessons.length,
                totalModules,
                xpEarned: xp,
                completionDate: new Date().toISOString(),
              });
            }
          }
        }

        setCertificates(certs);
      } catch {
        // Profile data may not be available from Supabase
      }
    };

    load();
  }, [profile?.selected_skill_id, completedLessons.length]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Sign out error
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
              <Text style={styles.memberSince}>{t('profile.memberSince')} {memberSince}</Text>
            ) : null}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{practiceCount}</Text>
              <Text style={styles.statLabel}>{t('profile.practices')}</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValueSmall}>{skillName || '—'}</Text>
              <Text style={styles.statLabel}>{t('profile.currentSkill')}</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>{t('profile.streak')}</Text>
            </GlassCard>
          </View>

          {/* Share Profile */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              try { Haptics.selectionAsync(); } catch {}
              navigation.navigate('PublicProfile');
            }}
            style={{ marginBottom: spacing['2xl'] }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareProfileButton}
            >
              <Ionicons name="share-outline" size={18} color="#FFF" />
              <Text style={styles.shareProfileText}>Share Profile</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Certificates */}
          {certificates.length > 0 && (
            <View style={{ marginBottom: spacing['2xl'] }}>
              <Text style={styles.sectionHeader}>Certificates</Text>
              {certificates.map((cert, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.8}
                  onPress={() => {
                    try { Haptics.selectionAsync(); } catch {}
                    navigation.navigate('Certificate', {
                      skillName: cert.skillName,
                      modulesCompleted: cert.modulesCompleted,
                      totalModules: cert.totalModules,
                      xpEarned: cert.xpEarned,
                      completionDate: cert.completionDate,
                    });
                  }}
                >
                  <GlassCard style={styles.certCard}>
                    <View style={styles.certIcon}>
                      <Text style={{ fontSize: 22 }}>{'\uD83C\uDF93'}</Text>
                    </View>
                    <View style={styles.certInfo}>
                      <Text style={styles.certTitle}>{cert.skillName}</Text>
                      <Text style={styles.certSub}>
                        {cert.modulesCompleted} modules | {cert.xpEarned.toLocaleString()} XP
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Menu Items */}
          <View style={styles.menu}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                try { Haptics.selectionAsync(); } catch {}
                navigation.navigate('ChangeSkill');
              }}
            >
              <GlassCard style={styles.menuItem}>
                <Text style={styles.menuText}>{t('profile.changeSkill')}</Text>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                try { Haptics.selectionAsync(); } catch {}
                navigation.navigate('Settings');
              }}
            >
              <GlassCard style={styles.menuItem}>
                <Text style={styles.menuText}>{t('profile.settings')}</Text>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                try { Haptics.selectionAsync(); } catch {}
                navigation.navigate('Subscription');
              }}
            >
              <GlassCard style={styles.menuItem}>
                <Text style={styles.menuText}>{t('profile.subscription')}</Text>
                <Text style={styles.chevron}>›</Text>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={() => {
              try { Haptics.selectionAsync(); } catch {}
              handleSignOut();
            }}>
              <GlassCard style={styles.menuItem}>
                <Text style={[styles.menuText, { color: colors.error }]}>{t('profile.signOut')}</Text>
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
    paddingBottom: 120,
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

  // Share Profile Button
  shareProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  shareProfileText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Section header
  sectionHeader: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },

  // Certificates
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  certIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212,175,55,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  certInfo: {
    flex: 1,
  },
  certTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  certSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
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
