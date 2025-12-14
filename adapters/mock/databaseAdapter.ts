/**
 * Mock Database Adapter
 *
 * In-memory implementation of IDatabaseAdapter for development and testing.
 * Provides full CRUD operations, filtering, sorting, pagination, and geospatial queries.
 */

import type {
  DatabaseChange,
  Filter,
  FilterOperator,
  IDatabaseAdapter,
  ModelName,
  ModelTypeMap,
  OrderBy,
  PaginatedResult,
  PaginationOptions,
  QueryOptions,
} from '../types';

interface MockDatabaseConfig {
  /** Artificial delay in ms for realistic testing */
  delay?: number;
  /** Whether to persist to localStorage */
  persist?: boolean;
  /** Callback for realtime changes */
  onDatabaseChange?: <T>(change: DatabaseChange<T>) => void;
}

const STORAGE_KEY = 'chainge_mock_db';

/**
 * Generate a mock UUID
 */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Calculate distance between two coordinates in km (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Deep clone an object
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Get nested property value by path (e.g., "user.email")
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((curr: unknown, key) => {
    if (curr && typeof curr === 'object') {
      return (curr as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Evaluate a filter against a record
 */
function evaluateFilter(record: Record<string, unknown>, filter: Filter): boolean {
  const value = getNestedValue(record, filter.field);
  const filterValue = filter.value;

  const operators: Record<FilterOperator, () => boolean> = {
    eq: () => value === filterValue,
    neq: () => value !== filterValue,
    gt: () => {
      if (typeof value === 'number' && typeof filterValue === 'number') {
        return value > filterValue;
      }
      if (value instanceof Date && filterValue instanceof Date) {
        return value > filterValue;
      }
      return String(value) > String(filterValue);
    },
    gte: () => {
      if (typeof value === 'number' && typeof filterValue === 'number') {
        return value >= filterValue;
      }
      if (value instanceof Date && filterValue instanceof Date) {
        return value >= filterValue;
      }
      return String(value) >= String(filterValue);
    },
    lt: () => {
      if (typeof value === 'number' && typeof filterValue === 'number') {
        return value < filterValue;
      }
      if (value instanceof Date && filterValue instanceof Date) {
        return value < filterValue;
      }
      return String(value) < String(filterValue);
    },
    lte: () => {
      if (typeof value === 'number' && typeof filterValue === 'number') {
        return value <= filterValue;
      }
      if (value instanceof Date && filterValue instanceof Date) {
        return value <= filterValue;
      }
      return String(value) <= String(filterValue);
    },
    in: () => {
      if (Array.isArray(filterValue)) {
        return filterValue.includes(value);
      }
      return false;
    },
    contains: () => {
      if (typeof value === 'string' && typeof filterValue === 'string') {
        return value.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (Array.isArray(value)) {
        return value.includes(filterValue);
      }
      return false;
    },
    startsWith: () => {
      if (typeof value === 'string' && typeof filterValue === 'string') {
        return value.toLowerCase().startsWith(filterValue.toLowerCase());
      }
      return false;
    },
    endsWith: () => {
      if (typeof value === 'string' && typeof filterValue === 'string') {
        return value.toLowerCase().endsWith(filterValue.toLowerCase());
      }
      return false;
    },
  };

  return operators[filter.operator]();
}

/**
 * Sort records by orderBy configuration
 */
function sortRecords<T extends Record<string, unknown>>(records: T[], orderBy: OrderBy[]): T[] {
  return [...records].sort((a, b) => {
    for (const order of orderBy) {
      const aVal = getNestedValue(a, order.field);
      const bVal = getNestedValue(b, order.field);

      let comparison = 0;
      if (aVal === null || aVal === undefined) {
        comparison = 1;
      } else if (bVal === null || bVal === undefined) {
        comparison = -1;
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      if (comparison !== 0) {
        return order.direction === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
}

export class MockDatabaseAdapter implements IDatabaseAdapter {
  private stores: Map<ModelName, Map<string, Record<string, unknown>>> = new Map();
  private config: MockDatabaseConfig;

  constructor(config: MockDatabaseConfig = {}) {
    this.config = {
      delay: config.delay ?? 200,
      persist: config.persist ?? false,
      onDatabaseChange: config.onDatabaseChange,
    };

    // Initialize all model stores
    const models: ModelName[] = [
      'user',
      'follow',
      'activity',
      'activityParticipant',
      'post',
      'postLike',
      'postComment',
      'chat',
      'chatParticipant',
      'message',
      'notification',
    ];
    models.forEach((model) => this.stores.set(model, new Map()));

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
        Object.entries(data).forEach(([model, records]) => {
          const store = this.stores.get(model as ModelName);
          if (store && typeof records === 'object' && records !== null) {
            Object.entries(records as Record<string, unknown>).forEach(([id, record]) => {
              store.set(id, this.deserializeRecord(record as Record<string, unknown>));
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

      const data: Record<string, Record<string, unknown>> = {};
      this.stores.forEach((store, model) => {
        data[model] = Object.fromEntries(store);
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  private deserializeRecord(record: Record<string, unknown>): Record<string, unknown> {
    const result = { ...record };
    // Convert date strings back to Date objects
    const dateFields = [
      'createdAt',
      'updatedAt',
      'scheduledAt',
      'startedAt',
      'endedAt',
      'joinedAt',
      'lastReadAt',
    ];
    dateFields.forEach((field) => {
      if (result[field] && typeof result[field] === 'string') {
        result[field] = new Date(result[field] as string);
      }
    });
    return result;
  }

  private emitChange<T>(
    type: DatabaseChange<T>['type'],
    table: ModelName,
    record: T,
    oldRecord?: T,
  ): void {
    if (this.config.onDatabaseChange) {
      this.config.onDatabaseChange({
        type,
        table,
        record,
        oldRecord,
      });
    }
  }

  async get<M extends ModelName>(model: M, id: string): Promise<ModelTypeMap[M] | null> {
    await this.simulateDelay();

    const store = this.stores.get(model);
    if (!store) return null;

    const record = store.get(id);
    return record ? (deepClone(record) as unknown as ModelTypeMap[M]) : null;
  }

  async list<M extends ModelName>(model: M, options?: QueryOptions): Promise<ModelTypeMap[M][]> {
    await this.simulateDelay();

    const store = this.stores.get(model);
    if (!store) return [];

    let records = Array.from(store.values());

    // Apply filters
    if (options?.where && options.where.length > 0) {
      records = records.filter((record) =>
        options.where!.every((filter) => evaluateFilter(record, filter)),
      );
    }

    // Apply sorting
    if (options?.orderBy && options.orderBy.length > 0) {
      records = sortRecords(records, options.orderBy);
    }

    // Apply offset
    if (options?.offset) {
      records = records.slice(options.offset);
    }

    // Apply limit
    if (options?.limit) {
      records = records.slice(0, options.limit);
    }

    return records.map((r) => deepClone(r) as unknown as ModelTypeMap[M]);
  }

  async create<M extends ModelName>(
    model: M,
    data: Partial<ModelTypeMap[M]>,
  ): Promise<ModelTypeMap[M]> {
    await this.simulateDelay();

    const store = this.stores.get(model);
    if (!store) {
      throw new Error(`Unknown model: ${model}`);
    }

    const now = new Date();
    const record: Record<string, unknown> = {
      ...data,
      id: (data as Record<string, unknown>).id || generateId(),
      createdAt: now,
      updatedAt: now,
    };

    // Set default values based on model
    this.applyDefaults(model, record);

    store.set(record.id as string, record);
    this.saveToStorage();

    const result = deepClone(record) as unknown as ModelTypeMap[M];
    this.emitChange('INSERT', model, result);

    return result;
  }

  async update<M extends ModelName>(
    model: M,
    id: string,
    data: Partial<ModelTypeMap[M]>,
  ): Promise<ModelTypeMap[M]> {
    await this.simulateDelay();

    const store = this.stores.get(model);
    if (!store) {
      throw new Error(`Unknown model: ${model}`);
    }

    const existing = store.get(id);
    if (!existing) {
      throw new Error(`Record not found: ${model}/${id}`);
    }

    const oldRecord = deepClone(existing);
    const record: Record<string, unknown> = {
      ...existing,
      ...data,
      id, // Ensure ID cannot be changed
      updatedAt: new Date(),
    };

    store.set(id, record);
    this.saveToStorage();

    const result = deepClone(record) as unknown as ModelTypeMap[M];
    this.emitChange('UPDATE', model, result, oldRecord as unknown as ModelTypeMap[M]);

    return result;
  }

  async delete(model: ModelName, id: string): Promise<void> {
    await this.simulateDelay();

    const store = this.stores.get(model);
    if (!store) {
      throw new Error(`Unknown model: ${model}`);
    }

    const existing = store.get(id);
    if (existing) {
      store.delete(id);
      this.saveToStorage();
      this.emitChange('DELETE', model, existing);
    }
  }

  async query<M extends ModelName>(model: M, filters: Filter[]): Promise<ModelTypeMap[M][]> {
    return this.list(model, { where: filters });
  }

  async queryNearby<M extends ModelName>(
    model: M,
    latitude: number,
    longitude: number,
    radiusKm: number,
    options?: QueryOptions,
  ): Promise<ModelTypeMap[M][]> {
    await this.simulateDelay();

    const store = this.stores.get(model);
    if (!store) return [];

    let records = Array.from(store.values());

    // Filter by distance
    records = records.filter((record) => {
      const lat = record.latitude as number | null | undefined;
      const lng = record.longitude as number | null | undefined;

      if (lat === null || lat === undefined || lng === null || lng === undefined) {
        return false;
      }

      const distance = calculateDistance(latitude, longitude, lat, lng);
      return distance <= radiusKm;
    });

    // Apply additional filters
    if (options?.where && options.where.length > 0) {
      records = records.filter((record) =>
        options.where!.every((filter) => evaluateFilter(record, filter)),
      );
    }

    // Apply sorting
    if (options?.orderBy && options.orderBy.length > 0) {
      records = sortRecords(records, options.orderBy);
    }

    // Apply limit
    if (options?.limit) {
      records = records.slice(0, options.limit);
    }

    return records.map((r) => deepClone(r) as unknown as ModelTypeMap[M]);
  }

  async paginate<M extends ModelName>(
    model: M,
    options: PaginationOptions,
  ): Promise<PaginatedResult<ModelTypeMap[M]>> {
    await this.simulateDelay();

    const store = this.stores.get(model);
    if (!store) {
      return { data: [], nextCursor: null, hasMore: false, total: 0 };
    }

    let records = Array.from(store.values());
    const total = records.length;

    // Apply filters
    if (options?.where && options.where.length > 0) {
      records = records.filter((record) =>
        options.where!.every((filter) => evaluateFilter(record, filter)),
      );
    }

    // Apply sorting (default to createdAt desc)
    const orderBy = options.orderBy ?? [{ field: 'createdAt', direction: 'desc' }];
    records = sortRecords(records, orderBy);

    // Apply cursor
    if (options.cursor) {
      const cursorIndex = records.findIndex((r) => (r.id as string) === options.cursor);
      if (cursorIndex >= 0) {
        records = records.slice(cursorIndex + 1);
      }
    }

    // Get one extra to check if there are more
    const limit = options.limit;
    const hasMore = records.length > limit;
    const data = records.slice(0, limit).map((r) => deepClone(r) as unknown as ModelTypeMap[M]);

    const nextCursor =
      hasMore && data.length > 0 ? (data[data.length - 1] as unknown as { id: string }).id : null;

    return {
      data,
      nextCursor,
      hasMore,
      total,
    };
  }

  private applyDefaults(model: ModelName, record: Record<string, unknown>): void {
    switch (model) {
      case 'user':
        record.followerCount = record.followerCount ?? 0;
        record.followingCount = record.followingCount ?? 0;
        record.interests = record.interests ?? [];
        break;
      case 'activity':
        record.status = record.status ?? 'SCHEDULED';
        record.visibility = record.visibility ?? 'PUBLIC';
        break;
      case 'activityParticipant':
        record.status = record.status ?? 'PENDING';
        break;
      case 'post':
        record.likeCount = record.likeCount ?? 0;
        record.commentCount = record.commentCount ?? 0;
        record.mediaUrls = record.mediaUrls ?? [];
        break;
      case 'chat':
        record.type = record.type ?? 'DIRECT';
        break;
      case 'chatParticipant':
        record.joinedAt = record.joinedAt ?? new Date();
        break;
      case 'notification':
        record.read = record.read ?? false;
        break;
    }
  }

  // ==================== TEST HELPERS ====================

  /**
   * Reset all mock data
   */
  reset(): void {
    this.stores.forEach((store) => store.clear());
    if (this.config.persist && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Seed data for a model
   */
  seed<M extends ModelName>(model: M, records: Partial<ModelTypeMap[M]>[]): void {
    const store = this.stores.get(model);
    if (!store) return;

    records.forEach((data) => {
      const now = new Date();
      const record: Record<string, unknown> = {
        ...data,
        id: (data as Record<string, unknown>).id || generateId(),
        createdAt: now,
        updatedAt: now,
      };
      this.applyDefaults(model, record);
      store.set(record.id as string, record);
    });
    this.saveToStorage();
  }

  /**
   * Get count of records in a model
   */
  count(model: ModelName): number {
    const store = this.stores.get(model);
    return store?.size ?? 0;
  }

  /**
   * Set the change callback (used by realtime adapter)
   */
  setOnDatabaseChange(callback: MockDatabaseConfig['onDatabaseChange']): void {
    this.config.onDatabaseChange = callback;
  }
}

// Default export for convenience
export const createMockDatabaseAdapter = (config?: MockDatabaseConfig): MockDatabaseAdapter => {
  return new MockDatabaseAdapter(config);
};
