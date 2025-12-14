/**
 * Adapter Interfaces
 *
 * These interfaces define the contract for all backend operations.
 * Any backend provider (Supabase, AWS, Mock) must implement these interfaces.
 */

import type {
  Activity,
  ActivityParticipant,
  Chat,
  ChatParticipant,
  Follow,
  Message,
  Notification,
  Post,
  PostComment,
  PostLike,
  User,
} from '@/types';

// ==================== AUTH TYPES ====================

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: AuthUser;
}

export interface AuthResult {
  user: AuthUser | null;
  session: Session | null;
  error: AuthError | null;
}

export interface AuthError {
  code: string;
  message: string;
}

export type AuthStateChangeCallback = (user: AuthUser | null) => void;

// ==================== DATABASE TYPES ====================

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export type OrderDirection = 'asc' | 'desc';

export interface OrderBy {
  field: string;
  direction: OrderDirection;
}

export interface QueryOptions {
  where?: Filter[];
  orderBy?: OrderBy[];
  limit?: number;
  offset?: number;
}

export interface PaginationOptions {
  cursor?: string;
  limit: number;
  orderBy?: OrderBy[];
  where?: Filter[];
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

// Model name type for type safety
export type ModelName =
  | 'user'
  | 'follow'
  | 'activity'
  | 'activityParticipant'
  | 'post'
  | 'postLike'
  | 'postComment'
  | 'chat'
  | 'chatParticipant'
  | 'message'
  | 'notification';

// Map model names to their types
export interface ModelTypeMap {
  user: User;
  follow: Follow;
  activity: Activity;
  activityParticipant: ActivityParticipant;
  post: Post;
  postLike: PostLike;
  postComment: PostComment;
  chat: Chat;
  chatParticipant: ChatParticipant;
  message: Message;
  notification: Notification;
}

// Database change event for realtime
export type DatabaseChangeType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface DatabaseChange<T = unknown> {
  type: DatabaseChangeType;
  table: ModelName;
  record: T;
  oldRecord?: T;
}

// ==================== STORAGE TYPES ====================

export type StorageBucket = 'avatars' | 'posts' | 'activities' | 'messages';

export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface StorageFile {
  path: string;
  size: number;
  contentType: string;
  lastModified: Date;
}

// ==================== REALTIME TYPES ====================

export interface PresenceState {
  [userId: string]: {
    onlineAt: Date;
    status?: string;
    [key: string]: unknown;
  };
}

export interface PresenceChannel {
  track(state: Record<string, unknown>): Promise<void>;
  untrack(): Promise<void>;
  onSync(callback: (state: PresenceState) => void): () => void;
  onJoin(callback: (userId: string, state: PresenceState[string]) => void): () => void;
  onLeave(callback: (userId: string, state: PresenceState[string]) => void): () => void;
}

export type RealtimeCallback<T = unknown> = (payload: T) => void;

// ==================== ADAPTER INTERFACES ====================

/**
 * Authentication Adapter Interface
 *
 * Handles all authentication operations including signup, signin,
 * OAuth providers, session management, and auth state changes.
 */
export interface IAuthAdapter {
  /**
   * Sign up a new user with email and password
   */
  signUpWithEmail(email: string, password: string): Promise<AuthResult>;

  /**
   * Sign in an existing user with email and password
   */
  signInWithEmail(email: string, password: string): Promise<AuthResult>;

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle(): Promise<AuthResult>;

  /**
   * Sign in with Apple OAuth
   */
  signInWithApple(): Promise<AuthResult>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Send password reset email
   */
  resetPassword(email: string): Promise<{ error: AuthError | null }>;

  /**
   * Subscribe to auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChange(callback: AuthStateChangeCallback): () => void;

  /**
   * Get the currently authenticated user (synchronous)
   */
  getCurrentUser(): AuthUser | null;

  /**
   * Get the current session (synchronous)
   */
  getSession(): Session | null;
}

/**
 * Database Adapter Interface
 *
 * Handles all database operations including CRUD, queries,
 * geospatial queries, and pagination.
 */
export interface IDatabaseAdapter {
  /**
   * Get a single record by ID
   */
  get<M extends ModelName>(model: M, id: string): Promise<ModelTypeMap[M] | null>;

  /**
   * List records with optional filtering, sorting, and pagination
   */
  list<M extends ModelName>(model: M, options?: QueryOptions): Promise<ModelTypeMap[M][]>;

  /**
   * Create a new record
   */
  create<M extends ModelName>(model: M, data: Partial<ModelTypeMap[M]>): Promise<ModelTypeMap[M]>;

  /**
   * Update an existing record
   */
  update<M extends ModelName>(
    model: M,
    id: string,
    data: Partial<ModelTypeMap[M]>,
  ): Promise<ModelTypeMap[M]>;

  /**
   * Delete a record
   */
  delete(model: ModelName, id: string): Promise<void>;

  /**
   * Query records with filters
   */
  query<M extends ModelName>(model: M, filters: Filter[]): Promise<ModelTypeMap[M][]>;

  /**
   * Query records near a geographic location
   */
  queryNearby<M extends ModelName>(
    model: M,
    latitude: number,
    longitude: number,
    radiusKm: number,
    options?: QueryOptions,
  ): Promise<ModelTypeMap[M][]>;

  /**
   * Paginate records with cursor-based pagination
   */
  paginate<M extends ModelName>(
    model: M,
    options: PaginationOptions,
  ): Promise<PaginatedResult<ModelTypeMap[M]>>;
}

/**
 * Storage Adapter Interface
 *
 * Handles file storage operations including upload, download, delete,
 * and URL generation.
 */
export interface IStorageAdapter {
  /**
   * Upload a file to storage
   * @returns The path of the uploaded file
   */
  upload(
    bucket: StorageBucket,
    path: string,
    file: Blob | ArrayBuffer,
    options?: UploadOptions,
  ): Promise<string>;

  /**
   * Download a file from storage
   */
  download(bucket: StorageBucket, path: string): Promise<Blob>;

  /**
   * Delete a file from storage
   */
  delete(bucket: StorageBucket, path: string): Promise<void>;

  /**
   * Get the public URL for a file
   */
  getPublicUrl(bucket: StorageBucket, path: string): string;

  /**
   * List files in a bucket/path
   */
  list(bucket: StorageBucket, path?: string): Promise<StorageFile[]>;
}

/**
 * Realtime Adapter Interface
 *
 * Handles real-time subscriptions, broadcasts, and presence.
 */
export interface IRealtimeAdapter {
  /**
   * Subscribe to a channel event
   * @returns Unsubscribe function
   */
  subscribe<T = unknown>(channel: string, event: string, callback: RealtimeCallback<T>): () => void;

  /**
   * Subscribe to database table changes
   * @returns Unsubscribe function
   */
  subscribeToTable<M extends ModelName>(
    table: M,
    filter: string | null,
    callback: RealtimeCallback<DatabaseChange<ModelTypeMap[M]>>,
  ): () => void;

  /**
   * Broadcast a message to a channel
   */
  broadcast(channel: string, event: string, payload: unknown): Promise<void>;

  /**
   * Get or create a presence channel
   */
  presence(channel: string): PresenceChannel;

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void;
}

// ==================== COMBINED ADAPTERS TYPE ====================

export interface Adapters {
  auth: IAuthAdapter;
  database: IDatabaseAdapter;
  storage: IStorageAdapter;
  realtime: IRealtimeAdapter;
}
