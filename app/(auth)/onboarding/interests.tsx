import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import {
  ONBOARDING_INTEREST_CATEGORIES,
  ONBOARDING_MIN_INTERESTS,
  ONBOARDING_TOTAL_STEPS,
} from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InterestsScreen() {
  const router = useRouter();
  const { interests, toggleInterest } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(auth)/onboarding/profile-picture');
  };

  return (
    <OnboardingLayout
      title="What are your interests?"
      subtitle="Select at least 3 interests to help us personalize your experience."
      currentStep={9}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
      nextDisabled={interests.length < ONBOARDING_MIN_INTERESTS}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {ONBOARDING_INTEREST_CATEGORIES.map((category) => (
          <View key={category.title} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <View style={styles.chipsContainer}>
              {category.items.map((item) => {
                const isSelected = interests.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, isSelected && styles.selectedChip]}
                    onPress={() => toggleInterest(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  categoryContainer: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    ...typography.presets.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background.input,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
  },
  selectedChipText: {
    color: colors.background.default,
    fontWeight: '600',
  },
});
