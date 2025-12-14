import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

export default function ProfileScreen() {
  const { fetchProfile, fetchPosts, isLoading, stats, user } = useProfile();
  const { authUser, isInitialized } = useAuthStore();
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts');

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

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }} safeAreaEdges={['bottom', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => { fetchProfile(); fetchPosts(); }} tintColor={colors.primary} />
        }
        stickyHeaderIndices={[2]} // Stick the tabs to the top when scrolling
      >
        <ProfileHeader />
        
        <WingmanCard onPress={handleOpenWingman} />
        
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
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No events yet</Text>
                </View>
            )}
        </View>

      </ScrollView>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      <BottomSheet ref={bottomSheetRef} snapPoints={['60%']}>
        <WingmanSheet />
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
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        zIndex: 1,
    }
});

