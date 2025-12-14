import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { ActivityWithParticipants, User } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarDaysIcon, MapPinIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleSolidIcon, CheckIcon } from 'react-native-heroicons/solid';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
// Increased height to reduce top space
const CARD_HEIGHT = SCREEN_HEIGHT * 0.72;

interface ActivityCardProps {
  activity: ActivityWithParticipants;
  onPass?: () => void;
  onJoin?: () => void;
  /** Animated x translation for swipe gesture overlay effects */
  translateX?: SharedValue<number>;
  isTopCard?: boolean;
  onPress?: () => void;
  onCTAInteractionStart?: () => void;
  onCTAInteractionEnd?: () => void;
}

export const ActivityCard = ({
  activity,
  onPass,
  onJoin,
  translateX,
  isTopCard = true,
  onPress,
  onCTAInteractionStart,
  onCTAInteractionEnd,
}: ActivityCardProps) => {
  const user = activity.user as User | undefined;

  // Calculate distance from user (mock for now)
  const distanceKm = 2; // Placeholder

  // Format scheduled time
  const scheduledDate = activity.scheduledAt ? new Date(activity.scheduledAt) : null;
  const formattedDate = scheduledDate
    ? scheduledDate.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : 'Now';
  const formattedTime = scheduledDate
    ? scheduledDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  // Border glow animation based on swipe direction
  const animatedBorderStyle = useAnimatedStyle(() => {
    if (!translateX) return {};
    const borderOpacity = interpolate(Math.abs(translateX.value), [0, CARD_WIDTH * 0.3], [0, 1]);
    const isRight = translateX.value > 0;
    return {
      borderColor: isRight
        ? `rgba(152, 255, 0, ${borderOpacity})`
        : `rgba(255, 69, 58, ${borderOpacity})`,
      borderWidth: interpolate(Math.abs(translateX.value), [0, CARD_WIDTH * 0.3], [0, 3]),
    };
  });

  return (
    <Animated.View style={[styles.cardContainer, animatedBorderStyle]}>
      {/* Background Image */}
      <View style={styles.imageContainer}>
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.backgroundImage, styles.placeholderImage]} />
        )}
        {/* Gradient overlay - Smoother transition */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', '#000000']}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.gradient}
        />
      </View>

      {/* Distance Badge */}
      <View style={styles.distanceBadge}>
        <Text style={styles.distanceBadgeText}>{distanceKm} km away</Text>
      </View>

      {/* Content Overlay */}
      <View style={styles.contentOverlay}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.displayName || user?.name || 'Unknown'}, {user?.age || '??'}
          </Text>
          {/* Verified badge */}
          <View style={styles.verifiedBadge}>
            <CheckCircleSolidIcon size={18} color={colors.primary} />
          </View>
        </View>

        {/* Activity Caption */}
        <View style={styles.captionContainer}>
          <Text style={styles.activityIcon}>🏃</Text>
          <Text style={styles.caption} numberOfLines={2}>
            Join me for a short {activity.activityType.toLowerCase()}.
          </Text>
        </View>

        {/* Date/Time & Location Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <CalendarDaysIcon size={16} color={colors.text.secondary} />
            <Text style={styles.metaText}>
              {formattedDate}
              {formattedTime ? `, ${formattedTime}` : ''}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MapPinIcon size={16} color={colors.text.secondary} />
            <Text style={styles.metaText}>{activity.locationName || 'Nearby'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionButton, styles.passButton]}
            onPress={onPass}
            onPressIn={onCTAInteractionStart}
            onPressOut={onCTAInteractionEnd}
          >
            <XMarkIcon size={20} color={colors.status.error} />
            <Text style={[styles.actionButtonText, styles.passButtonText]}>Pass</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.joinButton]}
            onPress={onJoin}
            onPressIn={onCTAInteractionStart}
            onPressOut={onCTAInteractionEnd}
          >
            <CheckIcon size={20} color={colors.jetBlack} />
            <Text style={[styles.actionButtonText, styles.joinButtonText]}>Join event</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 32, // More rounded
    overflow: 'hidden',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: colors.background.modal,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  distanceBadge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  distanceBadgeText: {
    color: colors.jetBlack,
    fontSize: 12,
    fontWeight: '700',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: spacing.xxl, // Added extra padding at bottom
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: '800',
    maxWidth: '85%',
  },
  verifiedBadge: {
    marginLeft: spacing.xs,
    marginTop: 4,
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  activityIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  caption: {
    color: colors.text.secondary,
    fontSize: 16,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: spacing.sm,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  passButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.status.error,
  },
  passButtonText: {
    color: colors.status.error,
    fontSize: 16,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: colors.primary, // Solid primary color
    borderWidth: 0,
  },
  joinButtonText: {
    color: colors.jetBlack,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ActivityCard;
