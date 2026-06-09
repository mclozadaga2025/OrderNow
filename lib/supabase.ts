import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

type SupabaseClientInstance = ReturnType<typeof buildSupabaseClient>;

interface SupabaseClientCache {
  client: SupabaseClientInstance;
  publishableKey: string;
  url: string;
}

declare global {
  // Reuse the auth client during Fast Refresh so web preview does not create
  // multiple GoTrue clients with the same storage key.
  // eslint-disable-next-line no-var
  var __ordernowsSupabaseClientCache: SupabaseClientCache | undefined;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabasePublishableKey = (
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
)?.trim();

export const supabaseConfigurationError = !supabaseUrl
  ? 'Missing EXPO_PUBLIC_SUPABASE_URL.'
  : !supabasePublishableKey
    ? 'Missing EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    : null;

export const isSupabaseConfigured = supabaseConfigurationError === null;

function buildSupabaseClient(url: string, publishableKey: string) {
  return createClient(url, publishableKey, {
    auth: {
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
      // AuthProvider restores persisted sessions before starting the normal lifecycle.
      skipAutoInitialize: true,
    },
  });
}

function createSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  const cachedClient = globalThis.__ordernowsSupabaseClientCache;

  if (
    cachedClient?.url === supabaseUrl &&
    cachedClient.publishableKey === supabasePublishableKey
  ) {
    return cachedClient.client;
  }

  const client = buildSupabaseClient(supabaseUrl, supabasePublishableKey);

  globalThis.__ordernowsSupabaseClientCache = {
    client,
    publishableKey: supabasePublishableKey,
    url: supabaseUrl,
  };

  return client;
}

export const supabase = createSupabaseClient();

if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
      return;
    }

    supabase.auth.stopAutoRefresh();
  });
}
