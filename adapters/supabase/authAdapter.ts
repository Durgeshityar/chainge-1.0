import type {
  AuthChangeEvent,
  AuthError as SupabaseAuthError,
  Session as SupabaseSession,
  User as SupabaseUser,
} from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import type {
  AuthError,
  AuthResult,
  AuthStateChangeCallback,
  AuthUser,
  IAuthAdapter,
  Session,
} from '../types';
import { getSupabaseClient } from './client';

WebBrowser.maybeCompleteAuthSession();

const DEFAULT_SCHEME = process.env.EXPO_PUBLIC_APP_SCHEME ?? 'chainge';
const SUPABASE_REDIRECT =
  process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL ??
  AuthSession.makeRedirectUri({
    scheme: DEFAULT_SCHEME,
    preferLocalhost: true,
  });

export class SupabaseAuthAdapter implements IAuthAdapter {
  private supabase = getSupabaseClient();
  private currentUser: AuthUser | null = null;
  private currentSession: Session | null = null;
  private listeners: Set<AuthStateChangeCallback> = new Set();
  private cleanupSupabaseSubscription: (() => void) | null = null;

  constructor() {
    void this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const { data } = await this.supabase.auth.getSession();
      if (data?.session) {
        this.applySession(data.session);
      } else {
        this.applySession(null);
      }

      if (!this.cleanupSupabaseSubscription) {
        const {
          data: { subscription },
        } = this.supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
          this.applySession(session);
        });

        this.cleanupSupabaseSubscription = () => {
          subscription.unsubscribe();
          this.cleanupSupabaseSubscription = null;
        };
      }
    } catch (error) {
      console.warn('[SupabaseAuthAdapter] Failed to initialize auth session', error);
    }
  }

  private applySession(session: SupabaseSession | null): void {
    if (session) {
      const authUser = this.mapUser(session.user);
      this.currentUser = authUser;
      this.currentSession = this.mapSession(session, authUser);
    } else {
      this.currentUser = null;
      this.currentSession = null;
    }

    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentUser));
  }

  private mapUser(user: SupabaseUser): AuthUser {
    return {
      id: user.id,
      email: user.email ?? '',
      emailVerified: Boolean(user.email_confirmed_at),
      createdAt: new Date(user.created_at ?? Date.now()),
    };
  }

  private mapSession(session: SupabaseSession, user?: AuthUser): Session {
    const mappedUser = user ?? this.mapUser(session.user);
    const expiresAt = session.expires_at
      ? new Date(session.expires_at * 1000)
      : new Date(Date.now() + (session.expires_in ?? 0) * 1000);

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token ?? '',
      expiresAt,
      user: mappedUser,
    };
  }

  private toAuthResult({
    session,
    user,
    error,
  }: {
    session: SupabaseSession | null;
    user?: SupabaseUser | null;
    error?: SupabaseAuthError | null;
  }): AuthResult {
    if (error) {
      return {
        user: null,
        session: null,
        error: this.transformError(error),
      };
    }

    const supabaseUser = user ?? session?.user ?? null;
    const authUser = supabaseUser ? this.mapUser(supabaseUser) : null;
    const mappedSession = session && authUser ? this.mapSession(session, authUser) : null;

    if (mappedSession) {
      this.currentSession = mappedSession;
      this.currentUser = mappedSession.user;
    } else if (authUser) {
      this.currentUser = authUser;
      this.currentSession = null;
    } else {
      this.currentUser = null;
      this.currentSession = null;
    }

    this.notifyListeners();

    return {
      user: this.currentUser,
      session: this.currentSession,
      error: null,
    };
  }

  private transformError(error: SupabaseAuthError | Error | unknown): AuthError {
    if (error && typeof error === 'object' && 'message' in error) {
      const typed = error as SupabaseAuthError & { status?: number; code?: string };
      return {
        code: typed.code ?? typed.name ?? 'auth_error',
        message: typed.message,
      };
    }

    return {
      code: 'auth_error',
      message: 'An unexpected authentication error occurred.',
    };
  }

  private async handleOAuthSignIn(provider: 'google' | 'apple'): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: SUPABASE_REDIRECT,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        return {
          user: null,
          session: null,
          error: this.transformError(error ?? new Error('OAuth flow failed to start.')),
        };
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, SUPABASE_REDIRECT);

      if (result.type !== 'success') {
        return {
          user: null,
          session: null,
          error: {
            code: 'oauth_cancelled',
            message: result.type === 'dismiss' ? 'Authentication was dismissed' : 'Authentication was cancelled',
          },
        };
      }

      const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession();

      if (sessionError) {
        return {
          user: null,
          session: null,
          error: this.transformError(sessionError),
        };
      }

      return this.toAuthResult({ session: sessionData?.session ?? null });
    } catch (error) {
      return {
        user: null,
        session: null,
        error: this.transformError(error),
      };
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: SUPABASE_REDIRECT,
      },
    });

    return this.toAuthResult({ session: data?.session ?? null, user: data?.user ?? null, error });
  }

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    return this.toAuthResult({ session: data?.session ?? null, user: data?.user ?? null, error });
  }

  signInWithGoogle(): Promise<AuthResult> {
    return this.handleOAuthSignIn('google');
  }

  signInWithApple(): Promise<AuthResult> {
    return this.handleOAuthSignIn('apple');
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.applySession(null);
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: SUPABASE_REDIRECT,
    });

    if (error) {
      return { error: this.transformError(error) };
    }

    return { error: null };
  }

  onAuthStateChange(callback: AuthStateChangeCallback): () => void {
    this.listeners.add(callback);
    callback(this.currentUser);
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
}
