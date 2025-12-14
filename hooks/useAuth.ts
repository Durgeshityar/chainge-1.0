import { useAdapters } from '@/hooks/useAdapter';
import { createAuthService, type SignInData, type SignUpData } from '@/services/auth';
import { selectIsAuthenticated, selectIsAuthReady, useAuthStore } from '@/stores/authStore';
import { useEffect, useMemo } from 'react';

export function useAuth() {
  const { auth, database } = useAdapters();
  
  // Memoize auth service to prevent recreation on every render
  const authService = useMemo(() => createAuthService(auth, database), [auth, database]);
  
  const {
    authUser,
    profile,
    isLoading,
    isInitialized,
    error,
    setAuthUser,
    setProfile,
    setLoading,
    setError,
    initialize,
    logout: storeLogout,
  } = useAuthStore();

  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isReady = useAuthStore(selectIsAuthReady);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      setAuthUser(user);
      
      if (user) {
        // If we have an auth user, try to fetch the profile
        try {
          const userProfile = await authService.getCurrentUserProfile();
          setProfile(userProfile);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          // Don't sign out here, just leave profile null? 
          // Or maybe we should retry? For now, just log.
        }
      } else {
        setProfile(null);
      }
      
      if (!isInitialized) {
        initialize();
      }
    });

    return () => unsubscribe();
  }, [authService, setAuthUser, setProfile, initialize, isInitialized]);

  const signIn = async (data: SignInData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.signIn(data);
      if (result.error) {
        setError(result.error);
      } else {
        setAuthUser(result.authUser);
        setProfile(result.user);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError({ code: 'unknown', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.signUp(data);
      if (result.error) {
        setError(result.error);
      } else {
        setAuthUser(result.authUser);
        setProfile(result.user);
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError({ code: 'unknown', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      storeLogout();
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.signInWithGoogle();
      if (result.error) {
        setError(result.error);
      } else {
        setAuthUser(result.authUser);
        setProfile(result.user);
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setError({ code: 'unknown', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.signInWithApple();
      if (result.error) {
        setError(result.error);
      } else {
        setAuthUser(result.authUser);
        setProfile(result.user);
      }
    } catch (err) {
      console.error('Apple sign in error:', err);
      setError({ code: 'unknown', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    user: profile, // Alias profile to user for consumer convenience
    authUser,
    isLoading,
    isReady,
    isAuthenticated,
    error,

    // Methods
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    resetPassword: authService.resetPassword.bind(authService),
  };
}
