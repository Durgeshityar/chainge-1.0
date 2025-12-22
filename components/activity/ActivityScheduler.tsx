import { LocationMap } from '@/components/onboarding/LocationMap';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WheelPicker } from '@/components/ui/WheelPicker';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
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
    visibility: 'Public' | 'Private'; // Simplified as requested: Everyone (Public) / Only Me (Private)
  }) => void;
}

export const ActivityScheduler = ({
  activityType,
  onBack,
  onSchedule,
}: ActivitySchedulerProps) => {
  const [date, setDate] = useState(new Date(Date.now() + 86400000));
  const [playground, setPlayground] = useState('Select Playground');
  const [visibility, setVisibility] = useState<'Public' | 'Private'>('Private');
  const [activeModal, setActiveModal] = useState<'date' | 'time' | 'playground' | 'visibility' | null>(null);

  // Search state for playground
  const [searchQuery, setSearchQuery] = useState('');

  // Date/Time generation
  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    });
  }, []);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
  const minutes = useMemo(() => Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')), []);

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedHour, setSelectedHour] = useState(date.getHours().toString().padStart(2, '0'));
  const [selectedMinute, setSelectedMinute] = useState((Math.floor(date.getMinutes() / 5) * 5).toString().padStart(2, '0'));

  const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const handleConfirmDateTime = () => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + selectedDayIdx);
    newDate.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);
    setDate(newDate);
    setActiveModal(null);
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'date':
      case 'time':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{activeModal === 'date' ? 'Select Date' : 'Select Time'}</Text>
            <View style={styles.pickerRow}>
              {activeModal === 'date' ? (
                <WheelPicker
                  items={days}
                  selectedValue={days[selectedDayIdx]}
                  onValueChange={(val) => setSelectedDayIdx(days.indexOf(val))}
                  height={200}
                />
              ) : (
                <>
                  <View style={{ flex: 1 }}>
                    <WheelPicker
                      items={hours}
                      selectedValue={selectedHour}
                      onValueChange={setSelectedHour}
                      height={200}
                    />
                  </View>
                  <Text style={styles.pickerSeparator}>:</Text>
                  <View style={{ flex: 1 }}>
                    <WheelPicker
                      items={minutes}
                      selectedValue={selectedMinute}
                      onValueChange={setSelectedMinute}
                      height={200}
                    />
                  </View>
                </>
              )}
            </View>
            <Button title="Confirm" onPress={handleConfirmDateTime} style={styles.confirmButton} />
          </View>
        );
      case 'visibility':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Who can join?</Text>
            <TouchableOpacity 
              style={[styles.optionItem, visibility === 'Private' && styles.optionItemSelected]}
              onPress={() => { setVisibility('Private'); setActiveModal(null); }}
            >
              <Text style={styles.optionText}>Only Me</Text>
              {visibility === 'Private' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.optionItem, visibility === 'Public' && styles.optionItemSelected]}
              onPress={() => { setVisibility('Public'); setActiveModal(null); }}
            >
              <Text style={styles.optionText}>Everyone</Text>
              {visibility === 'Public' && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        );
      case 'playground':
        return (
          <View style={[styles.modalContent, { height: '80%', paddingBottom: 0 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Playground</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <Input 
              placeholder="Search playgrounds..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Ionicons name="search" size={20} color={colors.text.secondary} />}
              containerStyle={{ marginBottom: spacing.md }}
            />
            <View style={{ flex: 1, borderRadius: 20, overflow: 'hidden' }}>
               <LocationMap onLocationSelect={(loc) => {
                 // In a real app we'd reverse geocode or pick from list
                 setPlayground(`Location (${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)})`);
               }} />
            </View>
            <Button 
              title="Confirm Location" 
              onPress={() => setActiveModal(null)} 
              style={{ marginVertical: spacing.lg }} 
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
          <TouchableOpacity style={styles.inputGroup} onPress={() => setActiveModal('date')}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{formatDate(date)}</Text>
              <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inputGroup} onPress={() => setActiveModal('time')}>
            <Text style={styles.label}>Time</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{formatTime(date)}</Text>
              <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inputGroup} onPress={() => setActiveModal('playground')}>
            <Text style={styles.label}>Playground</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{playground}</Text>
              <Ionicons name="map-outline" size={20} color={colors.text.secondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.inputGroup} onPress={() => setActiveModal('visibility')}>
            <Text style={styles.label}>Who can join this session?</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>{visibility === 'Private' ? 'Only Me' : 'Everyone'}</Text>
              <Ionicons name="people-outline" size={20} color={colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Button
            title="Schedule"
            onPress={() => onSchedule({ date, playground, visibility })}
          />
        </View>
      </ScrollView>

      <Modal
        visible={activeModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setActiveModal(null)}
          />
          <View style={styles.modalContainer}>
            {renderModalContent()}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    flex: 1,
    backgroundColor: '#050505',
    paddingBottom: spacing.xl,
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.presets.h3,
    color: colors.text.primary,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  inputText: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
  },
  footer: {
    marginTop: spacing.xl * 2,
    marginBottom: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: '#111',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalContent: {
    gap: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    ...typography.presets.h3,
    color: colors.text.primary,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pickerSeparator: {
    ...typography.presets.h1,
    color: colors.text.primary,
  },
  confirmButton: {
    marginTop: spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    padding: spacing.md,
    borderRadius: 16,
  },
  optionItemSelected: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  optionText: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
  },
});
