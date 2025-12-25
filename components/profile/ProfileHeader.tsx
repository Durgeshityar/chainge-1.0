import {
  CheckBadgeIcon,
  ChevronLeftIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  MapPinIcon,
  ShareIcon,
} from 'react-native-heroicons/outline';
import { CheckBadgeIcon as CheckBadgeSolidIcon } from 'react-native-heroicons/solid';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/hooks/useProfile';
import { DEFAULT_AVATAR_URL } from '@/lib/constants';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

import { ProfileHeaderSkeleton } from './profileHeaderSkeleton';

export const ProfileHeader = () => {
  const { user, stats, isCurrentUser, isLoading, isFollowing, toggleFollow } = useProfile();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!user) {
    return <ProfileHeaderSkeleton />;
  }

  if (isLoading) {
    return <ProfileHeaderSkeleton />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {/* COVER IMAGE */}
        {user.coverImage ? (
          <Image source={{ uri: user.coverImage }} style={styles.coverImage} resizeMode="cover" />
        ) : null}

        {/* BACK BUTTON FOR NON-CURRENT USER */}
        <View style={[styles.topNav, { paddingTop: insets.top + spacing.sm }]}>
          {!isCurrentUser && (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeftIcon size={24} color="white" />
            </TouchableOpacity>
          )}

          {/* ACTION BUTTONS FOR CURRENT USER */}
          {isCurrentUser && (
            <View style={styles.rightIcons}>
              {/* SETTINGS BUTTON */}
              <TouchableOpacity style={styles.backButton} onPress={() => router.push('/settings')}>
                <Cog6ToothIcon size={24} color="white" />
              </TouchableOpacity>
              {/* SHARE BUTTON */}
              <TouchableOpacity style={styles.backButton}>
                <ShareIcon size={24} color="white" />
              </TouchableOpacity>
              {/* MORE OPTIONS BUTTON */}
              <TouchableOpacity style={styles.backButton}>
                <EllipsisVerticalIcon size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* GRADIENT FOR COVER IMAGE */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.45)', colors.background.black]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />

        <View style={styles.content}>
          <View style={styles.headerTop}>
            {/* USER AVATAR */}
            <View style={styles.avatarContainer}>
              <Image source={{ uri: user.avatarUrl || DEFAULT_AVATAR_URL }} style={styles.avatar} />
            </View>

            {/* EDIT PROFILE / FOLLOW BUTTON */}
            {isCurrentUser ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push('/settings/edit-profile')}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.editButton,
                  isFollowing ? { backgroundColor: 'rgba(255,255,255,0.1)' } : { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={toggleFollow}
              >
                <Text style={[styles.editButtonText, !isFollowing && { color: colors.text.inverse }]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* USER INFO */}
          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user.name}</Text>
              {isCurrentUser && (
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={() => router.push('/verify')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.username}>@{user.username}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPinIcon size={14} color={colors.text.secondary} />
                <Text style={styles.metaText}>{user.location}</Text>
              </View>
              <Text style={styles.dot}>•</Text>
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>
                  {user.gender}, {user.age} yrs
                </Text>
              </View>
              <Text style={styles.dot}>•</Text>
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>{user.height}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                <Text style={styles.statNumber}>{stats.following}</Text> Following
              </Text>
              <Text style={styles.statText}>
                <Text style={styles.statNumber}>{stats.followers}</Text> Followers
              </Text>
            </View>

            {user.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>My vibe</Text>
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Game on</Text>
              <View style={styles.interestsRow}>
                {user.interests.length !== 0 &&
                  user.interests.map((interest, index) => (
                    <View key={index} style={styles.interestBadge}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 550, // Taller to accommodate content
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginLeft: 'auto',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Align to bottom to match avatar
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 88, // Slightly larger
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: spacing.xs, // Slight adjustment to align with avatar center/bottom visually
  },
  editButtonText: {
    ...typography.presets.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  infoContainer: {
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.presets.h2,
    color: colors.text.primary,
    fontSize: 28,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(152, 255, 0, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(152, 255, 0, 0.3)',
  },
  verifyButtonText: {
    ...typography.presets.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  username: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
  },
  dot: {
    color: colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  statText: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
  },
  statNumber: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  bioText: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    lineHeight: 20,
  },
  interestsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  interestBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestText: {
    ...typography.presets.bodySmall,
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
});
