import { PostCard } from '@/components/feed/PostCard';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useAdapters } from '@/hooks/useAdapter';
import { useAuth } from '@/hooks/useAuth';
import { createPostService } from '@/services/posts';
import { FeedPost } from '@/stores/feedStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { PostWithDetails } from '@/types';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const toFeedPost = (post: PostWithDetails, currentUserId: string): FeedPost => ({
  ...post,
  layout: post.mediaUrls?.length ? 'hero' : 'compact',
  likedByMe: (post.likes ?? []).some((like) => like.userId === currentUserId),
  muted: true,
});

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { database, storage } = useAdapters();
  const { user } = useAuth();
  const service = useMemo(() => createPostService(database, storage), [database, storage]);

  const [post, setPost] = useState<FeedPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!id || !user?.id) return;
      setIsLoading(true);
      const data = await service.getPostWithDetails(id as string);
      if (data) setPost(toFeedPost(data, user.id));
      setIsLoading(false);
    };
    run();
  }, [id, service, user?.id]);

  const handleLike = async () => {
    if (!post || !user?.id) return;
    setPost({
      ...post,
      likedByMe: !post.likedByMe,
      likeCount: post.likedByMe ? Math.max(0, post.likeCount - 1) : post.likeCount + 1,
    });
    const { liked, likeCount } = await service.toggleLike(post.id, user.id);
    setPost((current) => (current ? { ...current, likedByMe: liked, likeCount } : current));
  };

  const handleSendComment = async () => {
    if (!post || !user?.id || !newComment.trim()) return;
    const created = await service.addCommentWithUser(post.id, user.id, newComment.trim());
    setPost({
      ...post,
      commentCount: post.commentCount + 1,
      comments: [...(post.comments ?? []), created],
    });
    setNewComment('');
  };

  if (isLoading || !post) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ title: 'Post', headerTintColor: colors.text.primary }} />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container} safeAreaEdges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{ title: post.user?.name ?? 'Post', headerTintColor: colors.text.primary }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <PostCard
          post={post}
          onLikeToggle={() => handleLike()}
          onCommentPress={() => undefined}
          onSharePress={() => undefined}
          onToggleMute={(p) => setPost({ ...p, muted: !p.muted })}
        />

        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Comments</Text>
          <Text style={styles.commentsCount}>{post.commentCount}</Text>
        </View>

        {(post.comments ?? []).map((comment) => (
          <View key={comment.id} style={styles.commentRow}>
            <Text style={styles.commentAuthor}>{comment.user?.name ?? 'User'}</Text>
            <Text style={styles.commentText}>{comment.content}</Text>
          </View>
        ))}

        <View style={styles.inputRow}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment"
            placeholderTextColor={colors.text.tertiary}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendComment}
            disabled={!newComment.trim()}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.massive,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  commentsTitle: {
    color: colors.text.primary,
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
  },
  commentsCount: {
    color: colors.text.secondary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
  },
  commentRow: {
    marginBottom: spacing.md,
  },
  commentAuthor: {
    color: colors.text.primary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  commentText: {
    color: colors.text.primary,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.modal,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xl,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendText: {
    color: colors.text.inverse,
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.sm,
  },
});
