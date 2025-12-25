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
export const getTableName = (model: ModelName): string => TABLE_NAME_MAP[model];

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
