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
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

const HERO_HEIGHT = 520;
const COMPACT_HEIGHT = 300;

export default function FeedScreen() {
  const { database, storage } = useAdapters();
  const { user, isReady } = useAuth();
  const service = useMemo(() => createPostService(database, storage), [database, storage]);

  const commentSheetRef = useRef<CommentSheetHandle>(null);
  const shareSheetRef = useRef<ShareSheetHandle>(null);

  const [activePost, setActivePost] = useState<FeedPost | null>(null);

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
    setActivePost(post);
    commentSheetRef.current?.open();
  };

  const openShare = (post: FeedPost) => {
    setActivePost(post);
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

  const renderItem = ({ item }: { item: FeedPost }) => (
    <PostCard
      post={item}
      onPress={() => setActivePost(item)}
      onLikeToggle={handleLikeToggle}
      onCommentPress={openComments}
      onSharePress={openShare}
      onToggleMute={(p) => setMuted(p.id, !p.muted)}
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
        postTitle={activePost?.caption ?? 'Comments'}
        comments={activePost?.comments ?? []}
        onSend={handleSendComment}
        onRefresh={handleRefreshComments}
        isRefreshing={isRefreshingComments}
        onClose={() => setActivePost(null)}
      />

      <ShareSheet
        ref={shareSheetRef}
        shareUrl={activePost ? service.buildShareLink(activePost.id) : undefined}
        onCopy={() => undefined}
        onShareToChat={() => undefined}
        onClose={() => setActivePost(null)}
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
