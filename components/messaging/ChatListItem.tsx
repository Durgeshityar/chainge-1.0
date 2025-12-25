import { ChatAvatar } from '@/components/messaging/ChatAvatar';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { ChatType, ChatWithDetails } from '@/types';
import { format } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SpeakerWaveIcon, SpeakerXMarkIcon, TrashIcon } from 'react-native-heroicons/outline';

interface ChatListItemProps {
  chat: ChatWithDetails;
  onPress: (chatId: string) => void;
  onDelete?: (chatId: string) => void;
  onMuteToggle?: (chatId: string, muted: boolean) => void;
  isMuted?: boolean;
  unreadCount?: number;
  onSwipeableOpen?: (ref: Swipeable) => void;
  closeSwipeable?: boolean;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  onPress,
  onDelete,
  onMuteToggle,
  isMuted = false,
  unreadCount = 0,
  onSwipeableOpen,
}) => {
  const { user } = useAuth();
  const swipeableRef = React.useRef<Swipeable>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [muted, setMuted] = useState(isMuted);

  if (!user) return null;

  const participants = useMemo(
    () => chat.participants?.map((p) => p.user).filter(Boolean) || [],
    [chat.participants],
  );
  const primaryUser = participants.find((p) => p?.id !== user.id) || participants[0];
  const participantCount = participants.length;

  const chatName = useMemo(() => {
    if (chat.type === ChatType.DIRECT && primaryUser) {
      return primaryUser.name || primaryUser.username;
    }
    return chat.name || 'Unknown Chat';
  }, [chat.name, chat.type, primaryUser]);

  const isMatched = (chat as { isMatched?: boolean }).isMatched ?? false;
  const isGroup = chat.type === ChatType.GROUP || participantCount > 2;

  const lastMessage = chat.messages?.length ? chat.messages[chat.messages.length - 1] : null;
  const messagePreview = lastMessage?.content || 'Incoming texts written here will be seen here';
  const timeDisplay =
    lastMessage?.createdAt || chat.updatedAt
      ? format(new Date(lastMessage?.createdAt || chat.updatedAt), 'h:mm a')
      : '';

  const handleMuteToggle = () => {
    const newMutedState = !muted;
    setMuted(newMutedState);
    onMuteToggle?.(chat.id, newMutedState);
    swipeableRef.current?.close();
  };

  const handleDeletePress = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(chat.id);
    swipeableRef.current?.close();
  };

  const renderAvatar = () => {
    const usersToShow = participants.filter((p) => p?.id !== user.id);
    const displayUsers = usersToShow.length > 0 ? usersToShow : participants;

    const avatarUrls = displayUsers.map((u) => u?.avatarUrl);
    const displayNames = displayUsers.map((u) => u?.name || u?.username);

    let variant: 'single' | 'matched' | 'group' | undefined;
    if (isMatched) variant = 'matched';
    else if (isGroup) variant = 'group';
    else variant = 'single';

    return (
      <ChatAvatar
        avatars={avatarUrls}
        names={displayNames}
        variant={variant}
        size={50}
      />
    );
  };

  const renderActions = () => {
    return (
      <View style={styles.actionsWrapper}>
        <View style={styles.actionsContainer}>
          <ActionButton
            icon={
              muted ? (
                <SpeakerWaveIcon size={20} color={colors.text.primary} />
              ) : (
                <SpeakerXMarkIcon size={20} color={colors.text.primary} />
              )
            }
            onPress={handleMuteToggle}
          />
          <ActionButton
            icon={<TrashIcon size={20} color={colors.status.error} />}
            onPress={handleDeletePress}
            isDestructive
          />
        </View>
      </View>
    );
  };

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderActions}
        overshootRight={false}
        onSwipeableOpen={() => onSwipeableOpen?.(swipeableRef.current!)}
        containerStyle={styles.swipeableContainer}
      >
        <TouchableOpacity
          style={styles.container}
          onPress={() => onPress(chat.id)}
          activeOpacity={0.9}
        >
          <View style={styles.avatarContainer}>{renderAvatar()}</View>

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.nameContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {chatName}
                </Text>
                {muted && (
                  <SpeakerXMarkIcon size={14} color={colors.text.tertiary} style={styles.mutedIcon} />
                )}
              </View>
              <View style={styles.metaRight}>
                {unreadCount > 0 && <View style={styles.statusDot} />}
                <Text style={styles.time}>{timeDisplay}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text
                style={[styles.message, unreadCount > 0 && styles.messageUnread]}
                numberOfLines={1}
              >
                {messagePreview}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>

      <Modal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Conversation"
        message={`Are you sure you want to delete your conversation with ${chatName}? This action cannot be undone.`}
        actions={[
          {
            label: 'Delete',
            onPress: handleConfirmDelete,
            variant: 'destructive',
          },
          {
            label: 'Cancel',
            onPress: () => {},
            variant: 'cancel',
          },
        ]}
      />
    </>
  );
};

const ActionButton = ({
  icon,
  onPress,
  isDestructive = false,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  isDestructive?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.actionButton, isDestructive && styles.actionButtonDestructive]}
    activeOpacity={0.75}
  >
    {icon}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.charcoal,
    height: 88,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  avatarContainer: {
    width: 80,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 17,
    flexShrink: 1,
  },
  mutedIcon: {
    marginLeft: 6,
  },
  time: {
    ...typography.presets.labelSmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  message: {
    ...typography.presets.bodyMedium,
    color: colors.text.tertiary,
    flex: 1,
    marginRight: 8,
  },
  messageUnread: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.error,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Actions Styles
  actionsWrapper: {
    width: 130,
    height: 88,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDestructive: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
  },
});
