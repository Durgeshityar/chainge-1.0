import { useProfile } from '@/hooks/useProfile';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Post } from '@/types';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const HERO_HEIGHT = 520;
const COMPACT_HEIGHT = 300;
const CARD_MARGIN = spacing.xxl;

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_GAP = spacing.sm;
const ITEM_WIDTH = (width - spacing.md * 2 - ITEM_GAP) / COLUMN_COUNT;

// MOCK DATA for visual demonstration - ALL IDENTICAL as requested
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

export const PostGrid = () => {
  const { posts, isLoading, user } = useProfile();
  const router = useRouter();

  // FORCE MOCK POSTS as per user request to populate with 4 posts
  // This ensures the 2x2 grid is visible and uniform
  const displayPosts = MOCK_POSTS; 

  const handlePostPress = (index: number) => {
    router.push({
      pathname: '/profile-feed',
      params: { initialIndex: index }
    });
  };

  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  const renderGridItem = ({ item, index }: { item: Post; index: number }) => {
    // "Close beat!" card style for ALL items
    // Using fixed green color #1F6D4A as visually identified/used elsewhere
    const durationMins = (item.stats?.duration || 0) / 60;
    const formattedDuration = `${durationMins.toFixed(2)} mins`;
    
    // Defaulting to Football as per screenshot if not in mock, 
    // but usually would come from string matching or activity relation
    const activityLabel = 'Football';

    return (
      <TouchableOpacity
        style={styles.gridItem}
        activeOpacity={0.8}
        onPress={() => handlePostPress(index)}
      >
        <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.caption || 'Activity'}
            </Text>

            <View style={styles.cardMetaContainer}>
                <View style={styles.activityRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.activityText}>{activityLabel}</Text>
                </View>
                <Text style={styles.statsText}>{formattedDuration}</Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <FlatList
        data={displayPosts}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.columnWrapper}
      />
    </>
  );
};

const styles = StyleSheet.create({
  grid: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  columnWrapper: {
    gap: ITEM_GAP,
    marginBottom: ITEM_GAP,
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.1, // Slightly taller than square to match the single card aspect ratio better
    borderRadius: 20, 
    overflow: 'hidden',
  },
  cardBody: {
    flex: 1,
    backgroundColor: '#1F6D4A', 
    padding: spacing.md, // Reduced padding for smaller form factor
    justifyContent: 'center', 
    paddingLeft: spacing.lg, // Give it that left-aligned look
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.presets.h3,
    color: colors.text.inverse, 
    fontSize: 20, // Slightly smaller than full card
    lineHeight: 24,
    marginBottom: spacing.xxs,
  },
  cardMetaContainer: {
    gap: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6, // Proportionally smaller
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ADFF2F', 
  },
  activityText: {
    ...typography.presets.bodySmall, // Smaller font
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: '500',
  },
  statsText: {
    ...typography.presets.bodyMedium, // Smaller font
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '400',
    marginTop: 2,
  },
  
  // Previous/Shared styles
  centerContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
  },
});
