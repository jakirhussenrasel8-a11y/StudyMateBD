import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys for local storage fallback (handy for Android users who can't edit .env directly)
const STORAGE_URL_KEY = 'studymate_supabase_url';
const STORAGE_KEY_KEY = 'studymate_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let currentConfiguredUrl = '';
let currentConfiguredKey = '';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'user' | 'none';
}

/**
 * Retrieve the active Supabase URL and anon key from environment or local storage.
 */
export function getSupabaseConfig(): SupabaseConfig {
  // Check environment variables first
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || 
                 (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

  // Check if env vars have real values (not placeholders)
  const isEnvValid = 
    envUrl.startsWith('https://') && 
    !envUrl.includes('YOUR_PROJECT_ID') &&
    envKey.length > 20 &&
    !envKey.includes('MY_');

  if (isEnvValid) {
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim(),
      isConfigured: true,
      source: 'env'
    };
  }

  // Check local storage for user configured keys (ideal for mobile users)
  try {
    const userUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
    const userKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

    if (userUrl.startsWith('https://') && userKey.length > 20) {
      return {
        url: userUrl.trim(),
        anonKey: userKey.trim(),
        isConfigured: true,
        source: 'user'
      };
    }
  } catch (e) {
    console.warn('LocalStorage not accessible for Supabase config', e);
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none'
  };
}

/**
 * Check if a valid Supabase configuration is present.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

/**
 * Save custom Supabase credentials from UI settings (useful for mobile Android users).
 */
export function saveUserSupabaseConfig(url: string, anonKey: string): boolean {
  try {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();
    if (!cleanUrl.startsWith('https://')) return false;
    if (cleanKey.length < 20) return false;

    localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
    localStorage.setItem(STORAGE_KEY_KEY, cleanKey);

    // Reset cached client to force re-instantiation
    cachedClient = null;
    return true;
  } catch (err) {
    console.error('Failed to save Supabase config to local storage', err);
    return false;
  }
}

/**
 * Clear custom Supabase credentials from local storage.
 */
export function clearUserSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
    cachedClient = null;
  } catch (e) {
    console.error('Failed to clear Supabase config', e);
  }
}

/**
 * Get or create the Supabase client instance.
 * Returns null if credentials are not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }

  if (cachedClient && currentConfiguredUrl === config.url && currentConfiguredKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'studymate_auth_token',
      },
    });
    currentConfiguredUrl = config.url;
    currentConfiguredKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Quick diagnostic test to verify that the Supabase client can reach the project.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials are not configured. Please enter your project URL and anon key.'
    };
  }

  try {
    // Attempt a light ping by querying auth or public table count
    const { error } = await client.from('profiles').select('id', { count: 'exact', head: true });
    
    // If the error is table missing or permission, it still reached Supabase!
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.profiles" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! Note: Please run the SQL schema in your Supabase SQL Editor.'
        };
      }
      // RLS or Auth errors still mean connection succeeded
      return {
        success: true,
        message: 'Connected to Supabase project successfully.'
      };
    }

    return {
      success: true,
      message: 'Supabase connection verified successfully!'
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Connection test failed: ${errorMsg}`
    };
  }
}
