import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import {
    ChatBubbleBottomCenterTextIcon as ChatOutline,
    RectangleStackIcon as FeedOutline,
    FingerPrintIcon as FingerPrintOutline,
    HomeIcon as HomeOutline,
} from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../ui/Avatar';

const ICON_SIZE = 24;

interface TabConfig {
  outlineIcon: React.FC<{ color: string; size: number }>;
  label: string;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  index: {
    outlineIcon: HomeOutline,
    label: 'Home',
  },
  nearby: {
    outlineIcon: FingerPrintOutline,
    label: 'Nearby',
  },
  feed: {
    outlineIcon: FeedOutline,
    label: 'Feed',
  },
  messages: {
    outlineIcon: ChatOutline,
    label: 'Messages',
  },
  profile: {
    outlineIcon: HomeOutline, // Placeholder, will use Avatar instead
    label: 'Profile',
  },
};

interface TabItemProps {
  route: {
    key: string;
    name: string;
  };
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  avatarUrl?: string;
  avatarName?: string;
}

const TabItem: React.FC<TabItemProps> = ({
  route,
  isFocused,
  onPress,
  onLongPress,
  avatarUrl,
  avatarName,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const config = TAB_CONFIG[route.name] || TAB_CONFIG.index;
  const isProfile = route.name === 'profile';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const iconColor = isFocused ? colors.primary : 'rgba(255, 255, 255, 0.5)';
  const IconComponent = config.outlineIcon;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={config.label}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={8}
      android_ripple={{ color: 'transparent' }}
      style={styles.tabItem}
    >
      <Animated.View
        style={[
          styles.iconButton,
          isProfile ? styles.avatarButton : null,
          isFocused
            ? isProfile
              ? styles.avatarButtonActive
              : styles.iconButtonActive
            : null,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {isProfile ? (
          <Avatar source={avatarUrl} name={avatarName || 'User'} size="md" />
        ) : (
          <>
            <IconComponent color={iconColor} size={ICON_SIZE} />
            {isFocused && <View style={styles.indicator} />}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

interface TabBarProps extends BottomTabBarProps {
  userAvatarUrl?: string;
  userName?: string;
  unreadCount?: number;
}

export const TabBar: React.FC<TabBarProps> = ({
  state,
  navigation,
  userAvatarUrl,
  userName,
  unreadCount,
}) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, spacing.md);

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: bottomOffset }]}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              avatarUrl={route.name === 'profile' ? userAvatarUrl : undefined}
              avatarName={route.name === 'profile' ? userName : undefined}
            />
          );
        })}
      </View>
    </View>
  );
};
export default TabBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.background.default,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...shadows.lg,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(152, 255, 0, 0.15)',
    shadowColor: '#98ff00',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarButton: {
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatarButtonActive: {
    borderColor: colors.primary,
  },
  indicator: {
    position: 'absolute',
    bottom: 6,
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },

});


