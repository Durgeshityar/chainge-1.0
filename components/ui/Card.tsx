import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: number;
  borderRadius?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = spacing.lg,
  borderRadius = 16,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1);
    }
  };

  const Container = onPress ? AnimatedPressable : View;
  const pressableProps = onPress
    ? { onPress, onPressIn: handlePressIn, onPressOut: handlePressOut }
    : {};

  return (
    <Container
      {...pressableProps}
      style={[
        styles.container,
        {
          padding,
          borderRadius,
        },
        onPress ? animatedStyle : {},
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
});
