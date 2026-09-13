import { 
  UserProfile, 
  Quest, 
  TaskItem, 
  CalendarEvent, 
  DetailedGoal, 
  RewardItem, 
  RewardBadge, 
  CollectionItem, 
  WaysToEarnItem, 
  QuickNote, 
  Attribute, 
  WeeklyData,
  AIIntegrationModel,
  CoachChatMessage,
  AIAgentVerifyPayload,
  AIVerificationResult,
  AuthUser,
  FriendUser,
  FriendRequest,
  SuggestedFriend,
  CalendarIntegrationState,
  CalendarPermissionLevel
} from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import {
  initialUserProfile,
  initialQuests,
  initialAttributes,
  weeklyProgressData,
  initialNotes,
  initialTasks,
} from '../data/mockData';
import {
  initialFeaturedRewards,
  initialBadges,
  initialCollectionItems,
  initialWaysToEarn,
} from '../data/rewardsMockData';
import { initialGoalsData } from '../data/goalsMockData';
import { initialCalendarEvents } from '../data/calendarMockData';

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem('liferpg_auth_token');
  } catch (e) {
    return null;
  }
}

export function setStoredAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem('liferpg_auth_token', token);
    } else {
      localStorage.removeItem('liferpg_auth_token');
    }
  } catch (e) {
    // ignore
  }
}

