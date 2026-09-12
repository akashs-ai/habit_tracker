import React, { useState, useEffect } from 'react';
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
import { Quest, QuestCategory, Goal, QuickNote, TaskItem, CalendarEvent, DetailedGoal } from './types';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('settings');
  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuestFilter, setActiveQuestFilter] = useState<QuestCategory>('all');

  // Core Data States
  const [user, setUser] = useState(initialUserProfile);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [detailedGoals, setDetailedGoals] = useState<DetailedGoal[]>(initialGoalsData);
  const [attributes, setAttributes] = useState(initialAttributes);
  const [weeklyData] = useState(weeklyProgressData);
  const [friends] = useState(leaderboardFriends);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [notes, setNotes] = useState<QuickNote[]>(initialNotes);

  // Modals
  const [isAddQuestOpen, setIsAddQuestOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

  // XP Toast micro-feedback
  const [xpToast, setXpToast] = useState<{ show: boolean; xp: number; attribute: string } | null>(null);

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

  // Handle Quest Complete / Toggle
  const handleToggleQuestComplete = (questId: string) => {
    setQuests((prevQuests) => {
      const target = prevQuests.find((q) => q.id === questId);
      if (!target) return prevQuests;

      const isNowCompleted = !target.completed;
      const xpChange = isNowCompleted ? target.xpReward : -target.xpReward;

      // Update User Progress
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

      // Update corresponding attribute percentage
      if (isNowCompleted) {
        setAttributes((prevAttrs) =>
          prevAttrs.map((attr) => {
            if (attr.name === target.attribute) {
              return {
                ...attr,
                percentage: Math.min(100, attr.percentage + 2),
              };
            }
            return attr;
          })
        );

        // Show subtle XP micro-reward notification
        setXpToast({
          show: true,
          xp: target.xpReward,
          attribute: target.attribute,
        });

        setTimeout(() => {
          setXpToast(null);
        }, 2400);
      }

      return prevQuests.map((q) =>
        q.id === questId ? { ...q, completed: isNowCompleted } : q
      );
    });
  };

  // Add new quest handler
  const handleAddQuest = (newQuestData: Omit<Quest, 'id' | 'completed'>) => {
    const newQuest: Quest = {
      id: `quest-${Date.now()}`,
      ...newQuestData,
      completed: false,
    };
    setQuests((prev) => [newQuest, ...prev]);
  };

  // Add new goal handler
  const handleAddGoal = (newGoal: Goal) => {
    setGoals((prev) => [newGoal, ...prev]);
  };

  // Add new note handler
  const handleAddNote = (newNote: QuickNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  // Task Handlers for TasksPage
  const handleToggleTaskComplete = (taskId: string) => {
    setTasks((prevTasks) => {
      const target = prevTasks.find((t) => t.id === taskId);
      if (!target) return prevTasks;
      const isNowCompleted = !target.completed;
      const xpReward = target.xpReward || 15;
      const xpChange = isNowCompleted ? xpReward : -xpReward;

      // Optimistic XP update
      setUser((prevUser) => ({
        ...prevUser,
        currentXp: Math.max(0, prevUser.currentXp + xpChange),
        totalPoints: Math.max(0, prevUser.totalPoints + xpChange),
      }));

      // If completing, trigger XP toast micro-feedback
      if (isNowCompleted) {
        setXpToast({
          show: true,
          xp: xpReward,
          attribute: target.labels[0] || 'Discipline',
        });
        setTimeout(() => {
          setXpToast(null);
        }, 2400);
      }

      return prevTasks.map((t) =>
        t.id === taskId ? { ...t, completed: isNowCompleted } : t
      );
    });
  };

  const handleAddTask = (newTaskData: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      ...newTaskData,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: TaskItem) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Calendar Handlers
  const handleAddCalendarEvent = (newEventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...newEventData,
      id: `evt-${Date.now()}`,
    };
    setCalendarEvents((prev) => [newEvent, ...prev]);
  };

  const handleUpdateCalendarEvent = (updatedEvent: CalendarEvent) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
  };

  const handleDeleteCalendarEvent = (eventId: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // Detailed Goals Handlers
  const handleAddDetailedGoal = (newGoalData: Omit<DetailedGoal, 'id'>) => {
    const newGoal: DetailedGoal = {
      ...newGoalData,
      id: `goal-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDetailedGoals((prev) => [newGoal, ...prev]);

    // Micro toast
    setXpToast({ show: true, xp: 50, attribute: newGoal.category });
    setTimeout(() => setXpToast(null), 3000);
  };

  const handleUpdateDetailedGoal = (updatedGoal: DetailedGoal) => {
    setDetailedGoals((prev) =>
      prev.map((g) => (g.id === updatedGoal.id ? { ...updatedGoal, updatedAt: new Date().toISOString().split('T')[0] } : g))
    );
  };

  const handleDeleteDetailedGoal = (goalId: string) => {
    setDetailedGoals((prev) => prev.filter((g) => g.id !== goalId));
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
        />
      ) : activeTab === 'ai-coach' ? (
        <AiCoachPage
          isDark={isDark}
          setIsDark={setIsDark}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onAddTaskToToday={(taskTitle) => {
            const newTask: TaskItem = {
              id: `task-${Date.now()}`,
              title: taskTitle,
              completed: false,
              viewCategory: 'today',
              dueText: 'Today',
              dueTime: '09:00 AM',
              labels: ['AI Coach', 'Priority'],
              priority: 'high',
              xpReward: 35,
              subtasks: []
            };
            setTasks(prev => [newTask, ...prev]);
          }}
        />
      ) : activeTab === 'analytics' ? (
        <AnalyticsPage
          isDark={isDark}
          setIsDark={setIsDark}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
      ) : activeTab === 'rewards' ? (
        <RewardsPage
          isDark={isDark}
          setIsDark={setIsDark}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
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

                {/* 4. Goals Section */}
                <GoalsSection
                  goals={goals}
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
