/**
 * Mock Authentication Adapter
 *
 * In-memory implementation of IAuthAdapter for development and testing.
 * Simulates authentication flows without requiring a real backend.
 */

import type {
  AuthError,
  AuthResult,
  AuthStateChangeCallback,
  AuthUser,
  IAuthAdapter,
  Session,
} from '../types';

interface MockStoredUser {
  id: string;
  email: string;
  passwordHash: string; // Simple simulation, not real hashing
  emailVerified: boolean;
  createdAt: Date;
}

interface MockAuthConfig {
  /** Artificial delay in ms for realistic testing */
  delay?: number;
  /** Whether to persist to localStorage */
  persist?: boolean;
}

const STORAGE_KEY = 'chainge_mock_auth';

/**
 * Simple hash simulation (NOT for production use)
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Generate a mock UUID
 */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a mock JWT-like token
 */
function generateToken(): string {
  return `mock_${generateId()}_${Date.now()}`;
}

export class MockAuthAdapter implements IAuthAdapter {
  private users: Map<string, MockStoredUser> = new Map();
  private currentUser: AuthUser | null = null;
  private currentSession: Session | null = null;
  private listeners: Set<AuthStateChangeCallback> = new Set();
  private config: MockAuthConfig;

  constructor(config: MockAuthConfig = {}) {
    this.config = {
      delay: config.delay ?? 500,
      persist: config.persist ?? false,
    };

    if (this.config.persist) {
      this.loadFromStorage();
    }
  }

