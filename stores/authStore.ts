/**
 * Auth Store
 *
 * Zustand store for managing authentication state.
 * Tracks the authenticated user, loading states, and initialization status.
 */

import type { AuthError, AuthUser } from '@/adapters/types';
import type { User } from '@/types';
import { create } from 'zustand';

interface AuthState {
  /** The authenticated user from the auth adapter */
  authUser: AuthUser | null;
  /** The user's profile data */
  profile: User | null;
  /** Whether an auth operation is in progress */
  isLoading: boolean;
  /** Whether the initial auth check has completed */
  isInitialized: boolean;
  /** Any error that occurred during auth operations */
  error: AuthError | null;
}

interface AuthActions {
  /** Set the authenticated user */
  setAuthUser: (user: AuthUser | null) => void;
  /** Set the user profile */
  setProfile: (profile: User | null) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error state */
  setError: (error: AuthError | null) => void;
  /** Mark auth as initialized (first check complete) */
  initialize: () => void;
  /** Reset auth state (for logout) */
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  authUser: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setAuthUser: (authUser) => set({ authUser }),

  setProfile: (profile) => set({ profile }),

  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  initialize: () => set({ isInitialized: true }),

  logout: () =>
    set({
      authUser: null,
      profile: null,
      isLoading: false,
      error: null,
    }),
}));

/**
 * Selector for checking if user is authenticated
 */
export const selectIsAuthenticated = (state: AuthStore): boolean =>
  state.authUser !== null;

/**
 * Selector for checking if auth is ready (initialized and not loading)
 */
export const selectIsAuthReady = (state: AuthStore): boolean =>
  state.isInitialized && !state.isLoading;
