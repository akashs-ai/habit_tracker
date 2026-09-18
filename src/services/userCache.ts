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
  AuthUser,
  FriendUser
} from '../types';

const CACHE_KEY_PREFIX = 'liferpg_user_cache_';
const AUTH_CACHE_KEY = 'liferpg_last_active_user';

export interface CachedUserData {
  userId: string;
  authUser?: AuthUser;
  user: UserProfile & {
    momentumPoints?: number;
    pointsThisWeek?: number;
    weeklyConsistency?: number;
  };
  quests: Quest[];
  tasks: TaskItem[];
  calendarEvents: CalendarEvent[];
  goals: DetailedGoal[];
  detailedGoals?: DetailedGoal[];
  rewards: RewardItem[];
  badges: RewardBadge[];
  collectionItems: CollectionItem[];
  collection?: CollectionItem[];
  waysToEarn?: WaysToEarnItem[];
  claims?: Array<{
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
  friends?: FriendUser[];
  cachedAt: number;
}

/**
 * Generates user-scoped cache key to guarantee cross-account data isolation.
 */
export function getUserCacheKey(userId: string): string {
  return `${CACHE_KEY_PREFIX}${userId}`;
}

/**
 * Safely reads cached authoritative state for a specific user ID.
 * Returns null if no cache exists, is corrupted, or belongs to another user.
 */
export function getStoredUserCache(userId: string): CachedUserData | null {
  if (!userId || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getUserCacheKey(userId));
    if (!raw) return null;
    const parsed: CachedUserData = JSON.parse(raw);
    if (!parsed || parsed.userId !== userId) return null;
    // Sanitize any mock tasks, quests, goals, or calendar events that might have previously leaked into authenticated user cache
    if (parsed.authUser && !parsed.authUser.isGuest) {
      if (Array.isArray(parsed.tasks)) {
        parsed.tasks = parsed.tasks.filter((t) => !t.id.startsWith('task-'));
      }
      if (Array.isArray(parsed.quests)) {
        parsed.quests = parsed.quests.filter((q) => !q.id.startsWith('quest-'));
      }
      if (Array.isArray(parsed.goals)) {
        parsed.goals = parsed.goals.filter((g) => !g.id.startsWith('goal-'));
      }
      if (Array.isArray(parsed.detailedGoals)) {
        parsed.detailedGoals = parsed.detailedGoals.filter((g) => !g.id.startsWith('goal-'));
      }
      if (Array.isArray(parsed.calendarEvents)) {
        parsed.calendarEvents = parsed.calendarEvents.filter(
          (e) => !e.id.startsWith('cal-') && !e.id.startsWith('evt-live-') && !e.id.startsWith('evt-demo-') && !e.id.startsWith('demo-')
        );
      }
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to read user cache:', err);
    return null;
  }
}

/**
 * Checks if valid cached data exists for the given user.
 */
export function hasStoredUserCache(userId: string): boolean {
  return getStoredUserCache(userId) !== null;
}

/**
 * Safely persists authenticated user state scoped strictly to their user ID.
 * Never stores authentication credentials, passwords, or service secrets.
 */
export function setStoredUserCache(userId: string, state: Partial<CachedUserData>): void {
  if (!userId || typeof window === 'undefined') return;
  try {
    const existing = getStoredUserCache(userId);
    const authUser = state.authUser || existing?.authUser;
    const isAuth = Boolean(authUser && !authUser.isGuest);
    const rawTasks = Array.isArray(state.tasks) ? state.tasks : (existing?.tasks || []);
    const sanitizedTasks = isAuth ? rawTasks.filter((t) => !t.id.startsWith('task-')) : rawTasks;
    const rawQuests = Array.isArray(state.quests) ? state.quests : (existing?.quests || []);
    const sanitizedQuests = isAuth ? rawQuests.filter((q) => !q.id.startsWith('quest-')) : rawQuests;
    const rawGoals = Array.isArray(state.goals)
      ? state.goals
      : (Array.isArray(state.detailedGoals)
          ? state.detailedGoals
          : (existing?.goals || existing?.detailedGoals || []));
    const sanitizedGoals = isAuth ? rawGoals.filter((g) => !g.id.startsWith('goal-')) : rawGoals;
    const rawCalendarEvents = Array.isArray(state.calendarEvents) ? state.calendarEvents : (existing?.calendarEvents || []);
    const sanitizedCalendarEvents = isAuth
      ? rawCalendarEvents.filter(
          (e) => !e.id.startsWith('cal-') && !e.id.startsWith('evt-live-') && !e.id.startsWith('evt-demo-') && !e.id.startsWith('demo-')
        )
      : rawCalendarEvents;

    const updated: CachedUserData = {
      userId,
      authUser,
      user: state.user || existing?.user || ({} as any),
      quests: sanitizedQuests,
      tasks: sanitizedTasks,
      calendarEvents: sanitizedCalendarEvents,
      goals: sanitizedGoals,
      detailedGoals: sanitizedGoals,
      rewards: state.rewards || existing?.rewards || [],
      badges: state.badges || existing?.badges || [],
      collectionItems: state.collectionItems || existing?.collectionItems || state.collection || existing?.collection || [],
      collection: state.collection || existing?.collection || state.collectionItems || existing?.collectionItems || [],
      waysToEarn: state.waysToEarn || existing?.waysToEarn || [],
      claims: state.claims || existing?.claims || [],
      notes: state.notes || existing?.notes || [],
      attributes: state.attributes || existing?.attributes || [],
      weeklyData: state.weeklyData || existing?.weeklyData || [],
      aiAgents: state.aiAgents || existing?.aiAgents || [],
      friends: state.friends || existing?.friends || [],
      cachedAt: Date.now(),
    };
    localStorage.setItem(getUserCacheKey(userId), JSON.stringify(updated));
    localStorage.setItem(AUTH_CACHE_KEY, userId);
  } catch (err) {
    console.warn('Failed to save user cache:', err);
  }
}

/**
 * Gets the last active user ID if recorded in localStorage.
 */
export function getLastActiveUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(AUTH_CACHE_KEY);
  } catch {
    return null;
  }
}

/**
 * Removes cached data for a user on logout or account switch.
 */
export function clearUserCache(userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (userId) {
      localStorage.removeItem(getUserCacheKey(userId));
      if (localStorage.getItem(AUTH_CACHE_KEY) === userId) {
        localStorage.removeItem(AUTH_CACHE_KEY);
      }
    } else {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(CACHE_KEY_PREFIX) || key === AUTH_CACHE_KEY)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }
  } catch (err) {
    console.warn('Failed to clear user cache:', err);
  }
}
