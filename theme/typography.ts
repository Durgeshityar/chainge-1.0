/**
 * Application typography tokens
 * Font: Satoshi
 * Based on Chainge Design System
 */
import { Platform } from 'react-native';


const fontFamily = Platform.select({
  ios: {
    regular: 'Satoshi-Regular',
    medium: 'Satoshi-Medium',
    bold: 'Satoshi-Bold',
    black: 'Satoshi-Black',
  },
  android: {
    regular: 'Satoshi-Regular',
    medium: 'Satoshi-Medium',
    bold: 'Satoshi-Bold',
    black: 'Satoshi-Black',
  },
  default: {
    regular: 'Satoshi-Regular',
    medium: 'Satoshi-Medium',
    bold: 'Satoshi-Bold',
    black: 'Satoshi-Black',
  },
});

export const typography = {
  fonts: fontFamily,
  
  // Font Weights (Satoshi)
  weights: {
    regular: '400',
    medium: '500',
    bold: '700',
    black: '900',
  } as const,

  // Font Sizes (based on design spec)
  sizes: {
    xxs: 10, // My vibe label
    xs: 12, // System text (address, names)
    sm: 13, // Following, Don't Save
    md: 14, // Input texts, Start your journey
    lg: 16, // Comments, Create account
    xl: 18, // Splash screen body
    xxl: 24, // Home page special (Hey Aish...)
    xxxl: 32, // Splash screen headline (For everybody)
  },

  // Line Heights (Auto in design = undefined, will use default)
  lineHeights: {
    auto: undefined, // Let system handle
    xxs: 14,
    xs: 16,
    sm: 18,
    md: 20,
    lg: 22,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },

  // Presets based on design spec use cases
  presets: {
    // System text - Regular 12
    systemTextSmall: {
      fontSize: 12,
      fontWeight: '400',
      fontFamily: 'Satoshi-Regular',
    },
    // System text - Regular 13
    systemText: {
      fontSize: 13,
      fontWeight: '400',
      fontFamily: 'Satoshi-Regular',
    },
    // System text - Medium 12 (Susan Thomas)
    systemTextMediumSmall: {
      fontSize: 12,
      fontWeight: '500',
      fontFamily: 'Satoshi-Medium',
    },
    // System text - Medium 13 (Swimming)
    systemTextMedium: {
      fontSize: 13,
      fontWeight: '500',
      fontFamily: 'Satoshi-Medium',
    },
    // Input texts - Medium 14 (Playground 1)
    inputText: {
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Satoshi-Medium',
    },
    // System text - Medium 16 (Comments 120)
    bodyMedium: {
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'Satoshi-Medium',
    },
    // Splash screen body - Medium 18
    splashBody: {
      fontSize: 18,
      fontWeight: '500',
      fontFamily: 'Satoshi-Medium',
    },
    // Use case labels - Bold 10 (My vibe)
    labelSmall: {
      fontSize: 10,
      fontWeight: '700',
      fontFamily: 'Satoshi-Bold',
    },
    // Use case - Bold 13 (Don't Save)
    labelMedium: {
      fontSize: 13,
      fontWeight: '700',
      fontFamily: 'Satoshi-Bold',
    },
    // Use case - Bold 14 (Start your journey)
    button: {
      fontSize: 14,
      fontWeight: '700',
      fontFamily: 'Satoshi-Bold',
    },
    // Use case - Bold 16 (Create account)
    buttonLarge: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: 'Satoshi-Bold',
    },
    // Splash headline - Bold 32 (For everybody)
    splashHeadline: {
      fontSize: 32,
      fontWeight: '700',
      fontFamily: 'Satoshi-Bold',
    },
    // Home page special - Black 24 (Hey Aish, What are you in the mood for?)
    homeGreeting: {
      fontSize: 24,
      fontWeight: '900',
      fontFamily: 'Satoshi-Black',
    },
    // Legacy presets for compatibility
    h1: {
      fontSize: 32,
      fontWeight: '700',
      fontFamily: 'Satoshi-Bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      fontFamily: 'Satoshi-Bold',
    },
    h3: {
      fontSize: 18,
      fontWeight: '500',
      fontFamily: 'Satoshi-Medium',
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'Satoshi-Medium',
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: '400',
      fontFamily: 'Satoshi-Regular',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      fontFamily: 'Satoshi-Regular',
    },
  },
} as const;

export type Typography = typeof typography;
