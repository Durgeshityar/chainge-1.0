/**
 * Auth Service
 *
 * Handles authentication operations including signup, signin, signout,
 * and auth state management.
 */

import type {
    AuthError,
    AuthStateChangeCallback,
    AuthUser,
    IAuthAdapter,
    IDatabaseAdapter,
} from '@/adapters/types';
import type { User, UserCreateInput } from '@/types';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthServiceResult {
  user: User | null;
  authUser: AuthUser | null;
  error: AuthError | null;
}

/**
 * Auth Service
 *
 * Combines the auth adapter with database operations for user profile management.
 */
export class AuthService {
  constructor(private auth: IAuthAdapter, private database: IDatabaseAdapter) {}

  /**
   * Sign up a new user with email and password
   * Creates both an auth user and a user profile
   */
  async signUp(data: SignUpData): Promise<AuthServiceResult> {
    const { email, password, username, displayName } = data;

    // First, check if username is available
    const existingUsers = await this.database.query('user', [
      { field: 'username', operator: 'eq', value: username.toLowerCase() },
    ]);

    if (existingUsers.length > 0) {
      return {
        user: null,
        authUser: null,
        error: {
          code: 'username_taken',
          message: 'This username is already taken',
        },
      };
    }

    // Create auth user
    const authResult = await this.auth.signUpWithEmail(email, password);

    if (authResult.error || !authResult.user) {
      return {
        user: null,
        authUser: null,
        error: authResult.error,
      };
    }

    // Create user profile
    try {
      const userInput: UserCreateInput = {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        name: displayName ?? username, // Initialize required name
        displayName: displayName ?? null,
        bio: null,
        avatarUrl: null,
        interests: [],
        latitude: null,
        longitude: null,
      };

      const user = await this.database.create('user', {
        ...userInput,
        id: authResult.user.id, // Use the same ID as auth user
      });

      return {
        user,
        authUser: authResult.user,
        error: null,
      };
    } catch {
      // If profile creation fails, sign out to cleanup
      await this.auth.signOut();

      return {
        user: null,
        authUser: null,
        error: {
          code: 'profile_creation_failed',
          message: 'Failed to create user profile',
        },
      };
    }
  }

  /**
   * Sign in an existing user
   * Returns both auth user and user profile
   */
  async signIn(data: SignInData): Promise<AuthServiceResult> {
    const { email, password } = data;

    const authResult = await this.auth.signInWithEmail(email, password);

    if (authResult.error || !authResult.user) {
      return {
        user: null,
        authUser: null,
        error: authResult.error,
      };
    }

    // Fetch user profile
    const user = await this.database.get('user', authResult.user.id);

    if (!user) {
      // User profile doesn't exist, sign out
      await this.auth.signOut();

      return {
        user: null,
        authUser: null,
        error: {
          code: 'profile_not_found',
          message: 'User profile not found',
        },
      };
    }

    return {
      user,
      authUser: authResult.user,
      error: null,
    };
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<AuthServiceResult> {
    const authResult = await this.auth.signInWithGoogle();

    if (authResult.error || !authResult.user) {
      return {
        user: null,
        authUser: null,
        error: authResult.error,
      };
    }

    // Check if user profile exists
    let user = await this.database.get('user', authResult.user.id);

    if (!user) {
      // Create profile for new OAuth user
      const username = `user_${authResult.user.id.slice(0, 8)}`;
      const userInput: UserCreateInput = {
        email: authResult.user.email,
        username,
        name: username, // Initialize required name
        displayName: null,
        bio: null,
        avatarUrl: null,
        interests: [],
        latitude: null,
        longitude: null,
      };

      user = await this.database.create('user', {
        ...userInput,
        id: authResult.user.id,
      });
    }

    return {
      user,
      authUser: authResult.user,
      error: null,
    };
  }

  /**
   * Sign in with Apple OAuth
   */
  async signInWithApple(): Promise<AuthServiceResult> {
    const authResult = await this.auth.signInWithApple();

    if (authResult.error || !authResult.user) {
      return {
        user: null,
        authUser: null,
        error: authResult.error,
      };
    }

    // Check if user profile exists
    let user = await this.database.get('user', authResult.user.id);

    if (!user) {
      // Create profile for new OAuth user
      const username = `user_${authResult.user.id.slice(0, 8)}`;
      const userInput: UserCreateInput = {
        email: authResult.user.email,
        username,
        name: username, // Initialize required name
        displayName: null,
        bio: null,
        avatarUrl: null,
        interests: [],
        latitude: null,
        longitude: null,
      };

      user = await this.database.create('user', {
        ...userInput,
        id: authResult.user.id,
      });
    }

    return {
      user,
      authUser: authResult.user,
      error: null,
    };
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    await this.auth.signOut();
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    return this.auth.resetPassword(email);
  }

  /**
   * Get the current auth user
   */
  getCurrentUser(): AuthUser | null {
    return this.auth.getCurrentUser();
  }

  /**
   * Get the current user profile
   */
  async getCurrentUserProfile(): Promise<User | null> {
    const authUser = this.auth.getCurrentUser();
    if (!authUser) return null;

    return this.database.get('user', authUser.id);
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: AuthStateChangeCallback): () => void {
    return this.auth.onAuthStateChange(callback);
  }

  /**
   * Check if a user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.auth.getCurrentUser() !== null;
  }
}

/**
 * Create an AuthService instance
 */
export function createAuthService(auth: IAuthAdapter, database: IDatabaseAdapter): AuthService {
  return new AuthService(auth, database);
}