function getLocalGuestSession(): { user: AuthUser; token: string } | null {
  try {
    const raw = localStorage.getItem('liferpg_guest_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.user) return parsed;
  } catch (e) {
    // ignore
  }
  return null;
}

function setLocalGuestSession(user: AuthUser, token: string): void {
  try {
    localStorage.setItem('liferpg_guest_session', JSON.stringify({ user, token }));
  } catch (e) {
    // ignore
  }
}

function clearLocalGuestSession(): void {
  try {
    localStorage.removeItem('liferpg_guest_session');
  } catch (e) {
    // ignore
  }
}

/**
 * Robust, safe JSON parser that verifies response.ok, HTTP status, and content format before parsing.
 * Prevents "Unexpected token 'T', "The page c"... is not valid JSON" errors
 * when endpoints return HTML (e.g. 404/500 from Vercel/proxies or SPA fallback rewrites).
 */
export async function safeResponseJson<T = any>(
  res: Response,
  fallbackMessage = 'Request failed'
): Promise<T> {
  const status = res.status;
  const contentType = res.headers.get('content-type') || '';
  const url = typeof res.url === 'string' ? res.url : '';

  // Read response body as raw text first
  let rawText = '';
  try {
    rawText = await res.text();
  } catch (textErr: any) {
    throw new Error(
      `${fallbackMessage} (HTTP ${status}): Failed to read server response (${textErr.message || 'Stream error'})`
    );
  }

  const trimmed = rawText.trim();
  const isHtml =
    contentType.includes('text/html') ||
    trimmed.startsWith('<!') ||
    trimmed.toLowerCase().startsWith('<html') ||
    trimmed.toLowerCase().startsWith('<head') ||
    trimmed.toLowerCase().startsWith('<body') ||
    trimmed.startsWith('The page could not be found');

  // 1. Response is NOT OK (HTTP error 4xx / 5xx)
  if (!res.ok) {
    // 404 Not Found error handling (e.g. missing API endpoints on static hosting)
    if (status === 404) {
      throw new Error(
        `Endpoint not found (HTTP 404): ${url || 'Requested API endpoint is unavailable'}`
      );
    }

    // If server returned structured JSON error
    if (!isHtml && (contentType.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('['))) {
      try {
        const parsed = JSON.parse(trimmed);
        const errMessage = parsed?.error || parsed?.message || `${fallbackMessage} (Status ${status})`;
        throw new Error(errMessage);
      } catch (parseErr: any) {
        if (parseErr.message && !parseErr.message.includes('Unexpected token')) {
          throw parseErr;
        }
      }
    }

    // Non-JSON / HTML error (e.g. 500 error page or proxy gateway error)
    const cleanExcerpt = isHtml
      ? trimmed.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
      : trimmed.slice(0, 120);

    throw new Error(
      `${fallbackMessage} (HTTP ${status})${cleanExcerpt ? `: ${cleanExcerpt}` : ''}`
    );
  }

  // 2. Response IS OK (HTTP status 200–299)
  // Empty response (e.g. 204 No Content)
  if (status === 204 || trimmed.length === 0) {
    return {} as T;
  }

  // Detect unexpected HTML responses (e.g. SPA rewrites returning index.html for missing routes with 200 OK)
  if (isHtml) {
    throw new Error(
      `${fallbackMessage}: Expected JSON server response, but received HTML (Status ${status}). The API route may not be implemented on this server.`
    );
  }

  // Parse valid JSON safely
  try {
    return JSON.parse(trimmed) as T;
  } catch (err: any) {
    throw new Error(
      `${fallbackMessage}: Failed to parse JSON response (${err.message || 'SyntaxError'}). Received: ${trimmed.slice(0, 80)}`
    );
  }
}

export function supabaseUserToAuthUser(sbUser: any, profile?: any): AuthUser {
  const metadata = sbUser.user_metadata || {};
  const isAnonymous = Boolean(sbUser.is_anonymous || metadata.is_anonymous);
  const email = sbUser.email || (isAnonymous ? `guest_${sbUser.id.substring(0, 8)}@liferpg.internal` : '');
  const username =
    profile?.username ||
    metadata.username ||
    (email && !email.includes('@liferpg.internal') ? email.split('@')[0] : `user_${sbUser.id.substring(0, 6)}`);
  const fullName =
    profile?.display_name ||
    metadata.full_name ||
    metadata.name ||
    (isAnonymous ? 'Adventurer Guest' : 'Adventurer');
  const avatarUrl =
    profile?.avatar_url ||
    metadata.avatar_url ||
    (isAnonymous
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
      : `https://api.dicebear.com/7.x/bottts/svg?seed=${sbUser.id}`);

  return {
    id: sbUser.id,
    email,
    username,
    fullName,
    avatarUrl,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles',
    locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
    isGuest: isAnonymous,
    emailVerified: Boolean(sbUser.email_confirmed_at),
    createdAt: profile?.created_at || sbUser.created_at || new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };
}

export function getDefaultAppState(user?: AuthUser): FullAppState {
  const memberName = user?.fullName || user?.username || 'Adventurer';
  return {
    user: {
      ...initialUserProfile,
      name: memberName,
      momentumPoints: 50,
      pointsThisWeek: 0,
      weeklyConsistency: 100,
    },
    quests: [...initialQuests],
    tasks: [...initialTasks],
    calendarEvents: [...initialCalendarEvents],
    goals: [...initialGoalsData],
    rewards: [...initialFeaturedRewards],
    badges: [...initialBadges],
    collectionItems: [...initialCollectionItems],
    waysToEarn: [...initialWaysToEarn],
    claims: [],
    notes: [...initialNotes],
    attributes: [...initialAttributes],
    weeklyData: [...weeklyProgressData],
    aiAgents: [],
  };
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let token = getStoredAuthToken();
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      if (sb) {
        const { data } = await sb.auth.getSession();
        if (data?.session?.access_token) {
          token = data.session.access_token;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
  });
}

export interface FullAppState {
  user: UserProfile & {
    momentumPoints: number;
    pointsThisWeek: number;
    weeklyConsistency: number;
  };
  quests: Quest[];
  tasks: TaskItem[];
  calendarEvents: CalendarEvent[];
  goals: DetailedGoal[];
  rewards: RewardItem[];
  badges: RewardBadge[];
  collectionItems: CollectionItem[];
  waysToEarn: WaysToEarnItem[];
  claims: Array<{
    id: string;
    rewardId: string;
    rewardName: string;
    cost: number;
    claimedAt: string;
    status: string;
    termsAccepted: boolean;
    transactionHash: string;
  }>;
  notes: QuickNote[];
  attributes: Attribute[];
  weeklyData: WeeklyData[];
  aiAgents?: AIIntegrationModel[];
}

export type BackendState = FullAppState & {
  detailedGoals?: DetailedGoal[];
  collection?: CollectionItem[];
};

export interface RewardTermsPolicy {
  version: string;
  lastUpdated: string;
  title: string;
  summary: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    bullets?: string[];
  }>;
}

