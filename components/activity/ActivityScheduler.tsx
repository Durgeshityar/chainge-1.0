import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ActivityType } from './ActivityPicker';

interface ActivitySchedulerProps {
  activityType: ActivityType;
  onBack: () => void;
  onSchedule: (details: {
    date: Date;
    playground: string;
    visibility: 'Public' | 'Followers' | 'Private';
  }) => void;
}

export const ActivityScheduler = ({
  activityType,
  onBack,
  onSchedule,
}: ActivitySchedulerProps) => {
  // Mock data/state for form
  const [date, setDate] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [playground, setPlayground] = useState('Playground 1');
  const [visibility, setVisibility] = useState<'Public' | 'Followers' | 'Private'>('Private');

  // Simple date formatter (mocking a picker result)
  const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Schedule {activityType}</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        
        {/* Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>{formatDate(date)}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
          </View>
        </View>

        {/* Time Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>{formatTime(date)}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
          </View>
        </View>

        {/* Playground Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Playground</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>{playground}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
          </View>
        </View>

        {/* Visibility Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Who can join this session?</Text>
            <View style={styles.inputContainer}>
             <Text style={styles.inputText}>{visibility === 'Private' ? 'Only Me' : visibility}</Text>
             <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
            </View>
        </View>

      </View>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => onSchedule({ date, playground, visibility })}
        >
          <Text style={styles.scheduleButtonText}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    flex: 1,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  inputContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  inputText: {
    color: colors.text.primary,
    fontSize: 16,
  },
  footer: {
    marginTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  scheduleButton: {
    backgroundColor: '#ADFF2F', // GreenYellow
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
});
