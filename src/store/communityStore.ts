import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { CommunityPost, Comment } from '../utils/types';

interface CommunityState {
  feed: CommunityPost[];
  isLoading: boolean;
  fetchFeed: (page?: number) => Promise<void>;
  likePractice: (practiceId: string, userId: string) => Promise<void>;
  unlikePractice: (practiceId: string, userId: string) => Promise<void>;
  addComment: (practiceId: string, userId: string, text: string) => Promise<void>;
  fetchComments: (practiceId: string) => Promise<Comment[]>;
  sharePractice: (sessionId: string) => Promise<void>;
}

const PAGE_SIZE = 20;

export const useCommunityStore = create<CommunityState>((set, get) => ({
  feed: [],
  isLoading: false,

  fetchFeed: async (page = 0) => {
    set({ isLoading: true });
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          user:users!practice_sessions_user_id_fkey(id, username, avatar_url),
          skill:skills!practice_sessions_skill_id_fkey(name, icon)
        `)
        .eq('is_shared', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Fetch like and comment counts plus current user's like status
      const posts: CommunityPost[] = await Promise.all(
        (data ?? []).map(async (session: any) => {
          const [likesRes, commentsRes] = await Promise.all([
            supabase
              .from('practice_likes')
              .select('user_id', { count: 'exact' })
              .eq('practice_id', session.id),
            supabase
              .from('practice_comments')
              .select('id', { count: 'exact' })
              .eq('practice_id', session.id),
          ]);

          return {
            ...session,
            user: session.user,
            skill: session.skill,
            like_count: likesRes.count ?? 0,
            comment_count: commentsRes.count ?? 0,
            is_liked: false, // will be updated client-side if needed
          } as CommunityPost;
        })
      );

      if (page === 0) {
        set({ feed: posts, isLoading: false });
      } else {
        set((state) => ({
          feed: [...state.feed, ...posts],
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      set({ isLoading: false });
    }
  },

  likePractice: async (practiceId, userId) => {
    try {
      const { error } = await supabase
        .from('practice_likes')
        .insert({ practice_id: practiceId, user_id: userId });

      if (error) throw error;

      set((state) => ({
        feed: state.feed.map((post) =>
          post.id === practiceId
            ? { ...post, like_count: post.like_count + 1, is_liked: true }
            : post
        ),
      }));
    } catch (error) {
      console.error('Error liking practice:', error);
    }
  },

  unlikePractice: async (practiceId, userId) => {
    try {
      const { error } = await supabase
        .from('practice_likes')
        .delete()
        .eq('practice_id', practiceId)
        .eq('user_id', userId);

      if (error) throw error;

      set((state) => ({
        feed: state.feed.map((post) =>
          post.id === practiceId
            ? { ...post, like_count: Math.max(0, post.like_count - 1), is_liked: false }
            : post
        ),
      }));
    } catch (error) {
      console.error('Error unliking practice:', error);
    }
  },

  addComment: async (practiceId, userId, text) => {
    try {
      const { error } = await supabase
        .from('practice_comments')
        .insert({ practice_id: practiceId, user_id: userId, text });

      if (error) throw error;

      set((state) => ({
        feed: state.feed.map((post) =>
          post.id === practiceId
            ? { ...post, comment_count: post.comment_count + 1 }
            : post
        ),
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  },

  fetchComments: async (practiceId) => {
    try {
      const { data, error } = await supabase
        .from('practice_comments')
        .select(`
          *,
          user:users!practice_comments_user_id_fkey(id, username, avatar_url)
        `)
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as Comment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  sharePractice: async (sessionId) => {
    try {
      const { error } = await supabase
        .from('practice_sessions')
        .update({ is_shared: true })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error sharing practice:', error);
    }
  },
}));
