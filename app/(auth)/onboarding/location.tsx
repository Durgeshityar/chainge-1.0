import { LocationMap } from '@/components/onboarding/LocationMap';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ONBOARDING_TOTAL_STEPS } from '@/lib/constants';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LocationScreen() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleNext = () => {
    // Save location to store if needed
    console.log('Selected Location:', selectedLocation);
    router.push('/(auth)/onboarding/notifications');
  };

  const handleSkip = () => {
    router.push('/(auth)/onboarding/notifications');
  };

  return (
    <OnboardingLayout
      title="Where are you?"
      subtitle="Select your location to find activities nearby."
      currentStep={12}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
      onSkip={handleSkip}
      nextLabel="Confirm Location"
      nextDisabled={!selectedLocation}
    >
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          <LocationMap onLocationSelect={setSelectedLocation} />
        </View>
        <Text style={styles.helperText}>Drag the map to pinpoint your exact location.</Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.md,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
  },
  helperText: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
