import { BottomSheet, BottomSheetRef } from '@/components/ui/BottomSheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { MessageWithSender } from '@/types';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChatBubbleLeftRightIcon } from 'react-native-heroicons/outline';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Available reactions
const REACTIONS = [
  { emoji: '👍', name: 'thumbs_up' },
  { emoji: '❤️', name: 'heart' },
  { emoji: '😂', name: 'laugh' },
  { emoji: '😮', name: 'wow' },
  { emoji: '😢', name: 'sad' },
  { emoji: '🔥', name: 'fire' },
];

export interface MessageReaction {
  emoji: string;
  name: string;
  count: number;
  userIds: string[];
}

export interface MessageActionsSheetRef {
  open: (message: MessageWithSender) => void;
  close: () => void;
}

interface MessageActionsSheetProps {
  onReact: (messageId: string, reaction: string) => void;
  onReply: (message: MessageWithSender) => void;
}

export const MessageActionsSheet = forwardRef<MessageActionsSheetRef, MessageActionsSheetProps>(
  ({ onReact, onReply }, ref) => {
    const bottomSheetRef = useRef<BottomSheetRef>(null);
    const [selectedMessage, setSelectedMessage] = React.useState<MessageWithSender | null>(null);

    useImperativeHandle(ref, () => ({
      open: (message: MessageWithSender) => {
        setSelectedMessage(message);
        bottomSheetRef.current?.scrollTo(-SCREEN_HEIGHT * 0.35);
      },
      close: () => {
        bottomSheetRef.current?.scrollTo(0);
        setSelectedMessage(null);
      },
    }));

    const handleReaction = (reaction: string) => {
      if (selectedMessage) {
        onReact(selectedMessage.id, reaction);
      }
      bottomSheetRef.current?.scrollTo(0);
    };

    const handleReply = () => {
      if (selectedMessage) {
        onReply(selectedMessage);
      }
      bottomSheetRef.current?.scrollTo(0);
    };

    const handleClose = () => {
      setSelectedMessage(null);
    };

    // Get preview text for the message
    const getPreviewText = () => {
      if (!selectedMessage) return '';
      const content = selectedMessage.content || '';
      if (content.length > 50) {
        return content.substring(0, 50) + '...';
      }
      return content || 'Media message';
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['35%']}
        backgroundColor="#1A1A1A"
        onClose={handleClose}
      >
        <View style={styles.container}>
          {/* Message Preview */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Reacting to:</Text>
            <Text style={styles.previewText} numberOfLines={2}>
              {getPreviewText()}
            </Text>
          </View>

          {/* Reactions Row */}
          <View style={styles.reactionsContainer}>
            <Text style={styles.sectionLabel}>Add Reaction</Text>
            <View style={styles.reactionsRow}>
              {REACTIONS.map((reaction) => (
                <TouchableOpacity
                  key={reaction.name}
                  style={styles.reactionButton}
                  onPress={() => handleReaction(reaction.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReply}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <ChatBubbleLeftRightIcon size={20} color={colors.text.primary} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Reply in Thread</Text>
                <Text style={styles.actionSubtitle}>Start a conversation about this message</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    );
  }
);

MessageActionsSheet.displayName = 'MessageActionsSheet';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  previewContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  previewLabel: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  previewText: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
  },
  reactionsContainer: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.sm,
  },
  reactionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 24,
  },
  actionsContainer: {
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: spacing.md,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  actionSubtitle: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});
