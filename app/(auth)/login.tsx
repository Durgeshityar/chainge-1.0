import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthSocialButtons } from '@/components/auth/SocialButtons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { selectIsAuthenticated, useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

// Zod schema for login form validation
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(12, 'Password must be at least 12 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login Screen
 *
 * Handles user authentication with email/password and social login options.
 * Uses React Hook Form + Zod for form validation.
 */
export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithApple, isLoading, error } = useAuth();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await signIn({ email: data.email, password: data.password });
  };

  const handleGoogleLogin = () => {
    signInWithGoogle();
  };

  const handleAppleLogin = () => {
    signInWithApple();
  };

  return (
    <AuthScreen
      footer={
        <View style={styles.footer}>
          <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.footerLink}>Forgot password?</Text>
          </Pressable>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.footerLinkPrimary}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <AuthHeader onBack={() => router.back()} />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        {error?.message && <Text style={styles.errorText}>{error.message}</Text>}

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

        <Button
          title="Continue"
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          style={styles.continueButton}
        />

        <AuthSocialButtons onGooglePress={handleGoogleLogin} onApplePress={handleAppleLogin} />
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
  footerLink: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
  footerLinkPrimary: {
    ...typography.presets.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    ...typography.presets.bodySmall,
    color: colors.status.error,
    marginBottom: 12,
  },
});
