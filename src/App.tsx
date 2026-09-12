import React, { useState, useEffect, useMemo } from 'react';
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
  initialQuests, 
  initialAttributes, 
  weeklyProgressData, 
  leaderboardFriends, 
  initialGoals, 
  initialNotes,
  initialTasks
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
  AIIntegrationModel
} from './types';
import { Sparkles, X } from 'lucide-react';
import { TasksPage } from './components/tasks/TasksPage';
import { CalendarPage } from './components/calendar/CalendarPage';
import { GoalsPage } from './components/goals/GoalsPage';
import { FriendsPage } from './components/friends/FriendsPage';
import { RewardsPage } from './components/rewards/RewardsPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { AiCoachPage } from './components/aicoach/AiCoachPage';
import { AiIntegrationPage } from './components/aiintegration/AiIntegrationPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { api, BackendState } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuestFilter, setActiveQuestFilter] = useState<QuestCategory>('all');

  // Core Synchronized Data States
  const [user, setUser] = useState(initialUserProfile);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [detailedGoals, setDetailedGoals] = useState<DetailedGoal[]>(initialGoalsData);
  const [attributes, setAttributes] = useState(initialAttributes);
  const [weeklyData, setWeeklyData] = useState(weeklyProgressData);
  const [friends] = useState(leaderboardFriends);
  const [notes, setNotes] = useState<QuickNote[]>(initialNotes);
  const [rewards, setRewards] = useState<RewardItem[]>(initialFeaturedRewards);
  const [badges, setBadges] = useState<RewardBadge[]>(initialBadges);
  const [collection, setCollection] = useState<CollectionItem[]>(initialCollectionItems);

  // Modals
  const [isAddQuestOpen, setIsAddQuestOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

  // AI Agent Models Synchronized State
  const [aiAgents, setAiAgents] = useState<AIIntegrationModel[]>([]);
  const [isSyncingAI, setIsSyncingAI] = useState(false);
  const [aiLastSyncedTime, setAiLastSyncedTime] = useState<string | null>(null);

  // XP Toast micro-feedback
  const [xpToast, setXpToast] = useState<{ show: boolean; xp: number; attribute: string } | null>(null);

  // Reconcile complete authoritative backend state into React
  const syncFromBackend = (data: BackendState) => {
    if (!data) return;
    if (data.user) setUser(data.user);
    if (data.quests) setQuests(data.quests);
    if (data.tasks) setTasks(data.tasks);
    if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
    if (data.detailedGoals) setDetailedGoals(data.detailedGoals);
    if (data.rewards) setRewards(data.rewards);
    if (data.badges) setBadges(data.badges);
    if (data.collection) setCollection(data.collection);
    if (data.notes) setNotes(data.notes);
    if (data.attributes) setAttributes(data.attributes);
    if (data.weeklyData) setWeeklyData(data.weeklyData);
    if (data.aiAgents) setAiAgents(data.aiAgents);
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
    details: { accountEmail?: string; apiKey?: string; modelTier?: string; loginMethod?: string }
  ) => {
    try {
      const res = await api.connectAIAgent(agentId, details);
      setAiAgents(res.agents);
    } catch (err) {
      console.error('Failed to connect AI agent:', err);
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

  // Initial load: fetch authoritative state from backend
  useEffect(() => {
    let isMounted = true;
    const fetchState = async () => {
      try {
        const state = await api.getState();
        if (isMounted && state) {
          syncFromBackend(state);
        }
      } catch (err) {
        console.warn('Backend not ready yet, using initialized local state:', err);
      }

      // Initial AI agents load
      try {
        const agents = await api.getAIAgents();
        if (isMounted && agents && agents.length > 0) {
          setAiAgents(agents);
        }
      } catch (err) {
        console.warn('AI agents initial load fallback:', err);
      }
    };
    fetchState();
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize dark mode class to html document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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

  // Handle Quest Complete / Toggle (Home)
  const handleToggleQuestComplete = async (questId: string) => {
    // 1. Optimistic update
    const target = quests.find((q) => q.id === questId);
    if (!target) return;
    const isNowCompleted = !target.completed;
    const xpChange = isNowCompleted ? target.xpReward : -target.xpReward;

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: isNowCompleted } : q))
    );

    setUser((prevUser) => {
      let newXp = prevUser.currentXp + xpChange;
      let newLevel = prevUser.level;
      let nextLevelXp = prevUser.nextLevelXp;

      if (newXp >= nextLevelXp) {
        newLevel += 1;
        newXp = newXp - nextLevelXp;
        nextLevelXp += 200;
      } else if (newXp < 0) {
        newXp = 0;
      }

      return {
        ...prevUser,
        currentXp: newXp,
        level: newLevel,
        nextLevelXp,
        totalPoints: Math.max(0, prevUser.totalPoints + xpChange),
        questsDoneThisWeek: isNowCompleted
          ? prevUser.questsDoneThisWeek + 1
          : Math.max(0, prevUser.questsDoneThisWeek - 1),
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
      const res = await api.toggleQuest(questId);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Quest toggle backend error:', err);
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
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Add quest error:', err);
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
    setNotes((prev) => [newNote, ...prev]);
    try {
      const res = await api.addNote(newNote);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Add note error:', err);
    }
  };

  // Task Handlers for TasksPage
  const handleToggleTaskComplete = async (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const isNowCompleted = !target.completed;
    const xpReward = target.xpReward || 15;
    const xpChange = isNowCompleted ? xpReward : -xpReward;

    // Optimistic UI updates
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: isNowCompleted } : t))
    );

    setUser((prevUser) => ({
      ...prevUser,
      currentXp: Math.max(0, prevUser.currentXp + xpChange),
      totalPoints: Math.max(0, prevUser.totalPoints + xpChange),
    }));

    if (isNowCompleted) {
      setXpToast({
        show: true,
        xp: xpReward,
        attribute: target.labels[0] || 'Discipline',
      });
      setTimeout(() => setXpToast(null), 2400);
    }

    // Authoritative backend sync (cross-syncs tasks, quests, calendar & goals)
    try {
      const res = await api.toggleTask(taskId);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Task toggle backend error:', err);
    }
  };

  const handleAddTask = async (newTaskData: Omit<TaskItem, 'id'>) => {
    const localToday = getTodayISO();
    const taskWithClientDate: Omit<TaskItem, 'id'> = {
      ...newTaskData,
      clientDate: newTaskData.clientDate || localToday,
      dueDate: newTaskData.dueDate || (newTaskData.dueText?.toLowerCase().includes('tomorrow')
        ? addDaysISO(localToday, 1)
        : newTaskData.dueText?.toLowerCase().includes('next week')
        ? addDaysISO(localToday, 7)
        : localToday),
    };

    const optimisticTask: TaskItem = {
      id: `task-${Date.now()}`,
      ...taskWithClientDate,
    };
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const res = await api.addTask(taskWithClientDate);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Add task error:', err);
    }
  };

  const handleUpdateTask = async (updatedTask: TaskItem) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    try {
      const res = await api.updateTask(updatedTask);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Update task error:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      const res = await api.deleteTask(taskId);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  // Calendar Handlers
  const handleAddCalendarEvent = async (newEventData: Omit<CalendarEvent, 'id'> & { id?: string }) => {
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

    try {
      const res = await api.addCalendarEvent(newEventData);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Add calendar event error:', err);
    }
  };

  const handleUpdateCalendarEvent = async (updatedEvent: CalendarEvent) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    try {
      const res = await api.updateCalendarEvent(updatedEvent);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Update calendar event error:', err);
    }
  };

  const handleDeleteCalendarEvent = async (eventId: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
    try {
      const res = await api.deleteCalendarEvent(eventId);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Delete calendar event error:', err);
    }
  };

  // Detailed Goals Handlers
  const handleAddDetailedGoal = async (newGoalData: Omit<DetailedGoal, 'id'>) => {
    const optimisticGoal: DetailedGoal = {
      ...newGoalData,
      id: `goal-${Date.now()}`,
      updatedAt: getLiveTodayISO(),
    };
    setDetailedGoals((prev) => [optimisticGoal, ...prev]);

    setXpToast({ show: true, xp: 50, attribute: newGoalData.category });
    setTimeout(() => setXpToast(null), 3000);

    try {
      const res = await api.addGoal(newGoalData);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Add goal error:', err);
    }
  };

  const handleUpdateDetailedGoal = async (updatedGoal: DetailedGoal) => {
    setDetailedGoals((prev) =>
      prev.map((g) =>
        g.id === updatedGoal.id
          ? { ...updatedGoal, updatedAt: getLiveTodayISO() }
          : g
      )
    );
    try {
      const res = await api.updateGoal(updatedGoal);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Update goal error:', err);
    }
  };

  const handleDeleteDetailedGoal = async (goalId: string) => {
    setDetailedGoals((prev) => prev.filter((g) => g.id !== goalId));
    try {
      const res = await api.deleteGoal(goalId);
      if (res.state) syncFromBackend(res.state);
    } catch (err) {
      console.error('Delete goal error:', err);
    }
  };

  // Rewards Claim & Activate Handlers
  const handleClaimReward = async (rewardId: string, termsAccepted: boolean) => {
    const res = await api.claimReward(rewardId, termsAccepted);
    if (res.state) {
      syncFromBackend(res.state);
    }
    return res;
  };

  const handleActivateReward = async (rewardId: string) => {
    const res = await api.activateReward(rewardId);
    if (res.state) {
      syncFromBackend(res.state);
    }
    return res;
  };

  return (
    <div className={`min-h-screen flex bg-[#08090B] text-[#F5F7FF] font-sans transition-colors duration-200`}>
      
      {/* Desktop Sidebar (hidden on screens < 1024px) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          setIsDark={setIsDark}
          userLevel={user.level}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-72 max-w-[80vw] h-full bg-[#111318] shadow-2xl flex flex-col justify-between border-r border-white/8">
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
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
                isDark={isDark}
                setIsDark={setIsDark}
                userLevel={user.level}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Switch between Settings, AI Integration, AI Coach, Analytics, Rewards, Friends, Goals, Calendar, Tasks, and Dashboard */}
      {activeTab === 'settings' ? (
        <SettingsPage
          isDark={isDark}
          setIsDark={setIsDark}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      ) : activeTab === 'ai-integration' ? (
        <AiIntegrationPage
          isDark={isDark}
          setIsDark={setIsDark}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          models={aiAgents}
          onSelectModel={handleSelectAIModel}
          onConnectSubmit={handleConnectAISubmit}
          onDisconnectModel={handleDisconnectAI}
          onSyncModels={handleSyncAIModels}
          isSyncing={isSyncingAI}
          lastSyncedTime={aiLastSyncedTime}
        />
      ) : activeTab === 'ai-coach' ? (
        <AiCoachPage
          isDark={isDark}
          setIsDark={setIsDark}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={(tab) => setActiveTab(tab)}
          agents={aiAgents}
          onSelectModelId={handleSelectAIModel}
          onSyncModels={handleSyncAIModels}
          isSyncingModels={isSyncingAI}
          lastSyncedTime={aiLastSyncedTime}
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
          setIsDark={setIsDark}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          liveUser={user}
          liveTasks={tasks}
          liveQuests={quests}
          liveGoals={detailedGoals}
        />
      ) : activeTab === 'rewards' ? (
        <RewardsPage
          isDark={isDark}
          setIsDark={setIsDark}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          liveMomentumPoints={(user as any).momentumPoints ?? 4320}
          livePointsThisWeek={(user as any).pointsThisWeek ?? 240}
          liveStreakDays={(user as any).streakDays ?? user.streakDays}
          liveWeeklyConsistency={(user as any).weeklyConsistency ?? 92}
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
          setIsDark={setIsDark}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      ) : activeTab === 'goals' ? (
        <GoalsPage
          goals={detailedGoals}
          onAddGoal={handleAddDetailedGoal}
          onUpdateGoal={handleUpdateDetailedGoal}
          onDeleteGoal={handleDeleteDetailedGoal}
          isDark={isDark}
          setIsDark={setIsDark}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      ) : activeTab === 'calendar' ? (
        <CalendarPage
          events={calendarEvents}
          onAddEvent={handleAddCalendarEvent}
          onUpdateEvent={handleUpdateCalendarEvent}
          onDeleteEvent={handleDeleteCalendarEvent}
          isDark={isDark}
          setIsDark={setIsDark}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      ) : activeTab === 'tasks' ? (
        <TasksPage
          tasks={tasks}
          onToggleComplete={handleToggleTaskComplete}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          isDark={isDark}
          setIsDark={setIsDark}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
          {/* Top Header */}
          <Header
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Page Container */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto">
            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Main Column: Hero, Quests, Analytics Bento, Goals */}
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
                {/* 1. Hero & Bento Stats */}
                <HeroBanner user={user} />

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
                />
              </div>

            </div>
          </main>
        </div>
      )}

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

      {/* Mobile Bottom Navigation Bar (< lg screens) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
