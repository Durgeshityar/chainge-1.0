import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon, EllipsisVerticalIcon, NoSymbolIcon, ShareIcon, UserIcon, UserMinusIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionMenu, ActionMenuItem } from '../ui/ActionMenu';

interface ChatHeaderProps {
  title: string;
  isOnline?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  otherUserId?: string; // Optional for profile navigation
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  isOnline = false,
  onBackPress,
  onMenuPress,
  otherUserId,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const menuItems: ActionMenuItem[] = [
    {
      label: 'View profile',
      icon: UserIcon,
      onPress: () => {
        if (otherUserId) {
          router.push(`/profile/${otherUserId}` as any);
        } else {
          console.log('No user ID for profile navigation');
        }
      },
    },
    {
      label: 'Unfollow user',
      icon: UserMinusIcon,
      onPress: () => console.log('Unfollow pressed'),
    },
    {
      label: 'Share profile',
      icon: ShareIcon,
      onPress: () => console.log('Share pressed'),
    },
    {
      label: 'Block',
      icon: NoSymbolIcon,
      onPress: () => console.log('Block pressed'),
      isDestructive: true,
    },
  ];

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      setMenuVisible(true);
    }
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <ArrowLeftIcon size={20} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: isOnline ? '#98ff00' : colors.text.tertiary }]} />
              <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleMenuPress} style={styles.iconButton}>
            <EllipsisVerticalIcon size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={menuItems}
        anchorPosition={{ top: insets.top + 50, right: 16 }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.presets.bodyLarge,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
  },
});
