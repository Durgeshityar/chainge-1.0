import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ActivityCard } from '@/components/activity/activityCard';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PostGrid } from '@/components/profile/PostGrid';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { WingmanCard } from '@/components/profile/WingmanCard';
import { WingmanSheet } from '@/components/profile/WingmanSheet';
import { BottomSheet, BottomSheetRef } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

import { ActivityType } from '@/components/activity/ActivityPicker';
import { ActivityScheduler } from '@/components/activity/ActivityScheduler';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/authStore';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const MOCK_EVENTS = [
    { id: '1', title: 'Morning Run', time: '06:00 AM', location: 'Central Park', variant: 'purple' as const },
    { id: '2', title: 'Yoga Session', time: '08:30 AM', location: 'Zen Studio', variant: 'teal' as const },
    { id: '3', title: 'Evening Hike', time: '05:00 PM', location: 'Sunset Trail', variant: 'red' as const },
    { id: '4', title: 'Cycling Meet', time: '07:00 AM', location: 'Riverside Path', variant: 'yellow' as const },
    { id: '5', title: 'HIIT Workout', time: '06:00 PM', location: 'City Gym', variant: 'red' as const },
];

export default function ProfileScreen() {
  const { fetchProfile, fetchPosts, isLoading: isProfileLoading, stats, user } = useProfile();
  const { authUser, isInitialized } = useAuthStore();
  const { signOut, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts');
  
  const editActivitySheetRef = useRef<BottomSheetRef>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const handleViewActivity = (event: typeof MOCK_EVENTS[0]) => {
    setSelectedEvent(event);
    editActivitySheetRef.current?.scrollTo(-600);
  };

  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        fetchProfile();
        fetchPosts();
      }
    }, [fetchProfile, fetchPosts, isInitialized, authUser?.id])
  );
  
  // Also fetch when auth state stabilizes (e.g. after initial seed login)
  useEffect(() => {
      if (isInitialized && authUser?.id) {
          fetchProfile();
          fetchPosts();
      }
  }, [isInitialized, authUser?.id]);

  const handleOpenWingman = () => {
    bottomSheetRef.current?.scrollTo(-500); // Adjust snap point as needed
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  };

  const confirmStrictLogout = (): void => {
    Alert.alert('Sign out', 'This will end your current session immediately.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void handleLogout() },
    ]);
  };

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }} safeAreaEdges={['bottom', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isProfileLoading}
            onRefresh={() => {
              fetchProfile();
              fetchPosts();
            }}
            tintColor={colors.primary}
          />
        }
        stickyHeaderIndices={[2]} // Stick the tabs to the top when scrolling
      >
        <ProfileHeader />
        
        <WingmanCard 
          onPress={handleOpenWingman} 
          name={user?.name.split(' ')[0]} 
          isCurrentUser={true}
        />
        
        {/* Profile Feed */}
        <View style={styles.tabsContainer}> 
            <View style={styles.tabsWrapper}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'posts' && styles.activeTab]} 
                    onPress={() => setActiveTab('posts')}
                >
                    <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
                        Posts ({stats.posts})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'events' && styles.activeTab]} 
                    onPress={() => setActiveTab('events')}
                >
                    <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
                        Events ({12})
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.postsContainer}>
            {activeTab === 'posts' ? (
                <PostGrid />
            ) : (
                <View style={styles.eventsList}>
                    {MOCK_EVENTS.map((event) => (
                        <View key={event.id} style={styles.eventItemWrapper}>
                            <ActivityCard
                                title={event.title}
                                time={event.time}
                                location={event.location}
                                variant={event.variant}
                                onPress={() => handleViewActivity(event)}
                            />
                        </View>
                    ))}
                </View>
            )}
        </View>

        <View style={styles.logoutContainer}>
          <Button
            title="Log Out"
            variant="danger"
            size="lg"
            isLoading={isAuthLoading}
            onPress={confirmStrictLogout}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      <BottomSheet ref={bottomSheetRef} snapPoints={['60%']} backgroundColor="#000">
        <WingmanSheet />
      </BottomSheet>

      <BottomSheet ref={editActivitySheetRef} snapPoints={['75%']} backgroundColor="#050505">
        {selectedEvent && (
            <ActivityScheduler
                activityType={selectedEvent.title.split(' ')[1] as ActivityType || 'Running'} // Simple inference for mock
                onBack={() => editActivitySheetRef.current?.scrollTo(0)}
                onSchedule={(details) => {
                    console.log('Updated activity:', details);
                    editActivitySheetRef.current?.scrollTo(0);
                    // TODO: Update actual data source
                }}
                initialDate={new Date()} // Mock date
                initialPlayground={selectedEvent.location}
                initialVisibility="Public"
            />
        )}
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    postsContainer: {
        flex: 1,
        minHeight: 500, // Ensure minimum height for scrolling feel
    },
    tabsContainer: {
        backgroundColor: colors.background.black,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    tabsWrapper: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    tab: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.text.primary,
    },
    tabText: {
        ...typography.presets.bodyMedium,
        color: colors.text.secondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: colors.text.primary,
    },
    emptyState: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        ...typography.presets.bodyMedium,
        color: colors.text.secondary,
    },
    eventsList: {
        paddingTop: spacing.sm,
        paddingHorizontal: spacing.md,
        gap: spacing.md,
        paddingBottom: spacing.xxl,
    },
    eventItemWrapper: {
        height: 180, // Fixed height for visual consistency with ActivityCard design
    },
    scrollContent: {
        paddingBottom: spacing.massive,
    },
    logoutContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.massive,
        paddingTop: spacing.md,
    },
    logoutButton: {
        borderRadius: 28,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        zIndex: 1,
    }
});
