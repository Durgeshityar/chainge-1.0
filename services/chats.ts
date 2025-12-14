/**
 * Chats Service
 *
 * Handles chat operations including creating chats, sending messages,
 * real-time subscriptions, and read receipts.
 */

import type { DatabaseChange, IDatabaseAdapter, IRealtimeAdapter } from '@/adapters/types';
import type {
  Chat,
  ChatParticipant,
  ChatWithDetails,
  Message,
  MessageWithSender,
  User,
} from '@/types';
import { ChatType } from '@/types';

export interface CreateChatData {
  type: ChatType;
  name?: string;
  participantIds: string[];
}

/**
 * Chat Service
 *
 * Provides chat and messaging functionality.
 */
export class ChatService {
  constructor(private database: IDatabaseAdapter, private realtime: IRealtimeAdapter) {}

  /**
   * Create a new chat
   */
  async createChat(creatorId: string, data: CreateChatData): Promise<Chat> {
    // Create the chat
    const chat = await this.database.create('chat', {
      type: data.type,
      name: data.name ?? null,
      lastMessageId: null,
    });

    // Add creator as participant
    await this.database.create('chatParticipant', {
      chatId: chat.id,
      userId: creatorId,
    });

    // Add other participants
    await Promise.all(
      data.participantIds
        .filter((id) => id !== creatorId)
        .map((userId) =>
          this.database.create('chatParticipant', {
            chatId: chat.id,
            userId,
          }),
        ),
    );

    return chat;
  }

  /**
   * Create or get a direct message chat between two users
   */
  async getOrCreateDirectChat(userId1: string, userId2: string): Promise<Chat> {
    // Find existing DM between these users
    const user1Chats = await this.database.query('chatParticipant', [
      { field: 'userId', operator: 'eq', value: userId1 },
    ]);

    for (const participant of user1Chats) {
      const chat = await this.database.get('chat', participant.chatId);
      if (chat?.type !== ChatType.DIRECT) continue;

      // Check if the other user is in this chat
      const otherParticipants = await this.database.query('chatParticipant', [
        { field: 'chatId', operator: 'eq', value: participant.chatId },
        { field: 'userId', operator: 'eq', value: userId2 },
      ]);

      if (otherParticipants.length > 0) {
        return chat;
      }
    }

    // No existing DM found, create one
    return this.createChat(userId1, {
      type: ChatType.DIRECT,
      participantIds: [userId2],
    });
  }

  /**
   * Get a chat by ID
   */
  async getChatById(chatId: string): Promise<Chat | null> {
    return this.database.get('chat', chatId);
  }

