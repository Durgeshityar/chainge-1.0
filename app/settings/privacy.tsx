import { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const visibilityOptions = [
  { id: 'public', title: 'Public', description: 'Visible to anyone browsing nearby activities.' },
  {
    id: 'friends',
    title: 'Connections only',
    description: 'Only people you have connected with can view your profile and stats.',
  },
  {
    id: 'private',
    title: 'Private',
    description: 'Hide from discovery and share details manually.',
  },
] as const;

const blockedUsers = [
  { id: 'blocked-1', name: 'Riya Sharma', reason: 'Unwanted DMs', blockedAt: '2 weeks ago' },
  { id: 'blocked-2', name: 'Manav Jain', reason: 'Spam invites', blockedAt: '1 month ago' },
];

export default function PrivacySettingsScreen() {
  const [profileVisibility, setProfileVisibility] = useState<(typeof visibilityOptions)[number]['id']>('public');
  const [allowDiscover, setAllowDiscover] = useState(true);
  const [showActivityHistory, setShowActivityHistory] = useState(true);
  const [allowMentions, setAllowMentions] = useState(true);
  const [shareReadReceipts, setShareReadReceipts] = useState(false);

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.content}>
      <Header title="Privacy & Safety" showBack />

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Profile visibility</Text>
        {visibilityOptions.map((option) => (
          <VisibilityCard
            key={option.id}
            title={option.title}
            description={option.description}
            selected={profileVisibility === option.id}
            onPress={() => setProfileVisibility(option.id)}
          />
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Discovery</Text>
        <ToggleRow
          label="Appear in nearby discovery"
          subtitle="People nearby can invite you when this is on"
          value={allowDiscover}
          onValueChange={setAllowDiscover}
        />
        <ToggleRow
          label="Show workout history"
          subtitle="Share the last two weeks of activity stats"
          value={showActivityHistory}
          onValueChange={setShowActivityHistory}
        />
        <ToggleRow
          label="Allow mentions"
          subtitle="Friends can mention you in posts and recaps"
          value={allowMentions}
          onValueChange={setAllowMentions}
        />
        <ToggleRow
          label="Send read receipts"
          subtitle="Others see when you read a message"
          value={shareReadReceipts}
          onValueChange={setShareReadReceipts}
        />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Blocked users</Text>
          <TouchableOpacity>
            <Text style={styles.linkLabel}>Manage</Text>
          </TouchableOpacity>
        </View>
        {blockedUsers.map((user) => (
          <View key={user.id} style={styles.blockedRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.blockedName}>{user.name}</Text>
              <Text style={styles.blockedReason}>{user.reason}</Text>
            </View>
            <Text style={styles.blockedTime}>{user.blockedAt}</Text>
          </View>
        ))}
        {!blockedUsers.length && <Text style={styles.emptyState}>No one is blocked right now.</Text>}
      </View>

      <Button
        title="Clear location history"
        variant="secondary"
        onPress={() => console.log('clear location history')}
        style={styles.clearButton}
      />
    </ScreenContainer>
  );
}

const VisibilityCard = ({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[
      styles.visibilityCard,
      selected && { borderColor: colors.primary, backgroundColor: 'rgba(83, 255, 153, 0.08)' },
    ]}
  >
    <Text style={styles.visibilityTitle}>{title}</Text>
    <Text style={styles.visibilityDescription}>{description}</Text>
    {selected && <Text style={styles.visibilityBadge}>Selected</Text>}
  </TouchableOpacity>
);

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
  visibilityCard: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  visibilityTitle: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  visibilityDescription: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  visibilityBadge: {
    ...typography.presets.caption,
    color: colors.primary,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  linkLabel: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
  },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  blockedName: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  blockedReason: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  blockedTime: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
  },
  emptyState: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  clearButton: {
    marginBottom: spacing.xxl,
  },
});
