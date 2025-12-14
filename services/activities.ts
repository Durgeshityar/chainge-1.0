/**
 * Activities Service
 *
 * Handles activity operations including CRUD, nearby queries,
 * join requests, and participant management.
 */

import type { IDatabaseAdapter } from '@/adapters/types';
import type {
  Activity,
  ActivityCreateInput,
  ActivityParticipant,
  ActivityUpdateInput,
  ActivityWithParticipants,
} from '@/types';
import { ActivityStatus, ParticipantStatus, Visibility } from '@/types';

export interface CreateActivityData {
  userId: string;
  activityType: string;
  scheduledAt?: Date;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  visibility?: Visibility;
}

export interface NearbyActivityOptions {
  radiusKm?: number;
  activityTypes?: string[];
  limit?: number;
}

/**
 * Activity Service
 *
 * Provides activity management and discovery functionality.
 */
export class ActivityService {
  constructor(private database: IDatabaseAdapter) {}

  /**
   * Create a new activity
   */
  async createActivity(data: CreateActivityData): Promise<Activity> {
    const activityInput: ActivityCreateInput = {
      userId: data.userId,
      activityType: data.activityType,
      status: ActivityStatus.SCHEDULED,
      scheduledAt: data.scheduledAt ?? null,
      startedAt: null,
      endedAt: null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      locationName: data.locationName ?? null,
      routeData: null,
      stats: null,
      visibility: data.visibility ?? Visibility.PUBLIC,
    };

    return this.database.create('activity', activityInput);
  }

  /**
   * Get an activity by ID
   */
  async getActivityById(activityId: string): Promise<Activity | null> {
    return this.database.get('activity', activityId);
  }

  /**
   * Get an activity with its participants
   */
  async getActivityWithParticipants(activityId: string): Promise<ActivityWithParticipants | null> {
    const activity = await this.database.get('activity', activityId);
    if (!activity) return null;

    const participants = await this.database.query('activityParticipant', [
      { field: 'activityId', operator: 'eq', value: activityId },
    ]);

    // Fetch user details for each participant
    const participantsWithUsers = await Promise.all(
      participants.map(async (p) => {
        const user = await this.database.get('user', p.userId);
        return { ...p, user: user ?? undefined };
      }),
    );

    // Fetch activity owner
    const user = await this.database.get('user', activity.userId);

    return {
      ...activity,
      user: user ?? undefined,
      participants: participantsWithUsers,
    };
  }

  /**
   * Get activities created by a user
   */
  async getUserActivities(
    userId: string,
    status?: ActivityStatus,
    limit: number = 20,
    cursor?: string,
  ): Promise<{ activities: Activity[]; nextCursor: string | null }> {
    const filters = [{ field: 'userId', operator: 'eq' as const, value: userId }];

    if (status) {
      filters.push({ field: 'status', operator: 'eq', value: status });
    }

    const result = await this.database.paginate('activity', {
      where: filters,
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit,
      cursor,
    });

    return {
      activities: result.data,
      nextCursor: result.nextCursor,
    };
  }

  /**
   * Get nearby activities
   */
  async getNearbyActivities(
    latitude: number,
    longitude: number,
    options: NearbyActivityOptions = {},
  ): Promise<Activity[]> {
    const { radiusKm = 10, activityTypes, limit = 50 } = options;

    let activities = await this.database.queryNearby('activity', latitude, longitude, radiusKm, {
      where: [
        { field: 'status', operator: 'eq', value: 'SCHEDULED' },
        { field: 'visibility', operator: 'eq', value: 'PUBLIC' },
      ],
      orderBy: [{ field: 'scheduledAt', direction: 'asc' }],
      limit,
    });

    // Filter by activity types if specified
    if (activityTypes && activityTypes.length > 0) {
      activities = activities.filter((a) => activityTypes.includes(a.activityType));
    }

    return activities;
  }

  /**
   * Update an activity
   */
  async updateActivity(activityId: string, data: ActivityUpdateInput): Promise<Activity> {
    return this.database.update('activity', activityId, data);
  }

  /**
   * Start an activity (change status to ACTIVE)
   */
  async startActivity(activityId: string): Promise<Activity> {
    return this.database.update('activity', activityId, {
      status: ActivityStatus.ACTIVE,
      startedAt: new Date(),
    });
  }

