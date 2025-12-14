/**
 * Adapter Hooks
 *
 * Re-exports adapter hooks from AdapterContext for convenient imports.
 * Also provides additional composed hooks that combine adapters with stores.
 */

// Re-export the basic adapter hooks
export {
  useAdapters,
  useAuthAdapter,
  useDatabaseAdapter,
  useRealtimeAdapter,
  useStorageAdapter,
} from '@/adapters/AdapterContext';

// Export types for convenience
export type {
  Adapters,
  AuthResult,
  AuthUser,
  DatabaseChange,
  Filter,
  IAuthAdapter,
  IDatabaseAdapter,
  IRealtimeAdapter,
  IStorageAdapter,
  ModelName,
  ModelTypeMap,
  PaginatedResult,
  PaginationOptions,
  PresenceChannel,
  QueryOptions,
  Session,
  StorageBucket,
} from '@/adapters/types';
