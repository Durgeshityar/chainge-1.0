import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ONBOARDING_TOTAL_STEPS } from '@/lib/constants';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PhotoIcon, TrashIcon } from 'react-native-heroicons/outline';

export default function CoverImageScreen() {
  const router = useRouter();
  const { coverImage, setCoverImage } = useOnboardingStore();

  const handleNext = () => {
    router.push('/(auth)/onboarding/location');
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5], // Portrait aspect ratio
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
  };

  return (
    <OnboardingLayout
      title="Add cover image"
      subtitle="Your cover picture is important to help people find and recognise you."
      currentStep={11}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      onNext={handleNext}
      nextDisabled={!coverImage}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={handlePickImage}
          activeOpacity={0.8}
        >
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <View style={styles.iconContainer}>
                <PhotoIcon size={48} color={colors.text.secondary} />
              </View>
              <Text style={styles.placeholderText}>Tap to upload</Text>
            </View>
          )}
        </TouchableOpacity>

        {coverImage && (
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
        )}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // Square for now, or 4:5
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.background.input,
    borderWidth: 1,
    borderColor: colors.border.default,
    position: 'relative',
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.presets.bodyLarge,
    color: colors.text.secondary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
