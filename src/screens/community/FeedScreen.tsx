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

export function FeedScreen() {
  const navigation = useNavigation<any>();
  const profile = useUserStore((s) => s.profile);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (offset: number = 0) => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          user:users!user_id(id, username, avatar_url),
          skill:skills!skill_id(name, icon)
        `)
        .eq('is_shared', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;

      const enriched: CommunityPost[] = await Promise.all(
        (data || []).map(async (session: any) => {
          const [likesRes, commentsRes, likedRes] = await Promise.all([
            supabase.from('likes').select('*', { count: 'exact', head: true }).eq('practice_id', session.id),
            supabase.from('comments').select('*', { count: 'exact', head: true }).eq('practice_id', session.id),
            supabase.from('likes').select('id').eq('practice_id', session.id).eq('user_id', profile.id).maybeSingle(),
          ]);

          return {
            ...session,
            user: session.user,
            skill: session.skill,
            like_count: likesRes.count || 0,
            comment_count: commentsRes.count || 0,
            is_liked: !!likedRes.data,
          };
        })
      );

      if (offset === 0) {
        setPosts(enriched);
      } else {
        setPosts((prev) => [...prev, ...enriched]);
      }
      setHasMore(enriched.length === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching feed:', err);
    }
  }, [profile?.id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchPosts(0);
      setLoading(false);
    };
    load();
  }, [fetchPosts]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchPosts(posts.length);
    setLoadingMore(false);
  };

  const toggleLike = async (post: CommunityPost) => {
    if (!profile?.id) return;

    const prevPosts = posts;
    const newPosts = posts.map((p) => {
      if (p.id !== post.id) return p;
      return {
        ...p,
        is_liked: !p.is_liked,
        like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1,
      };
    });
    setPosts(newPosts);

    try {
      if (post.is_liked) {
        await supabase.from('likes').delete().eq('practice_id', post.id).eq('user_id', profile.id);
      } else {
        await supabase.from('likes').insert({ practice_id: post.id, user_id: profile.id });
      }
    } catch (err) {
      setPosts(prevPosts);
    }
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
            {item.skill?.icon} {item.skill?.name}
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
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
