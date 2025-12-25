import { useProfileStore } from '@/stores/profileStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Dimensions, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH * 0.55;

// Wingman image assets
const WINGMAN_IMAGES: { [key: string]: ImageSourcePropType } = {
  red: require('@/assets/wingman/red.png'),
  blue: require('@/assets/wingman/blue.png'),
  green: require('@/assets/wingman/green.png'),
  pink: require('@/assets/wingman/pink.png'),
};

// Color options for the picker with glow colors
const COLOR_OPTIONS = [
  { key: 'default', color: 'transparent', borderColor: 'rgba(255,255,255,0.3)', glowColor: 'rgba(255,255,255,0.08)' },
  { key: 'red', color: '#E07B54', glowColor: 'rgba(224,123,84,0.25)' },
  { key: 'blue', color: '#4FC3F7', glowColor: 'rgba(79,195,247,0.25)' },
  { key: 'pink', color: '#F48FB1', glowColor: 'rgba(244,143,177,0.25)' },
  { key: 'green', color: '#7C4DFF', glowColor: 'rgba(124,77,255,0.25)' },
];

export const WingmanSheet = () => {
  const { user, isCurrentUser } = useProfileStore();
  const [selectedColor, setSelectedColor] = useState<string>('red');

  if (!user) return null;

  const currentColorOption = COLOR_OPTIONS.find(opt => opt.key === selectedColor) || COLOR_OPTIONS[1];

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>
        {isCurrentUser
          ? `Hey ${user.name.split(' ')[0]}, I'm your wingman!`
          : `Hey ${user.name.split(' ')[0]} is good in ${user.interests[0] || 'sports'}, i think you both are a match!`}
      </Text>

      {/* Wingman Image with 3D Shadow Effect */}
      <View style={styles.imageWrapper}>
        {/* Radial glow effect using multiple layered gradients */}
        <LinearGradient
          colors={[currentColorOption.glowColor, 'transparent']}
          style={styles.glowCircle}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={[currentColorOption.glowColor, 'transparent']}
          style={styles.glowCircle}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0, y: 0 }}
        />
        <LinearGradient
          colors={[currentColorOption.glowColor, 'transparent']}
          style={styles.glowCircle}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0 }}
        />
        <LinearGradient
          colors={[currentColorOption.glowColor, 'transparent']}
          style={styles.glowCircle}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0, y: 1 }}
        />
        {/* Image container */}
        <View style={styles.imageContainer}>
          <Image
            source={WINGMAN_IMAGES[selectedColor] || WINGMAN_IMAGES.red}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        {/* Bottom reflection gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', '#0D0D0D']}
          style={styles.bottomFade}
        />
      </View>

      {/* Color Picker - Only show for current user */}
      {isCurrentUser && (
        <View style={styles.colorPickerContainer}>
          {COLOR_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.colorOption,
                {
                  backgroundColor: option.color,
                  borderColor: option.borderColor || option.color,
                },
                selectedColor === option.key && styles.selectedColorOption,
              ]}
              onPress={() => setSelectedColor(option.key === 'default' ? 'red' : option.key)}
              activeOpacity={0.7}
            >
              {selectedColor === option.key && (
                <View style={[styles.selectedIndicator, { borderColor: option.key === 'default' ? '#fff' : option.color }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    backgroundColor: '#000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

  },
  title: {
    ...typography.presets.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'left',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE * 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  glowCircle: {
    position: 'absolute',
    width: IMAGE_SIZE * 0.9,
    height: IMAGE_SIZE * 0.9,
    borderRadius: IMAGE_SIZE * 0.7,
    top: '-3%',
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE * 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColorOption: {
    borderWidth: 0,
  },
  selectedIndicator: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    position: 'absolute',
  },
});
