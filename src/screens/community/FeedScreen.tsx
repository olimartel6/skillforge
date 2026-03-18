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
import {
  FAKE_POSTS,
  AVATAR_GRADIENTS,
  PRACTICE_DESCRIPTIONS,
  POST_DAY_NUMBERS,
  POST_STREAKS,
} from './fakeData';
import * as Haptics from 'expo-haptics';

const PAGE_SIZE = 20;

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

export function FeedScreen() {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<CommunityPost[]>(FAKE_POSTS);
  const [loading, setLoading] = useState(false);

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
          <AvatarCircle username={item.user?.username || 'U'} gradientColors={gradientColors} />
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
      <View style={styles.root}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title}>Community</Text>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            false ? (
              <ActivityIndicator color={colors.primary} style={styles.footer} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet. Share your practice!</Text>
            </View>
          }
        />
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
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
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
  footer: {
    paddingVertical: spacing.xl,
  },
  emptyContainer: {
    paddingVertical: spacing['5xl'],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
