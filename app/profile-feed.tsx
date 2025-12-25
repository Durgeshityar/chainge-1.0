import { PostCard } from '@/components/feed/PostCard';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { FeedPost } from '@/stores/feedStore';
import { colors } from '@/theme/colors';
import { Post } from '@/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View
} from 'react-native';

// MOCK DATA - Duplicated from PostGrid to ensure consistency as requested
const MOCK_POSTS: Post[] = Array(4).fill({
    id: 'mock-1',
    userId: 'user-1',
    activityId: 'act-1',
    caption: 'Close beat!',
    mediaUrls: [], 
    mapSnapshotUrl: null,
    stats: { duration: 600, distance: 0 }, // 10 mins
    likeCount: 125,
    commentCount: 8,
    createdAt: new Date('2025-12-21T07:00:00Z'),
    updatedAt: new Date('2025-12-21T07:00:00Z'),
}).map((post, index) => ({ ...post, id: `mock-${index}` }));

export default function ProfileFeedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialIndex = params.initialIndex ? parseInt(params.initialIndex as string, 10) : 0;
  
  const { user: authUser } = useAuth();
  const { posts, isLoading, user, isCurrentUser } = useProfile();
  const flatListRef = useRef<FlatList>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // FORCE MOCK POSTS for visual demonstration consistency
  const displayPosts = MOCK_POSTS;

  const toFeedPost = (post: Post): FeedPost => {
    const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
    return {
      ...post,
      layout: hasMedia ? 'hero' : 'compact',
      accentColor: hasMedia ? undefined : '#1F6D4A',
      likedByMe: false,
      muted: true,
      user: user ? {
        id: user.id,
        name: user.name || user.displayName || user.username,
        avatarUrl: user.avatarUrl,
        location: user.location,
      } : {
        id: 'mock-user',
        name: 'Test User',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        location: 'New York, USA',
      },
    } as FeedPost;
  };

  const feedPosts: FeedPost[] = useMemo(() => {
    return displayPosts.map(toFeedPost);
  }, [displayPosts, user]);

  // Scroll to index on mount
  useEffect(() => {
    if (flatListRef.current && !hasScrolled && feedPosts.length > 0) {
      // Small timeout to ensure layout is ready
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
        setHasScrolled(true);
      }, 100);
    }
  }, [initialIndex, feedPosts.length, hasScrolled]);

  const getItemLayout = (data: any, index: number) => {
    // Assuming variable height, this might be tricky without fixed heights.
    // However, PostCard has dynamic height. 
    // If we can't predict height, scrollToIndex might fail or be inaccurate.
    // For now, let's try relying on onLayout or just default behavior, 
    // but default getItemLayout is needed for scrollToIndex with variable items usually.
    // Since we forced "Close beat!" cards (compact), we know the height approximately.
    // Compact card height ~ 300 + margin.
    const COMPACT_HEIGHT = 300;
    const MARGIN = 24; 
    const itemHeight = COMPACT_HEIGHT + MARGIN; 
    
    return {
        length: itemHeight,
        offset: itemHeight * index,
        index
    };
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading && posts.length === 0) {
     return (
        <ScreenContainer>
            <View style={styles.centerContainer}>
                <ActivityIndicator color={colors.primary} />
            </View>
        </ScreenContainer>
     );
  }

  return (
    <ScreenContainer style={styles.container} safeAreaEdges={['top', 'bottom', 'left', 'right']}>
      <Stack.Screen 
        options={{ 
            title: 'Posts', 
            headerTintColor: colors.text.primary,
            headerStyle: { backgroundColor: colors.background.black },
        }} 
      />
      
      <FlatList
        ref={flatListRef}
        data={feedPosts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            showMoreMenu={isCurrentUser}
            onPress={() => {}} 
            onLikeToggle={() => {}}
            onCommentPress={() => {}}
            onSharePress={() => {}}
            onToggleMute={() => {}}
            onUserPress={(userId) => {
              if (userId === authUser?.id) {
                router.push('/(tabs)/profile');
              } else {
                router.push(`/user/${userId}`);
              }
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
            });
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.black,
  },
  listContent: {
    padding: 16,
    paddingBottom: 64,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
