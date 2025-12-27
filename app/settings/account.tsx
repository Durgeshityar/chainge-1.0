import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/outline';

import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface SessionEntry {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  active?: boolean;
}

const sessions: SessionEntry[] = [
  {
    id: 'ios-15-pro',
    device: 'iPhone 15 Pro',
    location: 'Mumbai · Today, 10:14 AM',
    lastActive: 'Active now',
    active: true,
  },
  {
    id: 'ipad-mini',
    device: 'iPad Mini',
    location: 'Bengaluru · Yesterday, 8:20 PM',
    lastActive: 'Signed out remotely',
  },
];

export default function AccountSettingsScreen() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone: '',
    twoFactor: true,
    loginAlerts: false,
  });

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.content}>
      <Header title="Account" showBack />

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Profile details</Text>
        <FieldInput
          label="Name"
          value={form.name}
          onChangeText={(value) => handleChange('name', value)}
          placeholder="Enter your name"
        />
        <FieldInput
          label="Username"
          value={form.username}
          onChangeText={(value) => handleChange('username', value)}
          placeholder="@handle"
        />
        <FieldInput
          label="Email"
          value={form.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          placeholder="name@chainge.com"
        />
        <FieldInput
          label="Phone number"
          value={form.phone}
          onChangeText={(value) => handleChange('phone', value)}
          keyboardType="phone-pad"
          placeholder="Optional"
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Security</Text>
        <ToggleRow
          label="Two-factor authentication"
          subtitle="Add an extra step when signing in"
          value={form.twoFactor}
          onValueChange={(value) => handleChange('twoFactor', value)}
        />
        <ToggleRow
          label="Login alerts"
          subtitle="Push a notification if a new device signs in"
          value={form.loginAlerts}
          onValueChange={(value) => handleChange('loginAlerts', value)}
        />
        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkLabel}>Change password</Text>
          <ChevronRightIcon size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Sessions</Text>
        {sessions.map((session) => (
          <TouchableOpacity key={session.id} style={styles.sessionRow}>
            <View style={styles.sessionText}>
              <Text style={styles.sessionDevice}>{session.device}</Text>
              <Text style={styles.sessionLocation}>{session.location}</Text>
              <Text style={styles.sessionStatus}>{session.lastActive}</Text>
            </View>
            {session.active && <View style={styles.sessionBadge} />}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkLabel}>Sign out of other devices</Text>
          <ChevronRightIcon size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Danger zone</Text>
        <Text style={styles.dangerText}>
          Deleting your account is permanent. All activity records, chats and matches will be
          removed.
        </Text>
        <Button title="Delete account" variant="danger" onPress={() => console.log('delete')} />
      </View>

      <Button
        title="Save changes"
        onPress={() => console.log('save account form', form)}
        style={styles.saveButton}
      />
    </ScreenContainer>
  );
}

interface FieldInputProps {
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  onChangeText: (value: string) => void;
}

const FieldInput = ({ label, value, placeholder, keyboardType = 'default', onChangeText }: FieldInputProps) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
};

const ToggleRow = ({
  label,
  subtitle,
  value,
  onValueChange,
}: {
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) => (
  <View style={styles.toggleRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.toggleLabel}>{label}</Text>
      {subtitle && <Text style={styles.toggleSubtitle}>{subtitle}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.background.input, true: colors.primary }}
      thumbColor={colors.jetBlack}
    />
  </View>
);

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.presets.bodyLarge,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    borderRadius: 12,
    backgroundColor: colors.background.input,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
    ...typography.presets.bodyMedium,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '500',
  },
  toggleSubtitle: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  linkRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkLabel: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  sessionText: {
    flex: 1,
  },
  sessionDevice: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  sessionLocation: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  sessionStatus: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  sessionBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  dangerText: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  saveButton: {
    marginBottom: spacing.xxl,
  },
});
