import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface DividerProps {
  inset?: boolean;
  style?: ViewStyle;
  color?: string;
}

export const Divider: React.FC<DividerProps> = ({
  inset = false,
  style,
  color = colors.border.default,
}) => {
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          marginLeft: inset ? spacing.lg : 0,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
