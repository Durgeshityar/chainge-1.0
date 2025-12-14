import { useRouter } from 'expo-router';
import { Dimensions, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';

import { useEffect } from 'react';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BG_IMAGE = require('@/assets/images/welcome-bg.png');

/* --------------------------
   ICON COMPONENT
---------------------------*/
const LinkIcon = ({ color = colors.primary, size = 60 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/* --------------------------
   CUSTOM ANIMATION HOOK
---------------------------*/
function useSplashAnimation(onComplete: () => void) {
  const iconScale = useSharedValue(1);
  const iconOpacity = useSharedValue(1);

  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(1);

  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // PHASE 1 → PHASE 2
    iconScale.value = withDelay(
      900,
      withTiming(3, { duration: 550, easing: Easing.out(Easing.cubic) })
    );

    iconOpacity.value = withDelay(
      900,
      withTiming(0, { duration: 350, easing: Easing.out(Easing.ease) })
    );

    // GREEN EXPANSION
    circleScale.value = withDelay(
      900,
      withTiming(1, { duration: 650, easing: Easing.inOut(Easing.ease) })
    );

    // PHASE 3 → CONTENT
    circleOpacity.value = withDelay(
      1600,
      withTiming(0, { duration: 500 })
    );

    contentOpacity.value = withDelay(
      1600,
      withTiming(1, { duration: 500 }, () => {
        runOnJS(onComplete)();
      })
    );
  }, []);

  return { iconScale, iconOpacity, circleScale, circleOpacity, contentOpacity };
}

/* --------------------------
   MAIN WELCOME SCREEN
---------------------------*/
export default function WelcomeScreen() {
  const router = useRouter();

  const {
    iconScale,
    iconOpacity,
    circleScale,
    circleOpacity,
    contentOpacity
  } = useSplashAnimation(() => {
    // Callback after splash animation finishes
  });

  const maxDim = Math.sqrt(SCREEN_WIDTH ** 2 + SCREEN_HEIGHT ** 2) * 2;

  /* --------------------------
     ANIMATED STYLES
  ---------------------------*/
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value
  }));

  /* --------------------------
     RENDER
  ---------------------------*/
  return (
    <View style={styles.container}>

      {/* SPLASH LAYER */}
      <View style={styles.splashLayer}>
        <Animated.View
          style={[
            {
              width: maxDim,
              height: maxDim,
              borderRadius: maxDim / 2,
              backgroundColor: colors.primary
            },
            circleStyle,
            styles.circle
          ]}
        />

        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <LinkIcon />
        </Animated.View>
      </View>

      {/* FINAL CONTENT */}
      <Animated.View style={[styles.contentLayer, contentStyle]}>
        <ImageBackground
          source={BG_IMAGE}
          style={styles.bg}
          imageStyle={{ opacity: 0.9 }}
        >
          <View style={styles.overlay} />

          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.inner}>
              <View style={{ flex: 1 }} />

              <View style={styles.bottom}>
                <Text style={styles.title}>For everybody</Text>
                <Text style={styles.subtitle}>
                  Enter the new age of Fitness Social Network
                </Text>

                <View style={styles.buttons}>
                  <Button
                    title="Start your journey"
                    variant="primary"
                    size="lg"
                    onPress={() => router.push('/(auth)/signup')}
                    style={styles.pillButton}
                  />

                  <Button
                    title="Log In"
                    variant="secondary"
                    size="lg"
                    style={styles.loginBtn}
                    onPress={() => router.push('/(auth)/login')}
                    textStyle={{ color: colors.text.inverse }}
                  />
                </View>
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

/* --------------------------
   STYLES
---------------------------*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.black
  },

  splashLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },

  circle: {
    position: 'absolute'
  },

  iconContainer: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },

  contentLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10
  },

  bg: {
    flex: 1,
    width: '100%',
    height: '100%'
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },

  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between'
  },

  bottom: {
    paddingBottom: 40
  },

  title: {
    ...typography.presets.splashHeadline,
    color: colors.text.primary,
    marginBottom: 8
  },

  subtitle: {
    ...typography.presets.bodyLarge,
    color: colors.text.secondary,
    maxWidth: 280,
    marginBottom: 32
  },

  buttons: {
    gap: 12
  },

  pillButton: {
    borderRadius: 28
  },

  loginBtn: {
    borderRadius: 28,
    backgroundColor: colors.text.primary
  }
});
