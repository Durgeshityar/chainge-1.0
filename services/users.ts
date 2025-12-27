/**
 * User Service
 *
 * Handles user profile operations including CRUD, avatar upload,
 * and follow/unfollow functionality.
 */

import type { IDatabaseAdapter, IStorageAdapter } from '@/adapters/types';
import type { Follow, User, UserUpdateInput } from '@/types';

/**
 * User Service
 *
 * Provides user profile management functionality.
 */
export class UserService {
  constructor(private database: IDatabaseAdapter, private storage: IStorageAdapter) {}

  /**
   * Get a user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.database.get('user', userId);
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.database.query('user', [
      { field: 'username', operator: 'eq', value: username.toLowerCase() },
    ]);
    return users[0] ?? null;
  }

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.database.query('user', [
      { field: 'email', operator: 'eq', value: email.toLowerCase() },
    ]);
    return users[0] ?? null;
  }

  /**
   * Update a user's profile
   */
  async updateProfile(userId: string, data: UserUpdateInput): Promise<User> {
    // If updating username, check availability
    if (data.username) {
      const existing = await this.getUserByUsername(data.username);
      if (existing && existing.id !== userId) {
        throw new Error('Username is already taken');
      }
      data.username = data.username.toLowerCase();
    }

    return this.database.update('user', userId, data);
  }

  /**
   * Upload a user's avatar
   * Returns the public URL of the uploaded avatar
   */
  async uploadAvatar(userId: string, file: Blob): Promise<string> {
    const path = `${userId}/avatar.jpg`;
    await this.storage.upload('avatars', path, file, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    const avatarUrl = this.storage.getPublicUrl('avatars', path);

    // Update user profile with new avatar URL
    await this.database.update('user', userId, { avatarUrl });

    return avatarUrl;
  }

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<Follow> {
    // Check if already following
    const existingFollows = await this.database.query('follow', [
      { field: 'followerId', operator: 'eq', value: followerId },
      { field: 'followingId', operator: 'eq', value: followingId },
    ]);

    if (existingFollows.length > 0) {
      return existingFollows[0];
    }

    // Create follow relationship
    const follow = await this.database.create('follow', {
      followerId,
      followingId,
    });

    // Update counts
    const follower = await this.database.get('user', followerId);
    const following = await this.database.get('user', followingId);

    if (follower) {
      await this.database.update('user', followerId, {
        followingCount: follower.followingCount + 1,
      });
    }

    if (following) {
      await this.database.update('user', followingId, {
        followerCount: following.followerCount + 1,
      });
    }

    return follow;
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    // Find the follow relationship
    const follows = await this.database.query('follow', [
      { field: 'followerId', operator: 'eq', value: followerId },
      { field: 'followingId', operator: 'eq', value: followingId },
    ]);

    if (follows.length === 0) {
      return; // Not following
    }

    // Delete follow relationship
    await this.database.delete('follow', follows[0].id);

    // Update counts
    const follower = await this.database.get('user', followerId);
    const following = await this.database.get('user', followingId);

    if (follower && follower.followingCount > 0) {
      await this.database.update('user', followerId, {
        followingCount: follower.followingCount - 1,
      });
    }

    if (following && following.followerCount > 0) {
      await this.database.update('user', followingId, {
        followerCount: following.followerCount - 1,
      });
    }
  }

  /**
   * Check if a user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follows = await this.database.query('follow', [
      { field: 'followerId', operator: 'eq', value: followerId },
      { field: 'followingId', operator: 'eq', value: followingId },
    ]);
    return follows.length > 0;
  }

  /**
   * Get a user's followers
   */
  async getFollowers(
    userId: string,
    limit: number = 20,
    cursor?: string,
  ): Promise<{ users: User[]; nextCursor: string | null }> {
    const result = await this.database.paginate('follow', {
      where: [{ field: 'followingId', operator: 'eq', value: userId }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit,
      cursor,
    });

    // Fetch user details for each follower
    const users = await Promise.all(
      result.data.map((follow) => this.database.get('user', follow.followerId)),
    );

    return {
      users: users.filter((u): u is User => u !== null),
      nextCursor: result.nextCursor,
    };
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(
    userId: string,
    limit: number = 20,
    cursor?: string,
  ): Promise<{ users: User[]; nextCursor: string | null }> {
    const result = await this.database.paginate('follow', {
      where: [{ field: 'followerId', operator: 'eq', value: userId }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit,
      cursor,
    });

    // Fetch user details for each following
    const users = await Promise.all(
      result.data.map((follow) => this.database.get('user', follow.followingId)),
    );

    return {
      users: users.filter((u): u is User => u !== null),
      nextCursor: result.nextCursor,
    };
  }

  /**
   * Search users by username or display name
   */
  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    const term = query.trim();
    if (!term) return [];

    // Search in multiple text fields to cover all profile variations
    const [byUsername, byName, byDisplayName] = await Promise.all([
      this.database.query('user', [{ field: 'username', operator: 'contains', value: term.toLowerCase() }]),
      this.database.query('user', [{ field: 'name', operator: 'contains', value: term }]),
      this.database.query('user', [{ field: 'displayName', operator: 'contains', value: term }]),
    ]);

    // Merge and dedupe results
    const seen = new Set<string>();
    const results: User[] = [];

    for (const user of [...byUsername, ...byName, ...byDisplayName]) {
      if (!seen.has(user.id)) {
        seen.add(user.id);
        results.push(user);
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  /**
   * Get suggested users (all users except current user)
   */
  async getSuggestedUsers(currentUserId: string, limit: number = 20): Promise<User[]> {
    const allUsers = await this.database.list('user', {
      limit: limit + 1,
    });
    return allUsers.filter(u => u.id !== currentUserId).slice(0, limit);
  }

  /**
   * Update user's location
   */
  async updateLocation(userId: string, latitude: number, longitude: number): Promise<User> {
    return this.database.update('user', userId, { latitude, longitude });
  }

  /**
   * Get the IDs of users that a user is following
   */
  async getFollowingIds(userId: string): Promise<string[]> {
    const follows = await this.database.query('follow', [
      { field: 'followerId', operator: 'eq', value: userId },
    ]);
    return follows.map((f) => f.followingId);
  }
}

/**
 * Create a UserService instance
 */
export function createUserService(
  database: IDatabaseAdapter,
  storage: IStorageAdapter,
): UserService {
  return new UserService(database, storage);
}
