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
  showDivider?: boolean;
  iconBgColor?: string;
}

export const SettingsRow = ({
  icon,
  title,
  subtitle,
  onPress,
  isDestructive,
  showDivider = true,
  iconBgColor,
}: SettingsRowProps) => {
  return (
    <>
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.6}>
        <View style={[
          styles.iconContainer,
          isDestructive && styles.destructiveIcon,
          iconBgColor && { backgroundColor: iconBgColor }
        ]}>
          {icon}
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.textContainer}>
            <Text style={[styles.title, isDestructive && styles.destructiveText]}>{title}</Text>
            {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          </View>
          <ChevronRightIcon size={18} color={colors.text.tertiary} strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </>
  );
};

// Grouped section component for Apple-like grouped settings
interface SettingsSectionProps {
  children: React.ReactNode;
  header?: string;
  footer?: string;
}

export const SettingsSection = ({ children, header, footer }: SettingsSectionProps) => {
  return (
    <View style={styles.sectionWrapper}>
      {header && <Text style={styles.sectionHeader}>{header}</Text>}
      <View style={styles.sectionContainer}>
        {children}
      </View>
      {footer && <Text style={styles.sectionFooter}>{footer}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.background.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  destructiveIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    ...typography.presets.inputText,
    fontWeight: '500',
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  destructiveText: {
    color: '#EF4444',
  },
  subtitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.default,
    marginLeft: 56 + spacing.md, // icon width + icon margin + padding
  },
  // Section styles
  sectionWrapper: {
    marginBottom: spacing.xl,
  },
  sectionContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  sectionFooter: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    marginLeft: spacing.md,
    lineHeight: 18,
  },
});
