import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { CommunityPost, Comment } from '../../utils/types';
import { supabase } from '../../services/supabase';
import { useUserStore } from '../../store/userStore';

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

function AvatarCircle({ username, size = 36 }: { username: string; size?: number }) {
  return (
    <LinearGradient
      colors={[colors.secondary, colors.secondaryDark]}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>
        {username.charAt(0).toUpperCase()}
      </Text>
    </LinearGradient>
  );
}

export function PostDetailScreen() {
  const route = useRoute<any>();
  const { practiceId } = route.params;
  const profile = useUserStore((s) => s.profile);
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          user:users!user_id(id, username, avatar_url),
          skill:skills!skill_id(name, icon)
        `)
        .eq('id', practiceId)
        .single();

      if (error) throw error;

      const [likesRes, commentsRes, likedRes] = await Promise.all([
        supabase.from('likes').select('*', { count: 'exact', head: true }).eq('practice_id', practiceId),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('practice_id', practiceId),
        supabase.from('likes').select('id').eq('practice_id', practiceId).eq('user_id', profile.id).maybeSingle(),
      ]);

      setPost({
        ...data,
        user: data.user,
        skill: data.skill,
        like_count: likesRes.count || 0,
        comment_count: commentsRes.count || 0,
        is_liked: !!likedRes.data,
      } as CommunityPost);
    } catch (err) {
      console.error('Error fetching post:', err);
    }
  }, [practiceId, profile?.id]);

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users!user_id(id, username, avatar_url)
        `)
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((data || []) as Comment[]);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [practiceId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchPost(), fetchComments()]);
      setLoading(false);
    };
    load();
  }, [fetchPost, fetchComments]);

  const toggleLike = async () => {
    if (!profile?.id || !post) return;

    const prevPost = post;
    setPost({
      ...post,
      is_liked: !post.is_liked,
      like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1,
    });

    try {
      if (prevPost.is_liked) {
        await supabase.from('likes').delete().eq('practice_id', post.id).eq('user_id', profile.id);
      } else {
        await supabase.from('likes').insert({ practice_id: post.id, user_id: profile.id });
      }
    } catch (err) {
      setPost(prevPost);
    }
  };

  const sendComment = async () => {
    if (!profile?.id || !commentText.trim()) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          practice_id: practiceId,
          user_id: profile.id,
          text: commentText.trim(),
        })
        .select(`*, user:users!user_id(id, username, avatar_url)`)
        .single();

      if (error) throw error;

      setComments((prev) => [...prev, data as Comment]);
      setCommentText('');

      if (post) {
        setPost({ ...post, comment_count: post.comment_count + 1 });
      }
    } catch (err) {
      console.error('Error sending comment:', err);
    } finally {
      setSending(false);
    }
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

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentRow}>
      <AvatarCircle username={item.user?.username || 'U'} size={28} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.user?.username || 'User'}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.commentTime}>{timeAgo(item.created_at)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              post ? (
                <View style={styles.postSection}>
                  {/* Post Header */}
                  <View style={styles.postHeader}>
                    <AvatarCircle username={post.user?.username || 'U'} size={44} />
                    <View style={styles.postHeaderText}>
                      <Text style={styles.postUsername}>{post.user?.username || 'User'}</Text>
                      <Text style={styles.postMeta}>
                        {post.skill?.icon} {post.skill?.name} · {timeAgo(post.created_at)}
                      </Text>
                    </View>
                  </View>

                  {/* Media Placeholder */}
                  <View style={styles.mediaPlaceholder}>
                    <Text style={styles.mediaPlaceholderText}>Practice photo/video</Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.postActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={toggleLike}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionIcon}>{post.is_liked ? '❤️' : '🤍'}</Text>
                      <Text style={[styles.actionCount, post.is_liked && { color: colors.error }]}>
                        {post.like_count}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.actionButton}>
                      <Text style={styles.actionIcon}>💬</Text>
                      <Text style={styles.actionCount}>{post.comment_count}</Text>
                    </View>
                  </View>

                  {/* Comments Header */}
                  <Text style={styles.commentsHeader}>Comments</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <Text style={styles.noComments}>No comments yet. Be the first!</Text>
            }
          />

          {/* Comment Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!commentText.trim() || sending) && styles.sendDisabled]}
              onPress={sendComment}
              disabled={!commentText.trim() || sending}
              activeOpacity={0.7}
            >
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },

  // Avatar
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Post Section
  postSection: {
    marginBottom: spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  postHeaderText: {
    flex: 1,
  },
  postUsername: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  postMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Media
  mediaPlaceholder: {
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  mediaPlaceholderText: {
    ...typography.body,
    color: colors.textMuted,
  },

  // Actions
  postActions: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionCount: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Comments
  commentsHeader: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  commentRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  commentText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  commentTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  noComments: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: spacing.md,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
