import type {
  Filter,
  IDatabaseAdapter,
  ModelName,
  ModelTypeMap,
  OrderBy,
  PaginatedResult,
  PaginationOptions,
  QueryOptions,
} from '@/adapters/types';
import { getSupabaseClient } from './client';
import {
  convertKeysToCamelCase,
  convertKeysToSnakeCase,
  getTableName,
  hydrateDates,
  toSnakeCase,
} from './utils';
import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_PAGE_SIZE = 20;

type SelectCountOption = 'exact' | 'planned' | 'estimated';

function applyFilters(query: any, filters?: Filter[]): any {
  if (!filters) {
    return query;
  }

  return filters.reduce((builder, filter) => {
    const value = filter.value as any;
    const field = toSnakeCase(filter.field);
    switch (filter.operator) {
      case 'eq':
        return builder.eq(field, value);
      case 'neq':
        return builder.neq(field, value);
      case 'gt':
        return builder.gt(field, value);
      case 'gte':
        return builder.gte(field, value);
      case 'lt':
        return builder.lt(field, value);
      case 'lte':
        return builder.lte(field, value);
      case 'in':
        return Array.isArray(value) ? builder.in(field, value) : builder;
      case 'contains':
        if (typeof value === 'string') {
          return builder.ilike(field, `%${value}%`);
        }
        return builder.contains(field, value);
      case 'startsWith':
        return builder.ilike(field, `${value}%`);
      case 'endsWith':
        return builder.ilike(field, `%${value}`);
      default:
        return builder;
    }
  }, query);
}

const MODELS_WITHOUT_CREATED_AT: ModelName[] = ['chatParticipant'];

function applyOrder(model: ModelName, query: any, orderBy?: OrderBy[]): any {
  if (!orderBy || orderBy.length === 0) {
    return MODELS_WITHOUT_CREATED_AT.includes(model)
      ? query
      : query.order('created_at', { ascending: false });
  }

  return orderBy.reduce(
    (builder, order) =>
      builder.order(toSnakeCase(order.field), { ascending: order.direction !== 'desc', nullsFirst: false }),
    query,
  );
}

function mapRecords<M extends ModelName>(records?: ModelTypeMap[M][] | null): ModelTypeMap[M][] {
  if (!records) {
    return [];
  }

  return records.map((record) => hydrateDates(convertKeysToCamelCase(record)) as ModelTypeMap[M]);
}

export class SupabaseDatabaseAdapter implements IDatabaseAdapter {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = getSupabaseClient();
  }

  private buildQuery(
    model: ModelName,
    options?: QueryOptions,
    selectCount?: SelectCountOption,
  ): any {
    const table = getTableName(model);
    let query = this.supabase.from(table).select('*', { count: selectCount });
    query = applyFilters(query, options?.where);
    query = applyOrder(model, query, options?.orderBy);

    return query;
  }

  async get<M extends ModelName>(model: M, id: string): Promise<ModelTypeMap[M] | null> {
    const table = getTableName(model);
    const { data, error } = await this.supabase.from(table).select('*').eq('id', id).maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data ? (hydrateDates(convertKeysToCamelCase(data)) as ModelTypeMap[M]) : null;
  }

  async list<M extends ModelName>(model: M, options?: QueryOptions): Promise<ModelTypeMap[M][]> {
    let query = this.buildQuery(model, options);

    if (options?.limit !== undefined || options?.offset !== undefined) {
      const limit = options.limit ?? DEFAULT_PAGE_SIZE;
      const offset = options.offset ?? 0;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return mapRecords<M>(data as ModelTypeMap[M][] | null);
  }

  async create<M extends ModelName>(
    model: M,
    data: Partial<ModelTypeMap[M]>,
  ): Promise<ModelTypeMap[M]> {
    const table = getTableName(model);
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(convertKeysToSnakeCase(data))
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return hydrateDates(convertKeysToCamelCase(result)) as ModelTypeMap[M];
  }

  async update<M extends ModelName>(
    model: M,
    id: string,
    data: Partial<ModelTypeMap[M]>,
  ): Promise<ModelTypeMap[M]> {
    const table = getTableName(model);
    const { data: result, error } = await this.supabase
      .from(table)
      .update(convertKeysToSnakeCase(data))
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return hydrateDates(convertKeysToCamelCase(result)) as ModelTypeMap[M];
  }

  async delete(model: ModelName, id: string): Promise<void> {
    const table = getTableName(model);
    const { error } = await this.supabase.from(table).delete().eq('id', id);

    if (error) {
      throw error;
    }
  }

  async query<M extends ModelName>(model: M, filters: Filter[]): Promise<ModelTypeMap[M][]> {
    const query = this.buildQuery(model, { where: filters });
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return mapRecords<M>(data as ModelTypeMap[M][] | null);
  }

  async queryNearby<M extends ModelName>(
    model: M,
    latitude: number,
    longitude: number,
    radiusKm: number,
    options?: QueryOptions,
  ): Promise<ModelTypeMap[M][]> {
    const records = await this.list(model, options);
    const filtered: ModelTypeMap[M][] = [];

    records.forEach((record) => {
      const candidate = record as Record<string, any>;
      const lat = candidate.latitude ?? candidate.location?.latitude;
      const lon = candidate.longitude ?? candidate.location?.longitude;
      if (typeof lat !== 'number' || typeof lon !== 'number') {
        return;
      }

      if (calculateDistanceKm(lat, lon, latitude, longitude) <= radiusKm) {
        filtered.push(record);
      }
    });

    return filtered as unknown as ModelTypeMap[M][];
  }

  async paginate<M extends ModelName>(
    model: M,
    options: PaginationOptions,
  ): Promise<PaginatedResult<ModelTypeMap[M]>> {
    const limit = options.limit ?? DEFAULT_PAGE_SIZE;
    const offset = options.cursor ? Number(options.cursor) : 0;
    const query = this.buildQuery(model, { where: options.where, orderBy: options.orderBy }, 'exact').range(
      offset,
      offset + limit - 1,
    );

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const hydrated = toDateHydratedRecords<M>(data as ModelTypeMap[M][] | null);
    const nextOffset = offset + hydrated.length;
    const hasMore = count ? nextOffset < count : hydrated.length === limit;

    return {
      data: hydrated,
      nextCursor: hasMore ? String(nextOffset) : null,
      hasMore,
      total: count ?? undefined,
    };
  }
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
