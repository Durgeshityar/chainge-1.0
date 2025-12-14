import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';


interface BadgeProps {
  count?: number;
  variant?: 'default' | 'dot';
  style?: ViewStyle;
  size?: number;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  variant = 'default',
  style,
  size = 20,
}) => {
  if (variant === 'dot') {
    return (
      <View
        style={[
          styles.dot,
          {
            width: size / 2,
            height: size / 2,
            borderRadius: size / 4,
          },
          style,
        ]}
      />
    );
  }

  if (count === 0 || count === undefined) return null;

  const displayCount = count > 99 ? '99+' : count.toString();
  const isWide = displayCount.length > 1;

  return (
    <View
      style={[
        styles.badge,
        {
          minWidth: size,
          height: size,
          borderRadius: size / 2,
          paddingHorizontal: isWide ? 6 : 0,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: size * 0.6,
            lineHeight: size,
          },
        ]}
      >
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -5,
    right: -5,
    zIndex: 10,
    borderWidth: 2,
    borderColor: colors.background.default,
  },
  dot: {
    backgroundColor: colors.status.error,
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    borderWidth: 2,
    borderColor: colors.background.default,
  },
  text: {
    color: colors.text.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
});
