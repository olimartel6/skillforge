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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { CommunityPost, Comment } from '../../utils/types';
import {
  FAKE_POSTS,
  FAKE_POSTS_BY_ID,
  FAKE_COMMENTS,
  AVATAR_GRADIENTS,
  PRACTICE_DESCRIPTIONS,
  POST_DAY_NUMBERS,
  POST_STREAKS,
} from './fakeData';
import * as Haptics from 'expo-haptics';

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

function getAvatarGradient(username: string): [string, string] {
  const postIndex = FAKE_POSTS.findIndex((p) => p.user?.username === username);
  if (postIndex >= 0) {
    return AVATAR_GRADIENTS[postIndex % AVATAR_GRADIENTS.length];
  }
  // Fallback: hash the username to pick a gradient
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function AvatarCircle({ username, size = 36 }: { username: string; size?: number }) {
  const gradientColors = getAvatarGradient(username);
  return (
    <LinearGradient
      colors={gradientColors}
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

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Load post from shared fake data
    const fakePost = FAKE_POSTS_BY_ID[practiceId] || null;
    setPost(fakePost);

    // Load comments from fake data
    const postComments = FAKE_COMMENTS.filter((c) => c.practice_id === practiceId);
    setComments(postComments);
  }, [practiceId]);

  const toggleLike = () => {
    if (!post) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setPost({
      ...post,
      is_liked: !post.is_liked,
      like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1,
    });
  };

  const sendComment = () => {
    if (!commentText.trim()) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    setSending(true);
    const text = commentText.trim();

    const newComment: Comment = {
      id: `local-comment-${Date.now()}`,
      user_id: 'local-user',
      practice_id: practiceId,
      text,
      created_at: new Date().toISOString(),
      user: { id: 'local-user', username: 'You', avatar_url: null },
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText('');

    if (post) {
      setPost({ ...post, comment_count: post.comment_count + 1 });
    }

    setSending(false);
  };

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

  const skillName = post?.skill?.name || '';
  const desc = PRACTICE_DESCRIPTIONS[skillName];
  const dayNumber = post ? (POST_DAY_NUMBERS[post.id] || 1) : 1;
  const streak = post ? (POST_STREAKS[post.id] || 3) : 3;

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
                        Day {dayNumber} · {post.skill?.icon} {post.skill?.name} · <Text style={{ color: colors.primary }}>🔥 {streak}</Text> · {timeAgo(post.created_at)}
                      </Text>
                    </View>
                  </View>

                  {/* Practice description */}
                  {desc && (
                    <Text style={styles.practiceDescription}>{desc.text}</Text>
                  )}

                  {/* Media Preview */}
                  <View style={styles.mediaPlaceholder}>
                    <Text style={styles.mediaPlaceholderText}>{desc?.emoji || (post.media_type === 'video' ? '🎬' : '📷')}</Text>
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
  practiceDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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
    fontSize: 40,
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