  /**
   * Get a chat with all its details
   */
  async getChatWithDetails(chatId: string): Promise<ChatWithDetails | null> {
    const chat = await this.database.get('chat', chatId);
    if (!chat) return null;

    // Fetch participants
    const participants = await this.database.query('chatParticipant', [
      { field: 'chatId', operator: 'eq', value: chatId },
    ]);

    // Fetch user details for each participant
    const participantsWithUsers = await Promise.all(
      participants.map(async (p) => {
        const user = await this.database.get('user', p.userId);
        return { ...p, user: user ?? undefined };
      }),
    );

    // Fetch recent messages
    const messages = await this.database.list('message', {
      where: [{ field: 'chatId', operator: 'eq', value: chatId }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit: 50,
    });

    // Fetch sender details for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (m) => {
        const sender = await this.database.get('user', m.senderId);
        return { ...m, sender: sender ?? undefined };
      }),
    );

    return {
      ...chat,
      participants: participantsWithUsers,
      messages: messagesWithSenders.reverse(), // Oldest first
    };
  }

  /**
   * Get user's chats sorted by last message
   */
  async getUserChats(userId: string, limit: number = 50): Promise<ChatWithDetails[]> {
    // Get chat IDs the user is part of
    const participations = await this.database.query('chatParticipant', [
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    // Fetch all chats
    const chats = await Promise.all(participations.map((p) => this.getChatWithDetails(p.chatId)));

    // Filter null and sort by last message time
    return chats
      .filter((c): c is ChatWithDetails => c !== null)
      .sort((a, b) => {
        const aTime = a.updatedAt.getTime();
        const bTime = b.updatedAt.getTime();
        return bTime - aTime; // Most recent first
      })
      .slice(0, limit);
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    const message = await this.database.create('message', {
      chatId,
      senderId,
      content,
    });

    // Update chat's last message
    await this.database.update('chat', chatId, {
      lastMessageId: message.id,
    });

    return message;
  }

  /**
   * Get messages for a chat with pagination
   */
  async getChatMessages(
    chatId: string,
    limit: number = 50,
    cursor?: string,
  ): Promise<{ messages: MessageWithSender[]; nextCursor: string | null }> {
    const result = await this.database.paginate('message', {
      where: [{ field: 'chatId', operator: 'eq', value: chatId }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit,
      cursor,
    });

    // Fetch sender details for each message
    const messagesWithSenders = await Promise.all(
      result.data.map(async (m) => {
        const sender = await this.database.get('user', m.senderId);
        return { ...m, sender: sender ?? undefined };
      }),
    );

    return {
      messages: messagesWithSenders,
      nextCursor: result.nextCursor,
    };
  }

  /**
   * Subscribe to new messages in a chat
   */
  subscribeToMessages(chatId: string, callback: (message: Message) => void): () => void {
    return this.realtime.subscribeToTable(
      'message',
      `chatId=eq.${chatId}`,
      (change: DatabaseChange<Message>) => {
        if (change.type === 'INSERT') {
          callback(change.record);
        }
      },
    );
  }

  /**
   * Subscribe to all messages for a user's chats
   */
  subscribeToUserMessages(
    userId: string,
    callback: (message: Message, chatId: string) => void,
  ): () => void {
    return this.realtime.subscribeToTable('message', null, async (change) => {
      if (change.type !== 'INSERT') return;

      const message = change.record as Message;

      // Check if the user is a participant in this chat
      const participations = await this.database.query('chatParticipant', [
        { field: 'chatId', operator: 'eq', value: message.chatId },
        { field: 'userId', operator: 'eq', value: userId },
      ]);

      if (participations.length > 0) {
        callback(message, message.chatId);
      }
    });
  }

  /**
   * Mark chat as read
   */
  async markAsRead(chatId: string, userId: string): Promise<void> {
    const participants = await this.database.query('chatParticipant', [
      { field: 'chatId', operator: 'eq', value: chatId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    if (participants.length > 0) {
      await this.database.update('chatParticipant', participants[0].id, {
        lastReadAt: new Date(),
      });
    }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    // Get all chats the user is part of
    const participations = await this.database.query('chatParticipant', [
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    let unreadCount = 0;

    for (const participation of participations) {
      // Get messages newer than last read
      const lastReadAt = participation.lastReadAt ?? new Date(0);

      const unreadMessages = await this.database.query('message', [
        { field: 'chatId', operator: 'eq', value: participation.chatId },
        { field: 'createdAt', operator: 'gt', value: lastReadAt },
        { field: 'senderId', operator: 'neq', value: userId }, // Don't count own messages
      ]);

      unreadCount += unreadMessages.length;
    }

    return unreadCount;
  }

  /**
   * Check if user is participant in a chat
   */
  async isParticipant(chatId: string, userId: string): Promise<boolean> {
    const participants = await this.database.query('chatParticipant', [
      { field: 'chatId', operator: 'eq', value: chatId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);
    return participants.length > 0;
  }

  /**
   * Get chat participants
   */
  async getParticipants(chatId: string): Promise<(ChatParticipant & { user?: User })[]> {
    const participants = await this.database.query('chatParticipant', [
      { field: 'chatId', operator: 'eq', value: chatId },
    ]);

    return Promise.all(
      participants.map(async (p) => {
        const user = await this.database.get('user', p.userId);
        return { ...p, user: user ?? undefined };
      }),
    );
  }

  /**
   * Add a participant to a group chat
   */
  async addParticipant(chatId: string, userId: string): Promise<void> {
    const chat = await this.database.get('chat', chatId);
    if (!chat || chat.type !== ChatType.GROUP) {
      throw new Error('Can only add participants to group chats');
    }

    const existing = await this.database.query('chatParticipant', [
      { field: 'chatId', operator: 'eq', value: chatId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    if (existing.length === 0) {
      await this.database.create('chatParticipant', {
        chatId,
        userId,
      });
    }
  }

  /**
   * Remove a participant from a group chat
   */
  async removeParticipant(chatId: string, userId: string): Promise<void> {
    const participants = await this.database.query('chatParticipant', [
      { field: 'chatId', operator: 'eq', value: chatId },
      { field: 'userId', operator: 'eq', value: userId },
    ]);

    if (participants.length > 0) {
      await this.database.delete('chatParticipant', participants[0].id);
    }
  }
}

/**
 * Create a ChatService instance
 */
export function createChatService(
  database: IDatabaseAdapter,
  realtime: IRealtimeAdapter,
): ChatService {
  return new ChatService(database, realtime);
}
