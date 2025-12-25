import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal as RNModal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height } = Dimensions.get('window');

interface ModalAction {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'destructive' | 'cancel';
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions?: ModalAction[];
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  message,
  actions,
  children,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && (fadeAnim as any)._value === 0) return null;

  return (
    <RNModal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.overlay}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={styles.dismissArea}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <BlurView intensity={90} tint="dark" style={styles.content}>
            {title && <Text style={styles.title}>{title}</Text>}
            {message && <Text style={styles.message}>{message}</Text>}
            
            {children && <View style={styles.childrenContainer}>{children}</View>}

            {actions && actions.length > 0 && (
              <View style={styles.actionsContainer}>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.actionButton,
                      action.variant === 'cancel' && styles.cancelButton,
                      action.variant === 'destructive' && styles.destructiveButton,
                      index < actions.length - 1 && styles.actionDivider,
                    ]}
                    onPress={() => {
                        onClose();
                        setTimeout(action.onPress, 350);
                    }}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        action.variant === 'destructive' && styles.destructiveText,
                        action.variant === 'cancel' && styles.cancelText,
                      ]}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </BlurView>
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dismissArea: {
    flex: 1,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.presets.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  childrenContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  actionsContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDivider: {
    // borderBottomWidth: 1,
    // borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    ...typography.presets.bodyLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginTop: spacing.xs,
  },
  cancelText: {
    color: colors.text.secondary,
    fontWeight: '500',
  },
  destructiveButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  destructiveText: {
    color: '#EF4444',
  },
});
