import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  ArrowPathIcon,
  BoltIcon,
  BoltSlashIcon,
  CameraIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
} from 'react-native-heroicons/outline';
import { CheckBadgeIcon } from 'react-native-heroicons/solid';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_SIZE = SCREEN_WIDTH * 0.75;

type VerificationStep = 'instructions' | 'camera' | 'processing' | 'success';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [flash, setFlash] = useState(false);
  const [step, setStep] = useState<VerificationStep>('instructions');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => !current);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        if (photo) {
          setCapturedImage(photo.uri);
          setStep('processing');
          // Simulate verification processing
          setTimeout(() => {
            setStep('success');
          }, 2500);
        }
      } catch (error) {
        console.error('Failed to capture photo:', error);
      }
    }
  };

  const handleStartVerification = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (result.granted) {
        setStep('camera');
      }
    } else {
      setStep('camera');
    }
  };

  const handleComplete = () => {
    router.back();
  };

  const renderInstructions = () => (
    <View style={styles.instructionsContainer}>
      <View style={styles.iconContainer}>
        <CheckBadgeIcon size={80} color={colors.primary} />
      </View>

      <Text style={styles.title}>Verify Your Identity</Text>
      <Text style={styles.subtitle}>
        Help us keep Chainge safe by verifying your identity with a quick selfie.
      </Text>

      <View style={styles.instructionsList}>
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>1</Text>
          </View>
          <Text style={styles.instructionText}>
            Position your face within the frame
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>2</Text>
          </View>
          <Text style={styles.instructionText}>
            Ensure good lighting on your face
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>3</Text>
          </View>
          <Text style={styles.instructionText}>
            Remove glasses, hats, or masks
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Start Verification"
          onPress={handleStartVerification}
          variant="primary"
          size="lg"
        />
      </View>

      <Text style={styles.privacyText}>
        Your photo is encrypted and securely processed. We never share your biometric data.
      </Text>
    </View>
  );

  const renderCamera = () => {
    if (!permission?.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required for verification
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            variant="primary"
          />
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <Text style={styles.cameraTitle}>Face Verification</Text>
        <Text style={styles.cameraSubtitle}>
          Position your face within the frame.{'\n'}
          Ensure your face is well-lit and visible.
        </Text>

        <View style={styles.cameraWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flash ? 'on' : 'off'}
          />

          {/* Face Frame Overlay */}
          <View style={styles.frameOverlay}>
            <Svg width={FRAME_SIZE} height={FRAME_SIZE} viewBox="0 0 200 200">
              {/* Top Left Corner */}
              <Path
                d="M 10 50 L 10 10 L 50 10"
                stroke={colors.primary}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Top Right Corner */}
              <Path
                d="M 150 10 L 190 10 L 190 50"
                stroke={colors.primary}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Bottom Left Corner */}
              <Path
                d="M 10 150 L 10 190 L 50 190"
                stroke={colors.primary}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Bottom Right Corner */}
              <Path
                d="M 150 190 L 190 190 L 190 150"
                stroke={colors.primary}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>

        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleFlash}
            activeOpacity={0.7}
          >
            {flash ? (
              <BoltIcon size={24} color={colors.primary} />
            ) : (
              <BoltSlashIcon size={24} color={colors.text.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            activeOpacity={0.8}
          >
            <View style={styles.captureButtonInner}>
              <CameraIcon size={32} color={colors.jetBlack} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraFacing}
            activeOpacity={0.7}
          >
            <ArrowPathIcon size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProcessing = () => (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.processingTitle}>Verifying your identity...</Text>
      <Text style={styles.processingSubtitle}>
        This will only take a moment
      </Text>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIconContainer}>
        <CheckCircleIcon size={100} color={colors.primary} />
      </View>

      <Text style={styles.successTitle}>Verification Complete!</Text>
      <Text style={styles.successSubtitle}>
        Your identity has been verified successfully.{'\n'}
        Your profile now has a verified badge.
      </Text>

      <View style={styles.verifiedBadgePreview}>
        <CheckBadgeIcon size={24} color={colors.primary} />
        <Text style={styles.verifiedBadgeText}>Verified Account</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Done"
          onPress={handleComplete}
          variant="primary"
          size="lg"
        />
      </View>
    </View>
  );

  const renderContent = () => {
    switch (step) {
      case 'instructions':
        return renderInstructions();
      case 'camera':
        return renderCamera();
      case 'processing':
        return renderProcessing();
      case 'success':
        return renderSuccess();
      default:
        return renderInstructions();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.black, '#0A1A0F', colors.background.black]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeftIcon size={24} color={colors.text.primary} />
        </TouchableOpacity>
        {step !== 'instructions' && step !== 'success' && (
          <Text style={styles.headerTitle}>Face Verification</Text>
        )}
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.presets.h3,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // Instructions
  instructionsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(152, 255, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.presets.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  instructionsList: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(152, 255, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  instructionNumberText: {
    ...typography.presets.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  instructionText: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.lg,
  },
  privacyText: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  // Permission
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  permissionText: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Camera
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
  },
  cameraTitle: {
    ...typography.presets.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cameraSubtitle: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  cameraWrapper: {
    width: FRAME_SIZE + 40,
    height: FRAME_SIZE + 40,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.charcoal,
  },
  camera: {
    width: FRAME_SIZE + 40,
    height: FRAME_SIZE + 40,
  },
  frameOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.xl,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(152, 255, 0, 0.3)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Processing
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  processingTitle: {
    ...typography.presets.h3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  processingSubtitle: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Success
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  successIconContainer: {
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.presets.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  verifiedBadgePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(152, 255, 0, 0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  verifiedBadgeText: {
    ...typography.presets.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});
