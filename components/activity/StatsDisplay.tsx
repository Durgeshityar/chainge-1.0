import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { StyleSheet, Text, View } from 'react-native';

interface StatsDisplayProps {
  elapsedMs: number;
  distanceMeters?: number;
  mode?: 'map' | 'timer';
}

export const StatsDisplay = ({ elapsedMs, distanceMeters = 0, mode = 'timer' }: StatsDisplayProps) => {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isMapMode = mode === 'map';

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{formatTime(elapsedMs)}</Text>
        <Text style={styles.statLabel}>Duration</Text>
      </View>
      
      {isMapMode && (
        <>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(distanceMeters / 1000).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Km</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 100,
  },
  statValue: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.lg,
  },
});
