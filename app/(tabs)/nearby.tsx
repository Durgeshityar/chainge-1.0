import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { useNearbyStore } from '@/stores/nearbyStore';
import { ActivityStatus, ActivityWithParticipants, Visibility } from '@/types';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

import { EmptyState, FilterSheet, SwipeStack } from '@/components/nearby';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DETAIL_SHEET_OPEN_POSITION = -SCREEN_HEIGHT * 0.8;

// Mock activities for demo
const MOCK_ACTIVITIES: ActivityWithParticipants[] = [
  {
    id: '1',
    userId: 'u1',
    activityType: 'Run',
    status: ActivityStatus.SCHEDULED,
    scheduledAt: new Date(Date.now() + 3600000),
    startedAt: null,
    endedAt: null,
    latitude: 19.076,
    longitude: 72.8777,
    locationName: 'Mumbai',
    routeData: null,
    stats: null,
    visibility: Visibility.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'u1',
      email: 'julie@example.com',
      username: 'juliemehra',
      name: 'Julie Mehra',
      displayName: 'Julie Mehra',
      bio: 'Chasing goals on the field and off it.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      interests: ['Running', 'Table Tennis', 'Basketball'],
      latitude: null,
      longitude: null,
      followerCount: 1200,
      followingCount: 340,
      createdAt: new Date(),
      updatedAt: new Date(),
      age: 23,
      location: 'Mumbai',
    },
  },
  {
    id: '2',
    userId: 'u2',
    activityType: 'Cycling',
    status: ActivityStatus.SCHEDULED,
    scheduledAt: new Date(Date.now() + 7200000),
    startedAt: null,
    endedAt: null,
    latitude: 19.12,
    longitude: 72.91,
    locationName: 'Bandra',
    routeData: null,
    stats: null,
    visibility: Visibility.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'u2',
      email: 'alex@example.com',
      username: 'alexfit',
      name: 'Alex Johnson',
      displayName: 'Alex Johnson',
      bio: 'Cycling enthusiast.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      interests: ['Cycling', 'Football'],
      latitude: null,
      longitude: null,
      followerCount: 890,
      followingCount: 210,
      createdAt: new Date(),
      updatedAt: new Date(),
      age: 28,
      location: 'Bandra',
    },
  },
  {
    id: '3',
    userId: 'u3',
    activityType: 'Yoga',
    status: ActivityStatus.SCHEDULED,
    scheduledAt: new Date(Date.now() + 10800000),
    startedAt: null,
    endedAt: null,
    latitude: 19.05,
    longitude: 72.82,
    locationName: 'Juhu Beach',
    routeData: null,
    stats: null,
    visibility: Visibility.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'u3',
      email: 'priya@example.com',
      username: 'priyayoga',
      name: 'Priya Sharma',
      displayName: 'Priya Sharma',
      bio: 'Morning yoga sessions.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
      interests: ['Badminton', 'Tennis'],
      latitude: null,
      longitude: null,
      followerCount: 2100,
      followingCount: 150,
      createdAt: new Date(),
      updatedAt: new Date(),
      age: 26,
      location: 'Juhu',
    },
  },
];

export default function NearbyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const activities = useNearbyStore((state) => state.activities);
  const passedActivityIds = useNearbyStore((state) => state.passedActivityIds);
  const setActivities = useNearbyStore((state) => state.setActivities);
  const passActivity = useNearbyStore((state) => state.passActivity);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const visibleActivities = useMemo(
    () => activities.filter((activity) => !passedActivityIds.has(activity.id)),
    [activities, passedActivityIds],
  );

  // Initialize mock data
  useEffect(() => {
    setActivities(MOCK_ACTIVITIES);
  }, [setActivities]);

  const handleSwipeLeft = useCallback(
    (activityId: string) => {
      console.log('Passed activity:', activityId);
      passActivity(activityId);
    },
    [passActivity],
  );

  const handleSwipeRight = useCallback(
    (activityId: string) => {
      console.log('Joined activity:', activityId);
      // For now, also remove from stack (in real app, would send join request)
      passActivity(activityId);
    },
    [passActivity],
  );

  const handleCardPress = useCallback(
    (activity: ActivityWithParticipants) => {
      const userId = activity.userId;
      if (userId === user?.id) {
        router.push('/(tabs)/profile');
      } else {
        router.push({
          pathname: `/user/${userId}` as any,
          params: { fromNearby: 'true' }
        });
      }
    },
    [user, router],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {visibleActivities.length > 0 ? (
          <SwipeStack
            activities={visibleActivities as ActivityWithParticipants[]}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onCardPress={handleCardPress}
          />
        ) : (
          <EmptyState />
        )}
      </View>

      {isFilterOpen && (
        <FilterSheet
          onClose={() => setIsFilterOpen(false)}
          onApply={(filters) => {
            console.log('Filters applied:', filters);
            // Logic to filter MOCK_ACTIVITIES would go here
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.jetBlack,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
    zIndex: 10,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  content: {
    flex: 1,
    // Ensure content is behind header if we want overlap, but standard layout is fine
    paddingTop: spacing.md,
  },
});
