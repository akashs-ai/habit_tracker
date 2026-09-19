import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { TodayQuests } from './components/TodayQuests';
import { MiddleAnalyticsRow } from './components/MiddleAnalyticsRow';
import { GoalsSection } from './components/GoalsSection';
import { RightSidebar } from './components/RightSidebar';
import { AddQuestModal } from './components/AddQuestModal';
import { AddGoalModal } from './components/AddGoalModal';
import { AddNoteModal } from './components/AddNoteModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { 
  initialUserProfile, 
  freshUserProfile,
  initialQuests, 
  initialTasks,
  initialAttributes, 
  freshAttributes,
  weeklyProgressData, 
  freshWeeklyData,
  leaderboardFriends, 
  initialGoals, 
  initialNotes,
  initialNotifications
} from './data/mockData';
import { initialCalendarEvents } from './data/calendarMockData';
import { initialGoalsData } from './data/goalsMockData';
import { getLiveTodayISO, getTodayISO, addDaysISO, formatReadableDate } from './utils/dateUtils';
import { 
  initialFeaturedRewards, 
  initialBadges, 
  initialCollectionItems 
} from './data/rewardsMockData';
import { 
  Quest, 
  QuestCategory, 
  Goal, 
  QuickNote, 
  TaskItem, 
  CalendarEvent, 
  DetailedGoal,
  RewardItem,
  RewardBadge,
  CollectionItem,
  AIIntegrationModel,
  AppNotification,
  UserSettingsProfile,
  FriendUser
} from './types';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { AppLoadingOverlay } from './components/common/AppLoadingOverlay';

