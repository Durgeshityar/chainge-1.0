import React from 'react';
import {
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
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
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  style,
  textStyle,
  disabled = false,
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
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
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
    ...typography.presets.bodySmall,
    fontWeight: '500',
  },
});
