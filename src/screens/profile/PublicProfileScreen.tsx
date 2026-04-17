import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassCard } from '../../components/GlassCard';
import { AmbientGlow } from '../../components/AmbientGlow';
import { colors, spacing, borderRadius, typography, glowShadow } from '../../utils/theme';
import { useUserStore } from '../../store/userStore';
import { useGameStore } from '../../store/gameStore';
import { useStreakStore } from '../../store/streakStore';
import { useLeagueStore, getLeagueInfo } from '../../store/leagueStore';
import { SKILL_LESSONS } from '../games/GamesHomeScreen';
import { supabase } from '../../services/supabase';
import { Skill } from '../../utils/types';
import * as Haptics from 'expo-haptics';

let ViewShot: any = ({ children, ...p }: any) => <View {...p}>{children}</View>;
let captureRef: any = async () => '';
try {
  const vs = require('react-native-view-shot');
  ViewShot = vs.default;
  captureRef = vs.captureRef;
} catch (e) {
  console.warn('react-native-view-shot import failed:', e);
}
let Sharing: any = { shareAsync: async () => {} };
try {
  Sharing = require('expo-sharing');
} catch (e) {
  console.warn('expo-sharing import failed:', e);
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function PublicProfileScreen() {
  const navigation = useNavigation<any>();
  const profile = useUserStore((s) => s.profile);
  const { xp, level, completedLessons } = useGameStore();
  const { currentStreak, earnedBadges, badges } = useStreakStore();
  const { currentLeague, rank } = useLeagueStore();
  const viewShotRef = useRef<any>(null);
  const [skillName, setSkillName] = useState<string | null>(null);
  const [allSkillProgress, setAllSkillProgress] = useState<
    { name: string; completed: number; total: number }[]
  >([]);

  const username = profile?.username || 'Forger';
  const leagueInfo = getLeagueInfo(currentLeague);

  useEffect(() => {
    loadSkillData();
  }, [profile?.selected_skill_id]);

  async function loadSkillData() {
    try {
      // Current skill name
      if (profile?.selected_skill_id) {
        const { data } = await supabase
          .from('skills')
          .select('name')
          .eq('id', profile.selected_skill_id)
          .single();
        if (data) setSkillName((data as Skill).name);
      }

      // Gather progress across all skills the user has tried
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter((k) => k.startsWith('skill_progress_'));
      const progressItems: { name: string; completed: number; total: number }[] = [];

      for (const key of progressKeys) {
        const skillId = key.replace('skill_progress_', '');
        const stored = await AsyncStorage.getItem(key);
        if (!stored) continue;
        const progress = JSON.parse(stored);
        const completedStr = progress.game_completed_lessons;
        const completed: number[] = completedStr ? JSON.parse(completedStr) : [];

        // Try to get skill name from Supabase
        const { data: skillData } = await supabase
          .from('skills')
          .select('name')
          .eq('id', skillId)
          .single();
        const name = skillData ? (skillData as Skill).name : skillId;
        const totalModules = SKILL_LESSONS[name]?.length || 24;

        if (completed.length > 0) {
          progressItems.push({ name, completed: completed.length, total: totalModules });
        }
      }

      // Add current skill if not already included
      if (skillName && completedLessons.length > 0) {
        const exists = progressItems.some((p) => p.name === skillName);
        if (!exists) {
          const totalModules = SKILL_LESSONS[skillName]?.length || 24;
          progressItems.push({
            name: skillName,
            completed: completedLessons.length,
            total: totalModules,
          });
        }
      }

      setAllSkillProgress(progressItems);
    } catch {
      // Silently fail
    }
  }

  // Get earned badge details
  const earnedBadgeDetails = badges.filter((b) =>
    earnedBadges.some((eb) => eb.badge_id === b.id),
  );

  async function handleShare() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    try {
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const shareText = `Check out my Skilly profile! Level ${level} | ${xp.toLocaleString()} XP | ${currentStreak} day streak\n\nskilly://profile/${profile?.id || 'local-user'}`;

      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          UTI: 'public.png',
        });
      } else {
        await Share.share({ url: uri, message: shareText });
      }
    } catch (err: any) {
      // Fallback to text share
      try {
        await Share.share({
          message: `Check out my Skilly profile! Level ${level} | ${xp.toLocaleString()} XP | ${currentStreak} day streak\n\nskilly://profile/${profile?.id || 'local-user'}`,
        });
      } catch {}
    }
  }

  return (
    <View style={styles.root}>
      <AmbientGlow color={colors.primary} size={400} opacity={0.08} top="-5%" left="50%" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1 }}
            style={styles.captureArea}
          >
            {/* Gradient Header */}
            <LinearGradient
              colors={['rgba(255,107,53,0.15)', 'rgba(255,107,53,0.02)', 'transparent']}
              style={styles.headerGradient}
            />

            {/* Avatar + Username */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarRing}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.avatarCircle}
                >
                  <Text style={styles.avatarLetter}>
                    {username.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>
              <Text style={styles.username}>{username}</Text>
              <View style={styles.leagueBadge}>
                <Text style={styles.leagueIcon}>{leagueInfo.icon}</Text>
                <Text style={[styles.leagueText, { color: leagueInfo.color }]}>
                  {leagueInfo.label} League
                </Text>
                <Text style={styles.rankText}>#{rank}</Text>
              </View>
            </View>

            {/* Main Stats Row */}
            <View style={styles.statsRow}>
              <GlassCard style={styles.statCard} glowColor={colors.primary}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{level}</Text>
                <Text style={styles.statLabel}>LEVEL</Text>
              </GlassCard>
              <GlassCard style={styles.statCard} glowColor={colors.secondary}>
                <Text style={[styles.statValue, { color: colors.secondary }]}>
                  {xp.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>TOTAL XP</Text>
              </GlassCard>
              <GlassCard style={styles.statCard} glowColor={colors.success}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {currentStreak}
                </Text>
                <Text style={styles.statLabel}>STREAK</Text>
              </GlassCard>
            </View>

            {/* Skills Practiced */}
            {allSkillProgress.length > 0 && (
              <GlassCard style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Skills Practiced</Text>
                {allSkillProgress.map((skill, i) => {
                  const pct = Math.round((skill.completed / skill.total) * 100);
                  return (
                    <View key={i} style={styles.skillRow}>
                      <View style={styles.skillInfo}>
                        <Text style={styles.skillName}>{skill.name}</Text>
                        <Text style={styles.skillPct}>{pct}%</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <LinearGradient
                          colors={[colors.primary, colors.primaryDark]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressBarFill, { width: `${Math.min(pct, 100)}%` as any }]}
                        />
                      </View>
                    </View>
                  );
                })}
              </GlassCard>
            )}

            {/* Badges Earned */}
            <GlassCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                Badges Earned ({earnedBadgeDetails.length})
              </Text>
              {earnedBadgeDetails.length > 0 ? (
                <View style={styles.badgesGrid}>
                  {earnedBadgeDetails.map((badge, i) => (
                    <View key={i} style={styles.badgeItem}>
                      <View style={styles.badgeIconCircle}>
                        <Text style={styles.badgeIcon}>{badge.icon}</Text>
                      </View>
                      <Text style={styles.badgeName} numberOfLines={1}>
                        {badge.name}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No badges yet. Keep learning!</Text>
              )}
            </GlassCard>

            {/* Branding */}
            <View style={styles.branding}>
              <Text style={styles.brandingText}>Skilly</Text>
              <Text style={styles.brandingSubtext}>Master any skill</Text>
            </View>
          </ViewShot>

          {/* Share Button (outside capture area for cleaner share image) */}
          <TouchableOpacity onPress={handleShare} activeOpacity={0.8} style={styles.shareButton}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareGradient}
            >
              <Ionicons name="share-outline" size={20} color="#FFF" />
              <Text style={styles.shareText}>Share Profile</Text>
            </LinearGradient>
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
  backButton: {
    position: 'absolute',
    top: 8,
    left: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['5xl'],
    paddingBottom: 120,
  },
  captureArea: {
    backgroundColor: colors.background,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing['4xl'],
    marginBottom: spacing['2xl'],
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...glowShadow(colors.primary),
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  username: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  leagueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  leagueIcon: {
    fontSize: 16,
  },
  leagueText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 9,
  },

  // Section cards
  sectionCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },

  // Skills progress
  skillRow: {
    marginBottom: spacing.md,
  },
  skillInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  skillName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  skillPct: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Badges grid
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.lg * 2 - spacing.md * 3) / 4,
  },
  badgeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.xs,
  },
  badgeIcon: {
    fontSize: 22,
  },
  badgeName: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 9,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },

  // Branding
  branding: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  brandingText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  brandingSubtext: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // Share button
  shareButton: {
    marginTop: spacing.xl,
    ...glowShadow(colors.primary),
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  shareText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
