import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showSkip?: boolean;
  showBack?: boolean;
  /** Set to false for screens with WheelPicker/FlatList to avoid nested virtualized list errors */
  scrollable?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  subtitle,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  nextLabel = 'Next',
  nextDisabled = false,
  showSkip = true,
  showBack = true,
  scrollable = true,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeftIcon size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              {children}
            </View>
          </ScrollView>
        ) : (
          <View style={[styles.scrollView, styles.scrollContent]}>
            <View style={styles.content}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              {children}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          {showSkip ? (
            <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}

          {onNext && (
            <Button
              variant="primary"
              size="lg"
              onPress={onNext}
              disabled={nextDisabled}
              style={styles.nextButton}
              title={nextLabel}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonPlaceholder: {
    width: 32,
  },
  headerRightPlaceholder: {
    width: 32,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: colors.background.input,
    borderRadius: 2,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.presets.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipPlaceholder: {
    width: 50,
  },
  skipText: {
    ...typography.presets.button,
    color: colors.text.primary,
  },
  nextButton: {
    minWidth: 120,
  },
});
