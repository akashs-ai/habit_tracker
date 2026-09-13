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
    const res = await authFetch('/api/auth/me');
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch user session');
    return {
      user: json.user,
      token: json.token,
      state: json.state,
    };
  },

  async register(payload: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    termsAccepted: boolean;
    guestToken?: string;
  }): Promise<{ user: AuthUser; token: string; migrated: boolean; state: FullAppState }> {
    const res = await authFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to register account');
    setStoredAuthToken(json.token);
    return json;
  },

  async login(payload: {
    identifier: string;
    password?: string;
    rememberMe?: boolean;
  }): Promise<{ user: AuthUser; token: string; state: FullAppState }> {
    const res = await authFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Invalid credentials');
    setStoredAuthToken(json.token);
    return json;
  },

  async socialLogin(payload: {
    provider: 'google' | 'github' | 'discord' | 'apple';
    email?: string;
    fullName?: string;
  }): Promise<{ user: AuthUser; token: string; state: FullAppState }> {
    const res = await authFetch('/api/auth/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to authenticate with social provider');
    setStoredAuthToken(json.token);
    return json;
  },

  async continueAsGuest(): Promise<{ user: AuthUser; token: string; state: FullAppState }> {
    const res = await authFetch('/api/auth/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to initialize guest session');
    setStoredAuthToken(json.token);
    return json;
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const res = await authFetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to process password reset');
    return json;
  },

  async resetPassword(payload: {
    token?: string;
    email?: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const res = await authFetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to reset password');
    return json;
  },

  async verifyEmail(payload: { email: string; code?: string }): Promise<{ message: string; emailVerified: boolean }> {
    const res = await authFetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to verify email');
    return json;
  },

  async logout(): Promise<void> {
    try {
      if (isSupabaseConfigured()) {
        const sb = getSupabase();
        if (sb) await sb.auth.signOut();
      }
      await authFetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      // ignore
    }
    setStoredAuthToken(null);
  },

  async deleteAccount(): Promise<void> {
    const res = await authFetch('/api/auth/account', {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete account');
    setStoredAuthToken(null);
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
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update user profile');
    return json;
  },

  // 1. Full State
  async getState(): Promise<FullAppState> {
    const res = await authFetch('/api/state');
    if (!res.ok) throw new Error('Failed to load application state from server');
    const json = await res.json();
    return json.data;
  },

  // 2. Quests
  async toggleQuest(questId: string): Promise<{ quest: Quest; state: FullAppState }> {
    const res = await fetch('/api/quests/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle quest');
    return { quest: json.data, state: json.state };
  },

  async addQuest(questData: Omit<Quest, 'id' | 'completed'>): Promise<{ quest: Quest; state: FullAppState }> {
    const res = await fetch('/api/quests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add quest');
    return { quest: json.data, state: json.state };
  },

  // 3. Tasks
  async toggleTask(taskId: string): Promise<{ task: TaskItem; state: FullAppState }> {
    const res = await fetch(`/api/tasks/${taskId}/toggle`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle task');
    return { task: json.data, state: json.state };
  },

  async addTask(taskData: Omit<TaskItem, 'id'>): Promise<{ task: TaskItem; state: FullAppState }> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add task');
    return { task: json.data, state: json.state };
  },

  async updateTask(taskData: TaskItem): Promise<{ task: TaskItem; state: FullAppState }> {
    const res = await fetch(`/api/tasks/${taskData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update task');
    return { task: json.data, state: json.state };
  },

  async deleteTask(taskId: string): Promise<{ state: FullAppState }> {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete task');
    return { state: json.state };
  },

  // 4. Calendar Events
  async addCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<{ event: CalendarEvent; state: FullAppState }> {
    const res = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add calendar event');
    return { event: json.data, state: json.state };
  },

  async updateCalendarEvent(eventData: CalendarEvent): Promise<{ event: CalendarEvent; state: FullAppState }> {
    const res = await fetch(`/api/calendar/events/${eventData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update calendar event');
    return { event: json.data, state: json.state };
  },

  async deleteCalendarEvent(eventId: string): Promise<{ state: FullAppState }> {
    const res = await fetch(`/api/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete calendar event');
    return { state: json.state };
  },

  async toggleCalendarEvent(eventId: string): Promise<{ event: CalendarEvent; state: FullAppState }> {
    const res = await fetch(`/api/calendar/events/${eventId}/toggle`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle calendar event');
    return { event: json.data, state: json.state };
  },

  // 5. Goals
  async addGoal(goalData: Omit<DetailedGoal, 'id'>): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add goal');
    return { goal: json.data, state: json.state };
  },

  async updateGoal(goalData: DetailedGoal): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await fetch(`/api/goals/${goalData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update goal');
    return { goal: json.data, state: json.state };
  },

  async deleteGoal(goalId: string): Promise<{ state: FullAppState }> {
    const res = await fetch(`/api/goals/${goalId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete goal');
    return { state: json.state };
  },

  async toggleGoalSubtask(goalId: string, subtaskId: string): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await fetch(`/api/goals/${goalId}/subtask-toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtaskId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle goal subtask');
    return { goal: json.data, state: json.state };
  },

  async toggleGoalMilestone(goalId: string, milestoneId: string): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await fetch(`/api/goals/${goalId}/milestone-toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle goal milestone');
    return { goal: json.data, state: json.state };
  },

  // 6. Rewards & Verified Claim Engine
  async getRewardsTerms(): Promise<RewardTermsPolicy> {
    const res = await fetch('/api/rewards/terms');
    if (!res.ok) throw new Error('Failed to fetch reward terms');
    const json = await res.json();
    return json.data;
  },

  async claimReward(rewardId: string, termsAccepted: boolean): Promise<{ reward: RewardItem; claim: any; state: FullAppState }> {
    const res = await fetch('/api/rewards/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rewardId,
        termsAccepted,
        clientFingerprint: `usr-${navigator.userAgent.slice(0, 15)}`,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to claim reward');
    }
    return { reward: json.data.reward, claim: json.data.claim, state: json.state };
  },

  async activateReward(rewardId: string): Promise<{ reward: RewardItem; state: FullAppState }> {
    const res = await fetch('/api/rewards/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to activate reward');
    return { reward: json.data, state: json.state };
  },

  // 7. Analytics
  async getAnalytics(timeRange: string = '7d'): Promise<any> {
    const res = await fetch(`/api/analytics?timeRange=${timeRange}`);
    if (!res.ok) throw new Error('Failed to load analytics');
    const json = await res.json();
    return json.data;
  },

  // 8. Notes
  async addNote(noteData: QuickNote): Promise<{ note: QuickNote; state: FullAppState }> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add note');
    return { note: json.data, state: json.state };
  },

  async deleteNote(noteId: string): Promise<{ state: FullAppState }> {
    const res = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete note');
    return { state: json.state };
  },

  // 9. AI Agents & Chatting
  async getAIAgents(): Promise<AIIntegrationModel[]> {
    const res = await fetch('/api/ai/agents');
    if (!res.ok) throw new Error('Failed to fetch AI agents');
    const json = await res.json();
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

    const res = await fetch('/api/ai/agents/verify-and-connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
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
    const res = await fetch('/api/ai/agents/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, ...details }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to connect AI agent');
    return { agent: json.data, agents: json.agents };
  },

  async disconnectAIAgent(agentId: string): Promise<{ agent: AIIntegrationModel; agents: AIIntegrationModel[] }> {
    const res = await fetch('/api/ai/agents/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to disconnect AI agent');
    return { agent: json.data, agents: json.agents };
  },

  async selectAIAgent(agentId: string): Promise<AIIntegrationModel[]> {
    const res = await fetch('/api/ai/agents/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    const json = await res.json();
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
    const res = await fetch('/api/ai/agents/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
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
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send message to AI agent');
    return json.data;
  },

  async getCalendarIntegration(): Promise<CalendarIntegrationState> {
    const res = await fetch('/api/calendar/integration');
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch calendar integration');
    return json.data;
  },

  async updateCalendarIntegration(updates: Partial<CalendarIntegrationState>): Promise<CalendarIntegrationState> {
    const res = await fetch('/api/calendar/integration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
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
    const json = await res.json();
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
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch friend requests');
    return json.data;
  },

  async getSuggestedFriends(): Promise<SuggestedFriend[]> {
    const res = await authFetch('/api/friends/suggestions');
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch suggested friends');
    return json.data;
  },

  async searchUsers(query: string): Promise<any[]> {
    const res = await authFetch(`/api/friends/search?q=${encodeURIComponent(query)}`);
    const json = await res.json();
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
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send friend request');
    return json;
  },

  async acceptFriendRequest(requestId: string): Promise<{ message: string; progress: any }> {
    const res = await authFetch(`/api/friends/requests/${requestId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to accept friend request');
    return json;
  },

  async declineFriendRequest(requestId: string): Promise<{ message: string; progress: any }> {
    const res = await authFetch(`/api/friends/requests/${requestId}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to decline friend request');
    return json;
  },

  async removeFriend(friendId: string): Promise<{ success: boolean; progress: any }> {
    const res = await authFetch(`/api/friends/${friendId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to remove friend');
    return json;
  }
};
