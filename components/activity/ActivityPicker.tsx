import { spacing } from '@/theme/spacing';
import { useCallback, useEffect } from 'react';
import { Dimensions, Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const WHEEL_RADIUS = width * 0.7; // Radius of the semicircle
const ITEM_SIZE = width * 0.32;
const ANGLE_PER_ITEM = Math.PI / 5; // 36 degrees between items - more spread for visible curve

// Import icons from constants
import { sportsIcons } from '@/lib/constants';

export type ActivityType =
  | 'Running'
  | 'Cycling'
  | 'Swimming'
  | 'Football'
  | 'Basketball'
  | 'Tennis'
  | 'Badminton'
  | 'Cricket'
  | 'Pickleball'
  | 'Weightlifting'
  | 'Volleyball'
  | 'Boxing';

interface ActivityOption {
  id: ActivityType;
  label: string;
  icon: ImageSourcePropType;
}

const ACTIVITIES: ActivityOption[] = Object.entries(sportsIcons).map(([key, icon]) => {
  // Capitalize first letter
  const label = key.charAt(0).toUpperCase() + key.slice(1);
  return {
    id: label as ActivityType, // Ensuring type safety might require looser casting or consistent naming
    label: label,
    icon: icon as ImageSourcePropType,
  };
});

interface ActivityPickerProps {
  selectedActivity: ActivityType | null;
  onSelect: (activity: ActivityType) => void;
}

interface WheelItemProps {
  item: ActivityOption;
  index: number;
  currentIndex: SharedValue<number>;
}

const WheelItem = ({ item, index, currentIndex }: WheelItemProps) => {
  const rStyle = useAnimatedStyle(() => {
    // Calculate this item's angle on the wheel
    // offset: how many positions away from center this item is
    const offset = index - currentIndex.value;

    // Each item is positioned at an angle along the semicircle
    // angle = 0 means top center, negative = left side, positive = right side
    const angle = offset * ANGLE_PER_ITEM;

    // Position on semicircle (wheel center is below the visible area)
    // x = sin(angle) * radius -> horizontal position
    // y = (1 - cos(angle)) * radius -> vertical position (0 at top, increases downward)
    const x = Math.sin(angle) * WHEEL_RADIUS;
    const y = (1 - Math.cos(angle)) * WHEEL_RADIUS * 0.6; // Increased for more visible arc

    // Scale based on position (center = largest)
    const absOffset = Math.abs(offset);
    const scale = interpolate(
      absOffset,
      [0, 1, 2, 3],
      [1, 0.78, 0.6, 0.45],
      Extrapolation.CLAMP
    );

    // Opacity based on position
    const opacity = interpolate(
      absOffset,
      [0, 1, 2, 2.5],
      [1, 0.7, 0.4, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
      ],
      opacity,
      zIndex: Math.round(100 - absOffset * 10),
    };
  });

  return (
    <Animated.View style={[styles.itemContainer, rStyle]}>
      <View style={styles.card}>
        <Image source={item.icon} style={styles.icon} resizeMode="contain" />
        <Text style={styles.label}>{item.label}</Text>
      </View>
    </Animated.View>
  );
};

export const ActivityPicker = ({ selectedActivity, onSelect }: ActivityPickerProps) => {
  const currentIndex = useSharedValue(0);
  const startIndex = useSharedValue(0);

  const snapToIndex = useCallback((targetIndex: number) => {
    'worklet';
    const clampedIndex = Math.max(0, Math.min(ACTIVITIES.length - 1, Math.round(targetIndex)));

    currentIndex.value = withSpring(clampedIndex, {
      damping: 18,
      stiffness: 250,
      mass: 0.6,
    });

    runOnJS(onSelect)(ACTIVITIES[clampedIndex].id);
  }, [onSelect]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      cancelAnimation(currentIndex);
      startIndex.value = currentIndex.value;
    })
    .onUpdate((event) => {
      // Convert horizontal pan to index change
      // Map pan distance to rotation around the wheel
      const sensitivity = 0.006;
      const indexDelta = -event.translationX * sensitivity;
      const newIndex = startIndex.value + indexDelta;

      // Rubber band effect at edges
      const minIndex = 0;
      const maxIndex = ACTIVITIES.length - 1;

      if (newIndex < minIndex) {
        currentIndex.value = minIndex + (newIndex - minIndex) * 0.2;
      } else if (newIndex > maxIndex) {
        currentIndex.value = maxIndex + (newIndex - maxIndex) * 0.2;
      } else {
        currentIndex.value = newIndex;
      }
    })
    .onEnd((event) => {
      const velocityFactor = -event.velocityX * 0.00025;
      const projectedIndex = currentIndex.value + velocityFactor;
      snapToIndex(projectedIndex);
    });

  // Initialize
  useEffect(() => {
    const initialIndex = selectedActivity
      ? ACTIVITIES.findIndex(a => a.id === selectedActivity)
      : 0;

    if (initialIndex !== -1) {
      currentIndex.value = initialIndex;
      if (!selectedActivity) {
        onSelect(ACTIVITIES[0].id);
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* 3D semicircular platform at bottom */}
      {/* 3D semicircular platform (Shadow/Pedestal) */}
      <View style={styles.platformContainer}>
        <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <RadialGradient
              id="grad"
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="0%" stopColor="#4A4A4A" stopOpacity="0.7" />
              <Stop offset="30%" stopColor="#2A2A2A" stopOpacity="0.5" />
              <Stop offset="70%" stopColor="#121212" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#050505" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          {/* Main soft shadow/pedestal */}
          <Ellipse cx="50" cy="50" rx="48" ry="32" fill="url(#grad)" />
          {/* Inner core for depth */}
          <Ellipse cx="50" cy="50" rx="35" ry="20" fill="url(#grad)" opacity={0.6} />
        </Svg>
      </View>

      {/* Wheel items */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.wheelContainer}>
          {ACTIVITIES.map((item, index) => (
            <WheelItem
              key={item.id}
              item={item}
              index={index}
              currentIndex={currentIndex}
            />
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    height: 300,
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'hidden',
  },
  wheelContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.15,
    backgroundColor: 'transparent',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  icon: {
    width: ITEM_SIZE * 0.9, // Increased size
    height: ITEM_SIZE * 0.9, // Increased size
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  platformContainer: {
    position: 'absolute',
    bottom: 25,
    width: width * 0.45, // Reduced from 0.8
    height: 70, // Reduced from 120
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
});