  /**
   * Complete an activity (change status to COMPLETED)
   */
  async completeActivity(
    activityId: string,
    stats?: Activity['stats'],
    routeData?: Activity['routeData'],
  ): Promise<Activity> {
    return this.database.update('activity', activityId, {
      status: ActivityStatus.COMPLETED,
      endedAt: new Date(),
      stats: stats ?? null,
      routeData: routeData ?? null,
    });
  }

  /**
   * Cancel an activity
   */
  async cancelActivity(activityId: string): Promise<Activity> {
    return this.database.update('activity', activityId, {
      status: ActivityStatus.CANCELLED,
    });
  }

  /**
   * Request to join an activity
   */
  async joinActivity(activityId: string, userId: string): Promise<ActivityParticipant> {
    // Check if already a participant
    const existing = await this.database.query('activityParticipant', [
      { field: 'activityId', operator: 'eq', value: activityId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    if (existing.length > 0) {
      return existing[0];
    }

    return this.database.create('activityParticipant', {
      activityId,
      userId,
      status: ParticipantStatus.PENDING,
    });
  }

  /**
   * Leave an activity (or cancel join request)
   */
  async leaveActivity(activityId: string, userId: string): Promise<void> {
    const participants = await this.database.query('activityParticipant', [
      { field: 'activityId', operator: 'eq', value: activityId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    if (participants.length > 0) {
      await this.database.delete('activityParticipant', participants[0].id);
    }
  }

  /**
   * Approve a participant's join request
   */
  async approveParticipant(
    activityId: string,
    userId: string,
  ): Promise<ActivityParticipant | null> {
    const participants = await this.database.query('activityParticipant', [
      { field: 'activityId', operator: 'eq', value: activityId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    if (participants.length === 0) {
      return null;
    }

    return this.database.update('activityParticipant', participants[0].id, {
      status: ParticipantStatus.APPROVED,
    });
  }

  /**
   * Decline a participant's join request
   */
  async declineParticipant(
    activityId: string,
    userId: string,
  ): Promise<ActivityParticipant | null> {
    const participants = await this.database.query('activityParticipant', [
      { field: 'activityId', operator: 'eq', value: activityId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    if (participants.length === 0) {
      return null;
    }

    return this.database.update('activityParticipant', participants[0].id, {
      status: ParticipantStatus.DECLINED,
    });
  }

  /**
   * Get pending join requests for an activity
   */
  async getPendingRequests(activityId: string): Promise<ActivityParticipant[]> {
    return this.database.query('activityParticipant', [
      { field: 'activityId', operator: 'eq', value: activityId },
      { field: 'status', operator: 'eq', value: 'PENDING' },
    ]);
  }

  /**
   * Get activities a user has joined
   */
  async getJoinedActivities(userId: string, status?: ParticipantStatus): Promise<Activity[]> {
    const filters = [{ field: 'userId', operator: 'eq' as const, value: userId }];

    if (status) {
      filters.push({ field: 'status', operator: 'eq', value: status });
    }

    const participations = await this.database.query('activityParticipant', filters);

    const activities = await Promise.all(
      participations.map((p) => this.database.get('activity', p.activityId)),
    );

    return activities.filter((a): a is Activity => a !== null);
  }

  /**
   * Get participant status for a user and activity
   */
  async getParticipantStatus(
    activityId: string,
    userId: string,
  ): Promise<ParticipantStatus | null> {
    const participants = await this.database.query('activityParticipant', [
      { field: 'activityId', operator: 'eq', value: activityId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    return participants[0]?.status ?? null;
  }

  /**
   * Delete an activity and all its participants
   */
  async deleteActivity(activityId: string): Promise<void> {
    // Delete all participants first
    const participants = await this.database.query('activityParticipant', [
      { field: 'activityId', operator: 'eq', value: activityId },
    ]);

    await Promise.all(participants.map((p) => this.database.delete('activityParticipant', p.id)));

    // Delete the activity
    await this.database.delete('activity', activityId);
  }
}

/**
 * Create an ActivityService instance
 */
export function createActivityService(database: IDatabaseAdapter): ActivityService {
  return new ActivityService(database);
}
