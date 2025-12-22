import { ChatAvatar } from '@/components/messaging/ChatAvatar';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { ChatType, ChatWithDetails } from '@/types';
import { format } from 'date-fns';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { EyeIcon, SpeakerXMarkIcon, TrashIcon } from 'react-native-heroicons/outline';

interface ChatListItemProps {
  chat: ChatWithDetails;
  onPress: (chatId: string) => void;
  unreadCount?: number;
  onSwipeableOpen?: (ref: Swipeable) => void;
  closeSwipeable?: boolean;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  onPress,
  unreadCount = 0,
  onSwipeableOpen,
}) => {
  const { user } = useAuth();
  const swipeableRef = React.useRef<Swipeable>(null);

  if (!user) return null;

  const participants = useMemo(
    () => chat.participants?.map((p) => p.user).filter(Boolean) || [],
    [chat.participants],
  );
  const primaryUser = participants.find((p) => p?.id !== user.id) || participants[0];
  const secondaryUser = participants.find((p) => p && p.id !== primaryUser?.id && p.id !== user.id);
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

  const renderAvatar = () => {
    // If it's a group but has < 3 participants, it might technically be a direct chat in logic,
    // but here we trust isGroup/isMatched flags or participant count.
    // The snippet logic uses 'variant' prop.
    // ChatAvatar determines variant by count if not provided.
    // We can explicitly pass avatars list.

    // Collect all avatars and names
    // For 1-on-1, primaryUser is the other person.
    // For direct chat, we usually want the other person's avatar.
    // For group, we want all participants (excluding self usually, or including?
    // designs usually show other members).
    // Let's filter out 'user' (self) from participants list for the avatar display
    // unless it's a 'Saved Messages' (bipolar? no, self chat).
    // The 'participants' array in ChatListItem is already:
    // chat.participants?.map((p) => p.user).filter(Boolean) || []
    // Then we derive primaryUser (not self).

    // Let's create a list of users to show.
    // If 1-on-1: [primaryUser]
    // If Matched: [primaryUser, secondaryUser ?? primaryUser] NO wait.
    // Matched usually involves 2 specific people.
    // If Group: participants (minus self).

    const usersToShow = participants.filter((p) => p?.id !== user.id);
    // If usersToShow is empty (self chat?), show self? Or if it's broken data.
    // Fallback to all participants if empty (maybe self chat)
    const displayUsers = usersToShow.length > 0 ? usersToShow : participants;

    // Map to avatars and names
    const avatarUrls = displayUsers.map((u) => u?.avatarUrl);
    const displayNames = displayUsers.map((u) => u?.name || u?.username);

    // Determine variant override
    let variant: 'single' | 'matched' | 'group' | undefined;
    if (isMatched) variant = 'matched';
    else if (isGroup) variant = 'group';
    else variant = 'single';

    return (
      <ChatAvatar
        avatars={avatarUrls}
        names={displayNames}
        variant={variant}
        size={50} // Base size per snippet
      />
    );
  };

  const renderActions = (_progress: unknown, dragX: unknown, swipeable: { close: () => void }) => {
    return (
      <View style={styles.actionsWrapper}>
        <View style={styles.actionsContainer}>
          <ActionButton
            icon={<EyeIcon size={20} color={colors.text.primary} />}
            onPress={() => {
              // Handle view action
              swipeableRef.current?.close();
            }}
          />
          <ActionButton
            icon={<SpeakerXMarkIcon size={20} color={colors.text.primary} />}
            onPress={() => {
              // Handle mute action
              swipeableRef.current?.close();
            }}
          />
          <ActionButton
            icon={<TrashIcon size={20} color={colors.status.error} />}
            onPress={() => {
              // Handle delete action
              swipeableRef.current?.close();
            }}
            isDestructive
          />
        </View>
      </View>
    );
  };

  return (
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
            <Text style={styles.name} numberOfLines={1}>
              {chatName}
            </Text>
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
    backgroundColor: colors.background.charcoal, // Dark grey card background
    height: 88, // Fixed height
    paddingHorizontal: 18,
    borderRadius: 24,

    // gap: 16, // Using margin on avatarContainer for more control
  },
  avatarContainer: {
    width: 80,
    marginRight: 14, // Consistent spacing
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.presets.bodyMedium, // Use valid preset
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
    fontWeight: '700',
    fontSize: 17,
  },
  time: {
    ...typography.presets.labelSmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  message: {
    ...typography.presets.bodyMedium,
    color: colors.text.tertiary, // More subtle
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
    width: 180, // Fixed width for actions
    height: 88, // Match card height
    paddingLeft: 12, // Gap between card and actions
    justifyContent: 'center',
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#1A1A1A', // Darker background for actions card
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
