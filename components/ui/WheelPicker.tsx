import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import React, { useEffect, useRef } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface WheelPickerProps {
  items: string[] | number[];
  selectedValue: string | number;
  onValueChange: (value: any) => void;
  height?: number;
  itemHeight?: number;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  items,
  selectedValue,
  onValueChange,
  height = 200,
  itemHeight = 50,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    // Only scroll programmatically if the user isn't currently scrolling
    if (isScrolling.current) return;

    const index = items.indexOf(selectedValue as never);
    if (index !== -1 && flatListRef.current) {
      try {
        flatListRef.current.scrollToIndex({
          index,
          animated: true, // Animated true serves as a visual confirmation, but can be false if preferred
          viewPosition: 0.5,
        });
      } catch (e) {
        // Ignore scroll errors
      }
    }
  }, [items, selectedValue]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Ignore scroll events triggered by programmatic scrollToIndex calls to avoid snapping back
    if (!isScrolling.current) return;

    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    if (index >= 0 && index < items.length) {
      // Only call onValueChange if the value actually changed to avoid spamming
      if (items[index] !== selectedValue) {
        onValueChange(items[index]);
      }
    }
  };

  const onScrollBeginDrag = () => {
    isScrolling.current = true;
  };

  const onMomentumScrollBegin = () => {
    isScrolling.current = true;
  };

  const onMomentumScrollEnd = () => {
    isScrolling.current = false;
    // Optional: Re-align to exact center if needed, but snapToInterval handles this mostly
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isSelected = item === selectedValue;
    return (
      <View style={[styles.item, { height: itemHeight }]}>
        <Text style={[styles.text, isSelected && styles.selectedText]}>{item}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      <View
        style={[styles.selectionOverlay, { height: itemHeight, top: (height - itemHeight) / 2 }]}
      />
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollBegin={onMomentumScrollBegin}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: (height - itemHeight) / 2,
        }}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...typography.presets.h3,
    color: colors.text.secondary,
  },
  selectedText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 24,
  },
  selectionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
