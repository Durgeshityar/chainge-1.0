import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Input } from '@/components/ui/Input';
import { ONBOARDING_TOTAL_STEPS } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { CheckCircleIcon, XCircleIcon } from 'react-native-heroicons/outline';

export default function UsernameScreen() {
  const router = useRouter();
  const { username, setUsername } = useOnboardingStore();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!username) {
      setIsAvailable(null);
      return;
    }

    const checkAvailability = setTimeout(() => {
      setIsChecking(true);
      // Mock availability check
      setTimeout(() => {
        setIsAvailable(username.length > 3); // Mock rule: > 3 chars is available
        setIsChecking(false);
      }, 500);
    }, 500);

    return () => clearTimeout(checkAvailability);
  }, [username]);

  const handleNext = () => {
    router.push('/(auth)/onboarding/birthday');
  };

  return (
    <OnboardingLayout
      title="Create username"
      currentStep={2}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
      nextDisabled={!isAvailable}
    >
      <Input
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        rightIcon={
          isChecking ? undefined : isAvailable === true ? (
            <CheckCircleIcon size={20} color={colors.status.success} />
          ) : isAvailable === false ? (
            <XCircleIcon size={20} color={colors.status.error} />
          ) : undefined
        }
      />

      {isAvailable === true && <Text style={styles.successText}>yayy, username available</Text>}

      {isAvailable === false && (
        <Text style={styles.errorText}>Username unavailable or too short</Text>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  successText: {
    ...typography.presets.caption,
    color: colors.status.success,
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
  },
  errorText: {
    ...typography.presets.caption,
    color: colors.status.error,
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
  },
});
