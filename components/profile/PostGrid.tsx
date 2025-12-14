import { useProfile } from '@/hooks/useProfile';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlayIcon } from 'react-native-heroicons/solid';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_SIZE = width / COLUMN_COUNT;

export const PostGrid = () => {
  const { posts, isLoading } = useProfile();

  if (isLoading) {
    // Simple loading skeleton or spinner could go here
    return (
        <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
        </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No posts yet</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
      <Image source={{ uri: item.thumbnail }} style={styles.image} />
      {/* Overlay icon based on type - simplified for now */}
      <View style={styles.iconOverlay}>
         <PlayIcon size={12} color={colors.text.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={COLUMN_COUNT}
      scrollEnabled={false} // Let the parent ScrollView handle scrolling
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.columnWrapper}
    />
  );
};

const styles = StyleSheet.create({
  grid: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: (width - spacing.sm * 3) / 2,
    height: (width - spacing.sm * 3) / 2 * 0.7, // Aspect ratio
    marginBottom: spacing.sm,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.input,
  },
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
  iconOverlay: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 10,
      padding: 4,
  }
});
