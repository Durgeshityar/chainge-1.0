import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ONBOARDING_TOTAL_STEPS } from '@/lib/constants';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { BellIcon } from 'react-native-heroicons/outline';

export default function NotificationsScreen() {
  const router = useRouter();

  const handleNext = () => {
    // Request permission logic here
    router.push('/(auth)/onboarding/preview');
  };

  const handleSkip = () => {
    router.push('/(auth)/onboarding/preview');
  };

  return (
    <OnboardingLayout
      title="Turn on notifications"
      subtitle="Get updates on your activities and messages."
      currentStep={13}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
      onSkip={handleSkip}
      nextLabel="Allow Notifications"
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <BellIcon size={64} color={colors.primary} />
        </View>
        <Text style={styles.description}>
          Get notified when someone invites you to a game, follows you, or sends you a message.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  description: {
    ...typography.presets.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
