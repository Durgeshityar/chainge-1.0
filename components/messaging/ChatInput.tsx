import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowUpIcon, PhotoIcon, PlusIcon, XMarkIcon } from 'react-native-heroicons/solid';
import { ActionMenu, ActionMenuItem } from '../ui/ActionMenu';

interface ChatInputProps {
  onSend: (content: string, images?: string[]) => Promise<void>;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading = false }) => {
  const [text, setText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSend = async () => {
    if ((!text.trim() && selectedImages.length === 0) || isLoading) return;

    const content = text.trim();
    const images = [...selectedImages];

    setText('');
    setSelectedImages([]);

    try {
      await onSend(content, images);
    } catch (error) {
      setText(content);
      setSelectedImages(images);
    }
  };

  const ensureMediaPermission = async () => {
    // Check existing permission first to avoid redundant prompts
    const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (existing.granted) return true;

    // If not granted but we can still ask, request it
    if (existing.canAskAgain) {
      const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (requested.granted) return true;
      if (!requested.canAskAgain) {
        // User blocked; send to settings
        Alert.alert('Permission needed', 'Allow gallery access to attach images in Settings.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]);
        return false;
      }
    }

    // Already blocked/denied and cannot ask again
    Alert.alert('Permission needed', 'Allow gallery access to attach images in Settings.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]);
    return false;
  };

  const pickImage = async () => {
    // Close menu immediately to avoid overlay intercepting picker
    setMenuVisible(false);

    const allowed = await ensureMediaPermission();
    if (!allowed) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const menuItems: ActionMenuItem[] = [
    {
      label: 'Gallery',
      icon: PhotoIcon,
      onPress: pickImage,
    },
  ];

  return (
    <View style={styles.outerContainer}>
      {selectedImages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagePreviewContainer}
          contentContainerStyle={styles.imagePreviewContent}
        >
          {selectedImages.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                <XMarkIcon size={12} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Type message...."
          placeholderTextColor={colors.text.tertiary}
          multiline
          value={text}
          onChangeText={setText}
          maxLength={1000}
        />

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.plusButton} onPress={() => setMenuVisible(true)}>
            <PlusIcon size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendButton,
              ((!text.trim() && selectedImages.length === 0) || isLoading) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={(!text.trim() && selectedImages.length === 0) || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.jetBlack} size="small" />
            ) : (
              <ArrowUpIcon size={20} color={colors.jetBlack} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={menuItems}
        anchorPosition={{ bottom: 80, right: 60 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  imagePreviewContainer: {
    maxHeight: 100,
    marginBottom: 8,
  },
  imagePreviewContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    padding: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 6,
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    ...typography.presets.bodySmall,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#98ff00', // Figma green
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
});
