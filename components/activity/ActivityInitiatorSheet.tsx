import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityPicker, ActivityType } from './ActivityPicker';
import { ActivityScheduler } from './ActivityScheduler';

interface ActivityInitiatorSheetProps {
  onStartActivity: (type: ActivityType) => void;
  onScheduleActivity: (type: ActivityType, details: any) => void;
}

export const ActivityInitiatorSheet = ({
  onStartActivity,
  onScheduleActivity,
}: ActivityInitiatorSheetProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);

  const handleStartNow = () => {
    if (selectedActivity) {
      onStartActivity(selectedActivity);
    }
  };

  const handleScheduleLater = () => {
    if (selectedActivity) {
      setStep(2);
    }
  };

  // --- STEP 1: Picker ---
  if (step === 1) {
    return (
      <View style={styles.container}>
        {/* Drag Handle Area (Visual only, Logic in BottomSheet) */}
        <View style={styles.handleContainer}>
           {/* Handle is usually in the parent BottomSheet, but we can add secondary handle or title here */}
        </View>

        {/* Action Toggle (Start / Schedule) */}
        <View style={styles.toggleContainer}>
           <TouchableOpacity 
             style={[styles.toggleButton, styles.activeToggle]}
             onPress={() => {}} // Already in start mode visually
           >
             <Ionicons name="play" size={16} color="#FFF" />
             <Text style={styles.toggleTextActive}>Start Now</Text>
           </TouchableOpacity>
           
           <TouchableOpacity 
             style={styles.toggleButton}
             onPress={handleScheduleLater}
             disabled={!selectedActivity}
           >
             <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
             <Text style={styles.toggleTextInactive}>Schedule </Text>
           </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>Choose Activity</Text>

        <ActivityPicker
          selectedActivity={selectedActivity}
          onSelect={setSelectedActivity}
        />

        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
                styles.continueButton, 
                !selectedActivity && styles.continueButtonDisabled
            ]}
            onPress={handleStartNow}
            disabled={!selectedActivity}
          >
            <Text style={[
                styles.continueButtonText,
                !selectedActivity && styles.continueButtonTextDisabled
            ]}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- STEP 2: Scheduler ---
  return (
    <ActivityScheduler
      activityType={selectedActivity!}
      onBack={() => setStep(1)}
      onSchedule={(details) => onScheduleActivity(selectedActivity!, details)}
    />
  );
};


const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    height: '100%',
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 25,
    padding: 4,
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 6,
  },
  activeToggle: {
    backgroundColor: '#333',
  },
  toggleTextActive: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextInactive: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  footer: {
    // Determine positioning based on step or just standard padding
    marginTop: spacing.xl, 
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md, 
  },
  continueButton: {
    backgroundColor: '#ADFF2F',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ADFF2F',
    shadowColor: "#ADFF2F",
    shadowOffset: {
	    width: 0,
	    height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: 'transparent',
    borderColor: '#333',
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#666',
  },
});
