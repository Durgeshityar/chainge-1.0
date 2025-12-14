
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PostGrid } from '@/components/profile/PostGrid';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { useProfile } from '@/hooks/useProfile';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchProfile, fetchPosts, isLoading, stats, user } = useProfile();
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts');

  useEffect(() => {
    if (id) {
      fetchProfile(id);
      fetchPosts(id);
    }
    return () => {
      // Optional: clear user or re-fetch current user on unmount?
      // For now, let the next screen handle fetching what it needs.
      // But clearing loading state is good practice.
    };
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
    <ScreenContainer style={{ paddingHorizontal: 0 }} safeAreaEdges={['bottom', 'left', 'right']}>
      <Stack.Screen options={{ title: user.username, headerTransparent: true, headerTintColor: '#fff' }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => { if(id) { fetchProfile(id); fetchPosts(id); } }} tintColor={colors.primary} />
        }
        stickyHeaderIndices={[1]} // Stick the tabs to the top when scrolling
      >
        <ProfileHeader />
        
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
                        Events ({user.interests.length > 0 ? 3 : 0}) {/* Mock event count */}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.postsContainer}>
            {activeTab === 'posts' ? (
                <PostGrid />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>{user.name} has no events yet</Text>
                </View>
            )}
        </View>

      </ScrollView>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />
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
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        zIndex: 1,
    }
});
