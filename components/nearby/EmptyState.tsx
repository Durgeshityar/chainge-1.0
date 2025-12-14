import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPinIcon as MapPin } from 'react-native-heroicons/outline';

interface EmptyStateProps {
  onAdjustFilters?: () => void;
}

export const EmptyState = ({ onAdjustFilters }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MapPin size={48} color={colors.text.tertiary} />
      </View>
      <Text style={styles.title}>No activities nearby</Text>
      <Text style={styles.subtitle}>
        There are no scheduled activities in your area right now. Check back
        later or adjust your filters.
      </Text>
      {onAdjustFilters && (
        <Pressable style={styles.button} onPress={onAdjustFilters}>
          <Text style={styles.buttonText}>Adjust Filters</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.jetBlack,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EmptyState;
