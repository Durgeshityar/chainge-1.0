import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/outline';

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isDestructive?: boolean;
}

export const SettingsRow = ({ icon, title, subtitle, onPress, isDestructive }: SettingsRowProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon]}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isDestructive && styles.destructiveText]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <ChevronRightIcon size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    width: '100%',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  destructiveIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    ...typography.presets.bodyLarge,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  destructiveText: {
    color: '#EF4444',
  },
  subtitle: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
  },
});
