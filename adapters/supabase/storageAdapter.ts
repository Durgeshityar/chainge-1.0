import type { IStorageAdapter, StorageBucket, StorageFile, UploadOptions } from '@/adapters/types';
import { getSupabaseClient } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseStorageAdapter implements IStorageAdapter {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  async upload(
    bucket: StorageBucket,
    path: string,
    file: Blob | ArrayBuffer,
    options?: UploadOptions,
  ): Promise<string> {
    const storage = this.supabase.storage.from(bucket);
    const { data, error } = await storage.upload(path, file, {
      cacheControl: options?.cacheControl ?? '3600',
      upsert: options?.upsert ?? false,
      contentType: options?.contentType,
    });

    if (error) {
      throw error;
    }

    const finalPath = data?.path ?? path;
    return this.getPublicUrl(bucket, finalPath);
  }

  async download(bucket: StorageBucket, path: string): Promise<Blob> {
    const storage = this.supabase.storage.from(bucket);
    const { data, error } = await storage.download(path);

    if (error || !data) {
      throw error ?? new Error('Failed to download file');
    }

    return data;
  }

  async delete(bucket: StorageBucket, path: string): Promise<void> {
    const storage = this.supabase.storage.from(bucket);
    const { error } = await storage.remove([path]);

    if (error) {
      throw error;
    }
  }

  getPublicUrl(bucket: StorageBucket, path: string): string {
    const storage = this.supabase.storage.from(bucket);
    const { data } = storage.getPublicUrl(path);
    return data.publicUrl;
  }

  async list(bucket: StorageBucket, path?: string): Promise<StorageFile[]> {
    const storage = this.supabase.storage.from(bucket);
    const { data, error } = await storage.list(path ?? '', { limit: 100, offset: 0 });

    if (error || !data) {
      throw error ?? new Error('Failed to list storage files');
    }

    return data.map((entry) => ({
      path: entry.name,
      size: entry.metadata?.size ?? 0,
      contentType: entry.metadata?.mimetype ?? 'application/octet-stream',
      lastModified: entry.created_at ? new Date(entry.created_at) : new Date(),
    }));
  }
}
