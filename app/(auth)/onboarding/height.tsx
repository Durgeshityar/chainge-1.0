import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { WheelPicker } from '@/components/ui/WheelPicker';
import { HEIGHT_UNITS, ONBOARDING_TOTAL_STEPS, type HeightUnit } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HeightScreen() {
  const router = useRouter();
  const { height, setHeight } = useOnboardingStore();
  const [unit, setUnit] = useState<HeightUnit>(height.unit);
  const [value, setValue] = useState(height.value);

  const handleNext = () => {
    setHeight(value, unit);
    router.push('/(auth)/onboarding/weight');
  };

  const handleUnitChange = (newUnit: HeightUnit) => {
    // Convert value when switching units
    let newValue = value;
    if (unit === 'cm' && newUnit === 'ft') {
      newValue = value / 30.48;
    } else if (unit === 'ft' && newUnit === 'cm') {
      newValue = value * 30.48;
    }
    setUnit(newUnit);
    setValue(Math.round(newValue * 100) / 100);
  };

  // Generate items for picker based on unit
  const getItems = () => {
    if (unit === 'cm') {
      return Array.from({ length: 151 }, (_, i) => 100 + i); // 100cm to 250cm
    } else {
      // For ft, we might need a more complex picker (ft and inches),
      // but for now let's just show decimal feet or simplify
      // A better approach for ft/in is two pickers, but let's stick to simple for now
      // or just list height strings like "5'0", "5'1", etc.
      // Let's use a simple range of numbers for now to match WheelPicker expectation
      return Array.from({ length: 50 }, (_, i) => 4 + i * 0.1); // 4.0 to 9.0 roughly
    }
  };

  // For the sake of the WheelPicker which takes simple arrays, let's simplify for 'ft'
  // Real implementation might want two columns for ft/in
  const cmItems = Array.from({ length: 151 }, (_, i) => 100 + i);
  const ftItems = Array.from({ length: 48 }, (_, i) => {
    const ft = Math.floor(4 + i / 12);
    const inch = i % 12;
    return `${ft}'${inch}"`;
  });

  return (
    <OnboardingLayout
      title="How tall are you?"
      currentStep={5}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
    >
      <View style={styles.container}>
        <View style={styles.unitToggle}>
          {HEIGHT_UNITS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.unitButton, unit === opt && styles.activeUnit]}
              onPress={() => handleUnitChange(opt)}
            >
              <Text style={[styles.unitText, unit === opt && styles.activeUnitText]}>
                {opt === 'cm' ? 'cm' : 'ft/in'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pickerContainer}>
          {unit === 'cm' ? (
            <WheelPicker
              items={cmItems}
              selectedValue={Math.round(value)}
              onValueChange={(val) => setValue(Number(val))}
            />
          ) : (
            <WheelPicker
              items={ftItems}
              selectedValue={`${Math.floor(value)}'${Math.round((value % 1) * 12)}"`} // Approximation for display
              onValueChange={(val) => {
                // Parse string back to number for storage if needed, or just store string
                // For this mock, let's just update value roughly
                const str = val as string;
                const [f, i] = str.split("'").map((s) => parseFloat(s));
                setValue(f + i / 12);
              }}
            />
          )}
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
  },
  ftLabel: {
    ...typography.presets.h3,
    color: colors.text.secondary,
  },
});
