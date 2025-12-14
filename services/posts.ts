/**
 * Posts Service
 *
 * Handles post operations including CRUD, feed generation,
 * likes, and comments.
 */

import type { IDatabaseAdapter, IStorageAdapter } from '@/adapters/types';
import type { Post, PostComment, PostCreateInput, PostLike, PostWithDetails, User } from '@/types';

export interface CreatePostData {
  userId: string;
  activityId?: string;
  caption?: string;
  mediaUrls?: string[];
  mapSnapshotUrl?: string;
  stats?: Post['stats'];
}

/**
 * Post Service
 *
 * Provides post management and feed functionality.
 */
export class PostService {
  constructor(private database: IDatabaseAdapter, private storage: IStorageAdapter) {}

  /**
   * Create a new post
   */
  async createPost(data: CreatePostData): Promise<Post> {
    const postInput: PostCreateInput = {
      userId: data.userId,
      activityId: data.activityId ?? null,
      caption: data.caption ?? null,
      mediaUrls: data.mediaUrls ?? [],
      mapSnapshotUrl: data.mapSnapshotUrl ?? null,
      stats: data.stats ?? null,
    };

    return this.database.create('post', postInput);
  }

  /**
   * Get a post by ID
   */
  async getPostById(postId: string): Promise<Post | null> {
    return this.database.get('post', postId);
  }

