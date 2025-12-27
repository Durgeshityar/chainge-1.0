import type {
  DatabaseChange,
  IRealtimeAdapter,
  ModelName,
  ModelTypeMap,
  PresenceChannel,
  PresenceState,
  RealtimeCallback,
} from '@/adapters/types';
import { getSupabaseClient } from './client';
import { convertKeysToCamelCase, getTableName, hydrateDates, toSnakeCase } from './utils';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from '@supabase/supabase-js';

type Unsubscribe = () => void;

class SupabasePresenceChannel implements PresenceChannel {
  constructor(private channel: RealtimeChannel) {}

  async track(state: Record<string, unknown>): Promise<void> {
    await this.channel.track({ onlineAt: new Date().toISOString(), ...state });
  }

  async untrack(): Promise<void> {
    await this.channel.untrack();
  }

  onSync(callback: (state: PresenceState) => void): Unsubscribe {
    let active = true;
    this.channel.on('presence', { event: 'sync' }, () => {
      if (!active) return;
      const raw = this.channel.presenceState() as Record<string, Record<string, unknown>[]>;
      const formatted: PresenceState = Object.fromEntries(
        Object.entries(raw).map(([userId, states]) => [
          userId,
          formatPresenceState((states.at(-1) ?? {}) as Record<string, unknown>),
        ]),
      );
      callback(formatted);
    });

    return () => {
      active = false;
    };
  }

  onJoin(callback: (userId: string, state: PresenceState[string]) => void): Unsubscribe {
    let active = true;
    this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      if (!active) return;
      newPresences.forEach((presence) => callback(key, formatPresenceState(presence)));
    });

    return () => {
      active = false;
    };
  }

  onLeave(callback: (userId: string, state: PresenceState[string]) => void): Unsubscribe {
    let active = true;
    this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      if (!active) return;
      leftPresences.forEach((presence) => callback(key, formatPresenceState(presence)));
    });

    return () => {
      active = false;
    };
  }
}

export class SupabaseRealtimeAdapter implements IRealtimeAdapter {
  private supabase: SupabaseClient;
  private channels: Set<RealtimeChannel> = new Set();

  constructor() {
    this.supabase = getSupabaseClient();
  }

  subscribe<T = unknown>(channelName: string, event: string, callback: RealtimeCallback<T>): Unsubscribe {
    const channel = this.supabase.channel(channelName);
    channel.on('broadcast', { event }, (payload) => callback(payload.payload as T));
    channel.subscribe();
    this.channels.add(channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channel);
    };
  }

  subscribeToTable<M extends ModelName>(
    table: M,
    filter: string | null,
    callback: RealtimeCallback<DatabaseChange<ModelTypeMap[M]>>,
  ): Unsubscribe {
    const tableName = getTableName(table);
    const channelName = `table:${tableName}:${Math.random().toString(36).slice(2)}`;
    const channel = this.supabase.channel(channelName);
    const formattedFilter = formatRealtimeFilter(filter);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
        filter: formattedFilter,
      },
      (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const newRecord = payload.new
          ? (hydrateDates(convertKeysToCamelCase(payload.new)) as ModelTypeMap[M])
          : undefined;
        const previousRecord = payload.old
          ? (hydrateDates(convertKeysToCamelCase(payload.old)) as ModelTypeMap[M])
          : undefined;

        const change: DatabaseChange<ModelTypeMap[M]> = {
          type: payload.eventType as DatabaseChange['type'],
          table,
          record: (newRecord ?? previousRecord) as ModelTypeMap[M],
          oldRecord: previousRecord,
        };
        callback(change);
      },
    );

    channel.subscribe();
    this.channels.add(channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channel);
    };
  }

  async broadcast(channelName: string, event: string, payload: unknown): Promise<void> {
    const channel = this.supabase.channel(`broadcast:${channelName}`);
    await channel.subscribe();
    await channel.send({ type: 'broadcast', event, payload });
    await channel.unsubscribe();
  }

  presence(channelName: string): PresenceChannel {
    const channel = this.supabase.channel(channelName, { config: { presence: { key: Math.random().toString(36) } } });
    channel.subscribe();
    this.channels.add(channel);
    return new SupabasePresenceChannel(channel);
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel) => channel.unsubscribe());
    this.channels.clear();
  }
}

function formatPresenceState(state: Record<string, unknown>): PresenceState[string] {
  const onlineAtValue = state.onlineAt;
  let onlineAt: Date;

  if (onlineAtValue instanceof Date) {
    onlineAt = onlineAtValue;
  } else if (typeof onlineAtValue === 'string' || typeof onlineAtValue === 'number') {
    onlineAt = new Date(onlineAtValue);
  } else {
    onlineAt = new Date();
  }

  return {
    ...state,
    onlineAt,
  } as PresenceState[string];
}

function formatRealtimeFilter(filter: string | null): string | undefined {
  if (!filter) return undefined;

  return filter.replace(/([a-z0-9_]+)=/gi, (match, column) => `${toSnakeCase(column)}=`);
}
