import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const CARD_HEIGHT = 160;
const CARD_WIDTH = width * 0.9;
const STACK_OFFSET = 18;
const SCALE_FACTOR = 0.06;
const DRAG_THRESHOLD = 100;

const SPRING_CONFIG = {
  damping: 80, // High friction (like moving through water)
  stiffness: 100, // Weaker pull force (moves slower)
  mass: 5, // Very Heavy (takes a long time to accelerate/decelerate)
  overshootClamping: false,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};

export interface StackItem {
  id: string;
  element: React.ReactNode;
}

interface ActivityStackProps {
  items: StackItem[];
}

export function ActivityStack({ items }: ActivityStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedIndex = useSharedValue(0);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    animatedIndex.value = withSpring(currentIndex + 1, SPRING_CONFIG);
  }, [currentIndex, animatedIndex]);

  // We render a window of cards around the current index
  const visibleIndices = [
    currentIndex - 1, // The card moving to the back
    currentIndex, // The active card
    currentIndex + 1, // Next
    currentIndex + 2, // Next + 1
  ];

  return (
    <View style={styles.container}>
      {visibleIndices.reverse().map((i) => {
        // Infinite loop logic
        const itemIndex = ((i % items.length) + items.length) % items.length;
        const item = items[itemIndex];
        const key = `${item.id}-${i}`;

        return (
          <SwipeableCard
            key={key}
            item={item}
            actualIndex={i}
            isCurrent={i === currentIndex}
            animatedIndex={animatedIndex}
            onSwipe={handleNext}
          />
        );
      })}
    </View>
  );
}

interface SwipeableCardProps {
  item: StackItem;
  actualIndex: number;
  isCurrent: boolean;
  animatedIndex: SharedValue<number>;
  onSwipe: () => void;
}

function SwipeableCard({
  item,
  actualIndex,
  isCurrent,
  animatedIndex,
  onSwipe,
}: SwipeableCardProps) {
  const dragY = useSharedValue(0);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isCurrent)
        .onChange((e) => {
          // Allow dragging down freely, resistance dragging up
          if (e.translationY > 0) {
            dragY.value = e.translationY;
          } else {
            dragY.value = e.translationY * 0.2;
          }
        })
        .onEnd((e) => {
          const shouldDismiss = dragY.value > DRAG_THRESHOLD || e.velocityY > 800;

          if (shouldDismiss) {
            // 1. Trigger the state change
            runOnJS(onSwipe)();

            // 2. VITAL: Do NOT throw the card off screen.
            // Reset drag to 0. The StackCardUI interpolation will handle
            // moving it to the "back" of the stack based on the new index.
            dragY.value = withSpring(0, SPRING_CONFIG);
          } else {
            // Return to start if not swiped enough
            dragY.value = withSpring(0, SPRING_CONFIG);
          }
        }),
    [isCurrent, onSwipe, dragY],
  );

  return (
    <GestureDetector gesture={pan}>
      <StackCardUI actualIndex={actualIndex} animatedIndex={animatedIndex} dragY={dragY}>
        {item.element}
      </StackCardUI>
    </GestureDetector>
  );
}

interface StackCardUIProps {
  actualIndex: number;
  animatedIndex: SharedValue<number>;
  dragY: SharedValue<number>;
  children: React.ReactNode;
}

function StackCardUI({ actualIndex, animatedIndex, dragY, children }: StackCardUIProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const relativeIndex = actualIndex - animatedIndex.value;

    // 1. TRANSLATION Y
    const translateY = interpolate(
      relativeIndex,
      [-1, 0, 1, 2, 3],
      [
        -STACK_OFFSET * 2, // Index -1: Moves UP to the back of the stack
        0, // Index 0: Active Center
        -STACK_OFFSET, // Index 1: Behind
        -STACK_OFFSET * 2, // Index 2: Further Behind
        -STACK_OFFSET * 3,
      ],
      Extrapolate.CLAMP,
    );

    // 2. SCALE
    const scale = interpolate(
      relativeIndex,
      [-1, 0, 1, 2],
      [
        1 - SCALE_FACTOR * 2, // Index -1: Shrinks to look like it's in back
        1, // Index 0: Full Size
        1 - SCALE_FACTOR, // Index 1: Smaller
        1 - SCALE_FACTOR * 2, // Index 2: Smallest
      ],
      Extrapolate.CLAMP,
    );

    // 3. Z-INDEX
    // We use Z-Index to physically layer the cards.
    // When relativeIndex approaches -1, it MUST drop below index 0.
    const zIndex = interpolate(
      relativeIndex,
      [-1, -0.5, 0, 1],
      [0, 1, 100, 90], // At -1, zIndex is lowest. At 0, it is highest.
      Extrapolate.CLAMP,
    );

    // 4. OPACITY
    // Keep it visible so we see it tuck behind
    const opacity = interpolate(relativeIndex, [-2, -1, 0, 1], [0, 1, 1, 1], Extrapolate.CLAMP);

    // 5. DRAG INFLUENCE
    // Stop the drag from affecting the card once it transitions to "old" (-1)
    const dragStrength = interpolate(relativeIndex, [-0.5, 0, 0.5], [0, 1, 0], Extrapolate.CLAMP);

    return {
      transform: [{ translateY: translateY + dragY.value * dragStrength }, { scale }],
      zIndex: Math.round(zIndex), // Integer for zIndex
      opacity,
    };
  });

  return <Animated.View style={[styles.card, animatedStyle]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  container: {
    // Ensure container is large enough for gestures
    height: CARD_HEIGHT + 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
});
