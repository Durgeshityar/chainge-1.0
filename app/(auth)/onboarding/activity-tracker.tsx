import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ONBOARDING_ACTIVITY_TRACKERS, ONBOARDING_TOTAL_STEPS } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDownIcon, ClockIcon } from 'react-native-heroicons/outline';

export default function ActivityTrackerScreen() {
  const router = useRouter();
  const { activityTracker, setActivityTracker } = useOnboardingStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleNext = () => {
    router.push('/(auth)/onboarding/interests');
  };

  const handleSelect = (selected: string) => {
    setActivityTracker(selected);
    setIsOpen(false);
  };

  return (
    <OnboardingLayout
      title="Do you use any activity tracker?"
      currentStep={8}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
    >
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <View style={styles.selectorLeft}>
          <ClockIcon size={20} color={colors.text.secondary} />
          <Text style={[styles.selectorText, !activityTracker && styles.placeholderText]}>
            {activityTracker || 'eg. apple watch'}
          </Text>
        </View>
        <ChevronDownIcon size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {ONBOARDING_ACTIVITY_TRACKERS.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.option}
              onPress={() => handleSelect(option)}
            >
              <Text
                style={[styles.optionText, activityTracker === option && styles.selectedOptionText]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.input,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectorText: {
    ...typography.presets.bodyLarge,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.secondary,
  },
  dropdown: {
    marginTop: spacing.sm,
    backgroundColor: colors.background.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  option: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  optionText: {
    ...typography.presets.bodyLarge,
    color: colors.text.secondary,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
