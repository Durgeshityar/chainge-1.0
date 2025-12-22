import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Portal } from '@gorhom/portal';
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Dimensions, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

interface BottomSheetProps {
  children?: React.ReactNode;
  snapPoints?: string[]; // e.g. ['25%', '50%']
  onClose?: () => void;
  backgroundColor?: string;
}

export interface BottomSheetRef {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ children, snapPoints = ['50%'], onClose, backgroundColor = colors.background.card }, ref) => {
    const translateY = useSharedValue(0);
    const active = useSharedValue(false);
    const context = useSharedValue({ y: 0 });
    const [isPortalActive, setIsPortalActive] = useState(false);

    const setPortalActive = useCallback((value: boolean) => {
      setIsPortalActive(value);
    }, []);

    const scrollTo = useCallback(
      (destination: number) => {
        'worklet';
        active.value = destination !== 0;
        translateY.value = withSpring(destination, { damping: 50, stiffness: 200, mass: 0.5 });
      },
      [active, translateY],
    );

    const isActive = useCallback(() => {
      return active.value;
    }, [active]);

    useImperativeHandle(ref, () => ({ scrollTo, isActive }), [scrollTo, isActive]);

    useAnimatedReaction(
      () => active.value,
      (value) => {
        runOnJS(setPortalActive)(value);
      },
      [setPortalActive],
    );

    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        translateY.value = event.translationY + context.value.y;
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
      })
      .onEnd(() => {
        if (translateY.value > -SCREEN_HEIGHT / 3) {
          scrollTo(0);
          if (onClose) runOnJS(onClose)();
        } else {
          scrollTo(MAX_TRANSLATE_Y);
        }
      });

    const rBottomSheetStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
      };
    });

    const rBackdropStyle = useAnimatedStyle(() => {
      return {
        opacity: withSpring(active.value ? 1 : 0),
      };
    });

    return (
      <Portal>
        <View pointerEvents={isPortalActive ? 'auto' : 'none'} style={styles.portalOverlay}>
          <TouchableWithoutFeedback onPress={() => scrollTo(0)}>
            <Animated.View style={[styles.backdrop, rBackdropStyle]} />
          </TouchableWithoutFeedback>
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle, { backgroundColor }]}>
              <View style={styles.line} />
              {children}
            </Animated.View>
          </GestureDetector>
        </View>
      </Portal>
    );
  },
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  portalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    position: 'absolute',
    left: 0,
    right: 0,
    // backgroundColor handled via inline style now to support prop
    top: SCREEN_HEIGHT,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    zIndex: 100,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: colors.text.secondary,
    alignSelf: 'center',
    marginVertical: spacing.sm,
    borderRadius: 2,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    zIndex: 99,
  },
});
