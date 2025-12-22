import { PostService } from '@/services/posts';
import { PostComment, PostWithDetails, User } from '@/types';
import { create } from 'zustand';

type FeedLayout = 'hero' | 'compact';

export type FeedPost = PostWithDetails & {
  layout: FeedLayout;
  accentColor?: string;
  likedByMe?: boolean;
  muted?: boolean;
};

interface FetchArgs {
  service: PostService;
  userId: string;
  followingIds?: string[];
  limit?: number;
}

interface FeedState {
  posts: FeedPost[];
  cursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface FeedActions {
  hydrate: (posts: FeedPost[], cursor: string | null) => void;
  fetch: (args: FetchArgs) => Promise<void>;
  refresh: (args: FetchArgs) => Promise<void>;
  loadMore: (args: FetchArgs) => Promise<void>;
  toggleLike: (postId: string, userId: string, service: PostService) => Promise<void>;
  addComment: (
    postId: string,
    userId: string,
    content: string,
    service: PostService,
  ) => Promise<PostComment & { user?: User }>;
  refreshComments: (postId: string, service: PostService) => Promise<void>;
  setMuted: (postId: string, muted: boolean) => void;
  clearError: () => void;
}

type FeedStore = FeedState & FeedActions;

const toFeedPost = (post: PostWithDetails, currentUserId: string): FeedPost => {
  const layout: FeedLayout = post.mediaUrls && post.mediaUrls.length > 0 ? 'hero' : 'compact';
  const likedByMe = (post.likes ?? []).some((like) => like.userId === currentUserId);

  return {
    ...post,
    layout,
    likedByMe,
    accentColor: layout === 'compact' ? '#1F6D4A' : undefined,
    muted: true,
  };
};

export const useFeedStore = create<FeedStore>((set, get) => ({
  posts: [],
  cursor: null,
  hasMore: true,
  isLoading: false,
  isRefreshing: false,
  error: null,

  hydrate: (posts, cursor) => set({ posts, cursor, hasMore: cursor !== null }),

  fetch: async ({ service, userId, followingIds = [], limit = 10 }) => {
    set({ isLoading: true, error: null });
    try {
      const { posts, nextCursor } = await service.getFeedWithDetails(userId, followingIds, limit);
      set({
        posts: posts.map((p) => toFeedPost(p, userId)),
        cursor: nextCursor,
        hasMore: Boolean(nextCursor),
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to fetch feed', err);
      set({ error: 'Failed to load feed', isLoading: false });
    }
  },

  refresh: async ({ service, userId, followingIds = [], limit = 10 }) => {
    set({ isRefreshing: true, error: null });
    try {
      const { posts, nextCursor } = await service.getFeedWithDetails(userId, followingIds, limit);
      set({
        posts: posts.map((p) => toFeedPost(p, userId)),
        cursor: nextCursor,
        hasMore: Boolean(nextCursor),
        isRefreshing: false,
      });
    } catch (err) {
      console.error('Failed to refresh feed', err);
      set({ error: 'Failed to refresh', isRefreshing: false });
    }
  },

  loadMore: async ({ service, userId, followingIds = [], limit = 10 }) => {
    const { hasMore, cursor, posts } = get();
    if (!hasMore || get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const { posts: nextPosts, nextCursor } = await service.getFeedWithDetails(
        userId,
        followingIds,
        limit,
        cursor ?? undefined,
      );

      set({
        posts: [...posts, ...nextPosts.map((p) => toFeedPost(p, userId))],
        cursor: nextCursor,
        hasMore: Boolean(nextCursor),
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to load more feed', err);
      set({ error: 'Failed to load more', isLoading: false });
    }
  },

  toggleLike: async (postId, userId, service) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likeCount: post.likedByMe ? Math.max(0, post.likeCount - 1) : post.likeCount + 1,
            }
          : post,
      ),
    }));

    try {
      const { liked, likeCount } = await service.toggleLike(postId, userId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, likedByMe: liked, likeCount } : post,
        ),
      }));
    } catch (err) {
      console.error('Toggle like failed', err);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likedByMe: !post.likedByMe,
                likeCount: post.likedByMe ? Math.max(0, post.likeCount - 1) : post.likeCount + 1,
              }
            : post,
        ),
        error: 'Failed to like post',
      }));
    }
  },

  addComment: async (postId, userId, content, service) => {
    const comment = await service.addCommentWithUser(postId, userId, content);
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentCount: post.commentCount + 1,
              comments: [...(post.comments ?? []), comment],
            }
          : post,
      ),
    }));
    return comment;
  },

  refreshComments: async (postId, service) => {
    try {
      const comments = await service.getComments(postId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments,
              }
            : post,
        ),
      }));
    } catch (err) {
      console.error('Failed to refresh comments', err);
    }
  },

  setMuted: (postId, muted) =>
    set((state) => ({
      posts: state.posts.map((post) => (post.id === postId ? { ...post, muted } : post)),
    })),

  clearError: () => set({ error: null }),
}));
