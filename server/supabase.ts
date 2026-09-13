import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  '';

let serverSupabaseInstance: SupabaseClient | null = null;

export function isServerSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl && 
    supabaseUrl.trim().length > 0 && 
    supabaseKey && 
    supabaseKey.trim().length > 0 &&
    !supabaseUrl.includes('placeholder')
  );
}

export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured()) {
    return null;
  }
  if (!serverSupabaseInstance) {
    try {
      serverSupabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (err) {
      console.error('Failed to initialize server Supabase client:', err);
      return null;
    }
  }
  return serverSupabaseInstance;
}

export async function verifySupabaseToken(token: string) {
  const client = getServerSupabase();
  if (!client || !token) return null;
  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }
    return data.user;
  } catch (err) {
    console.error('Error verifying Supabase token:', err);
    return null;
  }
}
