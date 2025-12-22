import { useAdapters } from '@/hooks/useAdapter';
import { createNotificationService } from '@/services/notification';
import { useNotificationStore } from '@/stores/notificationStore';
import { useMemo } from 'react';

export function useNotifications() {
  const { database, realtime } = useAdapters();
  
  const notificationService = useMemo(
    () => createNotificationService(database, realtime),
    [database, realtime]
  );
  
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    setNotifications,
    addNotification,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
    setUnreadCount,
    setLoading,
    setError,
  } = useNotificationStore();

  const fetchNotifications = async (userId: string) => {
    setLoading(true);
    try {
      const { notifications: items } = await notificationService.getUserNotifications(userId);
      setNotifications(items);
      
      const count = await notificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      storeMarkAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async (userId: string) => {
    try {
      await notificationService.markAllAsRead(userId);
      storeMarkAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Subscribe to real-time notifications
  const subscribeToNotifications = (userId: string) => {
    return notificationService.subscribeToNotifications(userId, async (notification) => {
      // Need to fetch actor for the new notification to match store type
      const actorId = notification.data?.userId as string | undefined;
      const actor = actorId ? await database.get('user', actorId) : undefined;
      
      addNotification({ ...notification, user: actor ?? undefined });
    });
  };

  // Auto-subscribe if userId is provided? 
  // For now, consumers should call subscribeToNotifications or we can do it here if we bring in useAuth.
  // Let's rely on the consumer (screen or layout) to call fetch, but for subscription...
  // It's better if the hook manages it if we export a "useNotificationsSubscription" or similar.
  // Or just leave it as exposed function.
    
  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications,
    notificationService,
  };
}
