import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Modal, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowDownTrayIcon, ShareIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MediaPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  mediaUrls: string[];
  initialIndex?: number;
}

const { width, height } = Dimensions.get('window');

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  visible,
  onClose,
  mediaUrls,
  initialIndex = 0,
}) => {
  const insets = useSafeAreaInsets();
  // Ensure initialIndex is within bounds
  const safeInitialIndex = Math.max(0, Math.min(initialIndex, mediaUrls.length - 1));
  const [currentIndex, setCurrentIndex] = useState(safeInitialIndex);
  const flatListRef = useRef<FlatList>(null);

  React.useEffect(() => {
    const safeIndex = Math.max(0, Math.min(initialIndex, mediaUrls.length - 1));
    setCurrentIndex(safeIndex);
    if (flatListRef.current && visible && mediaUrls.length > 0) {
      flatListRef.current.scrollToIndex({ animated: false, index: safeIndex });
    }
  }, [initialIndex, visible, mediaUrls.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleSave = () => {
    // Mock save functionality - in a real app would use expo-media-library
    console.log('Saving image:', mediaUrls[currentIndex]);
    alert('Image saved to gallery (Mock)');
  };

  const handleShare = () => {
    console.log('Sharing image:', mediaUrls[currentIndex]);
    alert('Sharing image (Mock)');
  };

  if (!visible || mediaUrls.length === 0) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <XMarkIcon size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
              <ArrowDownTrayIcon size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <ShareIcon size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={mediaUrls}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          keyExtractor={(item, index) => `${item}-${index}`}
          initialScrollIndex={safeInitialIndex}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          renderItem={({ item }) => (
            <View style={styles.content}>
              <Image
                source={{ uri: item }}
                style={styles.fullImage}
                contentFit="contain"
                transition={300}
              />
            </View>
          )}
        />

        {mediaUrls.length > 1 && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={styles.counterText}>
              {currentIndex + 1} of {mediaUrls.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height * 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    ...typography.presets.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
