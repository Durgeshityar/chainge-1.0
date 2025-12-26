import type { ModelName } from '@/adapters/types';

const TABLE_NAME_MAP: Record<ModelName, string> = {
  user: 'users',
  follow: 'follows',
  activity: 'activities',
  activityParticipant: 'activity_participants',
  post: 'posts',
  postLike: 'post_likes',
  postComment: 'post_comments',
  chat: 'chats',
  chatParticipant: 'chat_participants',
  message: 'messages',
  notification: 'notifications',
};

/**
 * Map a model to its Supabase table name.
 */
export const getTableName = (model: ModelName): string => {
  const envKey = `EXPO_PUBLIC_SUPABASE_TABLE_${toEnvSuffix(model)}`;
  const override = process.env[envKey];
  return override?.trim() || TABLE_NAME_MAP[model];
};

const toEnvSuffix = (model: string): string =>
  model
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toUpperCase();

const DATE_KEY_REGEX = /(At|Date)$/;

/**
 * Convert ISO date strings into Date objects for keys that look like timestamps.
 */
export function hydrateDates<T extends Record<string, any>>(record: T): T {
  const result: Record<string, unknown> = { ...record };

  Object.entries(record).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      result[key] = value;
      return;
    }

    if (typeof value === 'string' && DATE_KEY_REGEX.test(key)) {
      const parsed = new Date(value);
      result[key] = Number.isNaN(parsed.getTime()) ? value : parsed;
      return;
    }

    if (Array.isArray(value)) {
      result[key] = value.map((item) => (typeof item === 'object' && item !== null ? hydrateDates(item) : item));
      return;
    }

    if (typeof value === 'object') {
      result[key] = hydrateDates(value as Record<string, unknown>);
      return;
    }

    result[key] = value;
  });

  return result as T;
}

const CAMEL_TO_SNAKE_REGEX = /([a-z0-9])([A-Z])/g;
const SNAKE_TO_CAMEL_REGEX = /_([a-z0-9])/g;

export const toSnakeCase = (value: string): string =>
  value
    .replace(CAMEL_TO_SNAKE_REGEX, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();

const toCamelCase = (value: string): string =>
  value.replace(SNAKE_TO_CAMEL_REGEX, (_, char: string) => char.toUpperCase());

export function convertKeysToSnakeCase<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(convertKeysToSnakeCase) as unknown as T;
  }

  if (input && typeof input === 'object' && !(input instanceof Date)) {
    return Object.keys(input as Record<string, unknown>).reduce((acc, key) => {
      const value = (input as Record<string, unknown>)[key];
      acc[toSnakeCase(key)] = convertKeysToSnakeCase(value);
      return acc;
    }, {} as Record<string, unknown>) as T;
  }

  return input;
}

export function convertKeysToCamelCase<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(convertKeysToCamelCase) as unknown as T;
  }

  if (input && typeof input === 'object' && !(input instanceof Date)) {
    return Object.keys(input as Record<string, unknown>).reduce((acc, key) => {
      const value = (input as Record<string, unknown>)[key];
      acc[toCamelCase(key)] = convertKeysToCamelCase(value);
      return acc;
    }, {} as Record<string, unknown>) as T;
  }

  return input;
}
