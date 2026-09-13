import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl: string = (
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  ''
).trim();

const supabaseAnonKey: string = (
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  ''
).trim();

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl && 
    supabaseUrl.trim().length > 0 && 
    supabaseAnonKey && 
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes('placeholder')
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export const supabase = {
  get client(): SupabaseClient | null {
    return getSupabase();
  },
  isConfigured: isSupabaseConfigured,
};

export interface RealtimeSubscriptionOptions {
  table: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export function subscribeToUserTable(
  userId: string,
  options: RealtimeSubscriptionOptions
): RealtimeChannel | null {
  const client = getSupabase();
  if (!client || !userId) return null;

  const channelName = `user_${options.table}_${userId}`;
  const filter = options.filter || `user_id=eq.${userId}`;

  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: options.table,
        filter: filter,
      },
      (payload: any) => {
        if (payload.eventType === 'INSERT' && options.onInsert) {
          options.onInsert(payload.new);
        } else if (payload.eventType === 'UPDATE' && options.onUpdate) {
          options.onUpdate(payload.new);
        } else if (payload.eventType === 'DELETE' && options.onDelete) {
          options.onDelete(payload.old);
        }
      }
    )
    .subscribe();

  return channel;
}
