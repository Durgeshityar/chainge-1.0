import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled && !isLoading) {
      scale.value = withSpring(0.96);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !isLoading) {
      scale.value = withSpring(1);
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.text.disabled;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.background.input;
      case 'danger':
        return colors.status.error;
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.background.default;
    switch (variant) {
      case 'primary':
        return colors.text.inverse;
      case 'secondary':
        return colors.primary;
      case 'danger':
        return colors.text.primary;
      case 'ghost':
        return colors.text.primary;
      default:
        return colors.text.inverse;
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 36;
      case 'md':
        return 48;
      case 'lg':
        return 56;
      default:
        return 48;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return spacing.md;
      case 'md':
        return spacing.lg;
      case 'lg':
        return spacing.xl;
      default:
        return spacing.lg;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return typography.sizes.sm;
      case 'md':
        return typography.sizes.md;
      case 'lg':
        return typography.sizes.lg;
      default:
        return typography.sizes.md;
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          height: getHeight(),
          paddingHorizontal: getPadding(),
        },
        animatedStyle,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.background.default : colors.primary}
        />
      ) : (
        <>
          {leftIcon && <React.Fragment>{leftIcon}</React.Fragment>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                marginLeft: leftIcon && title ? spacing.sm : 0,
                marginRight: rightIcon && title ? spacing.sm : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <React.Fragment>{rightIcon}</React.Fragment>}
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
