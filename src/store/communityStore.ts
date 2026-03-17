import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommunityPost, Comment } from '../utils/types';
import { FAKE_COMMENTS as SEED_COMMENTS } from '../screens/community/fakeData';

interface CommunityState {
  feed: CommunityPost[];
  isLoading: boolean;
  fetchFeed: (page?: number) => Promise<void>;
  likePractice: (practiceId: string) => void;
  unlikePractice: (practiceId: string) => void;
  addComment: (practiceId: string, text: string) => void;
  fetchComments: (practiceId: string) => Promise<Comment[]>;
  sharePractice: (sessionId: string) => Promise<void>;
}

const STORAGE_KEY = 'community_comments';

export const useCommunityStore = create<CommunityState>((set, get) => ({
  feed: [],
  isLoading: false,

  fetchFeed: async () => {
    // Feed is managed locally in FeedScreen with fake data.
    // This is a no-op; the store exposes the feed for screens that need it.
    set({ isLoading: false });
  },

  likePractice: (practiceId) => {
    set((state) => ({
      feed: state.feed.map((post) =>
        post.id === practiceId
          ? { ...post, like_count: post.like_count + 1, is_liked: true }
          : post
      ),
    }));
  },

  unlikePractice: (practiceId) => {
    set((state) => ({
      feed: state.feed.map((post) =>
        post.id === practiceId
          ? { ...post, like_count: Math.max(0, post.like_count - 1), is_liked: false }
          : post
      ),
    }));
  },

  addComment: (practiceId, text) => {
    const newComment: Comment = {
      id: `local-comment-${Date.now()}`,
      user_id: 'local-user',
      practice_id: practiceId,
      text,
      created_at: new Date().toISOString(),
      user: { id: 'local-user', username: 'You', avatar_url: null },
    };

    // Persist locally
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      const comments: Comment[] = stored ? JSON.parse(stored) : [];
      comments.push(newComment);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    });

    set((state) => ({
      feed: state.feed.map((post) =>
        post.id === practiceId
          ? { ...post, comment_count: post.comment_count + 1 }
          : post
      ),
    }));
  },

  fetchComments: async (practiceId) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const allComments: Comment[] = stored ? JSON.parse(stored) : [];
      const forPost = allComments.filter((c) => c.practice_id === practiceId);
      // Include fake seed comments for demo posts
      const seed = SEED_COMMENTS.filter((c) => c.practice_id === practiceId);
      return [...seed, ...forPost];
    } catch {
      return [];
    }
  },

  sharePractice: async (_sessionId) => {
    // No-op locally. In the future this could mark a session as shared in AsyncStorage.
  },
}));
