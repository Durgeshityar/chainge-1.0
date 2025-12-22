import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  style,
  textStyle,
  disabled = false,
  size = 'medium',
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.background.input;
    if (selected) return colors.primary;
    return colors.background.card;
  };

  const getTextColor = () => {
    if (disabled) return colors.text.disabled;
    if (selected) return colors.text.inverse;
    return colors.text.primary;
  };

  const getBorderColor = () => {
    if (disabled) return 'transparent';
    if (selected) return colors.primary;
    return colors.border.default;
  };

  const sizeStyles =
    size === 'small'
      ? {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: 14,
        }
      : undefined;

  const textPreset =
    size === 'small' ? typography.presets.labelSmall : typography.presets.bodySmall;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        sizeStyles,
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          textPreset,
          {
            color: getTextColor(),
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: '500',
  },
});
