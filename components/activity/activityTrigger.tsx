import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRightIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

const activiTriggerBackground = require('@/assets/images/activity-trigger.jpg');
const TITLE = 'What’s your move today?';

export const ActivityTrigger = ({
  handleOpenActivityTrigger,
}: {
  handleOpenActivityTrigger: () => void;
}) => {
  return (
    <View style={styles.cardWrapper}>
      <Image source={activiTriggerBackground} style={styles.manualImage} resizeMode="cover" />

      <View style={styles.overlay} pointerEvents="none" />

      <SafeAreaView style={styles.contentContainer}>
        <Text style={styles.heroTitle}>{TITLE}</Text>

        {/* ACTIVITY TRIGGER BUTTON */}
        <Pressable onPress={() => {}} style={styles.triggerContainer}>
          {/* Frosted glass blur */}
          <BlurView tint="dark" intensity={55} style={StyleSheet.absoluteFill} />

          {/* Subtle glass highlight (top-left) */}
          <LinearGradient
            colors={['rgba(255,255,255,0.22)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Soft bottom inner darkening */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.25)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Border */}
          <View style={styles.border} />

          {/* Content */}
          <View style={styles.row}>
            <Text style={styles.placeholder}>Choose your activity...</Text>

            {/* Arrow glass circle */}
            <View style={styles.iconGlass} onTouchEnd={handleOpenActivityTrigger}>
              <BlurView tint="dark" intensity={65} style={StyleSheet.absoluteFill} />
              <Text>
                <ArrowRightIcon size={16} color="#D7FDC8" strokeWidth={2} />
              </Text>
            </View>
          </View>
        </Pressable>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    height: 360,
    borderRadius: 28,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },

  manualImage: {
    position: 'absolute',
    width: '100%',
    height: '120%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
  },

  heroTitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: 18,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  triggerContainer: {
    height: 54,
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  placeholder: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
  },

  iconGlass: {
    height: 32,
    width: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
});
