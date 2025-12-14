import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';

interface FilterSheetProps {
  onClose: () => void;
  onApply: (filters: any) => void;
}

const ACTIVITY_TYPES = ['All', 'Run', 'Gym', 'Yoga', 'Cycling', 'Hike', 'Swim'];
const TIME_RANGES = ['Now', 'Next hour', 'Today', 'This week'];

export const FilterSheet = ({ onClose, onApply }: FilterSheetProps) => {
  const snapPoints = useMemo(() => ['50%'], []);
  
  const [selectedType, setSelectedType] = useState('All');
  const [distance, setDistance] = useState(10); // Mock slider value
  const [timeRange, setTimeRange] = useState('Now');

  const handleApply = () => {
      onApply({ type: selectedType, distance, timeRange });
      onClose();
  };

  const handleReset = () => {
      setSelectedType('All');
      setDistance(10);
      setTimeRange('Now');
  };

  return (
    <BottomSheet snapPoints={snapPoints} onClose={onClose}>
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Filter Activities</Text>
                <Button variant="ghost" title="Reset" onPress={handleReset} textStyle={{ color: colors.primary }} style={{ paddingHorizontal: 0 }} />
            </View>

            {/* Content would use ScrollView but for 50% height View is fine */}
            <View style={styles.section}>
                <Text style={styles.label}>Activity Type</Text>
                <View style={styles.chipRow}>
                    {ACTIVITY_TYPES.map(type => (
                        <FilterChip 
                            key={type} 
                            label={type} 
                            selected={selectedType === type} 
                            onPress={() => setSelectedType(type)} 
                        />
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                 <Text style={styles.label}>Distance (Max {distance}km)</Text>
                 {/* Placeholder for Slider - using buttons for now as standard slider needs library */}
                 <View style={styles.chipRow}>
                     {[5, 10, 20, 30].map(d => (
                         <FilterChip 
                            key={d} 
                            label={`${d}km`} 
                            selected={distance === d} 
                            onPress={() => setDistance(d)} 
                         />
                     ))}
                 </View>
            </View>

             <View style={styles.footer}>
                 <Button 
                    variant="primary" 
                    title="Apply Filters" 
                    onPress={handleApply} 
                    style={{ width: '100%' }}
                    textStyle={{ color: colors.jetBlack, fontWeight: '700' }}
                 />
             </View>
        </View>
    </BottomSheet>
  );
};

const FilterChip = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
    <Text 
        onPress={onPress}
        style={[
            styles.chip, 
            selected && styles.chipSelected
        ]}
    >
        {label}
    </Text>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text.primary,
    },
    section: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: spacing.md,
        fontWeight: '600',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.background.subtle,
        color: colors.text.secondary,
        overflow: 'hidden',
        fontSize: 14,
        fontWeight: '500',
    },
    chipSelected: {
        backgroundColor: colors.primary,
        color: colors.jetBlack,
        fontWeight: '700',
    },
    footer: {
        marginTop: 'auto',
    }
});
