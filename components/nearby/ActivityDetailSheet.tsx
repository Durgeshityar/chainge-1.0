import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckIcon, MapPinIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from 'react-native-heroicons/solid';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

import { ActivityWithParticipants, User } from '@/types';

import { Button } from '@/components/ui/Button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ActivityDetailSheetProps {
  activity: ActivityWithParticipants | null;
  onJoin: (activityId: string) => void;
  onPass: (activityId: string) => void;
}

export const ActivityDetailSheet = ({ activity, onJoin, onPass }: ActivityDetailSheetProps) => {
  const user = activity?.user as User | undefined;

  if (!activity) return null;

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

  // Calculate age if available or mock
  const age = user?.age || 23;

  return (
    <View style={styles.container}>
      {/* Full Screen Image Header */}
      <View style={styles.imageContainer}>
        {user?.coverImage || user?.avatarUrl ? (
          <Image
            source={{ uri: user?.coverImage || user?.avatarUrl || '' }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)', '#000000']}
          locations={[0, 0.5, 0.8, 1]}
          style={styles.gradient}
        />
      </View>

      <View style={styles.detailBody}>
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Info (Overlapping Image) */}
          <View style={styles.headerInfo}>
            <View style={styles.userInfo}>
              {/* Avatar Bubble */}
              <View style={styles.avatarBubble}>
                {user?.avatarUrl && (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarMini} />
                )}
              </View>

              <View style={styles.nameRow}>
                <Text style={styles.name}>
                  {user?.displayName || user?.name || 'Unknown'}, {age}
                </Text>
                <CheckCircleSolidIcon
                  size={20}
                  color={colors.primary}
                  style={styles.verifiedIcon}
                />
              </View>

              <View style={styles.subtitleRow}>
                <View style={styles.subtitleItem}>
                  <MapPinIcon size={14} color={colors.text.secondary} />
                  <Text style={styles.subtitleText}>{activity.locationName || 'Nearby'}</Text>
                </View>
                <Text style={styles.subtitleText}>
                  • {formattedDate}
                  {formattedTime ? ` @ ${formattedTime}` : ''}
                </Text>
                {user?.gender && <Text style={styles.subtitleText}> • {user.gender}</Text>}
                {user?.height && <Text style={styles.subtitleText}> • {user.height}</Text>}
                {/* Activity Tracker Brand (mock for visual match) */}
                <Text style={styles.subtitleText}> • Apple</Text>
              </View>
            </View>
          </View>

          {/* Content Sections */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>My vibe</Text>
            <Text style={styles.bioText}>
              {user?.bio || 'No bio yet. Just here to move and groove.'}
            </Text>

            <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>Game on</Text>
            <View style={styles.chipRow}>
              {user?.interests?.map((interest, index) => (
                <View key={index} style={styles.chip}>
                  {/* Simple mapping for sports icons could go here, for now using generic dot/text */}
                  <Text style={styles.chipText}>⚽ {interest}</Text>
                </View>
              ))}
              {(!user?.interests || user.interests.length === 0) && (
                <Text style={styles.bioText}>No interests listed.</Text>
              )}
            </View>

            {/* Extra Details from Visual if needed, keeping it clean for now */}
          </View>
          {/* Bottom Actions */}
          <View style={styles.actionContainer}>
            <View style={styles.actionRow}>
              <Button
                variant="ghost"
                title="Pass"
                onPress={() => onPass(activity.id)}
                style={styles.passButton}
                textStyle={styles.passButtonText}
                leftIcon={<XMarkIcon size={20} color={colors.status.error} />}
              />
              <Button
                variant="primary"
                title="Join event"
                onPress={() => onJoin(activity.id)}
                style={styles.joinButton}
                textStyle={styles.joinButtonText}
                leftIcon={<CheckIcon size={20} color={colors.jetBlack} />}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.jetBlack,
    overflow: 'hidden',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  imageContainer: {
    height: SCREEN_HEIGHT * 0.55,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: -1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: colors.background.modal,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  detailBody: {
    flex: 1,
    paddingTop: SCREEN_HEIGHT * 0.32,
    paddingBottom: spacing.xl,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  headerInfo: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  userInfo: {
    alignItems: 'flex-start',
  },
  avatarBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.status.error, // Using a distinct color like the visual (pinkish/red?)
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  avatarMini: {
    width: '100%',
    height: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  verifiedIcon: {
    marginTop: 4,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  subtitleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitleText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
  },
  sectionLabel: {
    color: colors.text.tertiary, // Duller label color
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  bioText: {
    color: colors.text.primary,
    fontSize: 16,
    lineHeight: 24,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  actionContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#0C0C0C',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  passButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  passButtonText: {
    color: colors.status.error,
  },
  joinButton: {
    flex: 2,
  },
  joinButtonText: {
    fontWeight: '700',
    color: colors.jetBlack,
  },
});
