/**
 * Application spacing tokens
 * Base unit: 4px
 */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
  
  // Layout specific
  gutter: 16,
  container: 16,
  headerHeight: 56,
  tabBarHeight: 60,
} as const;

export type Spacing = typeof spacing;
