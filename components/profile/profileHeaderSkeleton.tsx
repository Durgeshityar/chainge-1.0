import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SkeletonBox = ({ style }: { style?: object }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.text.secondary,
          borderRadius: 4,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const ProfileHeaderSkeleton = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={[styles.coverImage, { backgroundColor: colors.background.card }]} />

        <View style={[styles.topNav, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.rightIcons}>
            <SkeletonBox style={styles.iconButton} />
            <SkeletonBox style={styles.iconButton} />
            <SkeletonBox style={styles.iconButton} />
          </View>
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.45)', colors.background.black]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />

        <View style={styles.content}>
          <View style={styles.headerTop}>
            <SkeletonBox style={[styles.avatarContainer, { borderWidth: 0 }]} />
            <SkeletonBox style={{ width: 100, height: 36, borderRadius: 24 }} />
          </View>

          <View style={styles.infoContainer}>
            <SkeletonBox style={{ width: 180, height: 28, borderRadius: 4 }} />
            <SkeletonBox
              style={{ width: 120, height: 16, borderRadius: 4, marginTop: spacing.xs }}
            />

            <View style={[styles.metaRow, { marginTop: spacing.sm }]}>
              <SkeletonBox style={{ width: 80, height: 14, borderRadius: 4 }} />
              <SkeletonBox style={{ width: 60, height: 14, borderRadius: 4 }} />
              <SkeletonBox style={{ width: 50, height: 14, borderRadius: 4 }} />
            </View>

            <View style={[styles.statsRow, { marginTop: spacing.md }]}>
              <SkeletonBox style={{ width: 80, height: 16, borderRadius: 4 }} />
              <SkeletonBox style={{ width: 80, height: 16, borderRadius: 4 }} />
            </View>

            <View style={styles.section}>
              <SkeletonBox style={{ width: 60, height: 12, borderRadius: 4 }} />
              <SkeletonBox
                style={{ width: '100%', height: 40, borderRadius: 4, marginTop: spacing.sm }}
              />
            </View>

            <View style={styles.section}>
              <SkeletonBox style={{ width: 70, height: 12, borderRadius: 4 }} />
              <View style={[styles.interestsRow, { marginTop: spacing.sm }]}>
                <SkeletonBox style={{ width: 80, height: 32, borderRadius: 20 }} />
                <SkeletonBox style={{ width: 100, height: 32, borderRadius: 20 }} />
                <SkeletonBox style={{ width: 70, height: 32, borderRadius: 20 }} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 550, // Taller to accommodate content
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginLeft: 'auto',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Align to bottom to match avatar
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 88, // Slightly larger
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  infoContainer: {
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  section: {
    marginTop: spacing.md,
  },
  interestsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
