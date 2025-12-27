import { MeshGradientView } from 'expo-mesh-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ChatHeader } from '@/components/messaging/ChatHeader';
import { ChatInput } from '@/components/messaging/ChatInput';
import { MessageActionsSheet, MessageActionsSheetRef } from '@/components/messaging/MessageActionsSheet';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import { ThreadReply, ThreadSheet, ThreadSheetRef } from '@/components/messaging/ThreadSheet';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { colors } from '@/theme/colors';
import { ChatType, MessageWithSender } from '@/types';

// Emoji map for reactions
const REACTION_EMOJIS: { [key: string]: string } = {
  thumbs_up: '👍',
  heart: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  fire: '🔥',
};

export default function ChatDetailScreen() {
  const { id, name, avatarUrl } = useLocalSearchParams<{
    id: string;
    name?: string;
    avatarUrl?: string;
  }>();
  const { user } = useAuth();
  const {
    chats,
    activeChatMessages,
    fetchChatMessages,
    sendMessage,
    clearActiveChat,
  } = useChat();

  const [sending, setSending] = useState(false);
  const [messageReactions, setMessageReactions] = useState<{
    [messageId: string]: { emoji: string; name: string; count: number; userIds: string[] }[]
  }>({});
  const [messageThreads, setMessageThreads] = useState<{
    [messageId: string]: ThreadReply[]
  }>({});

  const messageActionsRef = useRef<MessageActionsSheetRef>(null);
  const threadSheetRef = useRef<ThreadSheetRef>(null);

  useEffect(() => {
    if (id) {
      fetchChatMessages(id);
    }

    return () => {
      clearActiveChat();
    };
  }, [id, fetchChatMessages, clearActiveChat]);

  // Find chat metadata from list
  const chat = chats.find(c => c.id === id);

  // Determine header title
  let title = chat?.name || name || 'Chat';
  if (chat?.type === ChatType.DIRECT && user) {
    const otherParticipant = chat.participants?.find((p) => p.userId !== user.id);
    if (otherParticipant?.user) {
      title = otherParticipant.user.name || otherParticipant.user.username;
    }
  } else if (!chat && name) {
    title = name;
  }

  const otherParticipant = chat?.participants?.find((p) => p.userId !== user?.id);
  const otherUserId = otherParticipant?.userId;

  const handleSend = async (content: string, images?: string[]) => {
    if (!id || !user) return;

    setSending(true);
    try {
      await sendMessage(id, user.id, content, images);
    } catch (err) {
      console.error('Send failed', err);
    } finally {
      setSending(false);
    }
  };

  const handleMessageLongPress = useCallback((message: MessageWithSender) => {
    messageActionsRef.current?.open(message);
  }, []);

  const handleReaction = useCallback((messageId: string, reactionName: string) => {
    if (!user) return;

    setMessageReactions(prev => {
      const existingReactions = prev[messageId] || [];
      const existingReactionIndex = existingReactions.findIndex(r => r.name === reactionName);

      if (existingReactionIndex >= 0) {
        const reaction = existingReactions[existingReactionIndex];
        if (reaction.userIds.includes(user.id)) {
          const updatedReaction = {
            ...reaction,
            count: reaction.count - 1,
            userIds: reaction.userIds.filter(uid => uid !== user.id),
          };
          if (updatedReaction.count === 0) {
            return {
              ...prev,
              [messageId]: existingReactions.filter((_, i) => i !== existingReactionIndex),
            };
          }
          return {
            ...prev,
            [messageId]: existingReactions.map((r, i) =>
              i === existingReactionIndex ? updatedReaction : r
            ),
          };
        } else {
          return {
            ...prev,
            [messageId]: existingReactions.map((r, i) =>
              i === existingReactionIndex
                ? { ...r, count: r.count + 1, userIds: [...r.userIds, user.id] }
                : r
            ),
          };
        }
      } else {
        return {
          ...prev,
          [messageId]: [
            ...existingReactions,
            {
              emoji: REACTION_EMOJIS[reactionName] || '👍',
              name: reactionName,
              count: 1,
              userIds: [user.id],
            },
          ],
        };
      }
    });
  }, [user]);

  const handleStartThread = useCallback((message: MessageWithSender) => {
    // Close the actions sheet and open the thread sheet
    messageActionsRef.current?.close();
    const existingReplies = messageThreads[message.id] || [];
    threadSheetRef.current?.open(message, existingReplies);
  }, [messageThreads]);

  const handleThreadPress = useCallback((message: MessageWithSender) => {
    const existingReplies = messageThreads[message.id] || [];
    threadSheetRef.current?.open(message, existingReplies);
  }, [messageThreads]);

  const handleSendReply = useCallback((messageId: string, content: string) => {
    if (!user) return;

    const newReply: ThreadReply = {
      id: `reply-${Date.now()}`,
      content,
      senderId: user.id,
      senderName: user.name || user.username,
      senderAvatar: user.avatarUrl || undefined,
      createdAt: new Date(),
    };

    setMessageThreads(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), newReply],
    }));
  }, [user]);

  // Enhance messages with reactions and thread counts
  const enhancedMessages = activeChatMessages.map(msg => ({
    ...msg,
    reactions: messageReactions[msg.id] || [],
    threadCount: (messageThreads[msg.id] || []).length,
  }));

  return (
    <View style={styles.root}>
      <MeshGradientView
        style={StyleSheet.absoluteFill}
        columns={3}
        rows={3}
        colors={[
          colors.background.black, colors.background.charcoal, colors.background.black,
          colors.background.charcoal, '#0A2312', colors.background.charcoal,
          colors.background.black, colors.background.black, colors.background.black,
        ]}
      />
      <ScreenContainer
        safeAreaEdges={['bottom']}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardAvoiding
      >
        <ChatHeader
          title={title}
          isOnline={true}
          otherUserId={otherUserId}
        />

        <FlatList
          data={enhancedMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              showSenderName={chat?.type === ChatType.GROUP}
              onLongPress={handleMessageLongPress}
              onThreadPress={handleThreadPress}
            />
          )}
          inverted
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <ChatInput onSend={handleSend} isLoading={sending} />
      </ScreenContainer>

      <MessageActionsSheet
        ref={messageActionsRef}
        onReact={handleReaction}
        onReply={handleStartThread}
      />

      <ThreadSheet
        ref={threadSheetRef}
        onSendReply={handleSendReply}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.black,
  },
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  contentContainer: {
    paddingHorizontal: 0,
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
  },
});