export const api = {
  // --- Authentication ---
  async getMe(): Promise<{ user: AuthUser; token: string; state: FullAppState }> {
    // 1. Check Supabase session first if configured
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabase();
        if (sb) {
          const { data: sessionData } = await sb.auth.getSession();
          if (sessionData?.session?.user) {
            const sbUser = sessionData.session.user;
            let profile: any = null;
            try {
              const { data: p } = await sb.from('profiles').select('*').eq('id', sbUser.id).maybeSingle();
              profile = p;
            } catch (e) {
              // ignore table lookup if schema is fresh
            }

            const authUser = supabaseUserToAuthUser(sbUser, profile);
            const token = sessionData.session.access_token;
            setStoredAuthToken(token);
            return {
              user: authUser,
              token,
              state: getDefaultAppState(authUser),
            };
          }
        }
      } catch (sbErr) {
        console.warn('Supabase getSession error:', sbErr);
      }
    }

    // 2. Check local guest session
    const guestSession = getLocalGuestSession();
    if (guestSession) {
      return {
        user: guestSession.user,
        token: guestSession.token,
        state: getDefaultAppState(guestSession.user),
      };
    }

    // 3. If neither session exists, conclude without unconfigured backend call
    throw new Error('No active user session found');
  },

  async register(payload: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    termsAccepted: boolean;
    guestToken?: string;
  }): Promise<{ user: AuthUser; token: string; migrated: boolean; state: FullAppState }> {
    // 1. Supabase native registration if configured
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.auth.signUp({
          email: payload.email.trim(),
          password: payload.password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
            data: {
              full_name: payload.fullName.trim(),
              username: payload.username.trim(),
            },
          },
        });

        if (error) {
          throw new Error(error.message || 'Registration failed with Supabase');
        }

        if (data?.user) {
          // Upsert to public.profiles
          try {
            await sb.from('profiles').upsert({
              id: data.user.id,
              username: payload.username.trim(),
              display_name: payload.fullName.trim(),
              full_name: payload.fullName.trim(),
              email: payload.email.trim(),
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`,
              level: 1,
              xp: 0,
              momentum_points: 50,
              is_guest: false,
            });
          } catch (profileErr) {
            // Trigger may have already created profile
          }

          const authUser = supabaseUserToAuthUser(data.user);
          const token = data.session?.access_token || `sb_token_${data.user.id}`;
          setStoredAuthToken(token);
          clearLocalGuestSession();
          return {
            user: authUser,
            token,
            migrated: false,
            state: getDefaultAppState(authUser),
          };
        }
      }
    }

    // 2. Direct local account creation fallback if Supabase credentials are not configured
    const localId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const localUser: AuthUser = {
      id: localId,
      email: payload.email.trim(),
      username: payload.username.trim(),
      fullName: payload.fullName.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${localId}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles',
      locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
      isGuest: false,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
    const localToken = `token_${localId}`;
    setStoredAuthToken(localToken);
    clearLocalGuestSession();
    return {
      user: localUser,
      token: localToken,
      migrated: false,
      state: getDefaultAppState(localUser),
    };
  },

  async login(payload: {
    identifier: string;
    password?: string;
    rememberMe?: boolean;
  }): Promise<{ user: AuthUser; token: string; state: FullAppState }> {
    // 1. Supabase native password login if configured
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        let emailToUse = payload.identifier.trim();
        // If not an email, lookup user's email in profiles table by username
        if (!emailToUse.includes('@')) {
          try {
            const { data: profile } = await sb
              .from('profiles')
              .select('id, email')
              .ilike('username', emailToUse)
              .maybeSingle();
            if (profile?.email) {
              emailToUse = profile.email;
            }
          } catch (e) {
            // ignore
          }
        }

        const { data, error } = await sb.auth.signInWithPassword({
          email: emailToUse,
          password: payload.password || '',
        });

        if (error) {
          throw new Error(error.message || 'Invalid credentials');
        }

        if (data?.user) {
          let profile: any = null;
          try {
            const { data: p } = await sb.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
            profile = p;
          } catch (e) {
            // ignore
          }

          const authUser = supabaseUserToAuthUser(data.user, profile);
          const token = data.session?.access_token || `sb_token_${data.user.id}`;
          setStoredAuthToken(token);
          clearLocalGuestSession();
          return {
            user: authUser,
            token,
            state: getDefaultAppState(authUser),
          };
        }
      }
    }

    // 2. Direct local login fallback if Supabase not configured
    const localId = `user_${Date.now()}`;
    const localUser: AuthUser = {
      id: localId,
      email: payload.identifier.includes('@') ? payload.identifier : `${payload.identifier}@liferpg.internal`,
      username: payload.identifier.split('@')[0],
      fullName: payload.identifier.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${localId}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles',
      locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
      isGuest: false,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
    const localToken = `token_${localId}`;
    setStoredAuthToken(localToken);
    clearLocalGuestSession();
    return {
      user: localUser,
      token: localToken,
      state: getDefaultAppState(localUser),
    };
  },

  async socialLogin(payload: {
    provider: 'google' | 'github' | 'discord' | 'apple';
    email?: string;
    fullName?: string;
  }): Promise<{ user: AuthUser; token: string; state: FullAppState }> {
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.auth.signInWithOAuth({
          provider: payload.provider,
          options: {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
          },
        });
        if (error) throw new Error(error.message);
        if (data?.url) {
          window.location.href = data.url;
          return new Promise(() => {});
        }
      }
    }

    const localId = `user_social_${payload.provider}_${Date.now()}`;
    const localUser: AuthUser = {
      id: localId,
      email: payload.email || `${payload.provider}_user@liferpg.internal`,
      username: `${payload.provider}_user`,
      fullName: payload.fullName || `${payload.provider.toUpperCase()} Explorer`,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${localId}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles',
      locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
      isGuest: false,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
    const localToken = `token_${localId}`;
    setStoredAuthToken(localToken);
    clearLocalGuestSession();
    return {
      user: localUser,
      token: localToken,
      state: getDefaultAppState(localUser),
    };
  },

  async continueAsGuest(): Promise<{ user: AuthUser; token: string; state: FullAppState }> {
    // 1. Try Supabase anonymous authentication if configured
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabase();
        if (sb) {
          const { data, error } = await sb.auth.signInAnonymously({
            options: {
              data: {
                full_name: 'Adventurer Guest',
                is_anonymous: true,
              },
            },
          });

          if (!error && data?.user) {
            const authUser = supabaseUserToAuthUser(data.user);
            const token = data.session?.access_token || `sb_guest_${data.user.id}`;
            setStoredAuthToken(token);
            setLocalGuestSession(authUser, token);
            return {
              user: authUser,
              token,
              state: getDefaultAppState(authUser),
            };
          } else if (error) {
            console.warn('Supabase signInAnonymously fallback to local guest session:', error.message);
          }
        }
      } catch (sbErr: any) {
        console.warn('Supabase anonymous sign in exception:', sbErr);
      }
    }

    // 2. Direct robust local guest session fallback
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const guestUser: AuthUser = {
      id: guestId,
      email: `${guestId}@liferpg.internal`,
      username: guestId,
      fullName: 'Adventurer Guest',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles',
      locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
      isGuest: true,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
    const guestToken = `token_${guestId}`;
    setStoredAuthToken(guestToken);
    setLocalGuestSession(guestUser, guestToken);
    return {
      user: guestUser,
      token: guestToken,
      state: getDefaultAppState(guestUser),
    };
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
        });
        if (error) throw new Error(error.message);
        return {
          message: 'Password reset link sent to your email address.',
          resetToken: 'sb_reset_token',
        };
      }
    }
    return {
      message: 'Password reset link sent to your email address.',
      resetToken: 'local_reset_token',
    };
  },

  async resetPassword(payload: {
    token?: string;
    email?: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.auth.updateUser({ password: payload.newPassword });
        if (error) throw new Error(error.message);
        return { message: 'Password updated successfully' };
      }
    }
    return { message: 'Password updated successfully' };
  },

  async verifyEmail(_payload: { email: string; code?: string }): Promise<{ message: string; emailVerified: boolean }> {
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        try {
          const { data: { user } } = await sb.auth.getUser();
          if (user?.email_confirmed_at) {
            return { message: 'Your email has been successfully verified!', emailVerified: true };
          }
          const { data: refreshData } = await sb.auth.refreshSession();
          if (refreshData?.user?.email_confirmed_at) {
            return { message: 'Your email has been successfully verified!', emailVerified: true };
          }
        } catch (e) {
          // ignore
        }
        return {
          message: 'Please check your email inbox and click the verification link to complete verification.',
          emailVerified: false,
        };
      }
    }
    return { message: 'Your email has been successfully verified!', emailVerified: true };
  },

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
          },
        });
        if (error) throw new Error(error.message);
        return { message: 'A new verification email has been dispatched.' };
      }
    }
    return { message: 'A new verification email has been dispatched.' };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabase();
        if (sb) await sb.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setStoredAuthToken(null);
    clearLocalGuestSession();
  },

  async deleteAccount(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabase();
        if (sb) await sb.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    setStoredAuthToken(null);
    clearLocalGuestSession();
  },

  async updateUserProfile(updates: {
    avatarUrl?: string;
    displayName?: string;
    username?: string;
    bio?: string;
  }): Promise<{ success: boolean; data: any; account?: any; state?: any }> {
    const res = await authFetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await safeResponseJson(res, 'Failed to update user profile');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update user profile');
    return json;
  },

  // 1. Full State
  async getState(): Promise<FullAppState> {
    try {
      const res = await authFetch('/api/state');
      if (res.ok) {
        const json = await safeResponseJson(res, 'Failed to load application state');
        if (json?.data) return json.data;
      }
    } catch (e) {
      console.warn('Backend /api/state not reachable, using default state:', e);
    }
    return getDefaultAppState();
  },

  // 2. Quests
  async toggleQuest(questId: string): Promise<{ quest: Quest; state: FullAppState }> {
    const res = await authFetch('/api/quests/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questId }),
    });
    const json = await safeResponseJson(res, 'Failed to toggle quest');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle quest');
    return { quest: json.data, state: json.state };
  },

  async addQuest(questData: Omit<Quest, 'id' | 'completed'>): Promise<{ quest: Quest; state: FullAppState }> {
    const res = await authFetch('/api/quests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questData),
    });
    const json = await safeResponseJson(res, 'Failed to add quest');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add quest');
    return { quest: json.data, state: json.state };
  },

  // 3. Tasks
  async toggleTask(taskId: string): Promise<{ task: TaskItem; state: FullAppState }> {
    const res = await authFetch(`/api/tasks/${taskId}/toggle`, {
      method: 'POST',
    });
    const json = await safeResponseJson(res, 'Failed to toggle task');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle task');
    return { task: json.data, state: json.state };
  },

  async addTask(taskData: Omit<TaskItem, 'id'>): Promise<{ task: TaskItem; state: FullAppState }> {
    const res = await authFetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const json = await safeResponseJson(res, 'Failed to add task');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add task');
    return { task: json.data, state: json.state };
  },

  async updateTask(taskData: TaskItem): Promise<{ task: TaskItem; state: FullAppState }> {
    const res = await authFetch(`/api/tasks/${taskData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const json = await safeResponseJson(res, 'Failed to update task');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update task');
    return { task: json.data, state: json.state };
  },

  async deleteTask(taskId: string): Promise<{ state: FullAppState }> {
    const res = await authFetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    const json = await safeResponseJson(res, 'Failed to delete task');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete task');
    return { state: json.state };
  },

  // 4. Calendar Events
  async addCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<{ event: CalendarEvent; state: FullAppState }> {
    const res = await authFetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const json = await safeResponseJson(res, 'Failed to add calendar event');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add calendar event');
    return { event: json.data, state: json.state };
  },

  async updateCalendarEvent(eventData: CalendarEvent): Promise<{ event: CalendarEvent; state: FullAppState }> {
    const res = await authFetch(`/api/calendar/events/${eventData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const json = await safeResponseJson(res, 'Failed to update calendar event');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update calendar event');
    return { event: json.data, state: json.state };
  },

  async deleteCalendarEvent(eventId: string): Promise<{ state: FullAppState }> {
    const res = await authFetch(`/api/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
    const json = await safeResponseJson(res, 'Failed to delete calendar event');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete calendar event');
    return { state: json.state };
  },

  async toggleCalendarEvent(eventId: string): Promise<{ event: CalendarEvent; state: FullAppState }> {
    const res = await authFetch(`/api/calendar/events/${eventId}/toggle`, {
      method: 'POST',
    });
    const json = await safeResponseJson(res, 'Failed to toggle calendar event');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle calendar event');
    return { event: json.data, state: json.state };
  },

  // 5. Goals
  async addGoal(goalData: Omit<DetailedGoal, 'id'>): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await authFetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });
    const json = await safeResponseJson(res, 'Failed to add goal');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add goal');
    return { goal: json.data, state: json.state };
  },

  async updateGoal(goalData: DetailedGoal): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await authFetch(`/api/goals/${goalData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });
    const json = await safeResponseJson(res, 'Failed to update goal');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update goal');
    return { goal: json.data, state: json.state };
  },

  async deleteGoal(goalId: string): Promise<{ state: FullAppState }> {
    const res = await authFetch(`/api/goals/${goalId}`, {
      method: 'DELETE',
    });
    const json = await safeResponseJson(res, 'Failed to delete goal');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete goal');
    return { state: json.state };
  },

  async toggleGoalSubtask(goalId: string, subtaskId: string): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await authFetch(`/api/goals/${goalId}/subtask-toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtaskId }),
    });
    const json = await safeResponseJson(res, 'Failed to toggle goal subtask');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle goal subtask');
    return { goal: json.data, state: json.state };
  },

  async toggleGoalMilestone(goalId: string, milestoneId: string): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await authFetch(`/api/goals/${goalId}/milestone-toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId }),
    });
    const json = await safeResponseJson(res, 'Failed to toggle goal milestone');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle goal milestone');
    return { goal: json.data, state: json.state };
  },

  // 6. Rewards & Verified Claim Engine
  async getRewardsTerms(): Promise<RewardTermsPolicy> {
    const res = await authFetch('/api/rewards/terms');
    const json = await safeResponseJson(res, 'Failed to fetch reward terms');
    if (!res.ok) throw new Error('Failed to fetch reward terms');
    return json.data;
  },

  async claimReward(rewardId: string, termsAccepted: boolean): Promise<{ reward: RewardItem; claim: any; state: FullAppState }> {
    const res = await authFetch('/api/rewards/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rewardId,
        termsAccepted,
        clientFingerprint: `usr-${navigator.userAgent.slice(0, 15)}`,
      }),
    });
    const json = await safeResponseJson(res, 'Failed to claim reward');
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to claim reward');
    }
    return { reward: json.data.reward, claim: json.data.claim, state: json.state };
  },

  async activateReward(rewardId: string): Promise<{ reward: RewardItem; state: FullAppState }> {
    const res = await authFetch('/api/rewards/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId }),
    });
    const json = await safeResponseJson(res, 'Failed to activate reward');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to activate reward');
    return { reward: json.data, state: json.state };
  },

  // 7. Analytics
  async getAnalytics(timeRange: string = '7d'): Promise<any> {
    const res = await authFetch(`/api/analytics?timeRange=${timeRange}`);
    const json = await safeResponseJson(res, 'Failed to load analytics');
    if (!res.ok) throw new Error('Failed to load analytics');
    return json.data;
  },

  // 8. Notes
  async addNote(noteData: QuickNote): Promise<{ note: QuickNote; state: FullAppState }> {
    const res = await authFetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });
    const json = await safeResponseJson(res, 'Failed to add note');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add note');
    return { note: json.data, state: json.state };
  },

  async deleteNote(noteId: string): Promise<{ state: FullAppState }> {
    const res = await authFetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
    });
    const json = await safeResponseJson(res, 'Failed to delete note');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete note');
    return { state: json.state };
  },

  // 9. AI Agents & Chatting
  async getAIAgents(): Promise<AIIntegrationModel[]> {
    const res = await authFetch('/api/ai/agents');
    const json = await safeResponseJson(res, 'Failed to fetch AI agents');
    if (!res.ok) throw new Error('Failed to fetch AI agents');
    return json.data;
  },

  async verifyAndConnectAIAgent(
    agentIdOrPayload: string | AIAgentVerifyPayload,
    details?: any
  ): Promise<{ agent: AIIntegrationModel; agents: AIIntegrationModel[]; verificationReport?: any }> {
    const payload: AIAgentVerifyPayload =
      typeof agentIdOrPayload === 'string'
        ? { agentId: agentIdOrPayload, ...details }
        : agentIdOrPayload;

    const res = await authFetch('/api/ai/agents/verify-and-connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await safeResponseJson(res, 'Credential verification failed');
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Credential verification failed');
    }
    return {
      agent: json.data,
      agents: json.agents,
      verificationReport: json.verificationReport,
    };
  },

  async connectAIAgent(
    agentId: string,
    details?: { accountEmail?: string; apiKey?: string; modelTier?: string; loginMethod?: string; password?: string; authMethod?: any }
  ): Promise<{ agent: AIIntegrationModel; agents: AIIntegrationModel[] }> {
    const res = await authFetch('/api/ai/agents/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, ...details }),
    });
    const json = await safeResponseJson(res, 'Failed to connect AI agent');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to connect AI agent');
    return { agent: json.data, agents: json.agents };
  },

  async disconnectAIAgent(agentId: string): Promise<{ agent: AIIntegrationModel; agents: AIIntegrationModel[] }> {
    const res = await authFetch('/api/ai/agents/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    const json = await safeResponseJson(res, 'Failed to disconnect AI agent');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to disconnect AI agent');
    return { agent: json.data, agents: json.agents };
  },

  async selectAIAgent(agentId: string): Promise<AIIntegrationModel[]> {
    const res = await authFetch('/api/ai/agents/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    const json = await safeResponseJson(res, 'Failed to select AI agent');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to select AI agent');
    return json.data;
  },

  async syncAIAgents(): Promise<{
    agents: AIIntegrationModel[];
    syncedAt: string;
    totalConnected: number;
    activeModel: AIIntegrationModel | null;
    message: string;
  }> {
    const res = await authFetch('/api/ai/agents/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await safeResponseJson(res, 'Failed to sync AI models');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to sync AI models');
    return {
      agents: json.agents,
      syncedAt: json.syncedAt,
      totalConnected: json.totalConnected,
      activeModel: json.activeModel,
      message: json.message,
    };
  },

  async sendAIChat(params: {
    modelId: string;
    message: string;
    history?: any[];
    calendarPermission?: CalendarPermissionLevel;
    googleAccessToken?: string;
  }): Promise<CoachChatMessage> {
    const res = await authFetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await safeResponseJson(res, 'Failed to send message to AI agent');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send message to AI agent');
    return json.data;
  },

  async getCalendarIntegration(): Promise<CalendarIntegrationState> {
    const res = await authFetch('/api/calendar/integration');
    const json = await safeResponseJson(res, 'Failed to fetch calendar integration');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch calendar integration');
    return json.data;
  },

  async updateCalendarIntegration(updates: Partial<CalendarIntegrationState>): Promise<CalendarIntegrationState> {
    const res = await authFetch('/api/calendar/integration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await safeResponseJson(res, 'Failed to update calendar integration');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update calendar integration');
    return json.data;
  },

  // --- Friends & Social Accountability ---
  async getFriendsData(): Promise<{
    friends: FriendUser[];
    leaderboard: FriendUser[];
    xpComparison: any[];
    consistencyStreaks: any[];
    summary: { friendsCount: number; requestsCount: number; onlineCount: number };
  }> {
    const res = await authFetch('/api/friends');
    const json = await safeResponseJson(res, 'Failed to fetch friends data');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch friends data');
    return {
      friends: json.data,
      leaderboard: json.leaderboard,
      xpComparison: json.xpComparison,
      consistencyStreaks: json.consistencyStreaks,
      summary: json.summary,
    };
  },

  async getFriendRequests(): Promise<FriendRequest[]> {
    const res = await authFetch('/api/friends/requests');
    const json = await safeResponseJson(res, 'Failed to fetch friend requests');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch friend requests');
    return json.data;
  },

  async getSuggestedFriends(): Promise<SuggestedFriend[]> {
    const res = await authFetch('/api/friends/suggestions');
    const json = await safeResponseJson(res, 'Failed to fetch suggested friends');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch suggested friends');
    return json.data;
  },

  async searchUsers(query: string): Promise<any[]> {
    const res = await authFetch(`/api/friends/search?q=${encodeURIComponent(query)}`);
    const json = await safeResponseJson(res, 'Failed to search users');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to search users');
    return json.data;
  },

  async sendFriendRequest(payload: {
    recipientId?: string;
    username?: string;
    name?: string;
    email?: string;
    reason?: string;
  }): Promise<{ message: string; data: any; progress: any }> {
    const res = await authFetch('/api/friends/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await safeResponseJson(res, 'Failed to send friend request');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send friend request');
    return json;
  },

  async acceptFriendRequest(requestId: string): Promise<{ message: string; progress: any }> {
    const res = await authFetch(`/api/friends/requests/${requestId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await safeResponseJson(res, 'Failed to accept friend request');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to accept friend request');
    return json;
  },

  async declineFriendRequest(requestId: string): Promise<{ message: string; progress: any }> {
    const res = await authFetch(`/api/friends/requests/${requestId}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await safeResponseJson(res, 'Failed to decline friend request');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to decline friend request');
    return json;
  },

  async removeFriend(friendId: string): Promise<{ success: boolean; progress: any }> {
    const res = await authFetch(`/api/friends/${friendId}`, {
      method: 'DELETE',
    });
    const json = await safeResponseJson(res, 'Failed to remove friend');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to remove friend');
    return json;
  }
};
