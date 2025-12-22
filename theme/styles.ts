/**
 * Global reusable styles
 */
import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const globalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.jetBlack,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.jetBlack,
  },
  contentContainer: {
    padding: spacing.container,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Text
  text: {
    color: colors.text.primary,
    ...typography.presets.bodyMedium,
  },
  title: {
    color: colors.text.primary,
    ...typography.presets.h1,
  },
  subtitle: {
    color: colors.text.secondary,
    ...typography.presets.bodyLarge,
  },

  // Utilities
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
});



