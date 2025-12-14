import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDownIcon } from 'react-native-heroicons/outline';

const ToggleRow = ({ 
    label, 
    subtitle, 
    value, 
    onValueChange 
}: { 
    label: string; 
    subtitle?: string; 
    value: boolean; 
    onValueChange: (val: boolean) => void;
}) => (
    <View style={styles.row}>
        <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{label}</Text>
            {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
        <Switch 
            value={value} 
            onValueChange={onValueChange}
            trackColor={{ false: colors.background.input, true: colors.primary }}
            thumbColor={colors.text.primary}
            ios_backgroundColor={colors.background.input}
        />
    </View>
);

const SelectorRow = ({
    label,
    subtitle,
    value,
    onPress
}: {
    label: string;
    subtitle?: string;
    value: string;
    onPress: () => void;
}) => (
     <View style={styles.row}>
        <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{label}</Text>
            {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
        <TouchableOpacity style={styles.selectorButton} onPress={onPress}>
            <Text style={styles.selectorValue}>{value}</Text>
            <ChevronDownIcon size={14} color={colors.text.secondary} />
        </TouchableOpacity>
    </View>
);

export default function NotificationsScreen() {
  const [activityPush, setActivityPush] = useState(true);
  const [activityEmail, setActivityEmail] = useState('Daily');
  const [activityBanners, setActivityBanners] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibrations, setVibrations] = useState(true);

  const [messagePush, setMessagePush] = useState(true);
  const [messageEmail, setMessageEmail] = useState('Daily');
  const [messageBanners, setMessageBanners] = useState(false);

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <Header title="Notifications" showBack />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. Activity updates</Text>
        </View>

        <ToggleRow 
            label="Push Notifications"
            subtitle="Receive instant activity updates"
            value={activityPush}
            onValueChange={setActivityPush}
        />
        
        <SelectorRow
            label="Email Digest"
            subtitle="Copy to be written here..."
            value={activityEmail}
            onPress={() => {}} // TODO: Selector
        />

        <ToggleRow 
            label="In-app Banners"
            subtitle="Show notifications within the app"
            value={activityBanners}
            onValueChange={setActivityBanners}
        />

        <ToggleRow 
            label="Sound"
            subtitle="Copy to be written here..."
            value={sound}
            onValueChange={setSound}
        />

        <ToggleRow 
            label="Vibrations"
            subtitle="Copy to be written here..."
            value={vibrations}
            onValueChange={setVibrations}
        />

        <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
            <Text style={styles.sectionTitle}>2. Messages</Text>
        </View>

        <ToggleRow 
            label="Push Notifications"
            subtitle="Receive instant activity updates"
            value={messagePush}
            onValueChange={setMessagePush}
        />

         <SelectorRow
            label="Email Digest"
            subtitle="Copy to be written here..."
            value={messageEmail}
            onPress={() => {}} // TODO: Selector
        />

         <ToggleRow 
            label="In-app Banners"
            subtitle="Show notifications within the app"
            value={messageBanners}
            onValueChange={setMessageBanners}
        />

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  sectionHeader: {
      marginBottom: spacing.md,
  },
  sectionTitle: {
      ...typography.presets.bodyLarge,
      fontWeight: '600',
      color: colors.text.primary,
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      marginBottom: spacing.sm,
  },
  rowText: {
      flex: 1,
      paddingRight: spacing.md,
  },
  rowLabel: {
      ...typography.presets.bodyMedium,
      color: colors.text.primary,
      fontWeight: '500',
  },
  rowSubtitle: {
      ...typography.presets.bodySmall,
      color: colors.text.tertiary,
      marginTop: 2,
  },
  selectorButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.input,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderRadius: 8,
  },
  selectorValue: {
      ...typography.presets.bodySmall,
      color: colors.text.primary,
      marginRight: 4,
  }
});
