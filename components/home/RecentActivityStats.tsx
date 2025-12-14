import { useMemo } from 'react';

import { useActivityStore } from '@/stores/activityStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

const PLACEHOLDER_STATS = {
  distanceKm: 24.5,
  timeHours: 3.2,
  streakDays: 4,
  calories: 1240,
  isPlaceholder: true,
};

export const RecentActivityStats = () => {
  const lastSummary = useActivityStore((state) => state.lastSummary);

  const stats = useMemo(() => {
    if (!lastSummary) return PLACEHOLDER_STATS;

    const distanceKmRaw = lastSummary.distanceMeters / 1000;
    const timeHoursRaw = lastSummary.durationMs / (1000 * 60 * 60);
    const distanceKm = Number.isFinite(distanceKmRaw) ? distanceKmRaw : 0;
    const timeHours = Number.isFinite(timeHoursRaw) ? timeHoursRaw : 0;
    const calories = Math.max(80, Math.round(distanceKm * 65));

    return {
      distanceKm,
      timeHours,
      streakDays: 1,
      calories,
      isPlaceholder: false,
    };
  }, [lastSummary]);

  const formatValue = (value: number, digits: number = 1) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
        style={styles.card}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Progress</Text>
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="fire" size={14} color="#FF9800" />
            <Text style={styles.streakText}>{stats.streakDays} Day Streak</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatValue(stats.distanceKm)}</Text>
            <Text style={styles.statLabel}>km</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatValue(stats.timeHours)}</Text>
            <Text style={styles.statLabel}>hours</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.calories.toLocaleString()}</Text>
            <Text style={styles.statLabel}>kcal</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,152,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  streakText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
