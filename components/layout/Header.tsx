import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  transparent?: boolean;
  onBackPress?: () => void;
}

export const Header = ({
  title,
  showBack = true,
  rightElement,
  transparent = false,
  onBackPress,
}: HeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={[
      localStyles.container, 
      transparent && localStyles.transparent,
      !transparent && localStyles.default
    ]}>
      <View style={localStyles.left}>
        {showBack && (
          <TouchableOpacity onPress={handleBack} style={localStyles.backButton}>
            <ChevronLeftIcon size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={localStyles.center}>
        {title && (
          <Text style={localStyles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>
      
      <View style={localStyles.right}>
        {rightElement}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  default: {
    backgroundColor: colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  transparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
  title: {
    ...typography.presets.h3,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
