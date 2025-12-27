import { AdapterProvider } from '@/adapters/AdapterContext';
import { useAuthAdapter } from '@/hooks/useAdapter';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme/colors';
import { PortalProvider } from '@gorhom/portal';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

/**
 * Auth State Observer
 *
 * Subscribes to auth state changes and updates the auth store.
 * This component should be rendered inside the AdapterProvider.
 */
function AuthStateObserver({ children }: { children: ReactNode }) {
  const authAdapter = useAuthAdapter();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authAdapter.onAuthStateChange((user) => {
      setAuthUser(user);
      // Mark as initialized after first auth check
      if (!isInitialized) {
        initialize();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [authAdapter, setAuthUser, initialize, isInitialized]);

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.otf'),
    'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
    'Satoshi-Bold': require('../assets/fonts/Satoshi-Bold.otf'),
    'Satoshi-Black': require('../assets/fonts/Satoshi-Black.otf'),
    'Satoshi-Italic': require('../assets/fonts/Satoshi-Italic.otf'),
    'Satoshi-MediumItalic': require('../assets/fonts/Satoshi-MediumItalic.otf'),
    'Satoshi-BoldItalic': require('../assets/fonts/Satoshi-BoldItalic.otf'),
    'Satoshi-BlackItalic': require('../assets/fonts/Satoshi-BlackItalic.otf'),
    'Satoshi-LightItalic': require('../assets/fonts/Satoshi-LightItalic.otf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <PortalProvider>
        <AdapterProvider>
          <AuthStateObserver>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="settings/index" />
              <Stack.Screen name="settings/notifications" />
              <Stack.Screen name="settings/edit-profile" />
              <Stack.Screen name="settings/location-picker" options={{ presentation: 'modal' }} />
              <Stack.Screen name="chat/new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="chat/[id]" />
            </Stack>
          </AuthStateObserver>
        </AdapterProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.black,
  },
});
