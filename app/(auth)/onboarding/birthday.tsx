import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Input } from '@/components/ui/Input';
import { ONBOARDING_TOTAL_STEPS } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useRouter } from 'expo-router';

export default function BirthdayScreen() {
  const router = useRouter();
  const { birthday, setBirthday } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(auth)/onboarding/gender');
  };

  // Simple mask for DD / MM / YYYY
  const handleTextChange = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');

    // Limit to 8 digits (DDMMYYYY)
    const truncated = cleaned.slice(0, 8);

    let formatted = truncated;
    if (truncated.length > 4) {
      formatted = `${truncated.slice(0, 2)} / ${truncated.slice(2, 4)} / ${truncated.slice(4)}`;
    } else if (truncated.length > 2) {
      formatted = `${truncated.slice(0, 2)} / ${truncated.slice(2)}`;
    }

    setBirthday(formatted);
  };

  return (
    <OnboardingLayout
      title="When is your birthday?"
      currentStep={3}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
      nextDisabled={birthday.length < 14}
    >
      <Input
        placeholder="DD / MM / YYYY"
        value={birthday}
        onChangeText={handleTextChange}
        keyboardType="number-pad"
        maxLength={14}
      />
    </OnboardingLayout>
  );
}
