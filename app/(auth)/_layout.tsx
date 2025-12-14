import { colors } from '@/theme/colors';
import { Stack } from 'expo-router';

/**
 * Auth Layout
 *
 * Stack navigator for authentication screens.
 * These screens are shown when the user is not authenticated.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background.black,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{
          title: 'Welcome',
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Sign Up',
        }}
      />
      <Stack.Screen
        name="forgot-password.tsx"
        options={{
          title: 'Forgot Password',
        }}
      />
    </Stack>
  );
}
