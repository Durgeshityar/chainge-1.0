import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { DEFAULT_AVATAR_URL, DEFAULT_COVER_URL, ONBOARDING_TOTAL_STEPS } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MapPinIcon } from 'react-native-heroicons/outline';

export default function PreviewScreen() {
  const router = useRouter();
  const {
    name,
    username,
    gender,
    birthday,
    height,
    activityTracker,
    coverImage,
    interests,
    profilePicture,
  } = useOnboardingStore();

  const handleNext = () => {
    // Here we would submit the data to the backend
    // For now, just navigate to the main app
    router.push('/(tabs)');
  };

  // Calculate age from birthday (simplified)
  const age = 26; // Mock age

  return (
    <OnboardingLayout
      title="Awesomeee your profile is set."
      currentStep={13}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
      nextLabel="Start"
      showSkip={false}
      scrollable={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <View style={styles.card}>
          <Image
            source={{ uri: coverImage || DEFAULT_COVER_URL }}
            style={styles.coverImage}
            resizeMode="cover"
          />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,1)']}
            style={styles.gradientOverlay}
          >
            <View style={styles.contentContainer}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: profilePicture || DEFAULT_AVATAR_URL }}
                  style={styles.avatar}
                />
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{name}</Text>
                  {/* Verified badge removed as per request */}
                </View>
                <Text style={styles.username}>@{username}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <MapPinIcon size={14} color={colors.text.secondary} />
                    <Text style={styles.statText}>Mumbai</Text>
                  </View>
                  <Text style={styles.dot}>•</Text>
                  <View style={styles.statItem}>
                    <Text style={styles.statText}>
                      {gender}, {age} yrs
                    </Text>
                  </View>
                  <Text style={styles.dot}>•</Text>
                  <View style={styles.statItem}>
                    <Text style={styles.statText}>
                      {height.value}'{Math.round((height.value % 1) * 10)}
                    </Text>
                  </View>
                  <Text style={styles.dot}>•</Text>
                  <View style={styles.statItem}>
                    <Text style={styles.statText}>{activityTracker}</Text>
                  </View>
                </View>

                <View style={styles.gameOnContainer}>
                  <Text style={styles.gameOnLabel}>Game on</Text>
                  <View style={styles.interestsRow}>
                    {interests.slice(0, 3).map((interest) => (
                      <View key={interest} style={styles.interestBadge}>
                        {/* Placeholder icon for interest - using a generic circle for now or text only */}
                        <Text style={styles.interestText}>⚽ {interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%', // Increased height
    justifyContent: 'flex-end',
    padding: spacing.xl,
  },
  contentContainer: {
    gap: spacing.sm,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.presets.h2,
    color: colors.text.primary,
    fontSize: 28,
    lineHeight: 34,
  },
  username: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
  },
  dot: {
    color: colors.text.secondary,
  },
  gameOnContainer: {
    marginTop: spacing.sm,
  },
  gameOnLabel: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  interestsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  interestBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Lighter background for chips
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
