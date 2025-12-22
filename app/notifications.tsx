import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowUturnLeftIcon } from 'react-native-heroicons/outline';

import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Chip } from '@/components/ui/Chip';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { NotificationType, NotificationWithUser } from '@/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, fetchNotifications, markAsRead, isLoading } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('All');

  const mockNotifications: NotificationWithUser[] = useMemo(
    () => [
      {
        id: 'mock-match-1',
        userId: user?.id || 'mock-user',
        type: NotificationType.MATCH,
        title: 'New Match',
        body: 'You and Riya liked each other. Say hi while the spark is fresh.',
        data: { matchId: 'riya-user-id', chatId: 'chat-new-match' },
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: 'mock-request-1',
        userId: user?.id || 'mock-user',
        type: NotificationType.CONNECTION_REQUEST,
        title: 'Someone Sent a Request',
        body: 'Aarav wants to connect. Accept or pass.',
        data: { requesterId: 'aarav-user-id' },
        read: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        id: 'mock-like-1',
        userId: user?.id || 'mock-user',
        type: NotificationType.LIKE,
        title: 'Someone Liked Your Photo',
        body: 'Your latest picture is getting attention.',
        data: { postId: 'post-1', likerId: 'unknown-id' },
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'mock-msg-1',
        userId: user?.id || 'mock-user',
        type: NotificationType.MESSAGE,
        title: 'Aarav messaged you',
        body: "Don't leave them hanging.",
        data: { chatId: 'chat-aarav', senderId: 'aarav-user-id' },
        read: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        id: 'mock-event-1',
        userId: user?.id || 'mock-user',
        type: NotificationType.EVENT_REMINDER,
        title: 'Event Reminder',
        body: 'Your meetup with Neha is today. Keep it simple and be yourself.',
        data: { eventId: 'event-1', partnerId: 'neha-user-id' },
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    ],
    [user?.id],
  );

  const loadNotifications = useCallback(() => {
    if (user) {
      fetchNotifications(user.id);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const usingMockData = !notifications.length && !isLoading;
  const displayNotifications = usingMockData ? mockNotifications : notifications;

  const handleNotificationPress = async (notification: NotificationWithUser) => {
    if (usingMockData) return;

    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate logic based on type
    if (notification.type === NotificationType.MESSAGE) {
      const chatId = notification.data?.chatId as string;
      if (chatId) router.push(`/chat/${chatId}`);
    } else if (notification.type === NotificationType.FOLLOW) {
      const followerId = notification.data?.followerId as string;
      if (followerId) router.push(`/user/${followerId}`);
    } else if (
      notification.type === NotificationType.LIKE ||
      notification.type === NotificationType.COMMENT
    ) {
      const postId = notification.data?.postId as string;
      // if (postId) router.push(`/post/${postId}`); // Not implemented yet
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'All') return displayNotifications;
    if (activeFilter === 'Unread') return displayNotifications.filter((n) => !n.read);
    if (activeFilter === 'Requests')
      return displayNotifications.filter(
        (n) =>
          n.type === NotificationType.CONNECTION_REQUEST ||
          n.type === NotificationType.JOIN_REQUEST,
      );
    if (activeFilter === 'Events')
      return displayNotifications.filter((n) => n.type === NotificationType.EVENT_REMINDER);
    return displayNotifications;
  }, [displayNotifications, activeFilter]);

  return (
    <ScreenContainer>
      <Header
        showBack={false}
        leftElement={<Text style={styles.headerTitle}>Notifications</Text>}
        rightElement={
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowUturnLeftIcon size={18} color={colors.text.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.filterContainer}>
        {['All', 'Unread', 'Requests', 'Events'].map((filter) => (
          <Chip
            key={filter}
            label={`${filter} ${
              filter === 'Unread'
                ? '(4)'
                : filter === 'Requests'
                ? '(2)'
                : filter === 'Events'
                ? '(2)'
                : ''
            }`}
            selected={activeFilter === filter}
            onPress={() => setActiveFilter(filter)}
            size="small"
          />
        ))}
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={handleNotificationPress} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadNotifications}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={null}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    ...typography.presets.h2,
    color: colors.text.primary,
  },

  filterContainer: {
    flexDirection: 'row',
    paddingBottom: 16,
    paddingTop: 8,
    gap: 8,
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  backButton: {
    width: 35,
    height: 35,
    borderRadius: 22,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
  },
});
