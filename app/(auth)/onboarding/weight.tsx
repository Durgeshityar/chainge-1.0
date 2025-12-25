import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { WheelPicker } from '@/components/ui/WheelPicker';
import { ONBOARDING_TOTAL_STEPS, WEIGHT_UNITS, type WeightUnit } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WeightScreen() {
  const router = useRouter();
  const { weight, setWeight } = useOnboardingStore();
  const [unit, setUnit] = useState<WeightUnit>(weight.unit);
  const [value, setValue] = useState(weight.value);

  const handleNext = () => {
    setWeight(value, unit);
    router.push('/(auth)/onboarding/activity-tracker');
  };

  const handleUnitChange = (newUnit: WeightUnit) => {
    // Convert value when switching units
    let newValue = value;
    if (unit === 'kg' && newUnit === 'lbs') {
      newValue = value * 2.20462;
    } else if (unit === 'lbs' && newUnit === 'kg') {
      newValue = value / 2.20462;
    }
    setUnit(newUnit);
    setValue(Math.round(newValue));
  };

  const kgItems = Array.from({ length: 151 }, (_, i) => 30 + i); // 30kg to 180kg
  const lbsItems = Array.from({ length: 331 }, (_, i) => 66 + i); // 66lbs to 396lbs

  return (
    <OnboardingLayout
      title="Weight?"
      currentStep={6}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
      scrollable={false}
    >
      <View style={styles.container}>
        <View style={styles.unitToggle}>
          {WEIGHT_UNITS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.unitButton, unit === opt && styles.activeUnit]}
              onPress={() => handleUnitChange(opt)}
            >
              <Text style={[styles.unitText, unit === opt && styles.activeUnitText]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pickerContainer}>
          <WheelPicker
            items={unit === 'kg' ? kgItems : lbsItems}
            selectedValue={Math.round(value)}
            onValueChange={(val) => setValue(Number(val))}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.input,
    borderRadius: 20,
    padding: 4,
  },
  unitButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  activeUnit: {
    backgroundColor: colors.background.card,
  },
  unitText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activeUnitText: {
    color: colors.text.primary,
  },
  pickerContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
  },
});
