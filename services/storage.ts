/**
 * Storage Service
 *
 * Handles file upload and download operations through the storage adapter.
 */

import type { IStorageAdapter, StorageBucket } from '@/adapters/types';

/**
 * Storage buckets used in the app
 */
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  POSTS: 'posts',
  ACTIVITIES: 'activities',
  MESSAGES: 'messages',
} as const satisfies Record<string, StorageBucket>;

/**
 * Storage Service
 *
 * Provides file storage functionality with organized buckets.
 */
export class StorageService {
  constructor(private storage: IStorageAdapter) {}

  /**
   * Upload a user avatar
   */
  async uploadAvatar(
    userId: string,
    file: File | Blob,
    options?: { contentType?: string },
  ): Promise<string> {
    const timestamp = Date.now();
    const extension = this.getFileExtension(options?.contentType);
    const path = `${userId}/avatar-${timestamp}${extension}`;

    return this.storage.upload(STORAGE_BUCKETS.AVATARS, path, file, {
      contentType: options?.contentType ?? 'image/jpeg',
    });
  }

  /**
   * Upload a post image
   */
  async uploadPostImage(
    userId: string,
    file: File | Blob,
    options?: { contentType?: string },
  ): Promise<string> {
    const timestamp = Date.now();
    const extension = this.getFileExtension(options?.contentType);
    const path = `${userId}/${timestamp}${extension}`;

    return this.storage.upload(STORAGE_BUCKETS.POSTS, path, file, {
      contentType: options?.contentType ?? 'image/jpeg',
    });
  }

  /**
   * Upload multiple post images
   */
  async uploadPostImages(
    userId: string,
    files: (File | Blob)[],
    options?: { contentType?: string },
  ): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadPostImage(userId, file, options)));
  }

  /**
   * Upload an activity image
   */
  async uploadActivityImage(
    userId: string,
    file: File | Blob,
    options?: { contentType?: string },
  ): Promise<string> {
    const timestamp = Date.now();
    const extension = this.getFileExtension(options?.contentType);
    const path = `${userId}/${timestamp}${extension}`;

    return this.storage.upload(STORAGE_BUCKETS.ACTIVITIES, path, file, {
      contentType: options?.contentType ?? 'image/jpeg',
    });
  }

  /**
   * Upload a message attachment
   */
  async uploadMessageAttachment(
    chatId: string,
    senderId: string,
    file: File | Blob,
    options?: { contentType?: string },
  ): Promise<string> {
    const timestamp = Date.now();
    const extension = this.getFileExtension(options?.contentType);
    const path = `${chatId}/${senderId}/${timestamp}${extension}`;

    return this.storage.upload(STORAGE_BUCKETS.MESSAGES, path, file, {
      contentType: options?.contentType ?? 'application/octet-stream',
    });
  }

  /**
   * Download a file by URL
   */
  async download(url: string): Promise<Blob> {
    // Extract bucket and path from URL
    const { bucket, path } = this.parseUrl(url);
    return this.storage.download(bucket, path);
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: StorageBucket, path: string): string {
    return this.storage.getPublicUrl(bucket, path);
  }

  /**
   * Delete a file
   */
  async deleteFile(url: string): Promise<void> {
    const { bucket, path } = this.parseUrl(url);
    return this.storage.delete(bucket, path);
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.deleteFile(url)));
  }

  /**
   * Delete all files for a post
   */
  async deletePostFiles(imageUrls: string[]): Promise<void> {
    await this.deleteFiles(imageUrls);
  }

  /**
   * Delete old avatar when uploading a new one
   */
  async deleteOldAvatar(oldAvatarUrl: string | null): Promise<void> {
    if (oldAvatarUrl) {
      try {
        await this.deleteFile(oldAvatarUrl);
      } catch {
        // Ignore deletion errors for old files
        console.warn('Could not delete old avatar:', oldAvatarUrl);
      }
    }
  }

  /**
   * Parse a storage URL to extract bucket and path
   */
  private parseUrl(url: string): { bucket: StorageBucket; path: string } {
    // Handle mock URLs (mock://bucket/path)
    if (url.startsWith('mock://')) {
      const [, rest] = url.split('mock://');
      const [bucket, ...pathParts] = rest.split('/');
      return { bucket: bucket as StorageBucket, path: pathParts.join('/') };
    }

    // Handle standard Supabase-style URLs
    // e.g., https://xxx.supabase.co/storage/v1/object/public/bucket/path
    const publicPattern = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)/;
    const signedPattern = /\/storage\/v1\/object\/sign\/([^/]+)\/(.+)/;

    let match = url.match(publicPattern);
    if (match) {
      return { bucket: match[1] as StorageBucket, path: match[2].split('?')[0] };
    }

    match = url.match(signedPattern);
    if (match) {
      return { bucket: match[1] as StorageBucket, path: match[2].split('?')[0] };
    }

    // Fallback: Try to extract from URL path
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        return { bucket: pathParts[0] as StorageBucket, path: pathParts.slice(1).join('/') };
      }
    } catch {
      // URL parsing failed
    }

    throw new Error(`Could not parse storage URL: ${url}`);
  }

  /**
   * Get file extension from content type
   */
  private getFileExtension(contentType?: string): string {
    const mimeToExtension: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/quicktime': '.mov',
      'application/pdf': '.pdf',
    };

    return contentType ? mimeToExtension[contentType] ?? '' : '';
  }
}

/**
 * Create a StorageService instance
 */
export function createStorageService(storage: IStorageAdapter): StorageService {
  return new StorageService(storage);
}
