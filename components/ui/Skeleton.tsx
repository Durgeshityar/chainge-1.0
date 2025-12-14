import React, { useEffect } from 'react';
import { DimensionValue, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  circle?: boolean;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle = false,
  style,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000, easing: Easing.ease }),
        withTiming(0.3, { duration: 1000, easing: Easing.ease })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width,
          height: height,
          borderRadius: circle && typeof width === 'number' ? width / 2 : 8,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.background.input,
  },
});
