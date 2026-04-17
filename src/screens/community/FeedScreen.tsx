import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { CommunityPost } from '../../utils/types';
import { useUserStore } from '../../store/userStore';
import {
  FAKE_POSTS,
  AVATAR_GRADIENTS,
  PRACTICE_DESCRIPTIONS,
  POST_DAY_NUMBERS,
  POST_STREAKS,
} from './fakeData';
import * as Haptics from 'expo-haptics';
import { t } from '../../i18n';

import { LeaderboardScreen } from './LeaderboardScreen';
import { LeagueScreen } from './LeagueScreen';
import { CommDailyChallengeScreen } from './DailyChallengeScreen';
import { GlobalLeaderboardScreen } from './GlobalLeaderboardScreen';

const PAGE_SIZE = 20;

type CommunityTab = 'leaderboard' | 'league' | 'challenge' | 'rankings';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function AvatarCircle({ username, gradientColors }: { username: string; gradientColors: [string, string] }) {
  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.avatar}
    >
      <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
    </LinearGradient>
  );
}

function TabBar({ activeTab, onTabPress }: { activeTab: CommunityTab; onTabPress: (tab: CommunityTab) => void }) {
  const tabs: { key: CommunityTab; label: string }[] = [
    { key: 'leaderboard', label: t('leaderboard.title') },
    { key: 'rankings', label: t('globalLeaderboard.tab') },
    { key: 'league', label: t('league.title') },
    { key: 'challenge', label: t('challenge.title') },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          activeOpacity={0.7}
          onPress={() => {
            try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
            onTabPress(tab.key);
          }}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
          {activeTab === tab.key && (
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.tabIndicator}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function FeedContent() {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<CommunityPost[]>(FAKE_POSTS);
  const [loading] = useState(false);

  const toggleLike = (post: CommunityPost) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== post.id) return p;
        return {
          ...p,
          is_liked: !p.is_liked,
          like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1,
        };
      })
    );
  };

  const renderPost = ({ item, index }: { item: CommunityPost; index: number }) => {
    const gradientColors = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
    const skillName = item.skill?.name || '';
    const desc = PRACTICE_DESCRIPTIONS[skillName];
    const dayNumber = POST_DAY_NUMBERS[item.id] || 1;
    const streak = POST_STREAKS[item.id] || 3;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PostDetail', { practiceId: item.id })}
        style={styles.postCard}
      >
        {/* Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PublicProfile', {
              userId: item.user?.id,
              username: item.user?.username || 'User',
              xp: item.like_count * 10,
              skill: item.skill?.name || 'Learning',
              isCurrentUser: false,
            })}
          >
            <AvatarCircle username={item.user?.username || 'U'} gradientColors={gradientColors} />
          </TouchableOpacity>
          <View style={styles.postHeaderText}>
            <Text style={styles.postUsername}>{item.user?.username || 'User'}</Text>
            <Text style={styles.postMeta}>
              Day {dayNumber} · {item.skill?.icon} {item.skill?.name} · <Text style={{ color: colors.primary }}>🔥 {streak}</Text>
            </Text>
          </View>
          <Text style={styles.postTime}>{timeAgo(item.created_at)}</Text>
        </View>

        {/* Practice description */}
        {desc && (
          <Text style={styles.practiceDescription}>{desc.text}</Text>
        )}

        {/* Media Preview */}
        <View style={styles.mediaPlaceholder}>
          <Text style={styles.mediaPlaceholderText}>{desc?.emoji || (item.media_type === 'video' ? '🎬' : '📷')}</Text>
        </View>

        {/* Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>{item.is_liked ? '❤️' : '🤍'}</Text>
            <Text style={[styles.actionCount, item.is_liked && { color: colors.error }]}>
              {item.like_count}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PostDetail', { practiceId: item.id })}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>{item.comment_count}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('community.noPosts')}</Text>
        </View>
      }
    />
  );
}

export function FeedScreen() {
  const navigation = useNavigation<any>();
  const profile = useUserStore((s) => s.profile);
  const [activeTab, setActiveTab] = useState<CommunityTab>('leaderboard');

  const isPremium = profile?.premium_expires_at
    ? new Date(profile.premium_expires_at) > new Date()
    : false;

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.paywallContainer}>
          <Text style={{ fontSize: 48, marginBottom: 20 }}>👥</Text>
          <Text style={styles.paywallTitle}>{t('community.unlockTitle')}</Text>
          <Text style={styles.paywallSub}>{t('community.unlockSub')}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProfileTab', { screen: 'Subscription' })}
          >
            <LinearGradient
              colors={['#FF6B35', '#FF3D00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.paywallBtn}
            >
              <Text style={styles.paywallBtnText}>{t('community.goPremium')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
        {activeTab === 'leaderboard' && <LeaderboardScreen />}
        {activeTab === 'rankings' && <GlobalLeaderboardScreen />}
        {activeTab === 'league' && <LeagueScreen />}
        {activeTab === 'challenge' && <CommDailyChallengeScreen />}
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
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: 1,
  },

  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
    paddingTop: spacing.lg,
  },

  // Post Card
  postCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  postHeaderText: {
    flex: 1,
  },
  postUsername: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  postMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  postTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  practiceDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },

  // Media
  mediaPlaceholder: {
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholderText: {
    fontSize: 40,
  },

  // Actions
  postActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Footer / Empty
  emptyContainer: {
    paddingVertical: spacing['5xl'],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  paywallContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['4xl'],
    backgroundColor: colors.background,
  },
  paywallTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  paywallSub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['4xl'],
  },
  paywallBtn: {
    padding: 16,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    paddingHorizontal: 48,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  paywallBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
