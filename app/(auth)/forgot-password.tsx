import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircleIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

// Zod schema for forgot password form validation
const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot Password Screen
 *
 * Allows users to request a password reset email.
 * Uses React Hook Form + Zod for form validation.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual password reset logic with auth adapter
      console.log('Send reset link to:', data.email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircleIcon size={64} color={colors.primary} />
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successMessage}>
            We&apos;ve sent a password reset link to {submittedEmail}
          </Text>
          <Button
            title="Back to Login"
            variant="primary"
            size="lg"
            onPress={() => router.push('/(auth)/login')}
            style={styles.successButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AuthScreen
      footer={
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLinkPrimary}>Log in</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <AuthHeader onBack={() => router.back()} />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email?.message}
              containerStyle={styles.input}
            />
          )}
        />

        <Button
          title="Send reset link"
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          style={styles.continueButton}
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.black,
  },
  formContainer: {
    flex: 1,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    marginBottom: 16,
  },
  continueButton: {
    borderRadius: 28,
    marginTop: 24,
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  footerRow: {
    flexDirection: 'row',
  },
  footerText: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
  },
  footerLinkPrimary: {
    ...typography.presets.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  // Success state styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  successMessage: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  successButton: {
    borderRadius: 28,
    width: '100%',
  },
});
