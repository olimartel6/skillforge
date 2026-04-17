import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../components/GlassCard';
import { AmbientGlow } from '../../components/AmbientGlow';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { colors, spacing, borderRadius, typography, glowShadow } from '../../utils/theme';
import { SkillTreeNode, UserProgress, Skill, Tier } from '../../utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase';
import { useUserStore } from '../../store/userStore';
import * as Haptics from 'expo-haptics';
import { t } from '../../i18n';

const TIER_CONFIG: Record<Tier, { label: string; colors: [string, string]; labelColor: string }> = {
  basics: { label: 'Basics', colors: [colors.primary, colors.primaryDark], labelColor: colors.success },
  intermediate: { label: 'Intermediate', colors: [colors.secondary, colors.secondaryDark], labelColor: colors.secondary },
  advanced: { label: 'Advanced', colors: [colors.success, colors.successDark], labelColor: colors.textSecondary },
};

const TIER_ORDER: Tier[] = ['basics', 'intermediate', 'advanced'];

function GlowNode({ children }: { children: React.ReactNode }) {
  const opacityAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1.0,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return <Animated.View style={{ opacity: opacityAnim }}>{children}</Animated.View>;
}

export function SkillTreeScreen() {
  const profile = useUserStore((s) => s.profile);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [nodes, setNodes] = useState<SkillTreeNode[]>([]);
  const [progress, setProgress] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id || !profile.selected_skill_id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [skillRes, nodesRes] = await Promise.all([
          supabase.from('skills').select('*').eq('id', profile.selected_skill_id!).single(),
          supabase.from('skill_tree_nodes').select('*').eq('skill_id', profile.selected_skill_id!).order('order'),
        ]);

        if (skillRes.data) setSkill(skillRes.data as Skill);
        if (nodesRes.data) setNodes(nodesRes.data as SkillTreeNode[]);

        // Load progress from local storage
        const storedProgress = await AsyncStorage.getItem('user_progress');
        if (storedProgress) {
          setProgress(new Set(JSON.parse(storedProgress)));
        }
      } catch {
        // Skill tree data may not be available
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [profile?.id, profile?.selected_skill_id]);

  const unlockedCount = nodes.filter((n) => progress.has(n.id)).length;

  if (loading) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.skeletonContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <SkeletonLoader width={36} height={36} borderRadius={18} />
              <View>
                <SkeletonLoader width={120} height={18} borderRadius={8} />
                <SkeletonLoader width={160} height={14} borderRadius={6} style={{ marginTop: 6 }} />
              </View>
            </View>
            <SkeletonLoader width={80} height={12} borderRadius={4} style={{ marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonLoader key={i} width={64} height={64} borderRadius={12} />
              ))}
            </View>
            <SkeletonLoader width={100} height={12} borderRadius={4} style={{ marginTop: 32, marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <SkeletonLoader key={i} width={64} height={64} borderRadius={12} />
              ))}
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AmbientGlow color={colors.primary} size={280} opacity={0.05} top={-40} left="60%" />
      <AmbientGlow color={colors.secondary} size={220} opacity={0.04} top="50%" left="-15%" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.skillIcon}>{skill?.icon || '🎯'}</Text>
            <View style={styles.headerText}>
              <Text style={styles.skillName}>{skill?.name || t('skillTree.defaultTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('skillTree.nodesUnlocked', { unlocked: unlockedCount, total: nodes.length })}
              </Text>
            </View>
          </View>

          {/* Tiers */}
          {TIER_ORDER.map((tier) => {
            const config = TIER_CONFIG[tier];
            const tierNodes = nodes.filter((n) => n.tier === tier).sort((a, b) => a.order - b.order);
            if (tierNodes.length === 0) return null;

            return (
              <View key={tier} style={styles.tierSection}>
                <Text style={[styles.tierLabel, { color: config.labelColor }]}>
                  {config.label.toUpperCase()}
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.nodesRow}
                >
                  {tierNodes.map((node, index) => {
                    const unlocked = progress.has(node.id);
                    return (
                      <React.Fragment key={node.id}>
                        {index > 0 && (
                          <View style={styles.connectorContainer}>
                            <View
                              style={[
                                styles.connector,
                                unlocked && progress.has(tierNodes[index - 1].id)
                                  ? { backgroundColor: config.colors[0] }
                                  : { backgroundColor: 'rgba(255,255,255,0.08)' },
                              ]}
                            />
                          </View>
                        )}
                        {unlocked ? (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                            }}
                          >
                            <GlowNode>
                              <View style={[styles.nodeWrapper, glowShadow(config.colors[0])]}>
                                <LinearGradient
                                  colors={config.colors}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={styles.nodeUnlocked}
                                >
                                  <Text style={styles.nodeEmoji}>
                                    {node.name.match(/\p{Emoji}/u)?.[0] || '⭐'}
                                  </Text>
                                  <Text style={styles.nodeNameUnlocked} numberOfLines={2}>
                                    {node.name}
                                  </Text>
                                </LinearGradient>
                              </View>
                            </GlowNode>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.nodeLocked}>
                            <Text style={styles.nodeEmojiLocked}>
                              {node.name.match(/\p{Emoji}/u)?.[0] || '🔒'}
                            </Text>
                            <Text style={styles.nodeNameLocked} numberOfLines={2}>
                              {node.name}
                            </Text>
                          </View>
                        )}
                      </React.Fragment>
                    );
                  })}
                </ScrollView>
              </View>
            );
          })}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing['3xl'],
    gap: spacing.md,
  },
  skillIcon: {
    fontSize: 36,
  },
  headerText: {
    flex: 1,
  },
  skillName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Tiers
  tierSection: {
    marginBottom: spacing['3xl'],
  },
  tierLabel: {
    ...typography.label,
    marginBottom: spacing.lg,
  },
  nodesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },

  // Nodes
  nodeWrapper: {
    borderRadius: borderRadius.lg,
  },
  nodeUnlocked: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  nodeLocked: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
    opacity: 0.5,
    padding: spacing.xs,
  },
  nodeEmoji: {
    fontSize: 20,
  },
  nodeEmojiLocked: {
    fontSize: 20,
    opacity: 0.4,
  },
  nodeNameUnlocked: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
  },
  nodeNameLocked: {
    fontSize: 8,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Connector
  connectorContainer: {
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  connector: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
});