  private async simulateDelay(): Promise<void> {
    if (this.config.delay && this.config.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.config.delay));
    }
  }

  private loadFromStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);

        // Restore users
        if (data.users) {
          this.users = new Map(
            data.users.map((u: MockStoredUser) => [
              u.email,
              { ...u, createdAt: new Date(u.createdAt) },
            ]),
          );
        }

        // Restore session
        if (data.session && data.currentUser) {
          this.currentUser = {
            ...data.currentUser,
            createdAt: new Date(data.currentUser.createdAt),
          };
          this.currentSession = {
            ...data.session,
            expiresAt: new Date(data.session.expiresAt),
            user: this.currentUser,
          };
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof localStorage === 'undefined' || !this.config.persist) return;

      const data = {
        users: Array.from(this.users.values()),
        currentUser: this.currentUser,
        session: this.currentSession
          ? {
              ...this.currentSession,
              user: undefined, // Don't duplicate user
            }
          : null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentUser));
  }

  private createAuthError(code: string, message: string): AuthError {
    return { code, message };
  }

  private createSession(user: AuthUser): Session {
    return {
      accessToken: generateToken(),
      refreshToken: generateToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      user,
    };
  }

  private toAuthUser(stored: MockStoredUser): AuthUser {
    return {
      id: stored.id,
      email: stored.email,
      emailVerified: stored.emailVerified,
      createdAt: stored.createdAt,
    };
  }

  async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    await this.simulateDelay();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        user: null,
        session: null,
        error: this.createAuthError('invalid_email', 'Invalid email format'),
      };
    }

    // Validate password
    if (password.length < 12) {
      return {
        user: null,
        session: null,
        error: this.createAuthError('weak_password', 'Password must be at least 12 characters'),
      };
    }

    // Check if user exists
    if (this.users.has(email.toLowerCase())) {
      return {
        user: null,
        session: null,
        error: this.createAuthError('email_exists', 'An account with this email already exists'),
      };
    }

    // Create user
    const storedUser: MockStoredUser = {
      id: generateId(),
      email: email.toLowerCase(),
      passwordHash: simpleHash(password),
      emailVerified: false,
      createdAt: new Date(),
    };

    this.users.set(email.toLowerCase(), storedUser);

    // Set current user and session
    const authUser = this.toAuthUser(storedUser);
    const session = this.createSession(authUser);

    this.currentUser = authUser;
    this.currentSession = session;

    this.saveToStorage();
    this.notifyListeners();

    return {
      user: authUser,
      session,
      error: null,
    };
  }

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    await this.simulateDelay();

    const storedUser = this.users.get(email.toLowerCase());

    if (!storedUser) {
      return {
        user: null,
        session: null,
        error: this.createAuthError('user_not_found', 'No account found with this email'),
      };
    }

    if (storedUser.passwordHash !== simpleHash(password)) {
      return {
        user: null,
        session: null,
        error: this.createAuthError('invalid_credentials', 'Invalid email or password'),
      };
    }

    const authUser = this.toAuthUser(storedUser);
    const session = this.createSession(authUser);

    this.currentUser = authUser;
    this.currentSession = session;

    this.saveToStorage();
    this.notifyListeners();

    return {
      user: authUser,
      session,
      error: null,
    };
  }

  async signInWithGoogle(): Promise<AuthResult> {
    await this.simulateDelay();

    // Mock OAuth flow - create a fake Google user
    const mockEmail = `google_user_${Date.now()}@gmail.com`;
    const storedUser: MockStoredUser = {
      id: generateId(),
      email: mockEmail,
      passwordHash: '', // OAuth users don't have passwords
      emailVerified: true, // Google emails are verified
      createdAt: new Date(),
    };

    this.users.set(mockEmail, storedUser);

    const authUser = this.toAuthUser(storedUser);
    const session = this.createSession(authUser);

    this.currentUser = authUser;
    this.currentSession = session;

    this.saveToStorage();
    this.notifyListeners();

    return {
      user: authUser,
      session,
      error: null,
    };
  }

  async signInWithApple(): Promise<AuthResult> {
    await this.simulateDelay();

    // Mock OAuth flow - create a fake Apple user
    const mockEmail = `apple_user_${Date.now()}@privaterelay.appleid.com`;
    const storedUser: MockStoredUser = {
      id: generateId(),
      email: mockEmail,
      passwordHash: '', // OAuth users don't have passwords
      emailVerified: true, // Apple emails are verified
      createdAt: new Date(),
    };

    this.users.set(mockEmail, storedUser);

    const authUser = this.toAuthUser(storedUser);
    const session = this.createSession(authUser);

    this.currentUser = authUser;
    this.currentSession = session;

    this.saveToStorage();
    this.notifyListeners();

    return {
      user: authUser,
      session,
      error: null,
    };
  }

  async signOut(): Promise<void> {
    await this.simulateDelay();

    this.currentUser = null;
    this.currentSession = null;

    this.saveToStorage();
    this.notifyListeners();
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    await this.simulateDelay();

    const storedUser = this.users.get(email.toLowerCase());

    if (!storedUser) {
      // For security, don't reveal if email exists
      return { error: null };
    }

    // In a real implementation, this would send an email
    console.log(`[MockAuth] Password reset email sent to ${email}`);

    return { error: null };
  }

  onAuthStateChange(callback: AuthStateChangeCallback): () => void {
    this.listeners.add(callback);

    // Immediately call with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  getSession(): Session | null {
    return this.currentSession;
  }

  // ==================== TEST HELPERS ====================

  /**
   * Reset all mock data (useful for testing)
   */
  reset(): void {
    this.users.clear();
    this.currentUser = null;
    this.currentSession = null;

    if (this.config.persist && typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }

    this.notifyListeners();
  }

  /**
   * Seed mock users for testing
   */
  seedUsers(users: { email: string; password: string; id?: string }[]): void {
    users.forEach(({ email, password, id }) => {
      const storedUser: MockStoredUser = {
        id: id || generateId(),
        email: email.toLowerCase(),
        passwordHash: simpleHash(password),
        emailVerified: true,
        createdAt: new Date(),
      };
      this.users.set(email.toLowerCase(), storedUser);
    });
    this.saveToStorage();
  }

  /**
   * Get all registered users (for debugging)
   */
  getRegisteredUsers(): AuthUser[] {
    return Array.from(this.users.values()).map(this.toAuthUser);
  }
}

// Default export for convenience
export const createMockAuthAdapter = (config?: MockAuthConfig): IAuthAdapter => {
  return new MockAuthAdapter(config);
};
