import React, { useState } from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | number;

interface AvatarProps {
  source?: ImageSourcePropType | string;
  name?: string;
  size?: AvatarSize;
  isOnline?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  borderColor?: string;
  borderWidth?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  isOnline = false,
  onPress,
  style,
  borderColor,
  borderWidth,
}) => {
  const [imageError, setImageError] = useState(false);

  const getDimensions = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 32;
      case 'md':
        return 48;
      case 'lg':
        return 72;
      case 'xl':
        return 96;
      default:
        return 48;
    }
  };

  const getFontSize = () => {
    if (typeof size === 'number') return size * 0.4;
    switch (size) {
      case 'sm':
        return typography.sizes.xs;
      case 'md':
        return typography.sizes.md;
      case 'lg':
        return typography.sizes.xl;
      case 'xl':
        return typography.sizes.xxl;
      default:
        return typography.sizes.md;
    }
  };

  const getInitials = () => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const dimension = getDimensions();
  const borderRadius = dimension / 2;

  const Container = onPress ? TouchableOpacity : View;

  const imageSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <Container onPress={onPress} style={[styles.container, style]}>
      <View
        style={[
          styles.avatarContainer,
          {
            width: dimension,
            height: dimension,
            borderRadius,
            backgroundColor: colors.background.card,
            borderColor: borderColor ?? colors.border.default,
            borderWidth: borderWidth ?? 1,
          },
        ]}
      >
        {source && !imageError ? (
          <Image
            source={imageSource}
            style={{ width: dimension, height: dimension, borderRadius }}
            onError={() => setImageError(true)}
          />
        ) : (
          <Text
            style={[
              styles.initials,
              {
                fontSize: getFontSize(),
              },
            ]}
          >
            {getInitials()}
          </Text>
        )}
      </View>

      {isOnline && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: dimension * 0.25,
              height: dimension * 0.25,
              borderRadius: dimension * 0.125,
              bottom: dimension * 0.05,
              right: dimension * 0.05,
            },
          ]}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  initials: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    backgroundColor: colors.status.success,
    borderWidth: 2,
    borderColor: colors.background.default,
  },
});
