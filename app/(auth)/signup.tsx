import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthSocialButtons } from '@/components/auth/SocialButtons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

// Zod schema for signup form validation
const signupSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Sign Up Screen
 *
 * Handles new user registration with email/password and social signup options.
 * Uses React Hook Form + Zod for form validation.
 */
export default function SignUpScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual signup logic with auth adapter
      console.log('Sign up with:', data);
      router.replace('/(auth)/onboarding');
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    console.log('Google signup');
  };

  const handleAppleSignUp = () => {
    console.log('Apple signup');
  };

  const getPasswordHint = () => {
    if (!password || password.length === 0) return '12 characters needed';
    if (password.length < 12) return `${12 - password.length} characters needed`;
    return '';
  };

  return (
    <AuthScreen
      footer={
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLinkPrimary}>Log in</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <AuthHeader onBack={() => router.back()} />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Create account</Text>

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

        <View>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                autoCapitalize="none"
                error={errors.password?.message}
                containerStyle={styles.input}
              />
            )}
          />
          {(!password || password.length < 12) && !errors.password && (
            <Text style={styles.passwordHint}>{getPasswordHint()}</Text>
          )}
        </View>

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Confirm password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              autoCapitalize="none"
              error={errors.confirmPassword?.message}
              containerStyle={styles.input}
            />
          )}
        />

        <Button
          title="Continue"
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          style={styles.continueButton}
        />

        <AuthSocialButtons onGooglePress={handleGoogleSignUp} onApplePress={handleAppleSignUp} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  passwordHint: {
    ...typography.presets.caption,
    color: colors.status.error,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 4,
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
});
