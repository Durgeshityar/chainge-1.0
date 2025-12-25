import { Avatar } from '@/components/ui/Avatar';
import { FeedPost } from '@/stores/feedStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { format } from 'date-fns';
import React, { useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    ArrowUpOnSquareIcon,
    ChatBubbleOvalLeftIcon,
    EllipsisVerticalIcon,
    EyeSlashIcon,
    HeartIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    TrashIcon,
} from 'react-native-heroicons/outline';
import { ActionMenu, ActionMenuItem } from '../ui/ActionMenu';

const HERO_HEIGHT = 520;
const COMPACT_HEIGHT = 300;

const formatCount = (value: number): string => {
  if (value >= 1000) {
    const rounded = value / 1000;
    return `${rounded.toFixed(rounded >= 10 ? 0 : 1)}k`;
  }
  return `${value}`;
};

interface PostCardProps {
  post: FeedPost;
  showMoreMenu?: boolean;
  onPress?: (post: FeedPost) => void;
  onLikeToggle?: (post: FeedPost) => void;
  onCommentPress?: (post: FeedPost) => void;
  onSharePress?: (post: FeedPost) => void;
  onToggleMute?: (post: FeedPost) => void;
  onUserPress?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  showMoreMenu = false,
  onPress,
  onLikeToggle,
  onCommentPress,
  onSharePress,
  onToggleMute,
  onUserPress,
}) => {
  const lastTap = useRef<number>(0);
  const singleTapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartScale = useRef(new Animated.Value(0)).current;
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; right: number }>({ top: 0, right: 20 });
  const moreButtonRef = useRef<View>(null);


  const activityLabel = post.activity?.activityType ?? 'Football';
  const durationMinutes = useMemo(() => {
    const seconds = post.stats?.duration ?? post.activity?.stats?.duration;
    if (!seconds) return '10.00 mins';
    return `${(seconds / 60).toFixed(2)} mins`;
  }, [post]);

  const timeDisplay = useMemo(() => {
    if (!post.createdAt) return '';
    return format(new Date(post.createdAt), 'h:mm a');
  }, [post.createdAt]);

  const handleLike = () => {
    if (onLikeToggle) {
      onLikeToggle(post);
    }
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 250) {
      if (singleTapTimeout.current) clearTimeout(singleTapTimeout.current);
      lastTap.current = 0;
      handleLike();
    } else {
      lastTap.current = now;
      singleTapTimeout.current = setTimeout(() => {
        onPress?.(post);
      }, 260);
    }
  };

  const cardHeight = post.layout === 'hero' ? HERO_HEIGHT : COMPACT_HEIGHT;
  const backgroundColor =
    post.layout === 'compact' ? post.accentColor ?? '#1F6D4A' : colors.background.card;

  const overlayTitle = post.caption ?? 'Easy miles to close that 10k';
  const locationLabel = post.user?.location ?? 'Juhu, Andheri';

  const handleMorePress = () => {
    moreButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setMenuAnchor({ top: pageY + height, right: Dimensions.get('window').width - (pageX + width) });
      setMenuVisible(true);
    });
  };

  const menuItems: ActionMenuItem[] = [
    {
      label: 'Unpublish',
      icon: EyeSlashIcon,
      onPress: () => console.log('Unpublish pressed for post:', post.id),
    },
    {
      label: 'Delete',
      icon: TrashIcon,
      onPress: () => console.log('Delete pressed for post:', post.id),
      isDestructive: true,
    },
  ];

  const engagementRow = (
    <View style={styles.engagementRow}>
      <TouchableOpacity style={styles.engagementButton} onPress={handleLike}>
        <HeartIcon
          size={22}
          color={post.likedByMe ? colors.primary : colors.text.secondary}
          fill={post.likedByMe ? colors.primary : 'transparent'}
        />
        <Text style={styles.engagementText}>{formatCount(post.likeCount)}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.engagementButton} onPress={() => onCommentPress?.(post)}>
        <ChatBubbleOvalLeftIcon size={22} color={colors.text.secondary} />
        <Text style={styles.engagementText}>{formatCount(post.commentCount)}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.engagementButton} onPress={() => onSharePress?.(post)}>
        <ArrowUpOnSquareIcon size={22} color={colors.text.secondary} />
      </TouchableOpacity>
      {showMoreMenu && (
        <View ref={moreButtonRef} collapsable={false}>
          <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
            <EllipsisVerticalIcon size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );



  if (post.layout === 'compact') {
    return (
      <View style={[styles.card, { height: 'auto' }]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.headerUserPressable} 
            onPress={() => onUserPress?.(post.userId)}
            activeOpacity={0.7}
          >
            <Avatar
              size={36}
              source={post.user?.avatarUrl ?? undefined}
              name={post.user?.name ?? ''}
            />
            <View style={styles.headerTextWrap}>
              <Text style={styles.userName}>{post.user?.name ?? 'Susan Thomas'}</Text>
              <Text style={styles.metaText}>{locationLabel}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.timestamp}>{timeDisplay || '5:05 PM'}</Text>
        </View>

        {/* Compact Content */}
        <Pressable
          style={[styles.compactCard, { backgroundColor, height: cardHeight }]}
          onPress={handlePress}
        >
          <View style={styles.compactContent}>
             <View style={styles.compactBody}>
              <Text style={styles.titleText}>{overlayTitle}</Text>
              <View style={styles.metaRow}>
                <View style={styles.badgeDot} />
                <Text style={styles.metaLabel}>{activityLabel}</Text>
              </View>
              <Text style={styles.durationText}>{durationMinutes}</Text>
            </View>
          </View>
        </Pressable>

        {/* Actions */}
        {engagementRow}

        <ActionMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          items={menuItems}
          anchorPosition={menuAnchor}
        />
      </View>
    );
  }

  return (
    <View style={[styles.card, { height: 'auto' }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.headerUserPressable} 
          onPress={() => onUserPress?.(post.userId)}
          activeOpacity={0.7}
        >
          <Avatar
            size={36}
            source={post.user?.avatarUrl ?? undefined}
            name={post.user?.name ?? ''}
          />
          <View style={styles.headerTextWrap}>
            <Text style={styles.userName}>{post.user?.name ?? 'Susan Thomas'}</Text>
            <Text style={styles.metaText}>{locationLabel}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.timestamp}>{timeDisplay || '5:05 PM'}</Text>
      </View>

      {/* Hero Media */}
      <Pressable style={styles.heroCard} onPress={handlePress}>
        <ImageBackground
          source={{
            uri:
              post.mediaUrls?.[0] ??
              'https://images.unsplash.com/photo-1521417532321-0f5dfabd7c81?w=1200',
          }}
          style={[styles.heroImage, { height: cardHeight }]}
          imageStyle={styles.heroImageRadius}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            {/* Inner Content: Title & Footer info */}
            <Text style={styles.overlayTitle}>{overlayTitle}</Text>

            <View style={styles.heroFooterInternal}>
              <View>
                <View style={styles.metaRow}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.metaLabel}>{activityLabel}</Text>
                </View>
                <Text style={styles.durationText}>{durationMinutes}</Text>
              </View>
              <TouchableOpacity
                style={styles.muteButton}
                onPress={() => onToggleMute?.(post)}
                hitSlop={8}
              >
                {post.muted ? (
                  <SpeakerXMarkIcon size={18} color={colors.text.primary} />
                ) : (
                  <SpeakerWaveIcon size={18} color={colors.text.primary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.heartBurst,
            {
              transform: [
                {
                  scale: heartScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1.4],
                  }),
                },
              ],
              opacity: heartScale,
            },
          ]}
        >
          <HeartIcon size={96} color={colors.primary} fill={colors.primary} />
        </Animated.View>
      </Pressable>

      {/* Actions */}
      {engagementRow}

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={menuItems}
        anchorPosition={menuAnchor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  headerUserPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.background.card, // Ensure card has background
  },
  heroImage: {
    width: '100%',
    justifyContent: 'space-between',
  },
  heroImageRadius: {
    borderRadius: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroContent: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'flex-end', // Push content to bottom
  },
  heroFooterInternal: { // Renamed from heroFooter
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  overlayTitle: {
    color: colors.text.primary,
    fontSize: 28,
    fontFamily: typography.fonts.bold,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.md,
  },
  headerTextWrap: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  userName: {
    color: colors.text.primary,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.bold,
  },
  metaText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.regular,
  },
  timestamp: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.medium,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  metaLabel: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
  },
  durationText: {
    color: colors.text.primary,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.medium,
    marginTop: 2,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md, // Increased padding
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-between',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  engagementText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.medium,
  },
  moreButton: {
    padding: spacing.xs,
  },
  heartBurst: {
    position: 'absolute',
    top: '40%',
    left: '40%',
  },
  compactCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  compactContent: { // Wrapper for content inside compact card
    padding: spacing.xl,
    flex: 1,
    justifyContent: 'space-between',
  },
  compactBody: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  titleText: {
    color: colors.text.primary,
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.bold,
    lineHeight: 24,
  },
  muteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
