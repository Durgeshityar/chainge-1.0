import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { DEFAULT_AVATAR_URL, DEFAULT_COVER_URL, ONBOARDING_TOTAL_STEPS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MapPinIcon } from 'react-native-heroicons/outline';

export default function PreviewScreen() {
  const router = useRouter();
  const {
    email,
    password,
    name,
    username,
    gender,
    birthday,
    height,
    weight,
    activityTracker,
    coverImage,
    interests,
    profilePicture,
    reset,
  } = useOnboardingStore();
  const { signUp, isLoading, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const age = calculateAge(birthday);
  const locationLabel = 'Mumbai'; // TODO: integrate actual location selection when implemented
  const genderAgeLabel = [gender, age ? `${age} yrs` : null].filter(Boolean).join(', ');
  const formattedHeight = formatHeight(height.value, height.unit);
  const formattedWeight = formatWeight(weight.value, weight.unit);

  const handleNext = async () => {
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please add your email and password to finish signing up.');
      router.replace('/(auth)/signup');
      return;
    }

    if (!username?.trim()) {
      setLocalError('Pick a username to continue.');
      router.push('/(auth)/onboarding/username');
      return;
    }

    const profilePayload = {
      name: name || username.trim(),
      displayName: name || username.trim(),
      avatarUrl: profilePicture ?? null,
      coverImage: coverImage ?? undefined,
      interests,
      gender: gender || undefined,
      dateOfBirth: birthday || undefined,
      age,
      activityTracker: activityTracker || undefined,
      height: formattedHeight,
      weight: formattedWeight,
    };

    const result = await signUp({
      email,
      password,
      username: username.trim(),
      displayName: name || undefined,
      profile: profilePayload,
    });

    if (!result || result.error) {
      setLocalError(result?.error?.message ?? 'Failed to create your account. Please try again.');
      return;
    }

    reset();
    router.replace('/(tabs)');
  };

  return (
    <OnboardingLayout
      title="Awesomeee your profile is set."
      currentStep={13}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
      nextLabel="Start"
      showSkip={false}
<<<<<<< HEAD
      scrollable={false}
=======
      nextDisabled={isLoading}
      nextIsLoading={isLoading}
>>>>>>> abhijay/dev
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
                  <Text style={styles.name}>{name || username || 'Chainge user'}</Text>
                  {/* Verified badge removed as per request */}
                </View>
                {username ? <Text style={styles.username}>@{username}</Text> : null}

                <View style={styles.statsRow}>
                  {locationLabel ? (
                    <>
                      <View style={styles.statItem}>
                        <MapPinIcon size={14} color={colors.text.secondary} />
                        <Text style={styles.statText}>{locationLabel}</Text>
                      </View>
                      {(genderAgeLabel || formattedHeight || activityTracker) && (
                        <Text style={styles.dot}>•</Text>
                      )}
                    </>
                  ) : null}

                  {genderAgeLabel ? (
                    <>
                      <View style={styles.statItem}>
                        <Text style={styles.statText}>{genderAgeLabel}</Text>
                      </View>
                      {(formattedHeight || activityTracker) && <Text style={styles.dot}>•</Text>}
                    </>
                  ) : null}

                  {formattedHeight ? (
                    <>
                      <View style={styles.statItem}>
                        <Text style={styles.statText}>{formattedHeight}</Text>
                      </View>
                      {activityTracker && <Text style={styles.dot}>•</Text>}
                    </>
                  ) : null}

                  {activityTracker ? (
                    <View style={styles.statItem}>
                      <Text style={styles.statText}>{activityTracker}</Text>
                    </View>
                  ) : null}
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

        {(localError || error?.message) && (
          <Text style={styles.errorText}>{localError ?? error?.message}</Text>
        )}
      </ScrollView>
    </OnboardingLayout>
  );
}

function calculateAge(birthday: string): number | undefined {
  if (!birthday) {
    return undefined;
  }

  const birthDate = new Date(birthday);
  if (Number.isNaN(birthDate.getTime())) {
    return undefined;
  }

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  const dayDiff = now.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age >= 0 ? age : undefined;
}

function formatHeight(value: number, unit: 'cm' | 'ft'): string | undefined {
  if (!Number.isFinite(value)) {
    return undefined;
  }

  if (unit === 'cm') {
    return `${Math.round(value)} cm`;
  }

  const feet = Math.floor(value);
  const inches = Math.round((value - feet) * 12);
  return `${feet}'${inches}"`;
}

function formatWeight(value: number, unit: 'kg' | 'lbs'): string | undefined {
  if (!Number.isFinite(value)) {
    return undefined;
  }

  return `${Math.round(value)} ${unit}`;
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
  errorText: {
    ...typography.presets.bodySmall,
    color: colors.status.error,
    marginTop: spacing.lg,
  },
});
