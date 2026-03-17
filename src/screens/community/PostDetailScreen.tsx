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
import { useCommunityStore } from '../../store/communityStore';

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

// Fake post data matching FeedScreen's fake posts
const FAKE_POSTS: Record<string, CommunityPost> = {
  fp1: { id: 'fp1', user_id: 'u1', challenge_id: 'c1', skill_id: 's1', media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true, created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), user: { id: 'u1', username: 'Maya', avatar_url: null }, skill: { name: 'Drawing', icon: '✏️' }, like_count: 47, comment_count: 12, is_liked: false },
  fp2: { id: 'fp2', user_id: 'u2', challenge_id: 'c2', skill_id: 's2', media_url: null, media_type: 'video', ai_feedback: null, is_shared: true, created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), user: { id: 'u2', username: 'Jake', avatar_url: null }, skill: { name: 'Guitar', icon: '🎸' }, like_count: 23, comment_count: 5, is_liked: true },
  fp3: { id: 'fp3', user_id: 'u3', challenge_id: 'c3', skill_id: 's3', media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true, created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), user: { id: 'u3', username: 'Sofia', avatar_url: null }, skill: { name: 'Magic Tricks', icon: '🪄' }, like_count: 89, comment_count: 21, is_liked: false },
  fp4: { id: 'fp4', user_id: 'u4', challenge_id: 'c4', skill_id: 's4', media_url: null, media_type: 'video', ai_feedback: null, is_shared: true, created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(), user: { id: 'u4', username: 'Leo', avatar_url: null }, skill: { name: 'Beatboxing', icon: '🥁' }, like_count: 156, comment_count: 34, is_liked: true },
  fp5: { id: 'fp5', user_id: 'u5', challenge_id: 'c5', skill_id: 's5', media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true, created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString(), user: { id: 'u5', username: 'Aria', avatar_url: null }, skill: { name: 'Dance', icon: '💃' }, like_count: 212, comment_count: 45, is_liked: false },
  fp6: { id: 'fp6', user_id: 'u6', challenge_id: 'c6', skill_id: 's6', media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true, created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(), user: { id: 'u6', username: 'Marcus', avatar_url: null }, skill: { name: 'Photography', icon: '📸' }, like_count: 78, comment_count: 9, is_liked: false },
  fp7: { id: 'fp7', user_id: 'u7', challenge_id: 'c7', skill_id: 's7', media_url: null, media_type: 'video', ai_feedback: null, is_shared: true, created_at: new Date(Date.now() - 1000 * 60 * 800).toISOString(), user: { id: 'u7', username: 'Zara', avatar_url: null }, skill: { name: 'Singing', icon: '🎤' }, like_count: 341, comment_count: 67, is_liked: true },
  fp8: { id: 'fp8', user_id: 'u8', challenge_id: 'c8', skill_id: 's8', media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true, created_at: new Date(Date.now() - 1000 * 60 * 1000).toISOString(), user: { id: 'u8', username: 'Kai', avatar_url: null }, skill: { name: 'Stand-up Comedy', icon: '😂' }, like_count: 534, comment_count: 89, is_liked: false },
  fp9: { id: 'fp9', user_id: 'u9', challenge_id: 'c9', skill_id: 's9', media_url: null, media_type: 'video', ai_feedback: null, is_shared: true, created_at: new Date(Date.now() - 1000 * 60 * 1200).toISOString(), user: { id: 'u9', username: 'Nina', avatar_url: null }, skill: { name: 'Piano', icon: '🎹' }, like_count: 167, comment_count: 28, is_liked: false },
  fp10: { id: 'fp10', user_id: 'u10', challenge_id: 'c10', skill_id: 's10', media_url: null, media_type: 'photo', ai_feedback: null, is_shared: true, created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), user: { id: 'u10', username: 'Alex', avatar_url: null }, skill: { name: 'Calligraphy', icon: '🖊️' }, like_count: 92, comment_count: 14, is_liked: true },
};

export function PostDetailScreen() {
  const route = useRoute<any>();
  const { practiceId } = route.params;
  const fetchComments = useCommunityStore((s) => s.fetchComments);
  const addComment = useCommunityStore((s) => s.addComment);

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Load post from fake data
    const fakePost = FAKE_POSTS[practiceId] || null;
    setPost(fakePost);

    // Load comments from local store
    fetchComments(practiceId).then(setComments);
  }, [practiceId, fetchComments]);

  const toggleLike = () => {
    if (!post) return;
    setPost({
      ...post,
      is_liked: !post.is_liked,
      like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1,
    });
  };

  const sendComment = () => {
    if (!commentText.trim()) return;

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

    addComment(practiceId, text);
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
