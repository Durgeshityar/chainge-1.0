import { Avatar } from '@/components/ui/Avatar';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { NotificationType, NotificationWithUser } from '@/types';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  CalendarDaysIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckIcon,
  HeartIcon,
  UserIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';

interface NotificationItemProps {
  notification: NotificationWithUser;
  onPress: (notification: NotificationWithUser) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const { type, title, body, createdAt, user, read, data } = notification;
  const timeDisplay = format(new Date(createdAt), 'h:mm a');

  // Icons based on type
  const renderIcon = () => {
    switch (type) {
      case NotificationType.LIKE:
        return (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 69, 58, 0.15)' }]}>
            <HeartIcon size={20} color={colors.status.error} fill={colors.status.error} />
          </View>
        );
      case NotificationType.MESSAGE:
        return (
          <View style={[styles.iconContainer, { backgroundColor: '#2A2A2A' }]}>
            <ChatBubbleBottomCenterTextIcon size={20} color={colors.text.secondary} />
          </View>
        );
      case NotificationType.CONNECTION_REQUEST:
        return (
          <View style={[styles.iconContainer, { backgroundColor: '#2A2A2A' }]}>
            <UserIcon size={20} color={colors.text.secondary} />
          </View>
        );
      case NotificationType.EVENT_REMINDER:
        return (
          <View style={[styles.iconContainer, { backgroundColor: '#2A2A2A' }]}>
            <CalendarDaysIcon size={20} color={colors.text.secondary} />
          </View>
        );
      case NotificationType.MATCH:
        // Match usually shows avatar stack or special icon.
        // Design shows two avatars in a pill for "New Match".
        // But here we are rendering the LEFT icon/avatar slot.
        // Screenshot shows "New Match" has a special overlapping avatar pill as the 'icon'
        // or effectively the user avatar area.
        return null; // Handled in main render
      default:
        // Fallback
        return (
          <View style={[styles.iconContainer, { backgroundColor: '#2A2A2A' }]}>
            <UserIcon size={20} color={colors.text.secondary} />
          </View>
        );
    }
  };

  const renderContent = () => {
    // Specialized layout for "New Match"
    if (type === NotificationType.MATCH) {
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onPress(notification)}
          style={[styles.card, !read && styles.unreadCard]}
        >
          {/* Header Row with Matched Avatar Pill */}
          <View style={styles.headerRow}>
            <MatchedAvatarPill />
            <View style={styles.flexText}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>New Match</Text>
                <Text style={styles.time}>{timeDisplay}</Text>
              </View>
              <Text style={styles.body} numberOfLines={2}>
                {body}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButtonPrimary}>
              <Text style={styles.actionTextPrimary}>Start Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonSecondary}>
              <Text style={styles.actionTextSecondary}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }

    // Default Layout for others
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(notification)}
        style={[styles.card, !read && styles.unreadCard]}
      >
        <View style={styles.row}>
          {/* Left Icon */}
          <View style={styles.leftCol}>{renderIcon()}</View>

          {/* Right Content */}
          <View style={styles.rightCol}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.time}>{timeDisplay}</Text>
            </View>
            <Text style={styles.body} numberOfLines={2}>
              {body}
            </Text>

            {/* Inline Actions */}
            {type === NotificationType.CONNECTION_REQUEST && (
              <View style={[styles.actionsRow, { marginTop: 12, justifyContent: 'flex-end' }]}>
                <TouchableOpacity
                  style={[
                    styles.actionButtonPrimary,
                    { flexDirection: 'row', gap: 6, alignItems: 'center' },
                  ]}
                >
                  <CheckIcon size={14} color={colors.text.primary} strokeWidth={3} />
                  <Text style={styles.actionTextPrimary}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButtonPrimary,
                    { flexDirection: 'row', gap: 6, alignItems: 'center' },
                  ]}
                >
                  <XMarkIcon size={14} color={colors.text.primary} strokeWidth={3} />
                  <Text style={styles.actionTextSecondary}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            {type === NotificationType.MESSAGE && (
              <View style={[styles.actionsRow, { marginTop: 12, justifyContent: 'flex-end' }]}>
                <TouchableOpacity style={styles.actionButtonSecondary}>
                  <Text style={styles.actionTextSecondary}>Open Chat</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return renderContent();
};

// Sub-component for the Matched Avatar Pill
const MatchedAvatarPill = () => (
  <LinearGradient
    colors={['#BEF264', '#6366F1']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.pillBorder}
  >
    <View style={styles.pillInner}>
      {/* Hardcoded or passed props for images */}
      <View style={{ marginRight: -12, zIndex: 1 }}>
        <Avatar
          source="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200"
          size={32}
          borderWidth={0}
        />
      </View>
      <View style={{ zIndex: 2 }}>
        <Avatar
          source="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200"
          size={32}
          borderWidth={0}
        />
      </View>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.charcoal,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.2,
    borderColor: '#2C2C2C',
  },
  unreadCard: {
    borderWidth: 0.2,
    borderColor: '#2C2C2C',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  leftCol: {
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  rightCol: {
    flex: 1,
  },
  flexText: {
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12, // iOS style squircle
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    ...typography.presets.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  time: {
    ...typography.presets.labelSmall,
    color: colors.text.tertiary,
  },
  body: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end', // Aligned right per screenshot
  },
  actionButtonPrimary: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionTextPrimary: {
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  actionTextSecondary: {
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  // Pill
  pillBorder: {
    padding: 2,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pillInner: {
    backgroundColor: '#121212',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
});
