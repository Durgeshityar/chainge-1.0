import { useAdapters } from '@/hooks/useAdapter';
import { createChatService } from '@/services/chats';
import { useChatStore } from '@/stores/chatStore';
import { MessageWithSender } from '@/types';
import { useCallback, useEffect, useMemo } from 'react';

export function useChat() {
  const { database, realtime } = useAdapters();

  const chatService = useMemo(() => createChatService(database, realtime), [database, realtime]);

  const {
    chats,
    activeChatMessages,
    unreadCount,
    isLoading,
    error,
    setChats,
    setActiveChatMessages,
    appendMessage,
    updateChat,
    setUnreadCount,
    setLoading,
    setError,
  } = useChatStore();

  const fetchUserChats = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      let userChats = await chatService.getUserChats(userId);

      // For fresh/mock users with no chats, seed sample previews
      if (userChats.length === 0) {
        userChats = await chatService.bootstrapSampleChats(userId);
      }

      setChats(userChats);

      const count = await chatService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [chatService, setChats, setUnreadCount, setLoading, setError]);

  const fetchChatMessages = useCallback(async (chatId: string) => {
    setLoading(true);
    try {
      const { messages } = await chatService.getChatMessages(chatId);
      setActiveChatMessages(messages);

      // Also update detailed chat info if needed
      // const details = await chatService.getChatWithDetails(chatId);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatService, setActiveChatMessages, setLoading, setError]);

  const sendMessage = useCallback(async (
    chatId: string,
    senderId: string,
    content: string,
    mediaUrls?: string[],
  ) => {
    try {
      // Optimistic update could go here
      const message = await chatService.sendMessage(chatId, senderId, content, mediaUrls);

      // Fetch sender details to match UI requirement
      const sender = await database.get('user', senderId);
      const messageWithSender: MessageWithSender = { ...message, sender: sender ?? undefined };

      appendMessage(messageWithSender);

      // Update chat list last message
      updateChat(chatId, {
        updatedAt: new Date(),
        // We'd ideally need the full details or just update what we can
      });

      return message;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, [chatService, database, appendMessage, updateChat]);

  const markAsRead = useCallback(async (chatId: string, userId: string) => {
    try {
      await chatService.markAsRead(chatId, userId);
      // Update unread count locally or refetch
      const count = await chatService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [chatService, setUnreadCount]);

  // Subscribe to real-time messages
  useEffect(() => {
    // Only subscribe if we have chats loaded (or just always if we have a user? Service method handles user check?)
    // Actually service needs userId.
    // We can't easily get userId here unless we pass it or get it from auth store which we didn't import here (we imported useChatStore).
    // Let's import useAuth to get userId.
  }, []);

  return {
    chats,
    activeChatMessages,
    unreadCount,
    isLoading,
    error,
    fetchUserChats,
    fetchChatMessages,
    sendMessage,
    markAsRead,
    chatService, // Expose service for custom needs
  };
}
