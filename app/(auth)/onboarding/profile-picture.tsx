import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ONBOARDING_TOTAL_STEPS } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TrashIcon, UserIcon } from 'react-native-heroicons/outline';

export default function ProfilePictureScreen() {
  const router = useRouter();
  const { profilePicture, setProfilePicture } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(auth)/onboarding/cover-image');
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setProfilePicture(null);
  };

  return (
    <OnboardingLayout
      title="Add a profile picture"
      subtitle="Help your friends find you by adding a profile picture."
      currentStep={10}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
      nextDisabled={!profilePicture}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={handlePickImage}
          activeOpacity={0.8}
        >
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <UserIcon size={64} color={colors.text.secondary} />
            </View>
          )}
        </TouchableOpacity>

        {profilePicture ? (
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={handlePickImage}>
              <Text style={styles.actionText}>Change Photo</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={handleRemoveImage} style={styles.removeButton}>
              <TrashIcon size={16} color={colors.status.error} />
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.helperText}>Tap to upload a photo</Text>
        )}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  imageContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    backgroundColor: colors.background.input,
    borderWidth: 1,
    borderColor: colors.border.default,
    position: 'relative',
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.default,
  },
  helperText: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionText: {
    ...typography.presets.bodyMedium,
    color: colors.primary,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border.default,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeText: {
    ...typography.presets.bodyMedium,
    color: colors.status.error,
  },
});
