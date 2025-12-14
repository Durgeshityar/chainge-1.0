import React from 'react';
import {
    Pressable,
    StyleSheet,
    ViewStyle
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';

export type IconButtonVariant = 'default' | 'primary' | 'ghost';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'default',
  size = 40,
  style,
  disabled = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.92);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1);
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.background.input;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'ghost':
        return 'transparent';
      case 'default':
      default:
        return colors.background.input;
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getBackgroundColor(),
        },
        animatedStyle,
        style,
      ]}
    >
      {icon}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
