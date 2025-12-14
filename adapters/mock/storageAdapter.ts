/**
 * Mock Storage Adapter
 *
 * In-memory implementation of IStorageAdapter for development and testing.
 * Stores files as base64 strings in memory with optional localStorage persistence.
 */

import type { IStorageAdapter, StorageBucket, StorageFile, UploadOptions } from '../types';

interface MockStoredFile {
  data: string; // base64 encoded
  contentType: string;
  size: number;
  lastModified: Date;
}

interface MockStorageConfig {
  /** Artificial delay in ms for realistic testing */
  delay?: number;
  /** Whether to persist to localStorage */
  persist?: boolean;
  /** Base URL for mock public URLs */
  baseUrl?: string;
}

const STORAGE_KEY = 'chainge_mock_storage';

/**
 * Convert Blob to base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64: string, contentType: string): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType });
}

export class MockStorageAdapter implements IStorageAdapter {
  private buckets: Map<StorageBucket, Map<string, MockStoredFile>> = new Map();
  private config: MockStorageConfig;

  constructor(config: MockStorageConfig = {}) {
    this.config = {
      delay: config.delay ?? 300,
      persist: config.persist ?? false,
      baseUrl: config.baseUrl ?? 'https://mock-storage.chainge.local',
    };

    // Initialize buckets
    const bucketNames: StorageBucket[] = ['avatars', 'posts', 'activities', 'messages'];
    bucketNames.forEach((name) => this.buckets.set(name, new Map()));

    if (this.config.persist) {
      this.loadFromStorage();
    }
  }

  private async simulateDelay(): Promise<void> {
    if (this.config.delay && this.config.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }
  }

  private loadFromStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([bucketName, files]) => {
          const bucket = this.buckets.get(bucketName as StorageBucket);
          if (bucket && typeof files === 'object' && files !== null) {
            Object.entries(files as Record<string, MockStoredFile>).forEach(([path, file]) => {
              bucket.set(path, {
                ...file,
                lastModified: new Date(file.lastModified),
              });
            });
          }
        });
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof localStorage === 'undefined' || !this.config.persist) return;

      const data: Record<string, Record<string, MockStoredFile>> = {};
      this.buckets.forEach((files, bucketName) => {
        data[bucketName] = Object.fromEntries(files);
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  private getBucket(bucket: StorageBucket): Map<string, MockStoredFile> {
    const bucketMap = this.buckets.get(bucket);
    if (!bucketMap) {
      throw new Error(`Unknown bucket: ${bucket}`);
    }
    return bucketMap;
  }

  async upload(
    bucket: StorageBucket,
    path: string,
    file: Blob | ArrayBuffer,
    options?: UploadOptions,
  ): Promise<string> {
    await this.simulateDelay();

    const bucketMap = this.getBucket(bucket);

    // Check if file exists and upsert is false
    if (bucketMap.has(path) && options?.upsert === false) {
      throw new Error(`File already exists: ${bucket}/${path}`);
    }

    // Convert to base64
    let data: string;
    let size: number;
    let contentType: string;

    if (file instanceof Blob) {
      data = await blobToBase64(file);
      size = file.size;
      contentType = options?.contentType ?? file.type ?? 'application/octet-stream';
    } else {
      data = arrayBufferToBase64(file);
      size = file.byteLength;
      contentType = options?.contentType ?? 'application/octet-stream';
    }

    const storedFile: MockStoredFile = {
      data,
      contentType,
      size,
      lastModified: new Date(),
    };

    bucketMap.set(path, storedFile);
    this.saveToStorage();

    return path;
  }

  async download(bucket: StorageBucket, path: string): Promise<Blob> {
    await this.simulateDelay();

    const bucketMap = this.getBucket(bucket);
    const file = bucketMap.get(path);

    if (!file) {
      throw new Error(`File not found: ${bucket}/${path}`);
    }

    return base64ToBlob(file.data, file.contentType);
  }

  async delete(bucket: StorageBucket, path: string): Promise<void> {
    await this.simulateDelay();

    const bucketMap = this.getBucket(bucket);
    bucketMap.delete(path);
    this.saveToStorage();
  }

  getPublicUrl(bucket: StorageBucket, path: string): string {
    return `${this.config.baseUrl}/${bucket}/${path}`;
  }

  async list(bucket: StorageBucket, prefix?: string): Promise<StorageFile[]> {
    await this.simulateDelay();

    const bucketMap = this.getBucket(bucket);
    const files: StorageFile[] = [];

    bucketMap.forEach((file, path) => {
      if (!prefix || path.startsWith(prefix)) {
        files.push({
          path,
          size: file.size,
          contentType: file.contentType,
          lastModified: file.lastModified,
        });
      }
    });

    return files.sort((a, b) => a.path.localeCompare(b.path));
  }

  // ==================== TEST HELPERS ====================

  /**
   * Reset all storage
   */
  reset(): void {
    this.buckets.forEach((bucket) => bucket.clear());
    if (this.config.persist && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Get count of files in a bucket
   */
  count(bucket: StorageBucket): number {
    return this.getBucket(bucket).size;
  }

  /**
   * Check if file exists
   */
  exists(bucket: StorageBucket, path: string): boolean {
    return this.getBucket(bucket).has(path);
  }

  /**
   * Seed a file (for testing)
   */
  seedFile(
    bucket: StorageBucket,
    path: string,
    data: string,
    contentType: string = 'application/octet-stream',
  ): void {
    const bucketMap = this.getBucket(bucket);
    bucketMap.set(path, {
      data, // Assume already base64
      contentType,
      size: atob(data).length,
      lastModified: new Date(),
    });
    this.saveToStorage();
  }
}

// Default export for convenience
export const createMockStorageAdapter = (config?: MockStorageConfig): IStorageAdapter => {
  return new MockStorageAdapter(config);
};
