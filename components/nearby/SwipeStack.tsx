import { ActivityWithParticipants } from '@/types';
import { useCallback, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ActivityCard } from './ActivityCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const ROTATION_ANGLE = 15;

interface SwipeStackProps {
  activities: ActivityWithParticipants[];
  onSwipeLeft: (activityId: string) => void;
  onSwipeRight: (activityId: string) => void;
  onCardPress?: (activity: ActivityWithParticipants) => void;
}

export const SwipeStack = ({
  activities,
  onSwipeLeft,
  onSwipeRight,
  onCardPress,
}: SwipeStackProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isCTAActive = useRef(false);

  // Reset values when activities change (top card changes)
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [activities, translateX, translateY]);

  const handleSwipeComplete = useCallback(
    (direction: 'left' | 'right') => {
      const currentActivity = activities[0];
      if (!currentActivity) return;

      if (direction === 'left') {
        onSwipeLeft(currentActivity.id);
      } else {
        onSwipeRight(currentActivity.id);
      }
    },
    [activities, onSwipeLeft, onSwipeRight],
  );

  const animateSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const destination = direction === 'left' ? -SCREEN_WIDTH * 1.5 : SCREEN_WIDTH * 1.5;
      translateX.value = withTiming(destination, { duration: 300 }, () => {
        runOnJS(handleSwipeComplete)(direction);
      });
    },
    [handleSwipeComplete, translateX],
  );

  const handleTap = useCallback(() => {
    if (isCTAActive.current) {
      return;
    }
    if (onCardPress && activities.length > 0) {
      onCardPress(activities[0]);
    }
  }, [onCardPress, activities]);

  const handleCTAInteractionStart = useCallback(() => {
    isCTAActive.current = true;
  }, []);

  const handleCTAInteractionEnd = useCallback(() => {
    isCTAActive.current = false;
  }, []);

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleTap)();
  });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5; // Reduced vertical movement
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right - Join
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
          runOnJS(handleSwipeComplete)('right');
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left - Pass
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
          runOnJS(handleSwipeComplete)('left');
        });
      } else {
        // Snap back
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // Race: If pan is detected, tap is cancelled. If tap is fast, it fires.
  const gesture = Gesture.Race(panGesture, tapGesture);

  const topCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
    );
    return {
      zIndex: 10,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(Math.abs(translateX.value), [0, SWIPE_THRESHOLD], [0.85, 1]);
    return {
      zIndex: 1,
      transform: [{ scale: 1 }],
      opacity,
    };
  });

  if (activities.length === 0) {
    return null;
  }

  const topActivity = activities[0];
  const nextActivity = activities.length > 1 ? activities[1] : null;

  return (
    <View style={styles.container}>
      {/* Next Card (behind) */}
      {nextActivity && (
        <Animated.View
          key={nextActivity.id}
          style={[styles.cardWrapper, styles.nextCard, nextCardStyle]}
        >
          <ActivityCard activity={nextActivity} isTopCard={false} />
        </Animated.View>
      )}

      {/* Top Card (interactive) */}
      <GestureDetector gesture={gesture}>
        <Animated.View key={topActivity.id} style={[styles.cardWrapper, topCardStyle]}>
          <ActivityCard
            activity={topActivity}
            translateX={translateX}
            isTopCard={true}
            onPass={() => animateSwipe('left')}
            onJoin={() => animateSwipe('right')}
            onCTAInteractionStart={handleCTAInteractionStart}
            onCTAInteractionEnd={handleCTAInteractionEnd}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center', // Changed to center manually via margin to reduce top space
    paddingTop: 30, // Push down slightly from header, but less than center
  },
  cardWrapper: {
    position: 'absolute',
    top: 0, // Align to top of container which has padding
  },
  nextCard: {
    // zIndex is handled by animated style, but ensuring base is low
    zIndex: 1,
  },
});

export default SwipeStack;
