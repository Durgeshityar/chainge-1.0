import { spacing } from '@/theme/spacing';
import { ActivitySummary, TrackPoint } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

const DEFAULT_ROUTE_POINTS = [
  [25, 85],
  [15, 55],
  [20, 35],
  [40, 15],
  [65, 20],
  [85, 35],
  [80, 65],
  [60, 85],
  [25, 85],
]
  .map((coords) => coords.join(','))
  .join(' ');

interface SummaryCardProps {
  activityType: string;
  summary: ActivitySummary;
  trackPoints: TrackPoint[];
  backgroundImage?: string | null; // URI
  themeColor?: string | null; // Hex or gradient start? For now assume hex/simple
}

export const SummaryCard = ({
  activityType,
  summary,
  trackPoints,
  backgroundImage,
  themeColor,
}: SummaryCardProps) => {
  const isRouteActivity = useMemo(() => {
    const type = activityType.toLowerCase();
    return type === 'running' || type === 'cycling';
  }, [activityType]);

  const polylineFromTrack = useMemo(() => {
    if (!trackPoints.length || !isRouteActivity) return '';

    const lats = trackPoints.map((point) => point.latitude);
    const lngs = trackPoints.map((point) => point.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = Math.max(0.00001, maxLat - minLat);
    const lngSpan = Math.max(0.00001, maxLng - minLng);

    return trackPoints
      .map((point) => {
        const normX = ((point.longitude - minLng) / lngSpan) * 100;
        const normY = 100 - ((point.latitude - minLat) / latSpan) * 100;
        return `${normX},${normY}`;
      })
      .join(' ');
  }, [trackPoints, isRouteActivity]);

  // Use real track if we have enough data (e.g., > 50m and > 5 points)
  // Otherwise, use the fake loop for visual testing/preview if it's a route activity.
  const polylinePoints = useMemo(() => {
    if (!isRouteActivity) return '';
    const hasSignificantData = trackPoints.length > 5 && summary.distanceMeters > 50;
    if (polylineFromTrack && hasSignificantData) return polylineFromTrack;
    return DEFAULT_ROUTE_POINTS;
  }, [polylineFromTrack, trackPoints.length, summary.distanceMeters, isRouteActivity]);

  // Format helpers
  const distanceKm = (summary.distanceMeters / 1000).toFixed(2);
  const durationMin = (summary.durationMs / 60000).toFixed(2);

  // Duration formatting for non-route activities (H:MM:SS or MM:SS)
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Pace formatting (min/km)
  const paceTotalMin = (summary.paceSecondsPerKm ?? 0) / 60;
  const paceMin = Math.floor(paceTotalMin);
  const paceSec = Math.round((paceTotalMin - paceMin) * 60);
  const paceDisplay = `${paceMin}'${paceSec.toString().padStart(2, '0')}"`;

  return (
    <View style={styles.cardContainer}>
      {/* Background Layer */}
      <View style={styles.backgroundLayer}>
        {backgroundImage ? (
          <Image
            source={{ uri: backgroundImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: themeColor || '#1a1a1a' }]} />
        )}

        {/* If we have an image, add a darker gradient for text readability */}
        {backgroundImage && (
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFill}
          />
        )}

        {isRouteActivity && !!polylinePoints && (
          <View style={styles.routeOverlay} pointerEvents="none">
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <Polyline
                points={polylinePoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        )}
      </View>

      {/* Content Layer */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.activityLabel}>{activityType}</Text>
        </View>

        <View style={styles.statsContainer}>
          {isRouteActivity ? (
            <>
              <View style={styles.statRow}>
                <Text style={styles.mainStatValue}>{distanceKm}</Text>
                <Text style={styles.mainStatUnit}> km</Text>
              </View>

              <View style={styles.secondaryStatsRow}>
                <View>
                  <Text style={styles.secondaryStatValue}>{durationMin}</Text>
                  <Text style={styles.secondaryStatLabel}>mins</Text>
                </View>
                <View style={styles.statDivider} />
                <View>
                  <Text style={styles.secondaryStatValue}>{paceDisplay}</Text>
                  <Text style={styles.secondaryStatLabel}>avg pace</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.statRow}>
              <Text style={styles.mainStatValue}>{formatDuration(summary.durationMs)}</Text>
              <Text style={styles.mainStatUnit}> {summary.durationMs >= 3600000 ? 'hrs' : 'mins'}</Text>
            </View>
          )}
        </View>

        {/* Quote/Caption Placeholder (Visual ref shows "Easy miles to close that 70k") */}
        {/* We can make this dynamic or just a placeholder for now */}
      </View>
    </View>
  );

};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  routeOverlay: {
    position: 'absolute',
    top: 90,
    left: 16,
    width: 120,
    height: 120,
  },
  contentContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  headerRow: {
    marginTop: spacing.md,
  },
  activityLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    opacity: 0.9,
  },
  statsContainer: {
    marginBottom: spacing.xxl,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mainStatValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  mainStatUnit: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 20,
    fontWeight: '500',
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
  secondaryStatValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  secondaryStatLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
