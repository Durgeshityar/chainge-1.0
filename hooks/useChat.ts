import { useAdapters } from '@/hooks/useAdapter';
import { createChatService } from '@/services/chats';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { MessageWithSender } from '@/types';
import { useCallback, useEffect, useMemo } from 'react';

export function useChat() {
  const { database, realtime } = useAdapters();

  const chatService = useMemo(() => createChatService(database, realtime), [database, realtime]);

  const {
    chats,
    activeChatMessages,
    activeChatId,
    unreadCount,
    isLoading,
    error,
    setChats,
    setActiveChatMessages,
    setActiveChatId,
    appendMessage,
    updateChat,
    setUnreadCount,
    setLoading,
    setError,
  } = useChatStore();

  const userId = useAuthStore((state) => state.profile?.id ?? state.authUser?.id ?? null);

  const fetchUserChats = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      let userChats = await chatService.getUserChats(userId);

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
    setActiveChatId(chatId);
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
  }, [chatService, setActiveChatMessages, setActiveChatId, setLoading, setError]);

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
      const count = await chatService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [chatService, setUnreadCount]);

  const clearActiveChat = useCallback(() => {
    setActiveChatId(null);
  }, [setActiveChatId]);

  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    const unsubscribe = chatService.subscribeToMessages(activeChatId, async (message) => {
      const sender = await database.get('user', message.senderId);
      const messageWithSender: MessageWithSender = { ...message, sender: sender ?? undefined };

      appendMessage(messageWithSender);
      updateChat(activeChatId, { updatedAt: message.createdAt });

      if (userId && message.senderId !== userId) {
        const count = await chatService.getUnreadCount(userId);
        setUnreadCount(count);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeChatId, chatService, database, appendMessage, updateChat, userId, setUnreadCount]);

  return {
    chats,
    activeChatMessages,
    activeChatId,
    unreadCount,
    isLoading,
    error,
    fetchUserChats,
    fetchChatMessages,
    sendMessage,
    markAsRead,
    clearActiveChat,
    chatService, // Expose service for custom needs
  };
}
