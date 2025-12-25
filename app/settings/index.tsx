import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SettingsRow, SettingsSection } from '@/components/settings/SettingsRow';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon,
  HashtagIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from 'react-native-heroicons/outline';
import { ChevronRightIcon } from 'react-native-heroicons/solid';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <Header title="Settings" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card - Apple Style */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push('/settings/edit-profile')}
          activeOpacity={0.7}
        >
          <View style={styles.profileRow}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{user?.name?.[0] || 'U'}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedCheck}>✓</Text>
                </View>
              </View>
              <Text style={styles.profileHandle}>@{user?.username || 'username'}</Text>
              <Text style={styles.profileSubtext}>
                Manage your personal information
              </Text>
            </View>
            <ChevronRightIcon size={20} color={colors.text.tertiary} />
          </View>
        </TouchableOpacity>

        {/* Privacy & Notifications Section */}
        <SettingsSection>
          <SettingsRow
            icon={<ShieldCheckIcon size={18} color="#fff" />}
            iconBgColor="#007AFF"
            title="Privacy & Safety"
            subtitle="Location, Profile Visibility, Blocked Users"
            onPress={() => router.push('/settings/privacy')}
          />
          <SettingsRow
            icon={<BellIcon size={18} color="#fff" />}
            iconBgColor="#FF3B30"
            title="Notifications"
            subtitle="Activity Updates, Messages, Social"
            onPress={() => router.push('/settings/notifications')}
            showDivider={false}
          />
        </SettingsSection>

        {/* Discovery & Content Section */}
        <SettingsSection header="Preferences">
          <SettingsRow
            icon={<MapPinIcon size={18} color="#fff" />}
            iconBgColor="#34C759"
            title="Discovery Preferences"
            subtitle="Activity Types, Distance, Availability"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<HashtagIcon size={18} color="#fff" />}
            iconBgColor="#FF9500"
            title="Content Sharing"
            subtitle="Post Privacy, Tagging Permissions"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<Cog6ToothIcon size={18} color="#fff" />}
            iconBgColor="#8E8E93"
            title="Activity Tracking"
            subtitle="GPS, Units, Auto-Pause"
            onPress={() => {}}
            showDivider={false}
          />
        </SettingsSection>

        {/* Account Actions */}
        <SettingsSection>
          <SettingsRow
            icon={<ArrowRightOnRectangleIcon size={18} color="#EF4444" />}
            title="Log Out"
            onPress={() => {
              // TODO: Implement Logout
            }}
            isDestructive
            showDivider={false}
          />
        </SettingsSection>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Chainge v1.0.0</Text>
          <Text style={styles.appCopyright}>Made with love</Text>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  // Profile Card Styles
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...typography.presets.h2,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    ...typography.presets.bodyLarge,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  verifiedCheck: {
    fontSize: 9,
    color: 'white',
    fontWeight: '700',
  },
  profileHandle: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  profileSubtext: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appVersion: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
  },
  appCopyright: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    marginTop: 4,
    opacity: 0.6,
  },
});