  /**
   * Get a post with all its details (user, activity, likes, comments)
   */
  async getPostWithDetails(postId: string): Promise<PostWithDetails | null> {
    const post = await this.database.get('post', postId);
    if (!post) return null;

    // Fetch related data in parallel
    const [user, activity, likes, comments] = await Promise.all([
      this.database.get('user', post.userId),
      post.activityId ? this.database.get('activity', post.activityId) : Promise.resolve(null),
      this.database.query('postLike', [{ field: 'postId', operator: 'eq', value: postId }]),
      this.database.list('postComment', {
        where: [{ field: 'postId', operator: 'eq', value: postId }],
        orderBy: [{ field: 'createdAt', direction: 'asc' }],
      }),
    ]);

    // Fetch user details for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const commentUser = await this.database.get('user', comment.userId);
        return { ...comment, user: commentUser ?? undefined };
      }),
    );

    return {
      ...post,
      user: user ?? undefined,
      activity: activity ?? undefined,
      likes,
      comments: commentsWithUsers,
    };
  }

  /**
   * Get feed posts (from users the current user follows)
   */
  async getFeedPosts(
    userId: string,
    followingIds: string[],
    limit: number = 20,
    cursor?: string,
  ): Promise<{ posts: Post[]; nextCursor: string | null }> {
    // Include the user's own posts and posts from followed users
    const userIds = [userId, ...followingIds];

    // Fetch posts from all these users
    const result = await this.database.paginate('post', {
      where: [{ field: 'userId', operator: 'in', value: userIds }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit,
      cursor,
    });

    return {
      posts: result.data,
      nextCursor: result.nextCursor,
    };
  }

  /**
   * Get posts by a specific user
   */
  async getUserPosts(
    userId: string,
    limit: number = 20,
    cursor?: string,
  ): Promise<{ posts: Post[]; nextCursor: string | null }> {
    const result = await this.database.paginate('post', {
      where: [{ field: 'userId', operator: 'eq', value: userId }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit,
      cursor,
    });

    return {
      posts: result.data,
      nextCursor: result.nextCursor,
    };
  }

  /**
   * Like a post
   */
  async likePost(postId: string, userId: string): Promise<PostLike> {
    // Check if already liked
    const existingLikes = await this.database.query('postLike', [
      { field: 'postId', operator: 'eq', value: postId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    if (existingLikes.length > 0) {
      return existingLikes[0];
    }

    // Create like
    const like = await this.database.create('postLike', {
      postId,
      userId,
    });

    // Update post like count
    const post = await this.database.get('post', postId);
    if (post) {
      await this.database.update('post', postId, {
        likeCount: post.likeCount + 1,
      });
    }

    return like;
  }

  /**
   * Unlike a post
   */
  async unlikePost(postId: string, userId: string): Promise<void> {
    const likes = await this.database.query('postLike', [
      { field: 'postId', operator: 'eq', value: postId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    if (likes.length === 0) {
      return;
    }

    // Delete like
    await this.database.delete('postLike', likes[0].id);

    // Update post like count
    const post = await this.database.get('post', postId);
    if (post && post.likeCount > 0) {
      await this.database.update('post', postId, {
        likeCount: post.likeCount - 1,
      });
    }
  }

  /**
   * Check if a user has liked a post
   */
  async hasLiked(postId: string, userId: string): Promise<boolean> {
    const likes = await this.database.query('postLike', [
      { field: 'postId', operator: 'eq', value: postId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);
    return likes.length > 0;
  }

  /**
   * Add a comment to a post
   */
  async addComment(postId: string, userId: string, content: string): Promise<PostComment> {
    const comment = await this.database.create('postComment', {
      postId,
      userId,
      content,
    });

    // Update post comment count
    const post = await this.database.get('post', postId);
    if (post) {
      await this.database.update('post', postId, {
        commentCount: post.commentCount + 1,
      });
    }

    return comment;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.database.get('postComment', commentId);

    if (!comment || comment.userId !== userId) {
      return; // Can only delete own comments
    }

    await this.database.delete('postComment', commentId);

    // Update post comment count
    const post = await this.database.get('post', comment.postId);
    if (post && post.commentCount > 0) {
      await this.database.update('post', comment.postId, {
        commentCount: post.commentCount - 1,
      });
    }
  }

  /**
   * Get comments for a post
   */
  async getComments(
    postId: string,
    limit: number = 50,
  ): Promise<(PostComment & { user?: User })[]> {
    const comments = await this.database.list('postComment', {
      where: [{ field: 'postId', operator: 'eq', value: postId }],
      orderBy: [{ field: 'createdAt', direction: 'asc' }],
      limit,
    });

    // Fetch user details for each comment
    return Promise.all(
      comments.map(async (comment) => {
        const user = await this.database.get('user', comment.userId);
        return { ...comment, user: user ?? undefined };
      }),
    );
  }

  /**
   * Upload post media
   */
  async uploadPostMedia(
    userId: string,
    postId: string,
    file: Blob,
    index: number = 0,
  ): Promise<string> {
    const path = `${userId}/${postId}/${index}.jpg`;
    await this.storage.upload('posts', path, file, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    return this.storage.getPublicUrl('posts', path);
  }

  /**
   * Delete a post and all its likes/comments
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.database.get('post', postId);

    if (!post || post.userId !== userId) {
      return; // Can only delete own posts
    }

    // Delete likes
    const likes = await this.database.query('postLike', [
      { field: 'postId', operator: 'eq', value: postId },
    ]);
    await Promise.all(likes.map((l) => this.database.delete('postLike', l.id)));

    // Delete comments
    const comments = await this.database.query('postComment', [
      { field: 'postId', operator: 'eq', value: postId },
    ]);
    await Promise.all(comments.map((c) => this.database.delete('postComment', c.id)));

    // Delete the post
    await this.database.delete('post', postId);
  }

  /**
   * Get users who liked a post
   */
  async getLikedBy(postId: string, limit: number = 20): Promise<User[]> {
    const likes = await this.database.list('postLike', {
      where: [{ field: 'postId', operator: 'eq', value: postId }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit,
    });

    const users = await Promise.all(likes.map((like) => this.database.get('user', like.userId)));

    return users.filter((u): u is User => u !== null);
  }
}

/**
 * Create a PostService instance
 */
export function createPostService(
  database: IDatabaseAdapter,
  storage: IStorageAdapter,
): PostService {
  return new PostService(database, storage);
}
