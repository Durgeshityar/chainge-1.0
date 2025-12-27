import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ClockIcon, MapPinIcon } from 'react-native-heroicons/outline';

import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { useNearbyStore } from '@/stores/nearbyStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Activity, ActivityStatus, Visibility } from '@/types';

const FALLBACK_ACTIVITY: Activity = {
  id: 'preview-activity',
  userId: 'mock-user',
  activityType: 'Running',
  status: ActivityStatus.SCHEDULED,
  scheduledAt: new Date(Date.now() + 45 * 60 * 1000),
  startedAt: null,
  endedAt: null,
  latitude: null,
  longitude: null,
  locationName: 'Bandra Sea Face',
  routeData: null,
  stats: {
    distance: 5200,
    duration: 1800,
    pace: 330,
    calories: 420,
    avgHeartRate: 132,
  },
  visibility: Visibility.PUBLIC,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const formatDate = (value?: Date | null) => {
  if (!value) return 'Flexible timing';
  return value.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDistance = (meters?: number) => {
  if (!meters) return '—';
  return `${(meters / 1000).toFixed(2)} km`;
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return '—';
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs) {
    return `${hrs}h ${remMins.toString().padStart(2, '0')}m`;
  }
  return `${mins} mins`;
};

const formatPace = (paceSeconds?: number) => {
  if (!paceSeconds || paceSeconds <= 0) return '—';
  const mins = Math.floor(paceSeconds / 60);
  const secs = paceSeconds % 60;
  return `${mins}'${secs.toString().padStart(2, '0')}" /km`;
};

export default function ActivityDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const activityIdParam = Array.isArray(params.id) ? params.id[0] : params.id;

  const activity = useNearbyStore((state) =>
    state.activities.find((item) => item.id === activityIdParam),
  );

  const displayActivity = activity ?? FALLBACK_ACTIVITY;

  const scheduledAt = useMemo(() => {
    const source = displayActivity.scheduledAt || displayActivity.startedAt;
    return source ? new Date(source) : null;
  }, [displayActivity.scheduledAt, displayActivity.startedAt]);

  const stats = displayActivity.stats ?? FALLBACK_ACTIVITY.stats!;

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.content}>
      <Header title={displayActivity.activityType || 'Activity'} showBack />

      <View style={styles.heroCard}>
        <Image
          source={{
            uri:
              (activity as any)?.user?.coverImage ||
              (activity as any)?.user?.avatarUrl ||
              'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=1200',
          }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{displayActivity.activityType}</Text>
          <Text style={styles.heroSubtitle}>{formatDate(scheduledAt)}</Text>
          {displayActivity.locationName && (
            <View style={styles.locationRow}>
              <MapPinIcon size={16} color={colors.text.inverse} />
              <Text style={styles.locationLabel}>{displayActivity.locationName}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Distance" value={formatDistance(stats?.distance)} />
        <StatCard label="Duration" value={formatDuration(stats?.duration)} />
        <StatCard label="Avg pace" value={formatPace(stats?.pace)} />
        <StatCard
          label="Calories"
          value={stats?.calories ? `${stats.calories} kcal` : '—'}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ClockIcon size={18} color={colors.text.secondary} />
          <Text style={styles.sectionTitle}>Schedule & preparation</Text>
        </View>
        <Text style={styles.sectionBody}>
          We recommend reaching 10 minutes early for a light warm up. Bring a bottle of water and
          a charged tracker if you want to log advanced stats.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MapPinIcon size={18} color={colors.text.secondary} />
          <Text style={styles.sectionTitle}>Meeting point</Text>
        </View>
        <Text style={styles.sectionBody}>
          {displayActivity.locationName || 'Host will share the location once confirmed.'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Host</Text>
        <Text style={styles.sectionBody}>
          {(activity as any)?.user?.displayName || 'Chainge member'} is hosting this run. After you
          request to join, the host will be notified to approve your spot.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Message host"
          variant="secondary"
          onPress={() => {
            console.log('Open chat for', activityIdParam);
          }}
          style={styles.actionButton}
        />
        <Button
          title="Request to join"
          onPress={() => {
            console.log('Request join for', activityIdParam);
          }}
          style={styles.actionButton}
        />
      </View>
    </ScreenContainer>
  );
}

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    height: 240,
    marginBottom: spacing.xl,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroContent: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  heroTitle: {
    ...typography.presets.h2,
    color: colors.text.inverse,
  },
  heroSubtitle: {
    ...typography.presets.bodyLarge,
    color: colors.text.inverse,
    marginTop: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  locationLabel: {
    ...typography.presets.bodyMedium,
    color: colors.text.inverse,
    marginLeft: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flexBasis: '48%',
    backgroundColor: colors.background.input,
    borderRadius: 16,
    padding: spacing.lg,
  },
  statValue: {
    ...typography.presets.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.presets.bodyLarge,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionBody: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  actionButton: {
    width: '100%',
  },
});
