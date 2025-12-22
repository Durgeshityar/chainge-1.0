import { MeshGradientView } from 'expo-mesh-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ChatHeader } from '@/components/messaging/ChatHeader';
import { ChatInput } from '@/components/messaging/ChatInput';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { colors } from '@/theme/colors';
import { ChatType } from '@/types';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    chats, 
    activeChatMessages, 
    fetchChatMessages, 
    sendMessage, 
  } = useChat();

  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchChatMessages(id);
    }
  }, [id, fetchChatMessages]);

  // Find chat metadata from list
  const chat = chats.find(c => c.id === id);
  
  // Determine header title
  let title = chat?.name || 'Chat';
  if (chat?.type === ChatType.DIRECT && user) {
    const otherParticipant = chat.participants?.find((p) => p.userId !== user.id);
    if (otherParticipant?.user) {
      title = otherParticipant.user.name || otherParticipant.user.username;
    }
  }

  const otherParticipant = chat?.participants?.find((p) => p.userId !== user?.id);
  const otherUserId = otherParticipant?.userId;

  const handleSend = async (content: string, images?: string[]) => {
    if (!id || !user) return;
    
    setSending(true);
    try {
      // images are passed here, we'll need to ensure the hook supports them
      await sendMessage(id, user.id, content, images);
    } catch (err) {
      console.error('Send failed', err);
    } finally {
      setSending(false);
    }
  };

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
          data={activeChatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} showSenderName={chat?.type === ChatType.GROUP} />
          )}
          inverted
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        
        <ChatInput onSend={handleSend} isLoading={sending} />
      </ScreenContainer>
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
    paddingHorizontal: 0, // Override default padding
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
  },
});
