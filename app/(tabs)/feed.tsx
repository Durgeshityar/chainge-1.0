import { CommentSheet, CommentSheetHandle } from '@/components/feed/CommentSheet';
import { PostCard } from '@/components/feed/PostCard';
import { ShareSheet, ShareSheetHandle } from '@/components/feed/ShareSheet';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useAdapters } from '@/hooks/useAdapter';
import { useAuth } from '@/hooks/useAuth';
import { createPostService } from '@/services/posts';
import { FeedPost, useFeedStore } from '@/stores/feedStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useAudioPlayer } from 'expo-audio';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

const HERO_HEIGHT = 520;
const COMPACT_HEIGHT = 300;

export default function FeedScreen() {
  const router = useRouter();
  const { database, storage } = useAdapters();
  const { user, isReady } = useAuth();
  const service = useMemo(() => createPostService(database, storage), [database, storage]);

  const commentSheetRef = useRef<CommentSheetHandle>(null);
  const shareSheetRef = useRef<ShareSheetHandle>(null);

  const [activePostId, setActivePostId] = useState<string | null>(null);

  const {
    posts,
    isLoading,
    isRefreshing,
    hasMore,
    fetch,
    refresh,
    loadMore,
    toggleLike,
    addComment,
    refreshComments,
    setMuted,
  } = useFeedStore();

  const [isRefreshingComments, setIsRefreshingComments] = useState(false);
  const [playingPostId, setPlayingPostId] = useState<string | null>(null);

  // Mock audio URL for feed posts (using Pixabay free music)
  const MOCK_FEED_AUDIO = 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3';
  const player = useAudioPlayer({ uri: MOCK_FEED_AUDIO });

  // Derive activePost from store to stay reactive
  const activePost = useMemo(
    () => posts.find((p) => p.id === activePostId) ?? null,
    [posts, activePostId]
  );

  useEffect(() => {
    if (isReady && user?.id) {
      fetch({ service, userId: user.id, followingIds: [] });
    }
  }, [fetch, isReady, service, user?.id]);



  const handleRefresh = () => {
    if (user?.id) {
      refresh({ service, userId: user.id, followingIds: [] });
    }
  };

  const handleLoadMore = () => {
    if (user?.id && hasMore) {
      loadMore({ service, userId: user.id, followingIds: [] });
    }
  };

  const handleLikeToggle = (post: FeedPost) => {
    if (!user?.id) return;
    toggleLike(post.id, user.id, service);
  };

  const openComments = (post: FeedPost) => {
    setActivePostId(post.id);
    commentSheetRef.current?.open();
  };

  const openShare = (post: FeedPost) => {
    setActivePostId(post.id);
    shareSheetRef.current?.open();
  };

  const handleSendComment = async (message: string) => {
    if (!user?.id || !activePost) return;
    await addComment(activePost.id, user.id, message, service);
  };

  const handleRefreshComments = async () => {
    if (!activePost) return;
    setIsRefreshingComments(true);
    await refreshComments(activePost.id, service);
    setIsRefreshingComments(false);
  };

  const handleToggleMute = (post: FeedPost) => {
    const newMuted = !post.muted;
    setMuted(post.id, newMuted);
    
    if (!newMuted) {
      // Unmuted - play music
      setPlayingPostId(post.id);
      player.seekTo(0);
      player.play();
    } else {
      // Muted - pause music
      if (playingPostId === post.id) {
        player.pause();
        setPlayingPostId(null);
      }
    }
  };

  const renderItem = ({ item }: { item: FeedPost }) => (
    <PostCard
      post={item}
      onPress={() => setActivePostId(item.id)}
      onLikeToggle={handleLikeToggle}
      onCommentPress={openComments}
      onSharePress={openShare}
      onToggleMute={handleToggleMute}
      onUserPress={(userId) => {
        if (userId === user?.id) {
          router.push('/(tabs)/profile');
        } else {
          router.push(`/user/${userId}`);
        }
      }}
    />
  );

  if (!user?.id) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.title}>Sign in to view your feed.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      {isLoading && posts.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              tintColor={colors.primary}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.title}>No posts yet</Text>
              <Text style={styles.subtitle}>Follow people to populate your feed.</Text>
            </View>
          )}
        />
      )}

      <CommentSheet
        ref={commentSheetRef}
        comments={activePost?.comments ?? []}
        onSend={handleSendComment}
        onRefresh={handleRefreshComments}
        isRefreshing={isRefreshingComments}
        onClose={() => setActivePostId(null)}
      />

      <ShareSheet
        ref={shareSheetRef}
        shareUrl={activePost ? service.buildShareLink(activePost.id) : undefined}
        onCopy={() => undefined}
        onShareToChat={() => undefined}
        onClose={() => setActivePostId(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.massive,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.regular,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  empty: {
    paddingVertical: spacing.massive,
    alignItems: 'center',
  },
});
