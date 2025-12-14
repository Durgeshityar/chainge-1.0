import { useProfile } from '@/hooks/useProfile';
import { DEFAULT_AVATAR_URL, DEFAULT_COVER_URL } from '@/lib/constants';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  MapPinIcon,
  ShareIcon,
} from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ProfileHeader = () => {
  const { user, stats, isCurrentUser } = useProfile();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: user.coverImage || DEFAULT_COVER_URL }}
          style={styles.coverImage}
          resizeMode="cover"
        />

        <View style={[styles.topNav, { paddingTop: insets.top + spacing.sm }]}>
          {!isCurrentUser && (
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                <ArrowLeftIcon size={24} color="white" />
              </BlurView>
            </TouchableOpacity>
          )}

          {isCurrentUser && (
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
                <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                  <Cog6ToothIcon size={24} color="white" />
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                  <ShareIcon size={24} color="white" />
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                  <EllipsisVerticalIcon size={24} color="white" />
                </BlurView>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', colors.background.black]}
          style={styles.gradient}
        />

        <View style={styles.content}>
          <View style={styles.headerTop}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: user.avatarUrl || DEFAULT_AVATAR_URL }} style={styles.avatar} />
            </View>

            {isCurrentUser ? (
              <TouchableOpacity style={styles.editButton} onPress={() => router.push('/settings/edit-profile')}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.editButton,
                  { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.editButtonText, { color: colors.text.inverse }]}>Follow</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.name}>{user.name}</Text>
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
                {user.interests.map((interest, index) => (
                  <View key={index} style={styles.interestBadge}>
                    <Text style={styles.interestText}>⚽ {interest}</Text>
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
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)', // Subtle tint on top of blur
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
  name: {
    ...typography.presets.h2,
    color: colors.text.primary,
    fontSize: 28,
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
