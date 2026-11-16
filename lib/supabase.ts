import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
}

let supabaseAdminInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminInstance;
}

export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  message: string;
  url?: string;
  version?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: 'Supabase URL or Anon Key is missing or using placeholder values in .env.local.',
    };
  }

  try {
    const client = getSupabase();
    if (!client) {
      return { ok: false, message: 'Could not create Supabase client.' };
    }

    // Try a lightweight query
    const { error } = await client.from('profiles').select('id', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.profiles" does not exist')) {
      // If table doesn't exist yet, connection is still valid!
      return {
        ok: true,
        message: `Connected to Supabase! (Note: The "profiles" table was not found yet. Please run the migration SQL in your Supabase SQL Editor.)`,
        url: supabaseUrl,
      };
    }

    return {
      ok: true,
      message: `Successfully connected to Supabase project at ${supabaseUrl}!`,
      url: supabaseUrl,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Connection failed: ${err.message || 'Unknown network error'}`,
    };
  }
}