// Code-split pages for high performance, fast initial load, and optimal chunking
const TasksPage = React.lazy(() => import('./components/tasks/TasksPage').then(m => ({ default: m.TasksPage })));
const CalendarPage = React.lazy(() => import('./components/calendar/CalendarPage').then(m => ({ default: m.CalendarPage })));
const GoalsPage = React.lazy(() => import('./components/goals/GoalsPage').then(m => ({ default: m.GoalsPage })));
const FriendsPage = React.lazy(() => import('./components/friends/FriendsPage').then(m => ({ default: m.FriendsPage })));
const RewardsPage = React.lazy(() => import('./components/rewards/RewardsPage').then(m => ({ default: m.RewardsPage })));
const AnalyticsPage = React.lazy(() => import('./components/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const AiCoachPage = React.lazy(() => import('./components/aicoach/AiCoachPage').then(m => ({ default: m.AiCoachPage })));
const AiIntegrationPage = React.lazy(() => import('./components/aiintegration/AiIntegrationPage').then(m => ({ default: m.AiIntegrationPage })));
const SettingsPage = React.lazy(() => import('./components/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LandingWelcomePage = React.lazy(() => import('./components/auth/LandingWelcomePage').then(m => ({ default: m.LandingWelcomePage })));
import { AuthModal } from './components/auth/AuthModal';
import { GuestBanner } from './components/auth/GuestBanner';
import { LevelUpModal } from './components/effects/LevelUpModal';
import { Footer } from './components/footer/Footer';
import { api, BackendState, supabaseUserToAuthUser, setStoredAuthToken } from './services/api';
import { AuthUser, AuthScreenType, AppearanceSettings as AppearanceSettingsType } from './types';
import { getStoredAppearance, applyAppearanceToDOM } from './utils/appearanceManager';
import { subscribeToUserTable, isSupabaseConfigured, getSupabase } from './lib/supabase';
import { initialAIModels } from './data/aiIntegrationMockData';
import { getStoredUserCache, setStoredUserCache, clearUserCache, getLastActiveUserId } from './services/userCache';
import {
  mapHabitRowToQuest,
  mapTaskRowToTaskItem,
  fetchSingleGoalFromSupabase,
  calculateGoalMetrics,
  mapCalendarRowToCalendarEvent,
  mapQuickNoteRowToQuickNote,
} from './services/supabaseData';
import {
  markCalendarEventDeleted,
  isCalendarEventDeleted,
  reconcileCalendarEvents,
  authoritativeReconcileCalendarEvents,
  clearDeletedCalendarEventTracking,
  enqueueCalendarMutation,
} from './utils/calendarMutationManager';
import { calculateProgressionDelta } from './utils/progression';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appearance, setAppearance] = useState<AppearanceSettingsType>(getStoredAppearance);
  const [isDark, setIsDark] = useState(() => {
    const initial = getStoredAppearance();
    if (initial.theme === 'dark') return true;
    if (initial.theme === 'light') return false;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Central tab navigation handler with alias normalization (e.g. 'coach' -> 'ai-coach')
  const handleNavigateTab = (tab: string) => {
    let target = tab;
    if (tab === 'coach' || tab === 'aicoach' || tab === 'ai_coach') {
      target = 'ai-coach';
    } else if (tab === 'integration' || tab === 'integrations' || tab === 'ai_integration') {
      target = 'ai-integration';
    }
    setActiveTab(target);
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuestFilter, setActiveQuestFilter] = useState<QuestCategory>('all');

  // Synchronous pre-initialization from authenticated user cache if present
  const initialCached = useMemo(() => {
    const lastId = getLastActiveUserId();
    return lastId ? getStoredUserCache(lastId) : null;
  }, []);

  // Authentication States
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => initialCached?.authUser || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalScreen, setAuthModalScreen] = useState<AuthScreenType>('login');
  const [isGuestBannerDismissed, setIsGuestBannerDismissed] = useState(false);
  const [showLandingWelcome, setShowLandingWelcome] = useState(false);
  const [verifiedBannerMessage, setVerifiedBannerMessage] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(() => !initialCached);

  // Core Synchronized Data States
  const isAuthUserCached = Boolean(initialCached?.authUser && !initialCached.authUser.isGuest);
  const isGuestCached = Boolean(initialCached?.authUser?.isGuest);

  const [user, setUser] = useState(() => {
    if (initialCached?.user) return initialCached.user;
    return isAuthUserCached ? freshUserProfile : initialUserProfile;
  });
  const [quests, setQuests] = useState<Quest[]>(() => {
    if (isAuthUserCached) {
      return Array.isArray(initialCached?.quests)
        ? initialCached!.quests.filter((q) => !q.id.startsWith('quest-'))
        : [];
    }
    return initialCached?.quests || initialQuests;
  });
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    if (isAuthUserCached) {
      return Array.isArray(initialCached?.tasks)
        ? initialCached!.tasks.filter((t) => !t.id.startsWith('task-'))
        : [];
    }
    return initialCached?.tasks || initialTasks;
  });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    if (isGuestCached) {
      return initialCached?.calendarEvents || initialCalendarEvents;
    }
    if (isAuthUserCached) {
      const cachedEvts = initialCached?.calendarEvents;
      return Array.isArray(cachedEvts)
        ? cachedEvts.filter((e) => !e.id.startsWith('cal-') && !e.id.startsWith('evt-live-') && !e.id.startsWith('evt-demo-') && !e.id.startsWith('demo-') && !e.id.startsWith('mock-'))
        : [];
    }
    // Authenticated or unknown session during resolution starts strictly with empty array
    return [];
  });
  const [detailedGoals, setDetailedGoals] = useState<DetailedGoal[]>(() => {
    if (isAuthUserCached) {
      const cachedGoals = initialCached?.goals || initialCached?.detailedGoals;
      return Array.isArray(cachedGoals)
        ? cachedGoals.filter((g) => !g.id.startsWith('goal-') && !g.id.startsWith('demo-'))
        : [];
    }
    if (initialCached?.goals) return initialCached.goals;
    if (initialCached?.detailedGoals) return initialCached.detailedGoals;
    return initialGoalsData;
  });
  const [attributes, setAttributes] = useState(() => {
    if (initialCached?.attributes) return initialCached.attributes;
    return isAuthUserCached ? freshAttributes : initialAttributes;
  });
  const [weeklyData, setWeeklyData] = useState(() => {
    if (initialCached?.weeklyData) return initialCached.weeklyData;
    return isAuthUserCached ? freshWeeklyData : weeklyProgressData;
  });
  const [friends, setFriends] = useState<FriendUser[]>(() => {
    if (initialCached?.friends) return initialCached.friends;
    return isAuthUserCached ? [] : leaderboardFriends;
  });
  const [notes, setNotes] = useState<QuickNote[]>(() => {
    if (initialCached?.notes) return initialCached.notes;
    return isAuthUserCached ? [] : initialNotes;
  });
  const deletedNoteIdsRef = useRef<Set<string>>(new Set());
  const [rewards, setRewards] = useState<RewardItem[]>(() => initialCached?.rewards || initialFeaturedRewards);
  const [badges, setBadges] = useState<RewardBadge[]>(() => initialCached?.badges || initialBadges);
  const [collection, setCollection] = useState<CollectionItem[]>(() => {
    if (Array.isArray(initialCached?.collectionItems)) return initialCached.collectionItems;
    if (Array.isArray(initialCached?.collection)) return initialCached.collection;
    if (initialCached?.authUser || isSupabaseConfigured()) return [];
    return initialCollectionItems;
  });
  const lastPointsUpdateTimestampRef = useRef<number>(0);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return isAuthUserCached ? [] : initialNotifications;
  });

  // Notification action handlers
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Modals
  const [isAddQuestOpen, setIsAddQuestOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(2);

  // AI Agent Models Synchronized State
  const [aiAgents, setAiAgents] = useState<AIIntegrationModel[]>(initialAIModels);
  const [isSyncingAI, setIsSyncingAI] = useState(false);
  const [aiLastSyncedTime, setAiLastSyncedTime] = useState<string | null>(null);

  // XP Toast micro-feedback
  const [xpToast, setXpToast] = useState<{ show: boolean; xp: number; attribute: string } | null>(null);

  // Reconcile complete authoritative backend state into React
  const syncFromBackend = (data: BackendState, options?: { allowTaskSync?: boolean; user?: AuthUser | null }) => {
    if (!data) return;
    if (data.user) setUser(data.user);
    // For authenticated users, Supabase is the sole authoritative source for quests/habits and tasks.
    // Never allow unscoped Express state or mutation side-effects to overwrite authenticated habits/tasks.
    const effectiveUser = options?.user !== undefined ? options.user : currentUser;
    const isAuthUser = Boolean(effectiveUser && !effectiveUser.isGuest);
    const shouldSyncQuests = Array.isArray(data.quests) && (!isAuthUser || options?.allowTaskSync);
    if (shouldSyncQuests) {
      const finalQuests = isAuthUser ? data.quests.filter((q) => !q.id.startsWith('quest-')) : data.quests;
      setQuests(finalQuests);
    }

    const shouldSyncTasks = Array.isArray(data.tasks) && (!isAuthUser || options?.allowTaskSync);
    if (shouldSyncTasks) {
      const finalTasks = isAuthUser ? data.tasks.filter((t) => !t.id.startsWith('task-')) : data.tasks;
      setTasks(finalTasks);
    }

    const shouldSyncCalendar = Array.isArray(data.calendarEvents) && (!isAuthUser || options?.allowTaskSync);
    if (shouldSyncCalendar) {
      const rawEvents = data.calendarEvents;
      const filteredEvents = isAuthUser
        ? rawEvents.filter((e) => !e.id.startsWith('cal-') && !e.id.startsWith('evt-live-') && !e.id.startsWith('evt-demo-') && !e.id.startsWith('demo-') && !e.id.startsWith('mock-'))
        : rawEvents;
      setCalendarEvents((prev) => authoritativeReconcileCalendarEvents(prev, filteredEvents, isAuthUser));
    }

    const shouldSyncGoals =
      (Array.isArray(data.goals) || Array.isArray(data.detailedGoals)) &&
      (!isAuthUser || options?.allowTaskSync);
    if (shouldSyncGoals) {
      const rawGoals = Array.isArray(data.goals) ? data.goals : (data.detailedGoals || []);
      const finalGoals = isAuthUser
        ? rawGoals.filter((g) => !g.id.startsWith('goal-') && !g.id.startsWith('demo-'))
        : rawGoals;
      setDetailedGoals(finalGoals);
    }
    if (data.rewards) setRewards(data.rewards);
    if (data.badges) setBadges(data.badges);
    if (data.collection) setCollection(data.collection);
    else if (data.collectionItems) setCollection(data.collectionItems);
    if (data.notes) {
      const finalNotes = isAuthUser ? data.notes.filter((n) => !n.id.startsWith('note-') && !n.id.startsWith('demo-')) : data.notes;
      setNotes(finalNotes);
    }
    if (data.attributes) setAttributes(data.attributes);
    if (data.weeklyData) setWeeklyData(data.weeklyData);
    if (data.aiAgents && data.aiAgents.length > 0) setAiAgents(data.aiAgents);
    if (Array.isArray(data.friends)) {
      const finalFriends = isAuthUser ? data.friends.filter((f) => !f.id.startsWith('friend-')) : data.friends;
      setFriends(finalFriends);
    }
  };

  const handleSyncAIModels = async () => {
    setIsSyncingAI(true);
    try {
      const res = await api.syncAIAgents();
      setAiAgents(res.agents);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAiLastSyncedTime(timeStr);
      return res;
    } catch (err) {
      console.error('Failed to sync AI models:', err);
    } finally {
      setIsSyncingAI(false);
    }
  };

  const handleSelectAIModel = async (agentId: string) => {
    setAiAgents((prev) =>
      prev.map((a) => ({
        ...a,
        selected: a.id === agentId,
      }))
    );
    try {
      const updated = await api.selectAIAgent(agentId);
      setAiAgents(updated);
    } catch (err) {
      console.error('Failed to select AI agent on backend:', err);
    }
  };

  const handleConnectAISubmit = async (
    agentId: string,
    details: any
  ) => {
    try {
      const res = await api.verifyAndConnectAIAgent(agentId, details);
      setAiAgents(res.agents);
    } catch (err) {
      console.error('Failed to verify and connect AI agent:', err);
      throw err;
    }
  };

  const handleDisconnectAI = async (agentId: string) => {
    try {
      const res = await api.disconnectAIAgent(agentId);
      setAiAgents(res.agents);
    } catch (err) {
      console.error('Failed to disconnect AI agent:', err);
    }
  };

  // Auth Action Handlers
  const handleOpenAuth = (screen: AuthScreenType = 'login') => {
    setAuthModalScreen(screen);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = async (authUser: AuthUser, _token: string) => {
    // Gatekeeping: Unverified non-guest users must not access dashboard
    if (!authUser.emailVerified && !authUser.isGuest) {
      handleOpenAuth('verify_email');
      return;
    }

    const cached = getStoredUserCache(authUser.id);
    if (cached) {
      syncFromBackend({
        ...cached,
        claims: cached.claims || [],
        collectionItems: cached.collectionItems || cached.collection || [],
      } as BackendState, { allowTaskSync: true, user: authUser });
    } else {
      // Clean slate for brand-new or uncached user
      const isAuth = !authUser.isGuest;
      setUser(isAuth ? { ...freshUserProfile, name: authUser.fullName || authUser.username || 'Adventurer' } : initialUserProfile);
      setQuests(isAuth ? [] : [...initialQuests]);
      setTasks(isAuth ? [] : [...initialTasks]);
      setDetailedGoals(isAuth ? [] : [...initialGoalsData]);
      setCalendarEvents(isAuth ? [] : [...initialCalendarEvents]);
      setNotes(isAuth ? [] : [...initialNotes]);
      setAttributes(isAuth ? [...freshAttributes] : [...initialAttributes]);
      setWeeklyData(isAuth ? [...freshWeeklyData] : [...weeklyProgressData]);
      setCollection([]);
      setNotifications(isAuth ? [] : [...initialNotifications]);
      setFriends(isAuth ? [] : [...leaderboardFriends]);
      setIsInitialLoading(true);
    }

    setCurrentUser(authUser);
    setShowLandingWelcome(false);
    try {
      const state = await api.getState();
      syncFromBackend(state, { allowTaskSync: true, user: authUser });
    } catch (err) {
      console.warn('Sync state after auth:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    if (currentUser?.id) {
      clearUserCache(currentUser.id);
    } else {
      clearUserCache();
    }
    clearDeletedCalendarEventTracking();
    setCurrentUser(null);
    setUser(freshUserProfile);
    setTasks([]);
    setQuests([]);
    setDetailedGoals([]);
    setCalendarEvents([]);
    setNotes([]);
    setAttributes([...freshAttributes]);
    setWeeklyData([...freshWeeklyData]);
    setNotifications([]);
    setCollection([]);
    setRewards(initialFeaturedRewards);
    setFriends([]);
    setShowLandingWelcome(true);
  };

  // Initial load: fetch authoritative user & state from backend
  useEffect(() => {
    let isMounted = true;

    // 1. Listen to Supabase auth events (email verification callback, sign-in, sign-out)
    let authUnsubscribe: (() => void) | null = null;
    if (isSupabaseConfigured()) {
      const sb = getSupabase();
      if (sb) {
        const { data: authListener } = sb.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;
          if (session?.user) {
            const isEmailVerified = Boolean(session.user.email_confirmed_at);
            const isAnonymous = Boolean(session.user.is_anonymous || session.user.user_metadata?.is_anonymous);

            // Gatekeeping: If user is not anonymous and email is unconfirmed, do not grant dashboard access
            if (!isEmailVerified && !isAnonymous) {
              return;
            }

            let profile: any = null;
            try {
              const { data: p } = await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
              profile = p;
            } catch (e) {
              // ignore
            }
            const authUser = supabaseUserToAuthUser(session.user, profile);
            authUser.emailVerified = isEmailVerified;
            setCurrentUser(authUser);
            setStoredAuthToken(session.access_token);
            setShowLandingWelcome(false);
            setIsAuthModalOpen(false);

            // Clean up verification tokens/code from URL bar and notify user
            if (typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
              setVerifiedBannerMessage('Email successfully verified! Welcome to LifeRPG.');
              window.history.replaceState(null, '', window.location.pathname);
            }
          } else if (event === 'SIGNED_OUT') {
            clearDeletedCalendarEventTracking();
            setCurrentUser(null);
            setStoredAuthToken(null);
            setUser(freshUserProfile);
            setTasks([]);
            setQuests([]);
            setDetailedGoals([]);
            setCalendarEvents([]);
            setNotes([]);
            setAttributes([...freshAttributes]);
            setWeeklyData([...freshWeeklyData]);
            setNotifications([]);
            setCollection([]);
            setRewards(initialFeaturedRewards);
            setFriends([]);
            setShowLandingWelcome(true);
          }
        });
        authUnsubscribe = () => authListener.subscription.unsubscribe();
      }
    }

    const fetchInitialData = async () => {
      try {
        // ONE Consolidated Hydration Pipeline
        try {
          const meRes = await api.getMe();
          if (!isMounted) return;

          if (meRes?.user) {
            if (meRes.user.emailVerified || meRes.user.isGuest) {
              setCurrentUser(meRes.user);
              setShowLandingWelcome(false);
              if (meRes.state) {
                syncFromBackend(meRes.state, { allowTaskSync: true, user: meRes.user });
              }
            } else {
              setCurrentUser(null);
              setShowLandingWelcome(true);
            }
          }
        } catch (err: any) {
          if (!isMounted) return;
          console.warn('Initial session check notice:', err?.message || err);

          // If we have valid cached data for the user, keep it in offline/degraded mode
          const activeUserId = getLastActiveUserId();
          const cached = activeUserId ? getStoredUserCache(activeUserId) : null;
          if (cached?.authUser) {
            setCurrentUser(cached.authUser);
            setShowLandingWelcome(false);
            syncFromBackend({
              ...cached,
              claims: cached.claims || [],
              collectionItems: cached.collectionItems || cached.collection || [],
            } as BackendState, { allowTaskSync: true, user: cached.authUser });
          } else {
            // No session and no valid cache: show landing page
            setCurrentUser(null);
            setShowLandingWelcome(true);
          }
        }
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
      if (authUnsubscribe) authUnsubscribe();
    };
  }, []);

  // Real-time synchronization when Supabase is configured (surgical updates without full refetches)
  useEffect(() => {
    if (!currentUser?.id || !isSupabaseConfigured()) return;
    const channels = [
      subscribeToUserTable(currentUser.id, {
        table: 'habits',
        onInsert: (payload: any) => {
          if (!payload) return;
          const quest = mapHabitRowToQuest(payload, false);
          setQuests((prev) => (prev.some((q) => q.id === quest.id) ? prev : [quest, ...prev]));
        },
        onUpdate: (payload: any) => {
          if (!payload) return;
          setQuests((prev) =>
            prev.map((q) => {
              if (q.id === payload.id) {
                const mapped = mapHabitRowToQuest(payload, q.completed);
                return { ...mapped, completed: q.completed };
              }
              return q;
            })
          );
        },
        onDelete: (payload: any) => {
          if (!payload?.id) return;
          setQuests((prev) => prev.filter((q) => q.id !== payload.id));
        },
      }),
      subscribeToUserTable(currentUser.id, {
        table: 'habit_completions',
        onInsert: (payload: any) => {
          if (!payload?.habit_id) return;
          setQuests((prev) =>
            prev.map((q) => (q.id === payload.habit_id ? { ...q, completed: true } : q))
          );
        },
        onDelete: (payload: any) => {
          if (!payload?.habit_id) return;
          setQuests((prev) =>
            prev.map((q) => (q.id === payload.habit_id ? { ...q, completed: false } : q))
          );
        },
      }),
      subscribeToUserTable(currentUser.id, {
        table: 'profiles',
        filter: `id=eq.${currentUser.id}`,
        onUpdate: (payload: any) => {
          if (!payload) return;
          const payloadTime = payload.updated_at ? new Date(payload.updated_at).getTime() : 0;
          const isStalePoints = payloadTime > 0 && payloadTime < lastPointsUpdateTimestampRef.current;

          setUser((prev) => ({
            ...prev,
            name: payload.display_name || prev.name,
            displayName: payload.display_name || prev.displayName || prev.name,
            username: payload.username || prev.username,
            avatarUrl: payload.avatar_url || prev.avatarUrl,
            bio: payload.bio || prev.bio,
            level: payload.level ?? prev.level,
            currentXp: payload.xp ?? prev.currentXp,
            nextLevelXp: payload.xp_to_next_level ?? prev.nextLevelXp,
            streak: payload.streak_days ?? prev.streak,
            streakDays: payload.streak_days ?? prev.streakDays,
            momentumPoints: isStalePoints ? prev.momentumPoints : (payload.momentum_points ?? prev.momentumPoints),
            totalPoints: isStalePoints ? prev.totalPoints : (payload.momentum_points ?? prev.totalPoints),
          }));
        },
      }),
      subscribeToUserTable(currentUser.id, {
        table: 'tasks',
        onInsert: (payload: any) => {
          if (!payload) return;
          const task = mapTaskRowToTaskItem(payload);
          if (task.clientTempId) {
            tempIdToRealUuidMap.current.set(task.clientTempId, task.id);
          }
          setTasks((prev) => {
            // 1. If this exact database UUID already exists, do not duplicate
            if (prev.some((t) => t.id === task.id)) return prev;

            // 2. If an optimistic task exists with this clientTempId, replace in-place
            if (task.clientTempId && prev.some((t) => t.id === task.clientTempId || t.clientTempId === task.clientTempId)) {
              return prev.map((t) =>
                (t.id === task.clientTempId || t.clientTempId === task.clientTempId) ? task : t
              );
            }

            // 3. Otherwise it is a genuinely new task from another tab or device
            return [task, ...prev];
          });
        },
        onUpdate: (payload: any) => {
          if (!payload) return;
          const task = mapTaskRowToTaskItem(payload);
          if (task.clientTempId) {
            tempIdToRealUuidMap.current.set(task.clientTempId, task.id);
          }
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id || (task.clientTempId && (t.id === task.clientTempId || t.clientTempId === task.clientTempId))
                ? task
                : t
            )
          );
        },
        onDelete: (payload: any) => {
          if (!payload?.id) return;
          setTasks((prev) => prev.filter((t) => t.id !== payload.id));
        },
      }),
      subscribeToUserTable(currentUser.id, {
        table: 'notifications',
        onInsert: (newNotif: any) => {
          if (newNotif) {
            setNotifications((prev) => [newNotif, ...prev]);
          }
        },
      }),
      subscribeToUserTable(currentUser.id, {
        table: 'reward_claims',
        onInsert: (payload: any) => {
          if (!payload?.reward_id) return;
          setRewards((prevRewards) => {
            const target = prevRewards.find((r) => r.id === payload.reward_id);
            const category = target?.category;
            const updated = prevRewards.map((r) => {
              if (r.id === payload.reward_id) {
                return { ...r, status: payload.is_active ? ('active' as const) : ('owned' as const) };
              }
              if (payload.is_active && category && r.category === category && r.status === 'active') {
                return { ...r, status: 'owned' as const };
              }
              return r;
            });

            setCollection((prevCol) => {
              if (prevCol.some((c) => c.id === payload.id)) {
                return prevCol.map((c) =>
                  c.id === payload.id ? { ...c, active: Boolean(payload.is_active) } : c
                );
              }
              return [
                {
                  id: payload.id,
                  name: target?.name || 'Reward Item',
                  type: (target?.badgeTag as any) || 'Theme',
                  icon: target?.previewType || 'star',
                  active: Boolean(payload.is_active),
                },
                ...prevCol,
              ];
            });

            return updated;
          });
        },
        onUpdate: (payload: any) => {
          if (!payload?.reward_id) return;
          setRewards((prevRewards) => {
            const target = prevRewards.find((r) => r.id === payload.reward_id);
            const category = target?.category;
            return prevRewards.map((r) => {
              if (r.id === payload.reward_id) {
                return { ...r, status: payload.is_active ? ('active' as const) : ('owned' as const) };
              }
              if (payload.is_active && category && r.category === category && r.status === 'active') {
                return { ...r, status: 'owned' as const };
              }
              return r;
            });
          });
          setCollection((prevCol) =>
            prevCol.map((c) =>
              c.id === payload.id ? { ...c, active: Boolean(payload.is_active) } : c
            )
          );
        },
        onDelete: (payload: any) => {
          if (!payload) return;
          const claimId = payload.id;
          const rewardId = payload.reward_id;

          setCollection((prevCol) => prevCol.filter((c) => c.id !== claimId));

          if (rewardId) {
            setRewards((prevRewards) =>
              prevRewards.map((r) => {
                if (r.id === rewardId) {
                  return { ...r, status: 'available' as const };
                }
                return r;
              })
            );
          }
        },
      }),
      subscribeToUserTable(currentUser.id, {
        table: 'goals',
        onInsert: (payload: any) => {
          if (!payload?.id) return;
          fetchSingleGoalFromSupabase(currentUser.id, payload.id).then((freshGoal) => {
            if (freshGoal) {
              setDetailedGoals((prev) =>
                prev.some((g) => g.id === freshGoal.id)
                  ? prev.map((g) => (g.id === freshGoal.id ? freshGoal : g))
                  : [freshGoal, ...prev]
              );
            }
          });
        },
        onUpdate: (payload: any) => {
          if (!payload?.id) return;
          fetchSingleGoalFromSupabase(currentUser.id, payload.id).then((freshGoal) => {
            if (freshGoal) {
              setDetailedGoals((prev) =>
                prev.map((g) => (g.id === freshGoal.id ? freshGoal : g))
              );
            }
          });
        },
        onDelete: (payload: any) => {
          if (!payload?.id) return;
          setDetailedGoals((prev) => prev.filter((g) => g.id !== payload.id));
        },
      }),
      subscribeToUserTable(currentUser.id, {
        table: 'goal_milestones',
        onInsert: (payload: any) => {
          if (!payload?.goal_id) return;
          fetchSingleGoalFromSupabase(currentUser.id, payload.goal_id).then((freshGoal) => {
            if (freshGoal) {
              setDetailedGoals((prev) =>
                prev.map((g) => (g.id === freshGoal.id ? freshGoal : g))
              );
            }
          });
        },
        onUpdate: (payload: any) => {
          if (!payload?.goal_id) return;
          fetchSingleGoalFromSupabase(currentUser.id, payload.goal_id).then((freshGoal) => {
            if (freshGoal) {
              setDetailedGoals((prev) =>
                prev.map((g) => (g.id === freshGoal.id ? freshGoal : g))
              );
            }
          });
        },
        onDelete: (payload: any) => {
          if (!payload?.goal_id) return;
          fetchSingleGoalFromSupabase(currentUser.id, payload.goal_id).then((freshGoal) => {
            if (freshGoal) {
              setDetailedGoals((prev) =>
                prev.map((g) => (g.id === freshGoal.id ? freshGoal : g))
              );
            }
          });
        },
      }),
      subscribeToUserTable(currentUser.id, {
        table: 'calendar_events',
        onInsert: (payload: any) => {
          if (!payload?.id) return;
          if (isCalendarEventDeleted(payload.id)) return;
          const mappedEvent = mapCalendarRowToCalendarEvent(payload);
          setCalendarEvents((prev) => reconcileCalendarEvents(prev, [mappedEvent]));
        },
        onUpdate: (payload: any) => {
          if (!payload?.id) return;
          if (isCalendarEventDeleted(payload.id)) return;
          const mappedEvent = mapCalendarRowToCalendarEvent(payload);
          setCalendarEvents((prev) => reconcileCalendarEvents(prev, [mappedEvent]));
        },
        onDelete: (payload: any) => {
          if (!payload?.id) return;
          markCalendarEventDeleted(payload.id);
          setCalendarEvents((prev) => prev.filter((e) => e.id !== payload.id));
        },
      }),
      subscribeToUserTable(currentUser.id, {
        table: 'quick_notes',
        onInsert: (payload: any) => {
          if (!payload?.id) return;
          if (deletedNoteIdsRef.current.has(payload.id)) return;
          const mappedNote = mapQuickNoteRowToQuickNote(payload);
          setNotes((prev) => {
            if (prev.some((n) => n.id === mappedNote.id)) return prev;
            return [mappedNote, ...prev];
          });
        },
        onUpdate: (payload: any) => {
          if (!payload?.id) return;
          if (deletedNoteIdsRef.current.has(payload.id)) return;
          const mappedNote = mapQuickNoteRowToQuickNote(payload);
          setNotes((prev) => prev.map((n) => (n.id === mappedNote.id ? mappedNote : n)));
        },
        onDelete: (payload: any) => {
          if (!payload?.id) return;
          deletedNoteIdsRef.current.add(payload.id);
          setNotes((prev) => prev.filter((n) => n.id !== payload.id));
        },
      }),
    ];

    return () => {
      channels.forEach((ch) => ch?.unsubscribe());
    };
  }, [currentUser?.id]);

  // Handle updating appearance (theme, accent color, interface density, motion)
  const handleUpdateAppearance = (newSettings: Partial<AppearanceSettingsType>) => {
    setAppearance((prev) => {
      const next = { ...prev, ...newSettings };
      applyAppearanceToDOM(next);
      if (next.theme === 'dark') {
        setIsDark(true);
      } else if (next.theme === 'light') {
        setIsDark(false);
      } else if (typeof window !== 'undefined') {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
      return next;
    });
  };

  // Toggle theme directly from header buttons with automatic DOM, state & storage sync
  const handleToggleTheme = (dark: boolean) => {
    setIsDark(dark);
    handleUpdateAppearance({ theme: dark ? 'dark' : 'light' });
  };

  // Synchronize initial appearance and handle system theme updates
  useEffect(() => {
    applyAppearanceToDOM(appearance);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const current = getStoredAppearance();
      if (current.theme === 'system') {
        setIsDark(e.matches);
        applyAppearanceToDOM({ ...current, theme: 'system' });
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Synchronize dark mode class to html document and body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      body?.classList.add('dark');
      body?.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      body?.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body?.classList.remove('dark');
      body?.classList.add('light');
      root.setAttribute('data-theme', 'light');
      body?.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [isDark]);

  // Keyboard shortcut ⌘K / Ctrl+K focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize Home GoalsSection directly from detailedGoals
  const homeGoals: Goal[] = useMemo(() => {
    return detailedGoals.map((dg) => {
      let category: Goal['category'] = 'education';
      let iconType: Goal['iconType'] = 'target';
      const catLower = dg.category.toLowerCase();
      if (catLower.includes('career')) {
        category = 'career';
        iconType = 'target';
      } else if (catLower.includes('health')) {
        category = 'health';
        iconType = 'dumbbell';
      } else if (catLower.includes('education') || catLower.includes('learn')) {
        category = 'education';
        iconType = 'book';
      }
      return {
        id: dg.id,
        title: dg.title,
        progressPercent: dg.progress,
        completedUnits: dg.completedTasks,
        totalUnits: Math.max(1, dg.totalTasks),
        unitLabel: dg.category === 'Career' ? 'problems' : dg.category === 'Health' ? 'workouts' : 'milestones',
        category,
        iconType,
        color: dg.color || '#6366F1',
      };
    });
  }, [detailedGoals]);

  // Concurrency lock refs: prevent duplicate in-flight mutations for the same habit/task
  const pendingQuestTogglesRef = useRef<Set<string>>(new Set());
  const pendingTaskTogglesRef = useRef<Set<string>>(new Set());
  const pendingCreationPromisesRef = useRef<Map<string, Promise<TaskItem>>>(new Map());
  const tempIdToRealUuidMap = useRef<Map<string, string>>(new Map());
  const calendarTempIdToRealUuidMap = useRef<Map<string, string>>(new Map());
  const pendingCalendarCreationPromisesRef = useRef<Map<string, Promise<CalendarEvent>>>(new Map());

  // Handle Quest Complete / Toggle (Home)
  const handleToggleQuestComplete = async (questId: string) => {
    // 0. Concurrency guard: Ignore repeated clicks while mutation is already pending for this habit
    if (pendingQuestTogglesRef.current.has(questId)) return;

    const target = quests.find((q) => q.id === questId);
    if (!target) return;

    pendingQuestTogglesRef.current.add(questId);
    const isNowCompleted = !target.completed;
    const xpChange = isNowCompleted ? target.xpReward : -target.xpReward;

    // 1. Optimistic update
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: isNowCompleted } : q))
    );

    setUser((prevUser) => {
      const prog = calculateProgressionDelta(prevUser, xpChange, xpChange);
      if (prog.level > prevUser.level) {
        setLevelUpLevel(prog.level);
        setIsLevelUpOpen(true);
      }

      return {
        ...prevUser,
        ...prog,
        questsDoneThisWeek: isNowCompleted
          ? (prevUser.questsDoneThisWeek ?? 0) + 1
          : Math.max(0, (prevUser.questsDoneThisWeek ?? 0) - 1),
      };
    });

    if (isNowCompleted) {
      setXpToast({
        show: true,
        xp: target.xpReward,
        attribute: target.attribute,
      });
      setTimeout(() => setXpToast(null), 2400);
    }

    // 2. Authoritative backend transaction
    try {
      const res = await api.toggleQuest(questId, isNowCompleted);
      if (res.quest) {
        setQuests((prev) => prev.map((q) => (q.id === questId ? res.quest : q)));
      }
      if (res.userProgression) {
        setUser((prev) => ({
          ...prev,
          ...res.userProgression,
          totalPoints: res.userProgression?.momentumPoints ?? res.userProgression?.totalPoints ?? prev.totalPoints,
          momentumPoints: res.userProgression?.momentumPoints ?? res.userProgression?.totalPoints ?? prev.momentumPoints,
        }));
      }
      if (res.state) syncFromBackend(res.state);
    } catch (err: any) {
      console.error('Quest toggle backend error:', err);
      // Revert optimistic state with surgical delta rollback ONLY for this failing mutation
      setQuests((prev) => prev.map((q) => (q.id === questId ? { ...q, completed: !isNowCompleted } : q)));
      setUser((prevUser) => calculateProgressionDelta(prevUser, -xpChange, -xpChange));
      setVerifiedBannerMessage(`Failed to update habit: ${err?.message || 'Database error'}`);
    } finally {
      pendingQuestTogglesRef.current.delete(questId);
    }
  };

  // Add new quest handler
  const handleAddQuest = async (newQuestData: Omit<Quest, 'id' | 'completed'>) => {
    const optimisticQuest: Quest = {
      id: `quest-${Date.now()}`,
      ...newQuestData,
      completed: false,
    };
    setQuests((prev) => [optimisticQuest, ...prev]);

    try {
      const res = await api.addQuest(newQuestData);
      if (res.quest) {
        setQuests((prev) => prev.map((q) => (q.id === optimisticQuest.id ? res.quest : q)));
      }
      if (res.state) syncFromBackend(res.state);
    } catch (err: any) {
      console.error('Add quest error:', err);
      setQuests((prev) => prev.filter((q) => q.id !== optimisticQuest.id));
      setVerifiedBannerMessage(`Failed to create habit: ${err?.message || 'Database error'}`);
    }
  };

  // Add new goal handler (Home modal)
  const handleAddGoal = async (newGoal: Goal) => {
    const detailedGoalData: Omit<DetailedGoal, 'id'> = {
      title: newGoal.title,
      category: (newGoal.category.charAt(0).toUpperCase() + newGoal.category.slice(1)) as any,
      description: `Target: complete ${newGoal.totalUnits} ${newGoal.unitLabel} with consistency.`,
      progress: newGoal.progressPercent || 0,
      completedTasks: newGoal.completedUnits || 0,
      totalTasks: newGoal.totalUnits || 5,
      dueDate: formatReadableDate(addDaysISO(getLiveTodayISO(), 30)),
      priority: 'medium',
      status: 'active',
      color: newGoal.color || '#6366F1',
      icon: newGoal.iconType === 'dumbbell' ? 'heart' : newGoal.iconType === 'book' ? 'book' : 'target',
      milestones: [
        { id: `m-${Date.now()}-1`, title: `Kickoff & preparation for ${newGoal.title}`, targetDate: 'In 2 weeks', completed: false },
        { id: `m-${Date.now()}-2`, title: `Completion milestone for ${newGoal.title}`, targetDate: 'In 1 month', completed: false },
      ],
      subtasks: [],
    };
    await handleAddDetailedGoal(detailedGoalData);
  };

  // Add new note handler
  const handleAddNote = async (newNote: QuickNote) => {
    const previousNotes = notes;
    setNotes((prev) => [newNote, ...prev.filter((n) => n.id !== newNote.id)]);
    try {
      const res = await api.addNote(newNote);
      if (res.note) {
        // Replace optimistic temp ID with database-persisted note
        setNotes((prev) => prev.map((n) => (n.id === newNote.id ? res.note : n)));
      }
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Add note error:', err);
      // Rollback optimistic addition
      setNotes(previousNotes);
    }
  };

  // Delete note handler
  const handleDeleteNote = async (noteId: string) => {
    deletedNoteIdsRef.current.add(noteId);
    const previousNotes = notes;
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      const res = await api.deleteNote(noteId);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Delete note error:', err);
      deletedNoteIdsRef.current.delete(noteId);
      setNotes(previousNotes);
    }
  };

  // Task Handlers for TasksPage
  const handleToggleTaskComplete = async (taskId: string) => {
    // 0. Concurrency guard: Ignore repeated clicks while mutation is already pending for this task
    if (pendingTaskTogglesRef.current.has(taskId)) return;

    // Resolve real UUID if taskId was a temporary ID
    let targetDbId = tempIdToRealUuidMap.current.get(taskId) || taskId;
    if (pendingCreationPromisesRef.current.has(taskId)) {
      try {
        const createdTask = await pendingCreationPromisesRef.current.get(taskId);
        if (createdTask?.id) {
          targetDbId = createdTask.id;
        }
      } catch {
        return; // Creation failed, abort toggle
      }
    }

    const target = tasks.find((t) => t.id === taskId || t.id === targetDbId);
    if (!target) return;

    pendingTaskTogglesRef.current.add(taskId);
    if (targetDbId !== taskId) pendingTaskTogglesRef.current.add(targetDbId);

    const isNowCompleted = !target.completed;
    const xpReward = target.xpReward || 15;
    const xpChange = isNowCompleted ? xpReward : -xpReward;

    // 1. Optimistic UI updates
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId || t.id === targetDbId ? { ...t, completed: isNowCompleted } : t))
    );

    setUser((prevUser) => {
      const prog = calculateProgressionDelta(prevUser, xpChange, xpChange);
      if (prog.level > prevUser.level) {
        setLevelUpLevel(prog.level);
        setIsLevelUpOpen(true);
      }

      return {
        ...prevUser,
        ...prog,
      };
    });

    if (isNowCompleted) {
      setXpToast({
        show: true,
        xp: xpReward,
        attribute: target.labels[0] || 'Discipline',
      });
      setTimeout(() => setXpToast(null), 2400);
    }

    // 2. Authoritative backend sync (cross-syncs tasks, quests, calendar & goals)
    try {
      const res = await api.toggleTask(targetDbId, isNowCompleted);
      if (res.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId || t.id === targetDbId || t.id === res.task.id ? res.task : t))
        );
      }
      if (res.userProgression) {
        setUser((prev) => ({
          ...prev,
          ...res.userProgression,
          totalPoints: res.userProgression?.momentumPoints ?? res.userProgression?.totalPoints ?? prev.totalPoints,
          momentumPoints: res.userProgression?.momentumPoints ?? res.userProgression?.totalPoints ?? prev.momentumPoints,
        }));
      }
      if (res.state) syncFromBackend(res.state);
    } catch (err: any) {
      console.error('Task toggle backend error:', err);
      // Revert optimistic state with surgical delta rollback ONLY for this failing mutation
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId || t.id === targetDbId ? { ...t, completed: !isNowCompleted } : t))
      );
      setUser((prevUser) => calculateProgressionDelta(prevUser, -xpChange, -xpChange));
      setVerifiedBannerMessage(`Failed to update task: ${err?.message || 'Database error'}`);
    } finally {
      pendingTaskTogglesRef.current.delete(taskId);
      pendingTaskTogglesRef.current.delete(targetDbId);
    }
  };

  const handleAddTask = async (newTaskData: Omit<TaskItem, 'id'>) => {
    const localToday = getTodayISO();
    const clientTempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const taskWithClientDate: Omit<TaskItem, 'id'> = {
      ...newTaskData,
      clientTempId,
      clientDate: newTaskData.clientDate || localToday,
      dueDate: newTaskData.dueDate || (newTaskData.dueText?.toLowerCase().includes('tomorrow')
        ? addDaysISO(localToday, 1)
        : newTaskData.dueText?.toLowerCase().includes('next week')
        ? addDaysISO(localToday, 7)
        : localToday),
    };

    const optimisticTask: TaskItem = {
      id: clientTempId,
      ...taskWithClientDate,
    };
    setTasks((prev) => [optimisticTask, ...prev]);

    const addPromise = (async () => {
      const res = await api.addTask(taskWithClientDate);
      const realTask = res.task;
      if (realTask) {
        tempIdToRealUuidMap.current.set(clientTempId, realTask.id);
        setTasks((prev) => {
          const alreadyHasReal = prev.some((t) => t.id === realTask.id);
          if (alreadyHasReal) {
            return prev.filter((t) => t.id !== clientTempId);
          }
          return prev.map((t) => (t.id === clientTempId ? realTask : t));
        });
      }
      if (res.state) syncFromBackend(res.state);
      return realTask;
    })();

    pendingCreationPromisesRef.current.set(clientTempId, addPromise);

    try {
      await addPromise;
    } catch (err: any) {
      console.error('Add task error:', err);
      setTasks((prev) => prev.filter((t) => t.id !== clientTempId));
      setVerifiedBannerMessage(`Failed to create task: ${err?.message || 'Database error'}`);
    } finally {
      pendingCreationPromisesRef.current.delete(clientTempId);
    }
  };

  const handleUpdateTask = async (updatedTask: TaskItem) => {
    let effectiveTask = { ...updatedTask };
    if (pendingCreationPromisesRef.current.has(updatedTask.id)) {
      try {
        const created = await pendingCreationPromisesRef.current.get(updatedTask.id);
        if (created?.id) effectiveTask.id = created.id;
      } catch {
        return;
      }
    } else if (tempIdToRealUuidMap.current.has(updatedTask.id)) {
      effectiveTask.id = tempIdToRealUuidMap.current.get(updatedTask.id)!;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id || t.id === effectiveTask.id ? effectiveTask : t))
    );
    try {
      const res = await api.updateTask(effectiveTask);
      if (res.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id || t.id === effectiveTask.id ? res.task : t))
        );
      }
      if (res.state) syncFromBackend(res.state);
    } catch (err: any) {
      console.error('Update task error:', err);
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id || t.id === effectiveTask.id ? updatedTask : t))
      );
      setVerifiedBannerMessage(`Failed to save task: ${err?.message || 'Database error'}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    let effectiveTaskId = taskId;
    if (pendingCreationPromisesRef.current.has(taskId)) {
      try {
        const created = await pendingCreationPromisesRef.current.get(taskId);
        if (created?.id) effectiveTaskId = created.id;
      } catch {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        return;
      }
    } else if (tempIdToRealUuidMap.current.has(taskId)) {
      effectiveTaskId = tempIdToRealUuidMap.current.get(taskId)!;
    }

    setTasks((prev) => prev.filter((t) => t.id !== taskId && t.id !== effectiveTaskId));
    try {
      const res = await api.deleteTask(effectiveTaskId);
      if (res.state) syncFromBackend(res.state);
    } catch (err: any) {
      console.error('Delete task error:', err);
      setVerifiedBannerMessage(`Failed to delete task: ${err?.message || 'Database error'}`);
    }
  };

  // Calendar Handlers
  const handleAddCalendarEvent = async (newEventData: Omit<CalendarEvent, 'id'> & { id?: string }) => {
    const isProvidedUUID = Boolean(newEventData.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newEventData.id));
    const eventId = newEventData.id || `evt-${Date.now()}`;
    const optimisticEvent: CalendarEvent = {
      ...newEventData,
      id: eventId,
    };

    setCalendarEvents((prev) => {
      if (prev.some(e => e.id === eventId || (e.title === newEventData.title && e.date === newEventData.date && e.startTime === newEventData.startTime))) {
        return prev;
      }
      return [optimisticEvent, ...prev];
    });

    const addPromise = (async () => {
      const res = await enqueueCalendarMutation(eventId, async () => {
        return await api.addCalendarEvent(newEventData);
      });
      const realEvent = res.event;
      if (realEvent) {
        if (!isProvidedUUID) {
          calendarTempIdToRealUuidMap.current.set(eventId, realEvent.id);
        }
        setCalendarEvents((prev) => {
          const alreadyHasReal = prev.some((e) => e.id === realEvent.id);
          if (alreadyHasReal) {
            return prev.filter((e) => e.id !== eventId);
          }
          return prev.map((e) => (e.id === eventId ? realEvent : e));
        });
      }
      if (res.state) syncFromBackend(res.state);
      return realEvent;
    })();

    pendingCalendarCreationPromisesRef.current.set(eventId, addPromise);

    try {
      await addPromise;
    } catch (err: any) {
      console.error('Add calendar event error:', err);
      setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
      setVerifiedBannerMessage(`Failed to create calendar event: ${err?.message || 'Database error'}`);
    } finally {
      pendingCalendarCreationPromisesRef.current.delete(eventId);
    }
  };

  const handleUpdateCalendarEvent = async (updatedEvent: CalendarEvent) => {
    let effectiveEvent = { ...updatedEvent };
    if (pendingCalendarCreationPromisesRef.current.has(updatedEvent.id)) {
      try {
        const created = await pendingCalendarCreationPromisesRef.current.get(updatedEvent.id);
        if (created?.id) effectiveEvent.id = created.id;
      } catch {
        return;
      }
    } else if (calendarTempIdToRealUuidMap.current.has(updatedEvent.id)) {
      effectiveEvent.id = calendarTempIdToRealUuidMap.current.get(updatedEvent.id)!;
    }

    const previousEvents = calendarEvents;
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id || e.id === effectiveEvent.id ? effectiveEvent : e))
    );

    try {
      const res = await enqueueCalendarMutation(effectiveEvent.id, async () => {
        return await api.updateCalendarEvent(effectiveEvent);
      });
      if (res.event) {
        setCalendarEvents((prev) =>
          prev.map((e) => (e.id === updatedEvent.id || e.id === effectiveEvent.id ? res.event! : e))
        );
      }
      if (res.state) syncFromBackend(res.state);
    } catch (err: any) {
      console.error('Update calendar event error:', err);
      setCalendarEvents(previousEvents);
      setVerifiedBannerMessage(`Failed to update calendar event: ${err?.message || 'Database error'}`);
    }
  };

  const handleDeleteCalendarEvent = async (eventId: string) => {
    let effectiveEventId = eventId;
    if (pendingCalendarCreationPromisesRef.current.has(eventId)) {
      try {
        const created = await pendingCalendarCreationPromisesRef.current.get(eventId);
        if (created?.id) effectiveEventId = created.id;
      } catch {
        return;
      }
    } else if (calendarTempIdToRealUuidMap.current.has(eventId)) {
      effectiveEventId = calendarTempIdToRealUuidMap.current.get(eventId)!;
    }

    markCalendarEventDeleted(eventId);
    if (effectiveEventId !== eventId) {
      markCalendarEventDeleted(effectiveEventId);
    }

    const previousEvents = calendarEvents;
    setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId && e.id !== effectiveEventId));

    try {
      const res = await enqueueCalendarMutation(effectiveEventId, async () => {
        return await api.deleteCalendarEvent(effectiveEventId);
      });
      if (res.state) syncFromBackend(res.state);
    } catch (err: any) {
      console.error('Delete calendar event error:', err);
      setCalendarEvents(previousEvents);
      setVerifiedBannerMessage(`Failed to delete calendar event: ${err?.message || 'Database error'}`);
    }
  };

  // Detailed Goals Handlers
  const handleAddDetailedGoal = async (newGoalData: Omit<DetailedGoal, 'id'>) => {
    const tempId = `temp-goal-${Date.now()}`;
    const optimisticGoal: DetailedGoal = {
      ...newGoalData,
      id: tempId,
      updatedAt: getLiveTodayISO(),
    };
    setDetailedGoals((prev) => [optimisticGoal, ...prev]);

    setXpToast({ show: true, xp: 50, attribute: newGoalData.category });
    setTimeout(() => setXpToast(null), 3000);

    try {
      const res = await api.addGoal(newGoalData);
      if (res.goal) {
        setDetailedGoals((prev) =>
          prev.map((g) => (g.id === tempId ? res.goal : g))
        );
      } else if (res.state) {
        syncFromBackend(res.state, { allowTaskSync: true });
      }
    } catch (err) {
      console.error('Add goal error:', err);
      setDetailedGoals((prev) => prev.filter((g) => g.id !== tempId));
    }
  };

  const handleUpdateDetailedGoal = async (updatedGoal: DetailedGoal) => {
    const previous = detailedGoals.find((g) => g.id === updatedGoal.id);
    setDetailedGoals((prev) =>
      prev.map((g) =>
        g.id === updatedGoal.id
          ? { ...updatedGoal, updatedAt: getLiveTodayISO() }
          : g
      )
    );
    try {
      const res = await api.updateGoal(updatedGoal);
      if (res.goal) {
        setDetailedGoals((prev) =>
          prev.map((g) => (g.id === res.goal.id ? res.goal : g))
        );
      } else if (res.state) {
        syncFromBackend(res.state, { allowTaskSync: true });
      }
    } catch (err) {
      console.error('Update goal error:', err);
      if (previous) {
        setDetailedGoals((prev) =>
          prev.map((g) => (g.id === previous.id ? previous : g))
        );
      }
    }
  };

  const handleDeleteDetailedGoal = async (goalId: string) => {
    const previous = detailedGoals.find((g) => g.id === goalId);
    setDetailedGoals((prev) => prev.filter((g) => g.id !== goalId));
    try {
      const res = await api.deleteGoal(goalId);
      if (res.state) syncFromBackend(res.state, { allowTaskSync: true });
    } catch (err) {
      console.error('Delete goal error:', err);
      if (previous) {
        setDetailedGoals((prev) => [previous, ...prev]);
      }
    }
  };

  const handleToggleGoalSubtask = async (goalId: string, subtaskId: string) => {
    const target = detailedGoals.find((g) => g.id === goalId);
    if (!target) return;

    const updatedSubtasks = (target.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const metrics = calculateGoalMetrics({ ...target, subtasks: updatedSubtasks });
    const optimistic: DetailedGoal = { ...target, subtasks: updatedSubtasks, ...metrics };
    setDetailedGoals((prev) => prev.map((g) => (g.id === goalId ? optimistic : g)));

    try {
      const res = await api.toggleGoalSubtask(goalId, subtaskId);
      if (res.goal) {
        setDetailedGoals((prev) => prev.map((g) => (g.id === res.goal.id ? res.goal : g)));
      } else if (res.state) {
        syncFromBackend(res.state, { allowTaskSync: true });
      }
    } catch (err) {
      console.error('Toggle goal subtask error:', err);
      setDetailedGoals((prev) => prev.map((g) => (g.id === goalId ? target : g)));
    }
  };

  // Rewards Claim & Activate Handlers
  const handleClaimReward = async (rewardId: string, termsAccepted: boolean) => {
    const res = await api.claimReward(rewardId, termsAccepted);
    if (res.state) {
      syncFromBackend(res.state);
    } else {
      const target = rewards.find((r) => r.id === rewardId) || res.reward;
      const category = target?.category;
      setRewards((prev) =>
        prev.map((r) => {
          if (r.id === rewardId) return { ...r, status: 'active' as const };
          if (category && r.category === category && r.status === 'active') {
            return { ...r, status: 'owned' as const };
          }
          return r;
        })
      );
      if (res.claim) {
        setCollection((prev) => {
          const itemExists = prev.some((c) => c.id === res.claim.id);
          const updated = prev.map((c) => {
            if (category && target?.badgeTag && c.type === target.badgeTag) {
              return { ...c, active: false };
            }
            return c;
          });
          if (!itemExists && target) {
            return [
              {
                id: res.claim.id || `claim-${Date.now()}`,
                name: target.name,
                type: (target.badgeTag as any) || 'Theme',
                icon: target.previewType || 'star',
                active: true,
              },
              ...updated,
            ];
          }
          return updated.map((c) =>
            c.id === res.claim.id ? { ...c, active: true } : c
          );
        });
      }
      if (typeof res.remainingPoints === 'number') {
        lastPointsUpdateTimestampRef.current = Date.now();
        setUser((prev) => ({
          ...prev,
          momentumPoints: res.remainingPoints!,
          totalPoints: res.remainingPoints!,
        }));
      } else if (target?.cost) {
        lastPointsUpdateTimestampRef.current = Date.now();
        setUser((prev) => ({
          ...prev,
          momentumPoints: Math.max(0, (prev.momentumPoints ?? prev.totalPoints ?? 0) - target.cost),
          totalPoints: Math.max(0, (prev.totalPoints ?? prev.momentumPoints ?? 0) - target.cost),
        }));
      }
    }
    return res;
  };

  const handleActivateReward = async (rewardId: string) => {
    const res = await api.activateReward(rewardId);
    if (res.state) {
      syncFromBackend(res.state);
    } else {
      const target = rewards.find((r) => r.id === rewardId);
      const category = target?.category;
      setRewards((prev) =>
        prev.map((r) => {
          if (r.id === rewardId) return { ...r, status: 'active' as const };
          if (category && r.category === category && r.status === 'active') {
            return { ...r, status: 'owned' as const };
          }
          return r;
        })
      );
      setCollection((prev) =>
        prev.map((c) => {
          if (target && c.name === target.name) return { ...c, active: true };
          if (category && target?.badgeTag && c.type === target.badgeTag) {
            return { ...c, active: false };
          }
          return c;
        })
      );
    }
    return res;
  };

  // User Profile Update Handler (Avatar photo change, name, bio)
  const handleUpdateUserProfile = async (updated: Partial<UserSettingsProfile>) => {
    const previousCurrentUser = currentUser;
    const previousUser = { ...user };

    // 1. Immediately update currentUser state for Header, Sidebar, and Account views
    setCurrentUser((prev) => {
      if (!prev) {
        return {
          id: 'user-alex-default',
          email: updated.email || 'alex.das@gmail.com',
          username: updated.username || 'alex',
          fullName: updated.displayName || 'Alex Das',
          avatarUrl:
            updated.avatarUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          timezone: 'America/Los_Angeles',
          locale: 'en-US',
          isGuest: false,
          emailVerified: true,
          createdAt: new Date().toISOString(),
        };
      }
      return {
        ...prev,
        fullName: updated.displayName !== undefined ? updated.displayName : prev.fullName,
        username: updated.username !== undefined ? updated.username : prev.username,
        avatarUrl: updated.avatarUrl !== undefined ? updated.avatarUrl : prev.avatarUrl,
      };
    });

    // 2. Immediately update in-game user state
    setUser((prev) => ({
      ...prev,
      name: updated.displayName !== undefined ? updated.displayName : prev.name,
      avatarUrl: updated.avatarUrl !== undefined ? updated.avatarUrl : prev.avatarUrl,
      bio: updated.bio !== undefined ? updated.bio : prev.bio,
    }));

    // 3. Persist avatar to localStorage for instant reload cache
    if (updated.avatarUrl) {
      try {
        localStorage.setItem('liferpg_user_avatar', updated.avatarUrl);
      } catch (e) {
        console.warn('LocalStorage save avatar warning:', e);
      }
    }

    // 4. Persist to authoritative backend
    try {
      const res = await api.updateUserProfile({
        avatarUrl: updated.avatarUrl,
        displayName: updated.displayName,
        username: updated.username,
        bio: updated.bio,
      });
      if (res.state) {
        syncFromBackend(res.state);
      }
    } catch (err: any) {
      console.warn('Backend profile sync note:', err);
      setCurrentUser(previousCurrentUser);
      setUser(previousUser);
      setVerifiedBannerMessage(`Failed to update profile: ${err?.message || 'Database error'}`);
    }
  };

  // Render global visual skeleton overlay while authoritative state is being fetched
  if (isInitialLoading) {
    return <AppLoadingOverlay />;
  }

  return (
    <div className={`min-h-screen flex bg-[#F8FAFC] text-slate-900 dark:bg-[#08090B] dark:text-[#F5F7FF] font-sans transition-colors duration-200 relative`}>
      {/* Accessible Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#7C6CFF] focus:text-white focus:rounded-xl focus:shadow-xl focus:text-sm focus:font-semibold focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Full-screen Landing Welcome View if user logged out or requests landing */}
      {showLandingWelcome ? (
        <div className="flex-1 w-full min-h-screen">
          <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6"><LoadingSkeleton type="card" count={2} /></div>}>
            <LandingWelcomePage
              onOpenLogin={() => handleOpenAuth('login')}
              onOpenSignUp={() => handleOpenAuth('signup')}
              onContinueAsGuest={() => handleOpenAuth('guest_prompt')}
              onDirectExplore={() => setShowLandingWelcome(false)}
            />
          </React.Suspense>
        </div>
      ) : (
        <>
          {/* Desktop Sidebar (hidden on screens < 1024px) */}
          <div className="hidden lg:block shrink-0">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={handleNavigateTab}
              isDark={isDark}
              setIsDark={handleToggleTheme}
              themeMode={appearance.theme}
              onSetThemeMode={(mode) => handleUpdateAppearance({ theme: mode })}
              userLevel={user.level}
              currentUser={currentUser}
              momentumPoints={user.momentumPoints ?? user.totalPoints ?? 0}
            />
          </div>

          {/* Mobile Drawer Overlay */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="relative z-50 w-72 max-w-[80vw] h-full bg-white dark:bg-[#111318] shadow-2xl flex flex-col justify-between border-r border-slate-200 dark:border-white/8">
                <div className="p-3 flex justify-end">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar
                    activeTab={activeTab}
                    setActiveTab={handleNavigateTab}
                    isDark={isDark}
                    setIsDark={handleToggleTheme}
                    themeMode={appearance.theme}
                    onSetThemeMode={(mode) => handleUpdateAppearance({ theme: mode })}
                    userLevel={user.level}
                    currentUser={currentUser}
                    momentumPoints={user.momentumPoints ?? user.totalPoints ?? 0}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Layout Area with optional Guest Banner */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Email Verification Success Banner */}
            {verifiedBannerMessage && (
              <div className="bg-[#22C55E]/15 border-b border-[#22C55E]/30 px-4 py-3 text-xs sm:text-sm text-[#86EFAC] flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>{verifiedBannerMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifiedBannerMessage(null)}
                  className="text-[#86EFAC]/70 hover:text-white text-xs font-semibold px-2 py-0.5 rounded transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Guest notification banner */}
            {currentUser?.isGuest && !isGuestBannerDismissed && (
              <GuestBanner
                onOpenSignUp={() => handleOpenAuth('signup')}
                onDismiss={() => setIsGuestBannerDismissed(true)}
              />
            )}

      {/* Main Content Area: Switch between Settings, AI Integration, AI Coach, Analytics, Rewards, Friends, Goals, Calendar, Tasks, and Dashboard */}
      <React.Suspense fallback={
        <div className="flex-1 flex flex-col min-w-0 p-6 md:p-8 max-w-[1600px] mx-auto w-full space-y-6">
          <LoadingSkeleton type="banner" count={1} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingSkeleton type="card" count={3} />
          </div>
        </div>
      }>
        {activeTab === 'settings' ? (
        <SettingsPage
          isDark={isDark}
          setIsDark={handleToggleTheme}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          currentUser={currentUser}
          userProgression={user}
          onOpenAuthModal={handleOpenAuth}
          onLogout={handleLogout}
          appearance={appearance}
          onUpdateAppearance={handleUpdateAppearance}
          onUpdateUser={handleUpdateUserProfile}
        />
      ) : activeTab === 'ai-integration' ? (
        <AiIntegrationPage
          isDark={isDark}
          setIsDark={handleToggleTheme}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          models={aiAgents}
          onSelectModel={handleSelectAIModel}
          onConnectSubmit={handleConnectAISubmit}
          onDisconnectModel={handleDisconnectAI}
          onSyncModels={handleSyncAIModels}
          isSyncing={isSyncingAI}
          lastSyncedTime={aiLastSyncedTime}
          userEmail={currentUser?.email || user.email || ''}
        />
      ) : (activeTab === 'ai-coach' || activeTab === 'coach' || activeTab === 'aicoach' || activeTab === 'ai_coach') ? (
        <AiCoachPage
          isDark={isDark}
          setIsDark={handleToggleTheme}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={handleNavigateTab}
          agents={aiAgents}
          onSelectModelId={handleSelectAIModel}
          onSyncModels={handleSyncAIModels}
          isSyncingModels={isSyncingAI}
          lastSyncedTime={aiLastSyncedTime}
          userEmail={currentUser?.email || user.email || ''}
          onAddTaskToToday={(taskTitle) => {
            handleAddTask({
              title: taskTitle,
              completed: false,
              viewCategory: 'today',
              dueText: 'Today',
              dueTime: '09:00 AM',
              labels: ['AI Coach', 'Priority'],
              priority: 'high',
              xpReward: 35,
              subtasks: []
            });
          }}
        />
      ) : activeTab === 'analytics' ? (
        <AnalyticsPage
          isDark={isDark}
          setIsDark={handleToggleTheme}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          liveUser={user}
          liveTasks={tasks}
          liveQuests={quests}
          liveGoals={detailedGoals}
        />
      ) : activeTab === 'rewards' ? (
        <RewardsPage
          isDark={isDark}
          setIsDark={handleToggleTheme}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          liveMomentumPoints={user.momentumPoints ?? user.totalPoints ?? 0}
          livePointsThisWeek={user.pointsThisWeek ?? 0}
          liveStreakDays={user.streakDays ?? user.streak ?? 0}
          liveWeeklyConsistency={user.weeklyConsistency ?? 0}
          liveLevel={user.level}
          liveCurrentXP={user.currentXp}
          liveMaxXP={user.nextLevelXp}
          liveRewards={rewards}
          liveBadges={badges}
          liveCollection={collection}
          onClaimReward={handleClaimReward}
          onActivateReward={handleActivateReward}
        />
      ) : activeTab === 'friends' ? (
        <FriendsPage
          isDark={isDark}
          setIsDark={handleToggleTheme}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          authUser={currentUser}
        />
      ) : activeTab === 'goals' ? (
        <GoalsPage
          goals={detailedGoals}
          onAddGoal={handleAddDetailedGoal}
          onUpdateGoal={handleUpdateDetailedGoal}
          onDeleteGoal={handleDeleteDetailedGoal}
          onToggleSubtask={handleToggleGoalSubtask}
          isDark={isDark}
          setIsDark={handleToggleTheme}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      ) : activeTab === 'calendar' ? (
        <CalendarPage
          events={calendarEvents}
          onAddEvent={handleAddCalendarEvent}
          onUpdateEvent={handleUpdateCalendarEvent}
          onDeleteEvent={handleDeleteCalendarEvent}
          isDark={isDark}
          setIsDark={handleToggleTheme}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onNavigateTab={handleNavigateTab}
        />
      ) : activeTab === 'tasks' ? (
        <TasksPage
          tasks={tasks}
          onToggleComplete={handleToggleTaskComplete}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          isDark={isDark}
          setIsDark={handleToggleTheme}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onNavigateTab={handleNavigateTab}
        />
      ) : (
        <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
          {/* Top Header */}
          <Header
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuth}
            onLogout={handleLogout}
            onNavigateToSettings={() => setActiveTab('settings')}
            notifications={notifications}
            onMarkNotificationAsRead={handleMarkNotificationAsRead}
            onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
            onClearAllNotifications={handleClearAllNotifications}
            onNavigateTab={handleNavigateTab}
          />

          {/* Page Container */}
          <main id="main-content" tabIndex={-1} className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto focus:outline-none">
            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Main Column: Hero, Quests, Analytics Bento, Goals */}
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
                {/* 1. Hero & Bento Stats Carousel */}
                <HeroBanner user={user} onNavigateTab={handleNavigateTab} />

                {/* 2. Today's Quests */}
                <TodayQuests
                  quests={quests}
                  onToggleComplete={handleToggleQuestComplete}
                  onOpenAddModal={() => setIsAddQuestOpen(true)}
                  activeFilter={activeQuestFilter}
                  setActiveFilter={setActiveQuestFilter}
                />

                {/* 3. Middle Analytics Row (Attributes, Weekly Progress, Leaderboard) */}
                <MiddleAnalyticsRow
                  attributes={attributes}
                  weeklyData={weeklyData}
                  friends={friends}
                />

                {/* 4. Goals Section - Live synchronized with detailedGoals */}
                <GoalsSection
                  goals={homeGoals}
                  onAddGoal={() => setIsAddGoalOpen(true)}
                />
              </div>

              {/* Right Column: Focus Mode, Quick Notes, AI Coach, Plant Card */}
              <div className="lg:col-span-4 xl:col-span-3">
                <RightSidebar
                  notes={notes}
                  onAddNote={() => setIsAddNoteOpen(true)}
                  onDeleteNote={handleDeleteNote}
                  onNavigateTab={handleNavigateTab}
                />
              </div>

            </div>
          </main>
        </div>
      )}
      </React.Suspense>

            {/* Team Expo Developer Footer */}
            <Footer className="pb-24 lg:pb-6" />
          </div>
        </>
      )}

      {/* Auth Modal Flow */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialScreen={authModalScreen}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Floating XP Gain Feedback Toast */}
      {xpToast && (
        <div 
          id="xp-reward-toast"
          className="fixed bottom-20 lg:bottom-8 right-6 z-50 bg-[#111827] text-white dark:bg-white dark:text-[#111827] px-4 py-2.5 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="w-6 h-6 rounded-lg bg-[#7C6CFF] flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
          </div>
          <div className="text-xs">
            <p className="font-bold tracking-wide">+{xpToast.xp} XP Earned!</p>
            <p className="text-[10px] text-[#A1A1AA] dark:text-[#52525B]">{xpToast.attribute} boosted</p>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddQuestModal
        isOpen={isAddQuestOpen}
        onClose={() => setIsAddQuestOpen(false)}
        onAddQuest={handleAddQuest}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAddGoal={handleAddGoal}
      />

      <AddNoteModal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onAddNote={handleAddNote}
      />

      {/* Level Up Celebratory Modal */}
      <LevelUpModal
        isOpen={isLevelUpOpen}
        onClose={() => setIsLevelUpOpen(false)}
        newLevel={levelUpLevel}
      />

      {/* Mobile Bottom Navigation Bar (< lg screens) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
      />
    </div>
  );
}
