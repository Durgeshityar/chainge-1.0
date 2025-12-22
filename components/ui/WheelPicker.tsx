import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const hasMounted = useRef(false);
  const [internalIndex, setInternalIndex] = useState(() => {
    const idx = items.indexOf(selectedValue as never);
    return idx !== -1 ? idx : 0;
  });

  // Only scroll to position on initial mount
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    const index = items.indexOf(selectedValue as never);
    if (index !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: index * itemHeight,
          animated: false,
        });
      }, 100);
    }
  }, []);

  const getIndexFromOffset = useCallback((offsetY: number) => {
    const index = Math.round(offsetY / itemHeight);
    return Math.max(0, Math.min(items.length - 1, index));
  }, [itemHeight, items.length]);

  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = getIndexFromOffset(offsetY);

    if (index >= 0 && index < items.length) {
      setInternalIndex(index);
      onValueChange(items[index]);
    }
  }, [items, onValueChange, getIndexFromOffset]);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isSelected = index === internalIndex;
    return (
      <View style={[styles.item, { height: itemHeight }]}>
        <Text style={[styles.text, isSelected && styles.selectedText]}>{item}</Text>
      </View>
    );
  }, [internalIndex, itemHeight]);

  const keyExtractor = useCallback((_: any, index: number) => index.toString(), []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }), [itemHeight]);

  return (
    <View style={[styles.container, { height }]}>
      <View
        style={[styles.selectionOverlay, { height: itemHeight, top: (height - itemHeight) / 2 }]}
      />
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: (height - itemHeight) / 2,
        }}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={(event) => {
          // Handle case where user scrolls slowly and no momentum
          const velocity = event.nativeEvent.velocity?.y ?? 0;
          if (Math.abs(velocity) < 0.5) {
            handleScrollEnd(event);
          }
        }}
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
