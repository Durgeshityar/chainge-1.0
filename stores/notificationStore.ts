import { NotificationWithUser } from '@/types';
import { create } from 'zustand';

interface NotificationState {
  notifications: NotificationWithUser[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setNotifications: (notifications: NotificationWithUser[]) => void;
  addNotification: (notification: NotificationWithUser) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
      return {};
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
