/**
 * Mock Realtime Adapter
 *
 * In-memory implementation of IRealtimeAdapter for development and testing.
 * Uses an event emitter pattern to simulate real-time subscriptions.
 */

import type {
  DatabaseChange,
  IRealtimeAdapter,
  ModelName,
  ModelTypeMap,
  PresenceChannel,
  PresenceState,
  RealtimeCallback,
} from '../types';

type SubscriptionKey = string;
type UnsubscribeFunction = () => void;

interface Subscription<T = unknown> {
  callback: RealtimeCallback<T>;
}

interface MockPresenceConfig {
  /** Current user ID for presence tracking */
  userId?: string;
}

interface MockRealtimeConfig {
  /** Artificial delay in ms for realistic testing */
  delay?: number;
}

/**
 * Mock Presence Channel Implementation
 */
class MockPresenceChannelImpl implements PresenceChannel {
  private state: PresenceState = {};
  private syncCallbacks: Set<(state: PresenceState) => void> = new Set();
  private joinCallbacks: Set<(userId: string, state: PresenceState[string]) => void> = new Set();
  private leaveCallbacks: Set<(userId: string, state: PresenceState[string]) => void> = new Set();
  private currentUserId: string | null = null;
  private currentUserState: Record<string, unknown> | null = null;

  async track(state: Record<string, unknown>): Promise<void> {
    // Generate a mock user ID if not set
    const userId = (state.userId as string) || `user_${Date.now()}`;
    this.currentUserId = userId;
    this.currentUserState = state;

    const presenceState: PresenceState[string] = {
      ...state,
      onlineAt: new Date(),
    };

    // Check if this is a new join or update
    const isNew = !this.state[userId];
    this.state[userId] = presenceState;

    // Notify callbacks
    if (isNew) {
      this.joinCallbacks.forEach((cb) => cb(userId, presenceState));
    }
    this.syncCallbacks.forEach((cb) => cb({ ...this.state }));
  }

  async untrack(): Promise<void> {
    if (this.currentUserId && this.state[this.currentUserId]) {
      const leftState = this.state[this.currentUserId];
      delete this.state[this.currentUserId];

      // Notify callbacks
      this.leaveCallbacks.forEach((cb) => cb(this.currentUserId!, leftState));
      this.syncCallbacks.forEach((cb) => cb({ ...this.state }));

      this.currentUserId = null;
      this.currentUserState = null;
    }
  }

  onSync(callback: (state: PresenceState) => void): UnsubscribeFunction {
    this.syncCallbacks.add(callback);
    // Immediately call with current state
    callback({ ...this.state });
    return () => {
      this.syncCallbacks.delete(callback);
    };
  }

  onJoin(callback: (userId: string, state: PresenceState[string]) => void): UnsubscribeFunction {
    this.joinCallbacks.add(callback);
    return () => {
      this.joinCallbacks.delete(callback);
    };
  }

  onLeave(callback: (userId: string, state: PresenceState[string]) => void): UnsubscribeFunction {
    this.leaveCallbacks.add(callback);
    return () => {
      this.leaveCallbacks.delete(callback);
    };
  }

  // For testing: simulate another user joining
  simulateJoin(userId: string, state: Record<string, unknown>): void {
    const presenceState: PresenceState[string] = {
      ...state,
      onlineAt: new Date(),
    };
    this.state[userId] = presenceState;
    this.joinCallbacks.forEach((cb) => cb(userId, presenceState));
    this.syncCallbacks.forEach((cb) => cb({ ...this.state }));
  }

  // For testing: simulate another user leaving
  simulateLeave(userId: string): void {
    if (this.state[userId]) {
      const leftState = this.state[userId];
      delete this.state[userId];
      this.leaveCallbacks.forEach((cb) => cb(userId, leftState));
      this.syncCallbacks.forEach((cb) => cb({ ...this.state }));
    }
  }

  // Get current state (for testing)
  getState(): PresenceState {
    return { ...this.state };
  }
}

export class MockRealtimeAdapter implements IRealtimeAdapter {
  private channelSubscriptions: Map<SubscriptionKey, Set<Subscription>> = new Map();
  private tableSubscriptions: Map<SubscriptionKey, Set<Subscription<DatabaseChange>>> = new Map();
  private presenceChannels: Map<string, MockPresenceChannelImpl> = new Map();
  private config: MockRealtimeConfig;

  constructor(config: MockRealtimeConfig = {}) {
    this.config = {
      delay: config.delay ?? 0,
    };
  }

  private async simulateDelay(): Promise<void> {
    if (this.config.delay && this.config.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }
  }

  private getSubscriptionKey(channel: string, event: string): SubscriptionKey {
    return `${channel}:${event}`;
  }

  private getTableSubscriptionKey(table: ModelName, filter: string | null): SubscriptionKey {
    return `table:${table}:${filter ?? '*'}`;
  }

