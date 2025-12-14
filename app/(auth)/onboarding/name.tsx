import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Input } from '@/components/ui/Input';
import { ONBOARDING_TOTAL_STEPS } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useRouter } from 'expo-router';

export default function NameScreen() {
  const router = useRouter();
  const { name, setName } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(auth)/onboarding/username');
  };

  const handleSkip = () => {
    router.push('/(auth)/onboarding/username');
  };

  return (
    <OnboardingLayout
      title="What do you like to be called?"
      currentStep={1}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
      onSkip={handleSkip}
      nextDisabled={!name.trim()}
      showBack={false}
    >
      <Input
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="next"
        onSubmitEditing={handleNext}
      />
    </OnboardingLayout>
  );
}
