import { router } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useActivityStore } from '@/stores/activityStore';

import { ActivityInitiatorSheet } from '@/components/activity/ActivityInitiatorSheet';
import { ActivityType } from '@/components/activity/ActivityPicker';
import { ActivityTrigger } from '@/components/activity/activityTrigger';
import { StackedActivityCards } from '@/components/activity/stackedActivityCards';
import { RecentActivityStats } from '@/components/home/RecentActivityStats';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BottomSheet, BottomSheetRef } from '@/components/ui/BottomSheet';

export default function HomeScreen() {
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const setScheduledActivities = useActivityStore((state) => state.setScheduledActivities);
  const scheduledActivities = useActivityStore((state) => state.scheduledActivities);

  const handleOpenActivityTrigger = () => {
    bottomSheetRef.current?.scrollTo(-580); // Open sheet
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
    alert(`Scheduled ${type} on ${details.date.toLocaleDateString()}`);
  };

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }} safeAreaEdges={['bottom', 'left', 'right']}>
      <ActivityTrigger handleOpenActivityTrigger={handleOpenActivityTrigger} />

      <RecentActivityStats />

      <Text style={styles.header}>Upcoming Activities</Text>
      <StackedActivityCards />
      <BottomSheet ref={bottomSheetRef} snapPoints={['65%']} backgroundColor="#050505">
        <ActivityInitiatorSheet
          onStartActivity={handleStartActivity}
          onScheduleActivity={handleScheduleActivity}
        />
      </BottomSheet>
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
