import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from 'react-native-heroicons/outline';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const TOAST_HEIGHT = 60;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const translateY = useSharedValue(-100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    translateY.value = withTiming(-100, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setToast)(null);
      }
    });
  }, [translateY]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current as ReturnType<typeof setTimeout>);
      }

      setToast({ id: Date.now().toString(), message, type, duration });
      translateY.value = withSpring(Platform.OS === 'ios' ? 60 : 20, {
        damping: 15,
      });

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast, translateY],
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const getIcon = () => {
    switch (toast?.type) {
      case 'success':
        return <CheckCircleIcon size={24} color={colors.status.success} />;
      case 'error':
        return <XCircleIcon size={24} color={colors.status.error} />;
      case 'warning':
        return <ExclamationCircleIcon size={24} color={colors.status.warning} />;
      case 'info':
      default:
        return <InformationCircleIcon size={24} color={colors.status.info} />;
    }
  };

  const getBorderColor = () => {
    switch (toast?.type) {
      case 'success':
        return colors.status.success;
      case 'error':
        return colors.status.error;
      case 'warning':
        return colors.status.warning;
      case 'info':
      default:
        return colors.status.info;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Animated.View style={[styles.container, animatedStyle, { borderColor: getBorderColor() }]}>
          <View style={styles.content}>
            {getIcon()}
            <Text style={styles.message}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    zIndex: 9999,
    ...shadows.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});
