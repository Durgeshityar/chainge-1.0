/**
 * Adapter Context
 *
 * React context for providing adapter instances throughout the app.
 * Supports environment-based adapter switching (mock, supabase, aws).
 *
 */

import React, { createContext, ReactNode, useContext, useMemo } from 'react';

import { MockAuthAdapter } from './mock/authAdapter';
import { MockDatabaseAdapter } from './mock/databaseAdapter';
import { MockRealtimeAdapter } from './mock/realtimeAdapter';
import { MockStorageAdapter } from './mock/storageAdapter';
import { SupabaseAuthAdapter } from './supabase/authAdapter';
import {
  supabaseDatabasePlaceholder,
  supabaseRealtimePlaceholder,
  supabaseStoragePlaceholder,
} from './supabase/placeholders';
import type {
  Adapters,
  IAuthAdapter,
  IDatabaseAdapter,
  IRealtimeAdapter,
  IStorageAdapter,
} from './types';

// ==================== CONTEXT ====================

const AdapterContext = createContext<Adapters | null>(null);

// ==================== ADAPTER FACTORIES ====================

export interface AdapterConfig {
  /** Artificial delay in ms for mock adapters */
  delay?: number;
  /** Whether to persist mock data to localStorage */
  persist?: boolean;
}

/**
 * Create mock adapters for development and testing
 */
export function createMockAdapters(config: AdapterConfig = {}): Adapters {
  const { delay = 200, persist = false } = config;

  // Create realtime adapter first
  const realtime = new MockRealtimeAdapter({ delay: 0 });

  // Create database adapter with realtime integration
  const database = new MockDatabaseAdapter({
    delay,
    persist,
    onDatabaseChange: (change) => {
      realtime.emitDatabaseChange(change);
    },
  });

  const auth = new MockAuthAdapter({ delay, persist });
  const storage = new MockStorageAdapter({ delay, persist });

  // SEED TEST DATA
  const {
    SEED_USERS,
    SEED_PROFILES,
    SEED_ACTIVITIES,
    SEED_CHATS,
    SEED_CHAT_PARTICIPANTS,
    SEED_MESSAGES,
    SEED_POSTS,
    SEED_POST_LIKES,
    SEED_POST_COMMENTS,
  } = require('./mock/initialData');

  // Seed Auth and DB (safe to run always, it upserts)
  auth.seedUsers(SEED_USERS.map((u: any) => ({ email: u.email, password: u.password, id: u.id })));
  database.seed('user', SEED_PROFILES);
  database.seed('activity', SEED_ACTIVITIES);
  database.seed('post', SEED_POSTS);
  database.seed('postLike', SEED_POST_LIKES);
  database.seed('postComment', SEED_POST_COMMENTS);
  database.seed('chat', SEED_CHATS);
  database.seed('chatParticipant', SEED_CHAT_PARTICIPANTS);
  database.seed('message', SEED_MESSAGES);

  // Auto-login only if not persisting (fresh start)
  if (!persist) {
    const defaultUser = SEED_USERS[0];
    // 3. SignIn (Async - triggers UI update)
    console.log('Seeding complete, signing in...');
    auth.signInWithEmail(defaultUser.email, defaultUser.password).then((result: any) => {
      console.log('Auto-signed in as:', result.user?.email);
    });
  }

  return {
    auth,
    database,
    storage,
    realtime,
  };
}

/**
 * Create Supabase adapters (to be implemented in Phase 16)
 */
let warnedAboutSupabaseAdapters = false;

export function createSupabaseAdapters(_config: AdapterConfig = {}): Adapters {
  if (!warnedAboutSupabaseAdapters) {
    console.warn(
      '[AdapterProvider] Supabase auth adapter is available, but database, storage, and realtime adapters are still TODO.',
    );
    warnedAboutSupabaseAdapters = true;
  }

  return {
    auth: new SupabaseAuthAdapter(),
    database: supabaseDatabasePlaceholder,
    storage: supabaseStoragePlaceholder,
    realtime: supabaseRealtimePlaceholder,
  };
}

/**
 * Create AWS adapters (to be implemented in Phase 17)
 */
export function createAWSAdapters(_config: AdapterConfig = {}): Adapters {
  // TODO: Implement in Phase 17
  throw new Error('AWS adapters not yet implemented. Use mock adapters for development.');
}

// ==================== PROVIDER ====================

export type BackendProvider = 'mock' | 'supabase' | 'aws';

export interface AdapterProviderProps {
  children: ReactNode;
  /** Which backend provider to use */
  provider?: BackendProvider;
  /** Configuration for adapters */
  config?: AdapterConfig;
  /** Custom adapters (for testing) */
  adapters?: Adapters;
}

/**
 * Adapter Provider Component
 *
 * Wraps the app and provides adapter instances via context.
 *
 * @example
 * ```tsx
 * <AdapterProvider provider="mock">
 *   <App />
 * </AdapterProvider>
 * ```
 */
export function AdapterProvider({
  children,
  provider = 'mock',
  config = {},
  adapters: customAdapters,
}: AdapterProviderProps): React.ReactElement {
  const adapters = useMemo(() => {
    // Allow custom adapters for testing
    if (customAdapters) {
      return customAdapters;
    }

    switch (provider) {
      case 'mock':
        return createMockAdapters(config);
      case 'supabase':
        return createSupabaseAdapters(config);
      case 'aws':
        return createAWSAdapters(config);
      default:
        throw new Error(`Unknown adapter provider: ${provider}`);
    }
  }, [provider, config, customAdapters]);

  return <AdapterContext.Provider value={adapters}>{children}</AdapterContext.Provider>;
}

// ==================== HOOKS ====================

/**
 * Hook to access all adapters
 *
 * @throws Error if used outside AdapterProvider
 */
export function useAdapters(): Adapters {
  const context = useContext(AdapterContext);
  if (!context) {
    throw new Error('useAdapters must be used within an AdapterProvider');
  }
  return context;
}

/**
 * Hook to access the auth adapter
 */
export function useAuthAdapter(): IAuthAdapter {
  const { auth } = useAdapters();
  return auth;
}

/**
 * Hook to access the database adapter
 */
export function useDatabaseAdapter(): IDatabaseAdapter {
  const { database } = useAdapters();
  return database;
}

/**
 * Hook to access the storage adapter
 */
export function useStorageAdapter(): IStorageAdapter {
  const { storage } = useAdapters();
  return storage;
}

/**
 * Hook to access the realtime adapter
 */
export function useRealtimeAdapter(): IRealtimeAdapter {
  const { realtime } = useAdapters();
  return realtime;
}

// ==================== EXPORTS ====================

export { AdapterContext };
export type { Adapters };
