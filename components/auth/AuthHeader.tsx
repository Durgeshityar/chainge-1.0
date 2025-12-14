import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';

import { colors } from '@/theme/colors';

import { BrandLinkIcon } from './BrandLinkIcon';

export type AuthHeaderProps = {
  onBack?: () => void;
  rightSlot?: ReactNode;
  showLogoText?: boolean;
};

export function AuthHeader({ onBack, rightSlot, showLogoText = true }: AuthHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color={colors.text.primary} />
        </Pressable>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}

      <View style={styles.logoContainer}>
        <BrandLinkIcon color={colors.primary} size={18} />
        {showLogoText ? <Text style={styles.logoText}>CHAINGE</Text> : null}
      </View>

      <View style={styles.rightSlot}>
        {rightSlot ?? <View style={styles.backButtonPlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },
  rightSlot: {
    width: 44,
    alignItems: 'center',
  },
});
