import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useActivityStore } from '@/stores/activityStore';

import { ActivityInitiatorSheet } from '@/components/activity/ActivityInitiatorSheet';
import { ActivityType } from '@/components/activity/ActivityPicker';
import { ActivityScheduler } from '@/components/activity/ActivityScheduler';
import { ActivityTrigger } from '@/components/activity/activityTrigger';
import { StackedActivityCards } from '@/components/activity/stackedActivityCards';
import { RecentActivityStats } from '@/components/home/RecentActivityStats';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BottomSheet, BottomSheetRef } from '@/components/ui/BottomSheet';
import { Modal } from '@/components/ui/Modal';

export default function HomeScreen() {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const setScheduledActivities = useActivityStore((state) => state.setScheduledActivities);
  const scheduledActivities = useActivityStore((state) => state.scheduledActivities);

  const editActivitySheetRef = useRef<BottomSheetRef>(null);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [showScheduledModal, setShowScheduledModal] = useState(false);
  const [showUpdatedModal, setShowUpdatedModal] = useState(false);
  const [scheduledActivityName, setScheduledActivityName] = useState('');

  const handleOpenActivityTrigger = () => {
    bottomSheetRef.current?.scrollTo(-580); // Open sheet
  };

  const handleViewActivity = (activity: any) => {
    setSelectedActivity(activity);
    editActivitySheetRef.current?.scrollTo(-600);
  };

  const handleStartActivity = (type: ActivityType) => {
    bottomSheetRef.current?.scrollTo(0); // Close sheet
    // Navigate with activity type param
    router.push({
      pathname: '/activity/tracking',
      params: { activityType: type },
    });
  };

  const handleScheduleActivity = (
    type: ActivityType,
    details: { date: Date; playground: string; visibility: string },
  ) => {
    // Add to store (simplified ID gen)
    const newActivity: any = {
      id: Math.random().toString(36).substr(2, 9),
      activityType: type,
      status: 'SCHEDULED', // Using string literal matching the enum in store/types if possible
      scheduledAt: details.date,
      locationName: details.playground,
      visibility: details.visibility.toUpperCase(),
      createdAt: new Date(),
    };

    // In a real app we'd append to existing, but here we just mock add
    setScheduledActivities([...scheduledActivities, newActivity]);

    bottomSheetRef.current?.scrollTo(0); // Close sheet
    setScheduledActivityName(`${type} on ${details.date.toLocaleDateString()}`);
    setShowScheduledModal(true);
  };

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }} safeAreaEdges={['bottom', 'left', 'right']}>
      <ActivityTrigger handleOpenActivityTrigger={handleOpenActivityTrigger} />

      <RecentActivityStats />

      <Text style={styles.header}>Upcoming Activities</Text>
      <StackedActivityCards onViewActivity={handleViewActivity} />
      <BottomSheet ref={bottomSheetRef} snapPoints={['65%']} backgroundColor="#050505">
        <ActivityInitiatorSheet
          onStartActivity={handleStartActivity}
          onScheduleActivity={handleScheduleActivity}
        />
      </BottomSheet>

      <BottomSheet ref={editActivitySheetRef} snapPoints={['75%']} backgroundColor="#050505">
        {selectedActivity && (
          <ActivityScheduler
            activityType={selectedActivity.activityType}
            onBack={() => editActivitySheetRef.current?.scrollTo(0)}
            onSchedule={(details) => {
               // In a real app, update activity here
               console.log('Update activity', details);
               editActivitySheetRef.current?.scrollTo(0);
               setShowUpdatedModal(true);
            }}
            initialDate={new Date(selectedActivity.scheduledAt)}
            initialPlayground={selectedActivity.locationName}
            initialVisibility={selectedActivity.visibility === 'PUBLIC' ? 'Public' : 'Private'}
          />
        )}
      </BottomSheet>

      {/* Scheduled Success Modal */}
      <Modal
        visible={showScheduledModal}
        onClose={() => setShowScheduledModal(false)}
        title="Scheduled! 📅"
        message={`Your ${scheduledActivityName} has been added to your calendar.`}
        actions={[
          {
            label: 'Got it',
            onPress: () => {},
          },
        ]}
      />

      {/* Updated Success Modal */}
      <Modal
        visible={showUpdatedModal}
        onClose={() => setShowUpdatedModal(false)}
        title="Activity Updated ✓"
        message="Your activity has been updated successfully."
        actions={[
          {
            label: 'Great',
            onPress: () => {},
          },
        ]}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 20,
    fontWeight: '300',
    marginLeft: 20,
    letterSpacing: 0.4,
  },
});
