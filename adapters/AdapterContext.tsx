/**
 * Adapter Context
 *
 * React context for providing adapter instances throughout the app.
 * Provides Supabase adapters across the app. Pass a custom implementation when testing.
 *
 */

import React, { createContext, ReactNode, useContext, useMemo } from 'react';

import { SupabaseAuthAdapter } from './supabase/authAdapter';
import { SupabaseDatabaseAdapter } from './supabase/databaseAdapter';
import { SupabaseRealtimeAdapter } from './supabase/realtimeAdapter';
import { SupabaseStorageAdapter } from './supabase/storageAdapter';
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

/**
 * Create Supabase adapters.
 */
export function createSupabaseAdapters(): Adapters {
  return {
    auth: new SupabaseAuthAdapter(),
    database: new SupabaseDatabaseAdapter(),
    storage: new SupabaseStorageAdapter(),
    realtime: new SupabaseRealtimeAdapter(),
  };
}

// ==================== PROVIDER ====================

export interface AdapterProviderProps {
  children: ReactNode;
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
 * <AdapterProvider>
 *   <App />
 * </AdapterProvider>
 * ```
 */
export function AdapterProvider({
  children,
  adapters: customAdapters,
}: AdapterProviderProps): React.ReactElement {
  const adapters = useMemo(() => {
    // Allow custom adapters for testing
    if (customAdapters) {
      return customAdapters;
    }

    return createSupabaseAdapters();
  }, [customAdapters]);

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
