import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet, BottomSheetRef } from '@/components/ui/BottomSheet';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { MessageWithSender } from '@/types';
import { format } from 'date-fns';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PaperAirplaneIcon, XMarkIcon } from 'react-native-heroicons/solid';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ThreadReply {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  createdAt: Date;
}

export interface ThreadSheetRef {
  open: (message: MessageWithSender, existingReplies?: ThreadReply[]) => void;
  close: () => void;
}

interface ThreadSheetProps {
  onSendReply: (messageId: string, content: string) => void;
}

export const ThreadSheet = forwardRef<ThreadSheetRef, ThreadSheetProps>(
  ({ onSendReply }, ref) => {
    const bottomSheetRef = useRef<BottomSheetRef>(null);
    const { user } = useAuth();
    const [parentMessage, setParentMessage] = useState<MessageWithSender | null>(null);
    const [replies, setReplies] = useState<ThreadReply[]>([]);
    const [replyText, setReplyText] = useState('');
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      open: (message: MessageWithSender, existingReplies?: ThreadReply[]) => {
        setParentMessage(message);
        setReplies(existingReplies || []);
        setReplyText('');
        bottomSheetRef.current?.scrollTo(-SCREEN_HEIGHT * 0.75);
      },
      close: () => {
        bottomSheetRef.current?.scrollTo(0);
        setParentMessage(null);
        setReplies([]);
      },
    }));

    const handleClose = () => {
      setParentMessage(null);
      setReplies([]);
      setReplyText('');
    };

    const handleSend = () => {
      if (!replyText.trim() || !parentMessage || !user) return;

      const newReply: ThreadReply = {
        id: `reply-${Date.now()}`,
        content: replyText.trim(),
        senderId: user.id,
        senderName: user.name || user.username,
        senderAvatar: user.avatarUrl || undefined,
        createdAt: new Date(),
      };

      setReplies(prev => [...prev, newReply]);
      onSendReply(parentMessage.id, replyText.trim());
      setReplyText('');
    };

    const renderParentMessage = () => {
      if (!parentMessage) return null;

      const isMe = user?.id === parentMessage.senderId;

      return (
        <View style={styles.parentContainer}>
          <View style={styles.parentHeader}>
            <Text style={styles.threadTitle}>Thread</Text>
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.scrollTo(0)}
              style={styles.closeButton}
            >
              <XMarkIcon size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.parentMessage}>
            <View style={styles.parentAvatarRow}>
              <Avatar
                source={parentMessage.sender?.avatarUrl || undefined}
                name={parentMessage.sender?.name || parentMessage.sender?.username}
                size="sm"
              />
              <View style={styles.parentInfo}>
                <Text style={styles.parentSender}>
                  {isMe ? 'You' : parentMessage.sender?.name || parentMessage.sender?.username}
                </Text>
                <Text style={styles.parentTime}>
                  {format(new Date(parentMessage.createdAt), 'MMM d, h:mm a')}
                </Text>
              </View>
            </View>
            <Text style={styles.parentContent}>
              {parentMessage.content || 'Media message'}
            </Text>
          </View>

          <View style={styles.repliesHeader}>
            <View style={styles.dividerLine} />
            <Text style={styles.repliesCount}>
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </Text>
            <View style={styles.dividerLine} />
          </View>
        </View>
      );
    };

    const renderReply = ({ item }: { item: ThreadReply }) => {
      const isMe = user?.id === item.senderId;

      return (
        <View style={[styles.replyContainer, isMe && styles.replyContainerMe]}>
          {!isMe && (
            <Avatar
              source={item.senderAvatar}
              name={item.senderName}
              size={24}
            />
          )}
          <View style={[styles.replyBubble, isMe ? styles.replyBubbleMe : styles.replyBubbleOther]}>
            {!isMe && (
              <Text style={styles.replySender}>{item.senderName}</Text>
            )}
            <Text style={[styles.replyContent, isMe && styles.replyContentMe]}>
              {item.content}
            </Text>
            <Text style={styles.replyTime}>
              {format(new Date(item.createdAt), 'h:mm a')}
            </Text>
          </View>
        </View>
      );
    };

    const renderEmptyState = () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No replies yet</Text>
        <Text style={styles.emptySubtext}>Be the first to reply to this message</Text>
      </View>
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['75%']}
        backgroundColor="#0D0D0D"
        onClose={handleClose}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={100}
        >
          {renderParentMessage()}

          <FlatList
            data={replies}
            keyExtractor={(item) => item.id}
            renderItem={renderReply}
            contentContainerStyle={styles.repliesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
          />

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Reply in thread..."
              placeholderTextColor={colors.text.tertiary}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!replyText.trim()}
            >
              <PaperAirplaneIcon
                size={20}
                color={replyText.trim() ? colors.primary : colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  }
);

ThreadSheet.displayName = 'ThreadSheet';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  parentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  parentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  threadTitle: {
    ...typography.presets.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentMessage: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.md,
  },
  parentAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  parentInfo: {
    marginLeft: spacing.sm,
  },
  parentSender: {
    ...typography.presets.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  parentTime: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  parentContent: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    lineHeight: 22,
  },
  repliesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  repliesCount: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  repliesList: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  replyContainerMe: {
    justifyContent: 'flex-end',
  },
  replyBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: 16,
  },
  replyBubbleOther: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
  },
  replyBubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  replySender: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  replyContent: {
    ...typography.presets.bodySmall,
    color: colors.text.primary,
    lineHeight: 20,
  },
  replyContentMe: {
    color: colors.jetBlack,
  },
  replyTime: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  emptySubtext: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0D0D0D',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    ...typography.presets.bodySmall,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(152, 255, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
