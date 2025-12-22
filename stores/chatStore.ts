import { ChatWithDetails, MessageWithSender } from '@/types';
import { create } from 'zustand';

interface ChatState {
  chats: ChatWithDetails[];
  activeChatMessages: MessageWithSender[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setChats: (chats: ChatWithDetails[]) => void;
  setActiveChatMessages: (messages: MessageWithSender[]) => void;
  appendMessage: (message: MessageWithSender) => void;
  updateChat: (chatId: string, updates: Partial<ChatWithDetails>) => void;
  setUnreadCount: (count: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChatMessages: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  setChats: (chats) => set({ chats }),
  setActiveChatMessages: (messages) => set({ activeChatMessages: messages }),
  
  appendMessage: (message) => 
    set((state) => ({
      activeChatMessages: [message, ...state.activeChatMessages], // Assumes inverted list for UI
    })),

  updateChat: (chatId, updates) =>
    set((state) => ({
      chats: state.chats.map((c) => (c.id === chatId ? { ...c, ...updates } : c)),
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
