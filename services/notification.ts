/**
 * Notification Service
 *
 * Handles notification operations including fetching, marking as read,
 * and real-time subscriptions for notifications.
 */

import type { IDatabaseAdapter, IRealtimeAdapter } from '@/adapters/types';
import type { Notification, User } from '@/types';
import { NotificationType } from '@/types';

export interface NotificationWithActor extends Notification {
  actor?: User;
}

/**
 * Notification Service
 *
 * Provides notification management functionality.
 */
export class NotificationService {
  constructor(private database: IDatabaseAdapter, private realtime: IRealtimeAdapter) {}

  /**
   * Get notifications for a user with pagination
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    cursor?: string,
  ): Promise<{ notifications: NotificationWithActor[]; nextCursor: string | null }> {
    const result = await this.database.paginate('notification', {
      where: [{ field: 'userId', operator: 'eq', value: userId }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit,
      cursor,
    });

    // Fetch actor details for each notification (actor ID stored in data.userId)
    const notificationsWithActors = await Promise.all(
      result.data.map(async (n) => {
        const actorId = n.data?.userId as string | undefined;
        const actor = actorId ? await this.database.get('user', actorId) : undefined;
        return { ...n, actor: actor ?? undefined };
      }),
    );

    return {
      notifications: notificationsWithActors,
      nextCursor: result.nextCursor,
    };
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const unread = await this.database.query('notification', [
      { field: 'userId', operator: 'eq', value: userId },
      { field: 'read', operator: 'eq', value: false },
    ]);
    return unread.length;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.database.update('notification', notificationId, {
      read: true,
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    const unread = await this.database.query('notification', [
      { field: 'userId', operator: 'eq', value: userId },
      { field: 'read', operator: 'eq', value: false },
    ]);

    await Promise.all(
      unread.map((n) => this.database.update('notification', n.id, { read: true })),
    );
  }

  /**
   * Subscribe to new notifications
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void,
  ): () => void {
    return this.realtime.subscribeToTable('notification', `userId=eq.${userId}`, (change) => {
      if (change.type === 'INSERT') {
        callback(change.record as Notification);
      }
    });
  }

  /**
   * Create a notification
   * (Usually called by other services when events happen)
   */
  async createNotification(params: {
    type: NotificationType;
    userId: string;
    actorId?: string;
    title: string;
    body: string;
    extraData?: Record<string, unknown>;
  }): Promise<Notification> {
    return this.database.create('notification', {
      type: params.type,
      userId: params.userId,
      title: params.title,
      body: params.body,
      data: {
        userId: params.actorId,
        ...params.extraData,
      },
      read: false,
    });
  }

  /**
   * Create a follow notification
   */
  async notifyFollow(followerId: string, followedId: string): Promise<void> {
    const follower = await this.database.get('user', followerId);
    if (!follower) return;

    await this.createNotification({
      type: NotificationType.FOLLOW,
      userId: followedId,
      actorId: followerId,
      title: 'New Follower',
      body: `${follower.displayName ?? follower.username} started following you`,
      extraData: { followerId },
    });
  }

  /**
   * Create a like notification
   */
  async notifyLike(likerId: string, postId: string, postOwnerId: string): Promise<void> {
    // Don't notify if liking own post
    if (likerId === postOwnerId) return;

    const liker = await this.database.get('user', likerId);
    if (!liker) return;

    await this.createNotification({
      type: NotificationType.LIKE,
      userId: postOwnerId,
      actorId: likerId,
      title: 'New Like',
      body: `${liker.displayName ?? liker.username} liked your post`,
      extraData: { postId, likerId },
    });
  }

  /**
   * Create a comment notification
   */
  async notifyComment(
    commenterId: string,
    postId: string,
    postOwnerId: string,
    commentPreview: string,
  ): Promise<void> {
    // Don't notify if commenting on own post
    if (commenterId === postOwnerId) return;

    const commenter = await this.database.get('user', commenterId);
    if (!commenter) return;

    await this.createNotification({
      type: NotificationType.COMMENT,
      userId: postOwnerId,
      actorId: commenterId,
      title: 'New Comment',
      body: `${commenter.displayName ?? commenter.username}: "${commentPreview.slice(0, 50)}${
        commentPreview.length > 50 ? '...' : ''
      }"`,
      extraData: { postId, commenterId },
    });
  }

  /**
   * Create an activity join notification
   */
  async notifyActivityJoin(
    activityId: string,
    activityOwnerId: string,
    joinerId: string,
  ): Promise<void> {
    const joiner = await this.database.get('user', joinerId);
    if (!joiner) return;

    const activity = await this.database.get('activity', activityId);
    if (!activity) return;

    await this.createNotification({
      type: NotificationType.JOIN_REQUEST,
      userId: activityOwnerId,
      actorId: joinerId,
      title: 'Activity Join Request',
      body: `${joiner.displayName ?? joiner.username} wants to join your ${
        activity.activityType
      } activity`,
      extraData: { activityId, joinerId },
    });
  }

  /**
   * Create an activity approval notification
   */
  async notifyActivityApproval(
    activityId: string,
    participantId: string,
    approved: boolean,
  ): Promise<void> {
    const activity = await this.database.get('activity', activityId);
    if (!activity) return;

    const owner = await this.database.get('user', activity.userId);
    if (!owner) return;

    await this.createNotification({
      type: approved ? NotificationType.JOIN_APPROVED : NotificationType.JOIN_DECLINED,
      userId: participantId,
      actorId: activity.userId,
      title: approved ? 'Request Approved' : 'Request Declined',
      body: approved
        ? `You've been approved to join the ${activity.activityType} activity`
        : `Your request to join the ${activity.activityType} activity was declined`,
      extraData: { activityId, approved },
    });
  }

  /**
   * Create a message notification
   */
  async notifyMessage(
    chatId: string,
    senderId: string,
    recipientId: string,
    messagePreview: string,
  ): Promise<void> {
    // Don't notify sender
    if (senderId === recipientId) return;

    const sender = await this.database.get('user', senderId);
    if (!sender) return;

    await this.createNotification({
      type: NotificationType.MESSAGE,
      userId: recipientId,
      actorId: senderId,
      title: 'New Message',
      body: `${sender.displayName ?? sender.username}: "${messagePreview.slice(0, 50)}${
        messagePreview.length > 50 ? '...' : ''
      }"`,
      extraData: { chatId, senderId },
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await this.database.delete('notification', notificationId);
  }

  /**
   * Delete old read notifications
   */
  async deleteOldNotifications(userId: string, daysOld: number = 30): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const oldNotifications = await this.database.query('notification', [
      { field: 'userId', operator: 'eq', value: userId },
      { field: 'read', operator: 'eq', value: true },
      { field: 'createdAt', operator: 'lt', value: cutoff },
    ]);

    await Promise.all(oldNotifications.map((n) => this.database.delete('notification', n.id)));
  }
}

/**
 * Create a NotificationService instance
 */
export function createNotificationService(
  database: IDatabaseAdapter,
  realtime: IRealtimeAdapter,
): NotificationService {
  return new NotificationService(database, realtime);
}
