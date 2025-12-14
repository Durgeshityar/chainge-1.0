import { spacing } from '@/theme/spacing';
import { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35; // Slightly larger than 1/3 for presence
const SPACING = 10;
const FULL_ITEM_SIZE = ITEM_WIDTH + SPACING;
const SPACER_ITEM_SIZE = (width - FULL_ITEM_SIZE) / 2;

export type ActivityType =
  | 'Running'
  | 'Cycling'
  | 'Walking'
  | 'Gym'
  | 'Yoga'
  | 'Basketball'
  | 'Tennis'
  | 'Soccer'
  | 'Hike';

interface ActivityOption {
  id: ActivityType;
  label: string;
  emoji: string;
  color: string;
}

const ACTIVITIES: ActivityOption[] = [
  { id: 'Running', label: 'Running', emoji: '🏃‍♂️', color: '#FF5F5F' },
  { id: 'Cycling', label: 'Cycling', emoji: '🚴', color: '#4CAF50' },
  { id: 'Walking', label: 'Walking', emoji: '🚶', color: '#2196F3' },
  { id: 'Gym', label: 'Gym', emoji: '💪', color: '#FF9800' },
  { id: 'Yoga', label: 'Yoga', emoji: '🧘', color: '#9C27B0' },
  { id: 'Basketball', label: 'Basketball', emoji: '🏀', color: '#FF5722' },
  { id: 'Tennis', label: 'Tennis', emoji: '🎾', color: '#CDDC39' },
  { id: 'Soccer', label: 'Soccer', emoji: '⚽', color: '#4CAF50' },
  { id: 'Hike', label: 'Hike', emoji: '⛰️', color: '#795548' },
];

// Add spacers for beginning and end
const DATA = [
  { key: 'spacer-left' },
  ...ACTIVITIES,
  { key: 'spacer-right' },
];

interface ActivityPickerProps {
  selectedActivity: ActivityType | null;
  onSelect: (activity: ActivityType) => void;
}

const WheelItem = ({ item, index, scrollX, onSelect }: any) => {
  if (!item.id) {
    return <View style={{ width: SPACER_ITEM_SIZE }} />;
  }

  // Adjust index because of the left spacer
  const realIndex = index - 1; 

  const rStyle = useAnimatedStyle(() => {
    // Input range is based on the scroll position relative to this item
    const inputRange = [
      (realIndex - 1) * FULL_ITEM_SIZE,
      realIndex * FULL_ITEM_SIZE,
      (realIndex + 1) * FULL_ITEM_SIZE,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.7, 1.0, 0.7], // reduced from 1.1 to 1.0 to prevent overflow
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.4, 1, 0.4],
        Extrapolation.CLAMP
    );

    const rotateY = interpolate(
        scrollX.value,
        inputRange,
        [45, 0, -45], // slight 3D rotation
        Extrapolation.CLAMP
    );

    return {
      transform: [
          { scale }, 
          { perspective: 1000 }, 
          { rotateY: `${rotateY}deg` }
      ],
      opacity,
    };
  });

  return (
    <View style={{ width: FULL_ITEM_SIZE }}>
        <Animated.View style={[styles.cardContainer, rStyle]}>
            <TouchableOpacity
                style={[styles.card, { borderColor: item.color }]}
                onPress={() => onSelect(item.id)}
                activeOpacity={0.9}
            >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={[styles.label, { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
        </Animated.View>
    </View>
  );
};

export const ActivityPicker = ({ selectedActivity, onSelect }: ActivityPickerProps) => {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<Animated.FlatList<any>>(null);

  // Auto-select on mount if specific prop passed, otherwise default to first?
  // User wanted "auto auto selected". We'll default to index 0 (Running).
  useEffect(() => {
     if (!selectedActivity) {
         onSelect(ACTIVITIES[0].id);
     }
  }, []);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleMomentumScrollEnd = (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / FULL_ITEM_SIZE);
      const clampedIndex = Math.min(Math.max(index, 0), ACTIVITIES.length - 1);
      
      const selected = ACTIVITIES[clampedIndex];
      if (selected && selected.id !== selectedActivity) {
          onSelect(selected.id); // Triggers state update in parent
      }
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={DATA}
        keyExtractor={(item: any) => item.id || item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={FULL_ITEM_SIZE}
        decelerationRate="fast"
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
            <WheelItem 
                item={item} 
                index={index} 
                scrollX={scrollX} 
                onSelect={(id: ActivityType) => {
                    // Start animation to scroll to this item if tapped
                    const targetIndex = ACTIVITIES.findIndex(a => a.id === id);
                    if (targetIndex !== -1 && flatListRef.current) {
                        flatListRef.current.scrollToOffset({
                            offset: targetIndex * FULL_ITEM_SIZE,
                            animated: true
                        });
                        onSelect(id);
                    }
                }}
            />
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  cardContainer: {
     alignItems: 'center',
     justifyContent: 'center',
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2,
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
