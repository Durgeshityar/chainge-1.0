/**
 * Application color tokens
 * Primary theme: Dark mode with neon green accents
 * Based on Chainge Design System
 */
export const colors = {
  // Primary Colors
  primary: '#98ff00', // Neon Green
  primaryAlt: '#B4FC57', // Previous Neon Green
  jetBlack: '#000000', // Jet Black

  // Background Colors
  background: {
    default: '#1c1c1c', // Background - Deep Charcoal
    input: '#3C3C3C', // Input bg
    black: '#10130F', // Pure Black
    card: '#2E2E22', // Dark Gray / Card Background
    modal: '#2C2C2E', // Modal/Sheet Background
    darkOlive: '#2accf2', // Dark Olive Background
    subtle: '#2E2E22', // Subtle background
    charcoal: '#131511',
    deepGreen: '#0A2312', // Deep Green for gradients
  },

  // Text Colors
  text: {
    primary: '#FFFFFF', // White
    secondary: '#979C9E', // Secondary text
    tertiary: '#565B5D', // Tertiary text
    offWhite: '#f5f5f5', // Off-White
    inverse: '#000000',
    disabled: '#3A3A3C',
  },

  // Interactive Colors - Gradients
  interactive: {
    steps: '#E9407A', // Steps - Pink/Orange
    weightGoal: '#00C289', // Weight Goal - Teal
    gradientStart: '#DDD1C0', // Gradient start
    gradientEnd: '#61C939', // Gradient end
    routines: '#8A37E3', // Routines - Purple
  },

  // Secondary / Accent Colors (Content Cards)
  accent: {
    purple: '#B4FC57', // Purple accent
    orange: '#FF7A64', // Orange
    peach: '#0A74DA', // Peach/Blue
    green: '#C72C41', // Green accent
    yellow: '#50C87B', // Yellow/Green
    red: '#4169E1', // Red/Blue
    mutedGreen: '#A6AC00', // Muted Green
    softYellow: '#FF7A64', // Soft Yellow/Coral
    gold: '#CFAD50', // Gold
    coral: '#DE9448', // Coral
  },

  // Card Colors
  cards: {
    purple: '#7045B8', // Purple card
    orange: '#E07A50', // Orange card
    heart: '#DE9448', // Heart/coral card
    muted: '#A6AC00', // Muted green card
    gold: '#CFAD50', // Gold card
    redOrange: '#DC6072', // Red-orange card
  },

  // Status
  status: {
    success: '#32D74B',
    warning: '#FFD60A',
    error: '#FF453A',
    info: '#0A84FF',
  },

  // UI Elements
  border: {
    default: '#38383A',
    active: '#B4FC57', // Updated to new primary
  },
  overlay: 'rgba(0, 0, 0, 0.6)', // Background Subtle Shadow
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
