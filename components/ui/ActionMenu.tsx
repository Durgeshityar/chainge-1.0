import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface ActionMenuItem {
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  onPress: () => void;
  isDestructive?: boolean;
}

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  items: ActionMenuItem[];
  anchorPosition?: { top?: number; bottom?: number; left?: number; right?: number };
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  visible,
  onClose,
  items,
  anchorPosition = { top: 60, right: 16 },
}) => {
  if (!visible) return null;

  const handleItemPress = (itemOnPress: () => void) => {
    onClose();
    // Longer delay to ensure modal is fully closed before launching picker
    setTimeout(() => {
      itemOnPress();
    }, 300);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.menuContainer, anchorPosition]}
          onPress={(e) => e.stopPropagation()}
        >
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.item,
                    index < items.length - 1 && styles.border
                  ]}
                  onPress={() => handleItemPress(item.onPress)}
                >
                  <Text style={[
                    styles.label,
                    item.isDestructive && styles.destructiveLabel
                  ]}>
                    {item.label}
                  </Text>
                  <Icon size={20} color={item.isDestructive ? colors.status.error : colors.text.primary} />
                </TouchableOpacity>
              );
            })}
          </BlurView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  menuContainer: {
    position: 'absolute',
    minWidth: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurContainer: {
    padding: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    marginRight: 12,
  },
  destructiveLabel: {
    color: colors.status.error,
  },
});
