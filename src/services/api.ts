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
 * Robust, safe JSON parser that verifies the response format before parsing.
 * Prevents "Unexpected token 'T', "The page c"... is not valid JSON" errors
 * when endpoints return HTML (e.g. 404 from Vercel/proxies).
 */
export async function safeResponseJson<T = any>(
  res: Response,
  fallbackMessage = 'Request failed'
): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  const trimmed = text.trim();

  // If Content-Type indicates JSON or content starts with JSON bracket/brace
  if (contentType.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      if (!res.ok) {
        throw new Error(parsed.error || parsed.message || `${fallbackMessage} (Status ${res.status})`);
      }
      return parsed as T;
    } catch (parseErr: any) {
      if (parseErr.message && !parseErr.message.includes('Unexpected token')) {
        throw parseErr;
      }
    }
  }

  // Not JSON (e.g. Vercel 404 HTML "The page could not be found")
  if (res.status === 404) {
    throw new Error(
      `Endpoint not found (HTTP 404): ${res.url || 'API route'}. Client authentication handles this operation directly.`
    );
  }

  if (!res.ok) {
    throw new Error(`${fallbackMessage} (HTTP ${res.status}): ${trimmed.slice(0, 100) || 'Non-JSON server response'}`);
  }

  throw new Error(`Expected JSON server response, but received: ${trimmed.slice(0, 100)}`);
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

    // 3. Fallback to backend API if available
    try {
      const res = await authFetch('/api/auth/me');
      if (res.ok) {
        const json = await safeResponseJson(res);
        if (json?.success && json?.user) {
          return {
            user: json.user,
            token: json.token,
            state: json.state || getDefaultAppState(json.user),
          };
        }
      }
    } catch (apiErr) {
      // Backend unavailable on static deployment
    }

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
    // 1. Try Supabase native registration if configured
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.auth.signUp({
          email: payload.email.trim(),
          password: payload.password,
          options: {
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
          // Attempt upserting to public.profiles
          try {
            await sb.from('profiles').upsert({
              id: data.user.id,
              username: payload.username.trim(),
              display_name: payload.fullName.trim(),
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`,
              level: 1,
              xp: 0,
              momentum_points: 50,
              is_guest: false,
            });
          } catch (profileErr) {
            // on_auth_user_created trigger may have handled it
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

    // 2. Fallback to backend API if Supabase client not configured or local server
    const res = await authFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await safeResponseJson(res, 'Failed to register account');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to register account');
    setStoredAuthToken(json.token);
    clearLocalGuestSession();
    return json;
  },

  async login(payload: {
    identifier: string;
    password?: string;
    rememberMe?: boolean;
  }): Promise<{ user: AuthUser; token: string; state: FullAppState }> {
    // 1. Try Supabase native password login if configured
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

    // 2. Fallback to backend API
    const res = await authFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await safeResponseJson(res, 'Invalid credentials');
    if (!res.ok || !json.success) throw new Error(json.error || 'Invalid credentials');
    setStoredAuthToken(json.token);
    clearLocalGuestSession();
    return json;
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
            redirectTo: window.location.origin,
          },
        });
        if (error) throw new Error(error.message);
        if (data?.url) {
          window.location.href = data.url;
          return new Promise(() => {});
        }
      }
    }

    const res = await authFetch('/api/auth/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await safeResponseJson(res, 'Failed to authenticate with social provider');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to authenticate with social provider');
    setStoredAuthToken(json.token);
    clearLocalGuestSession();
    return json;
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

    // 2. Try backend API endpoint if running with custom server
    try {
      const res = await authFetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const json = await safeResponseJson(res);
        if (json?.success && json?.user) {
          setStoredAuthToken(json.token);
          setLocalGuestSession(json.user, json.token);
          return json;
        }
      }
    } catch (apiErr) {
      // Backend not present (e.g. Vercel static deployment)
    }

    // 3. Robust local guest session (intended fallback design)
    // Ensures guest login NEVER fails, even offline or without anonymous auth enabled in Supabase dashboard
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
          redirectTo: window.location.origin,
        });
        if (error) throw new Error(error.message);
        return {
          message: 'Password reset link sent to your email address.',
          resetToken: 'sb_reset_token',
        };
      }
    }
    const res = await authFetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    const json = await safeResponseJson(res, 'Failed to process password reset');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send reset email');
    return json;
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
    const res = await authFetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await safeResponseJson(res, 'Failed to reset password');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to reset password');
    return json;
  },

  async verifyEmail(payload: { email: string; code?: string }): Promise<{ message: string; emailVerified: boolean }> {
    const res = await authFetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await safeResponseJson(res, 'Failed to verify email');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to verify email');
    return json;
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

    try {
      const res = await authFetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await safeResponseJson(res).catch(() => {});
      }
    } catch (e) {
      // ignore
    }
  },

  async deleteAccount(): Promise<void> {
    const res = await authFetch('/api/auth/account', {
      method: 'DELETE',
    });
    const json = await safeResponseJson(res, 'Failed to delete account');
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete account');
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
