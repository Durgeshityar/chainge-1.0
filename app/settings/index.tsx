import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SettingsRow } from '@/components/settings/SettingsRow';
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
  DocumentTextIcon,
  HashtagIcon,
  LockClosedIcon,
  UserIcon
} from 'react-native-heroicons/outline';

// Mock icons for navigation items (can be replaced with actual SVG/Icon components later)
const SettingsIcon = ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <Header title="Settings" showBack />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <TouchableOpacity 
            style={styles.profileCard} 
            onPress={() => router.push('/settings/edit-profile')}
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                  {/* Verified Badge Mock */}
                  <View style={[styles.verifiedBadge, { backgroundColor: '#3b82f6' }]}>
                      <Text style={{ fontSize: 8, color: 'white' }}>✓</Text>
                  </View>
              </View>
              <Text style={styles.profileHandle}>@{user?.username || 'username'}</Text>
            </View>
          </View>
          <Text style={styles.profileFooter}>
            Email & Password, Profile Photo, Verification etc
          </Text>
        </TouchableOpacity>

        {/* Settings List */}
        <View style={styles.section}>
            <SettingsRow
                icon={<LockClosedIcon size={20} color={colors.text.primary} />}
                title="Privacy & Safety"
                subtitle="Location & Privacy, Profile Visibility, Blocked..."
                onPress={() => {}} // TODO: Privacy Screen
            />
            <SettingsRow
                icon={<BellIcon size={20} color={colors.text.primary} />}
                title="Notifications"
                subtitle="Activity Updates, Messages, Social Interac..."
                onPress={() => router.push('/settings/notifications')}
            />
            <SettingsRow
                icon={<DocumentTextIcon size={20} color={colors.text.primary} />}
                title="Discovery Preferences"
                subtitle="Activity Types, Distance Range, Time Availa..."
                onPress={() => {}} // TODO: Discovery Screen
            />
            <SettingsRow
                icon={<HashtagIcon size={20} color={colors.text.primary} />}
                title="Content sharing"
                subtitle="Default Post Privacy, Tagging permissions,..."
                onPress={() => {}} // TODO: Content Screen
            />
             <SettingsRow
                icon={<UserIcon size={20} color={colors.text.primary} />}
                title="Activity Tracking"
                subtitle="GPS Settings, Units, Auto-Pause"
                onPress={() => {}} // TODO: Activity Screen
            />
        </View>

        {/* Bottom Actions */}
        <View style={styles.footer}>
             <SettingsRow
                icon={<ArrowRightOnRectangleIcon size={20} color="#EF4444" />}
                title="Log Out"
                subtitle=""
                onPress={() => {
                    // TODO: Implement Logout
                }}
                isDestructive
            />
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.background.modal,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...typography.presets.bodyLarge,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    ...typography.presets.bodyLarge,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: 4,
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.text.secondary, // Grayish badge in dark mode
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHandle: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
  },
  profileFooter: {
    ...typography.presets.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  footer: {
      marginBottom: spacing.xxl,
  }
});
