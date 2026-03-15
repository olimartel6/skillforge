import React, { useEffect, useState, useCallback } from 'react';
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
import { supabase } from '../../services/supabase';
import { useUserStore } from '../../store/userStore';

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

function AvatarCircle({ username }: { username: string }) {
  return (
    <LinearGradient
      colors={[colors.secondary, colors.secondaryDark]}
      style={styles.avatar}
    >
      <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
    </LinearGradient>
  );
}

const FAKE_POSTS: CommunityPost[] = [
  {
    id: 'fp1', user_id: 'u1', challenge_id: 'c1', skill_id: 's1',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    user: { id: 'u1', username: 'Maya', avatar_url: null },
    skill: { name: 'Drawing', icon: '✏️' },
    like_count: 47, comment_count: 12, is_liked: false,
  },
  {
    id: 'fp2', user_id: 'u2', challenge_id: 'c2', skill_id: 's2',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    user: { id: 'u2', username: 'Jake', avatar_url: null },
    skill: { name: 'Guitar', icon: '🎸' },
    like_count: 23, comment_count: 5, is_liked: true,
  },
  {
    id: 'fp3', user_id: 'u3', challenge_id: 'c3', skill_id: 's3',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    user: { id: 'u3', username: 'Sofia', avatar_url: null },
    skill: { name: 'Magic Tricks', icon: '🪄' },
    like_count: 89, comment_count: 21, is_liked: false,
  },
  {
    id: 'fp4', user_id: 'u4', challenge_id: 'c4', skill_id: 's4',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    user: { id: 'u4', username: 'Leo', avatar_url: null },
    skill: { name: 'Beatboxing', icon: '🥁' },
    like_count: 156, comment_count: 34, is_liked: true,
  },
  {
    id: 'fp5', user_id: 'u5', challenge_id: 'c5', skill_id: 's5',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    user: { id: 'u5', username: 'Aria', avatar_url: null },
    skill: { name: 'Dance', icon: '💃' },
    like_count: 212, comment_count: 45, is_liked: false,
  },
  {
    id: 'fp6', user_id: 'u6', challenge_id: 'c6', skill_id: 's6',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    user: { id: 'u6', username: 'Marcus', avatar_url: null },
    skill: { name: 'Photography', icon: '📸' },
    like_count: 78, comment_count: 9, is_liked: false,
  },
  {
    id: 'fp7', user_id: 'u7', challenge_id: 'c7', skill_id: 's7',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - 1000 * 60 * 800).toISOString(),
    user: { id: 'u7', username: 'Zara', avatar_url: null },
    skill: { name: 'Singing', icon: '🎤' },
    like_count: 341, comment_count: 67, is_liked: true,
  },
  {
    id: 'fp8', user_id: 'u8', challenge_id: 'c8', skill_id: 's8',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - 1000 * 60 * 1000).toISOString(),
    user: { id: 'u8', username: 'Kai', avatar_url: null },
    skill: { name: 'Stand-up Comedy', icon: '😂' },
    like_count: 534, comment_count: 89, is_liked: false,
  },
  {
    id: 'fp9', user_id: 'u9', challenge_id: 'c9', skill_id: 's9',
    media_url: null, media_type: 'video', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
    user: { id: 'u9', username: 'Nina', avatar_url: null },
    skill: { name: 'Piano', icon: '🎹' },
    like_count: 167, comment_count: 28, is_liked: false,
  },
  {
    id: 'fp10', user_id: 'u10', challenge_id: 'c10', skill_id: 's10',
    media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true,
    created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    user: { id: 'u10', username: 'Alex', avatar_url: null },
    skill: { name: 'Calligraphy', icon: '🖊️' },
    like_count: 92, comment_count: 14, is_liked: true,
  },
];

export function FeedScreen() {
  const navigation = useNavigation<any>();
  const profile = useUserStore((s) => s.profile);
  const [posts, setPosts] = useState<CommunityPost[]>(FAKE_POSTS);
  const [loading, setLoading] = useState(false);

  const toggleLike = (post: CommunityPost) => {
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

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('PostDetail', { practiceId: item.id })}
      style={styles.postCard}
    >
      {/* Header */}
      <View style={styles.postHeader}>
        <AvatarCircle username={item.user?.username || 'U'} />
        <View style={styles.postHeaderText}>
          <Text style={styles.postUsername}>{item.user?.username || 'User'}</Text>
          <Text style={styles.postMeta}>
            Day {Math.floor(Math.random() * 28) + 1} · {item.skill?.icon} {item.skill?.name} · <Text style={{ color: colors.primary }}>🔥 {Math.floor(Math.random() * 25) + 3}</Text>
          </Text>
        </View>
        <Text style={styles.postTime}>{timeAgo(item.created_at)}</Text>
      </View>

      {/* Media Placeholder */}
      <View style={styles.mediaPlaceholder}>
        <Text style={styles.mediaPlaceholderText}>Practice photo/video</Text>
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

  // Media
  mediaPlaceholder: {
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholderText: {
    ...typography.bodySmall,
    color: colors.textMuted,
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