  subscribe<T = unknown>(
    channel: string,
    event: string,
    callback: RealtimeCallback<T>,
  ): UnsubscribeFunction {
    const key = this.getSubscriptionKey(channel, event);

    if (!this.channelSubscriptions.has(key)) {
      this.channelSubscriptions.set(key, new Set());
    }

    const subscription: Subscription<T> = { callback };
    this.channelSubscriptions.get(key)!.add(subscription as Subscription);

    return () => {
      const subs = this.channelSubscriptions.get(key);
      if (subs) {
        subs.delete(subscription as Subscription);
        if (subs.size === 0) {
          this.channelSubscriptions.delete(key);
        }
      }
    };
  }

  subscribeToTable<M extends ModelName>(
    table: M,
    filter: string | null,
    callback: RealtimeCallback<DatabaseChange<ModelTypeMap[M]>>,
  ): UnsubscribeFunction {
    const key = this.getTableSubscriptionKey(table, filter);

    if (!this.tableSubscriptions.has(key)) {
      this.tableSubscriptions.set(key, new Set());
    }

    const subscription: Subscription<DatabaseChange> = {
      callback: callback as RealtimeCallback<DatabaseChange>,
    };
    this.tableSubscriptions.get(key)!.add(subscription);

    // Also subscribe to wildcard for this table
    const wildcardKey = this.getTableSubscriptionKey(table, null);
    if (filter !== null && !this.tableSubscriptions.has(wildcardKey)) {
      this.tableSubscriptions.set(wildcardKey, new Set());
    }
    if (filter !== null) {
      this.tableSubscriptions.get(wildcardKey)!.add(subscription);
    }

    return () => {
      const subs = this.tableSubscriptions.get(key);
      if (subs) {
        subs.delete(subscription);
        if (subs.size === 0) {
          this.tableSubscriptions.delete(key);
        }
      }

      if (filter !== null) {
        const wildcardSubs = this.tableSubscriptions.get(wildcardKey);
        if (wildcardSubs) {
          wildcardSubs.delete(subscription);
          if (wildcardSubs.size === 0) {
            this.tableSubscriptions.delete(wildcardKey);
          }
        }
      }
    };
  }

  async broadcast(channel: string, event: string, payload: unknown): Promise<void> {
    await this.simulateDelay();

    const key = this.getSubscriptionKey(channel, event);
    const subs = this.channelSubscriptions.get(key);

    if (subs) {
      subs.forEach((sub) => sub.callback(payload));
    }

    // Also broadcast to wildcard event listeners
    const wildcardKey = this.getSubscriptionKey(channel, '*');
    const wildcardSubs = this.channelSubscriptions.get(wildcardKey);

    if (wildcardSubs) {
      wildcardSubs.forEach((sub) => sub.callback({ event, payload }));
    }
  }

  presence(channel: string): PresenceChannel {
    if (!this.presenceChannels.has(channel)) {
      this.presenceChannels.set(channel, new MockPresenceChannelImpl());
    }
    return this.presenceChannels.get(channel)!;
  }

  unsubscribeAll(): void {
    this.channelSubscriptions.clear();
    this.tableSubscriptions.clear();
    // Don't clear presence channels as they may have active users
  }

  // ==================== INTERNAL METHODS (for MockDatabaseAdapter) ====================

  /**
   * Emit a database change event
   * This is called by MockDatabaseAdapter when records change
   */
  emitDatabaseChange<T>(change: DatabaseChange<T>): void {
    const { table } = change;

    // Notify all subscribers for this table
    const wildcardKey = this.getTableSubscriptionKey(table, null);
    const wildcardSubs = this.tableSubscriptions.get(wildcardKey);

    if (wildcardSubs) {
      wildcardSubs.forEach((sub) => sub.callback(change as DatabaseChange));
    }

    // Also notify specific filter subscriptions
    // For simplicity, we notify all subscriptions for the table
    // A real implementation would evaluate the filter
    this.tableSubscriptions.forEach((subs, key) => {
      if (key.startsWith(`table:${table}:`)) {
        subs.forEach((sub) => sub.callback(change as DatabaseChange));
      }
    });
  }

  // ==================== TEST HELPERS ====================

  /**
   * Get the number of subscriptions for a channel/event
   */
  getSubscriptionCount(channel: string, event: string): number {
    const key = this.getSubscriptionKey(channel, event);
    return this.channelSubscriptions.get(key)?.size ?? 0;
  }

  /**
   * Get the number of table subscriptions
   */
  getTableSubscriptionCount(table: ModelName, filter: string | null): number {
    const key = this.getTableSubscriptionKey(table, filter);
    return this.tableSubscriptions.get(key)?.size ?? 0;
  }

  /**
   * Get a presence channel for testing
   */
  getPresenceChannel(channel: string): MockPresenceChannelImpl | undefined {
    return this.presenceChannels.get(channel);
  }

  /**
   * Reset all subscriptions and presence
   */
  reset(): void {
    this.channelSubscriptions.clear();
    this.tableSubscriptions.clear();
    this.presenceChannels.clear();
  }
}

// Default export for convenience
export const createMockRealtimeAdapter = (config?: MockRealtimeConfig): MockRealtimeAdapter => {
  return new MockRealtimeAdapter(config);
};
