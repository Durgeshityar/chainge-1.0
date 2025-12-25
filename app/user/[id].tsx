import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ActivityCard } from '@/components/activity/activityCard';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PostGrid } from '@/components/profile/PostGrid';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { WingmanCard } from '@/components/profile/WingmanCard';
import { WingmanSheet } from '@/components/profile/WingmanSheet';
import { BottomSheet, BottomSheetRef } from '@/components/ui/BottomSheet';
import { useProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const MOCK_EVENTS = [
    { id: '1', title: 'Morning Run', time: '06:00 AM', location: 'Central Park', variant: 'purple' as const },
    { id: '2', title: 'Yoga Session', time: '08:30 AM', location: 'Zen Studio', variant: 'teal' as const },
    { id: '3', title: 'Evening Hike', time: '05:00 PM', location: 'Sunset Trail', variant: 'red' as const },
];

export default function UserProfileScreen() {
  const { id, fromNearby } = useLocalSearchParams<{ id: string; fromNearby?: string }>();
  const { fetchProfile, fetchPosts, isLoading, stats, user } = useProfile();
  const { profile: viewerProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts');
  const wingmanSheetRef = useRef<BottomSheetRef>(null);

  useEffect(() => {
    if (id) {
      fetchProfile(id);
      fetchPosts(id);
    }
  }, [id, fetchProfile, fetchPosts]);

  if (isLoading && !user) {
    return (
      <ScreenContainer>
         <Stack.Screen options={{ title: 'Loading...', headerTransparent: true, headerTintColor: '#fff' }} />
         <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
         </View>
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
       <ScreenContainer>
         <Stack.Screen options={{ title: 'User not found', headerTransparent: true, headerTintColor: '#fff' }} />
         <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>User not found</Text>
         </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }} safeAreaEdges={['left', 'right']}>
      <Stack.Screen options={{ title: user.username, headerTransparent: true, headerTintColor: '#fff' }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => { if(id) { fetchProfile(id); fetchPosts(id); } }} tintColor={colors.primary} />
        }
        stickyHeaderIndices={[fromNearby === 'true' ? 2 : 1]} // Adjust index if WingmanCard is present
      >
        <ProfileHeader />

        <WingmanCard 
          onPress={() => wingmanSheetRef.current?.scrollTo(-400)} 
          name={user.name.split(' ')[0]} 
          viewerName={viewerProfile?.name.split(' ')[0] || 'friend'}
          isCurrentUser={false}
        />

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
                        Events ({MOCK_EVENTS.length})
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
                                showButton={false}
                            />
                        </View>
                    ))}
                </View>
            )}
        </View>

      </ScrollView>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      <BottomSheet ref={wingmanSheetRef} snapPoints={['60%']} backgroundColor="#000">
        <WingmanSheet />
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...typography.presets.bodyLarge,
        color: colors.text.secondary,
    },
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
        paddingTop: spacing.sm, // Add some top padding as we don't have Wingman card here
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
        height: 180,
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
