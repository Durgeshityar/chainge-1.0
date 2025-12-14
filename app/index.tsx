import { selectIsAuthenticated, useAuthStore } from '@/stores/authStore';
import { Redirect } from 'expo-router';

/**
 * Entry Point
 * 
 * Redirects users based on authentication state:
 * - Authenticated users → Tab navigation (main app)
 * - Unauthenticated users → Auth screens (welcome)
 */
export default function Index() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
