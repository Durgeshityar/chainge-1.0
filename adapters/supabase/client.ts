import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_STORAGE_KEY = 'chainge-supabase-auth';
let client: SupabaseClient | null = null;

const getEnv = (): { url: string; anonKey: string } => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      '[SupabaseClient] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.',
    );
  }

  return { url, anonKey };
};

const createSupabaseClient = (): SupabaseClient => {
  const { url, anonKey } = getEnv();

  return createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      storageKey: SUPABASE_STORAGE_KEY,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'Accept-Timezone': 'UTC',
      },
    },
  });
};

export const getSupabaseClient = (): SupabaseClient => {
  if (!client) {
    client = createSupabaseClient();
  }

  return client;
};

export const resetSupabaseClient = (): void => {
  client = null;
};
