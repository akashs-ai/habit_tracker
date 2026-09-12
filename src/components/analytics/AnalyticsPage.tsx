import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Menu,
  X,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { AnalyticsHeader } from './AnalyticsHeader';
import { TimeRangeControls } from './TimeRangeControls';
import { AnalyticsKpiGrid } from './AnalyticsKpiGrid';
import { ConsistencyTrendCard } from './ConsistencyTrendCard';
import { HabitBreakdownCard } from './HabitBreakdownCard';
import { MostConsistentHabitsCard } from './MostConsistentHabitsCard';
import { ActivityHeatmapCard } from './ActivityHeatmapCard';
import { TimeDistributionCard } from './TimeDistributionCard';
import { GoalProgressCard } from './GoalProgressCard';
import { InsightsCard } from './InsightsCard';
import { AchievementsCard } from './AchievementsCard';
import {
  initialAnalyticsKpi,
  initialTrendPoints,
  initialHabitBreakdown,
  initialConsistentHabits,
  initialHeatmapDays,
  initialTimeDistributionHabits,
  initialTimeDistributionTasks,
  initialAnalyticsGoals,
  initialAnalyticsInsights,
  initialAnalyticsAchievements,
  getTimeRangeKpi,
} from '../../data/analyticsMockData';
import { AnalyticsTimeRange, UserProfile, TaskItem, Quest, DetailedGoal, AnalyticsGoalItem } from '../../types';

interface AnalyticsPageProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onToggleMobileMenu: () => void;
  liveUser?: UserProfile;
  liveTasks?: TaskItem[];
  liveQuests?: Quest[];
  liveGoals?: DetailedGoal[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  isDark,
  setIsDark,
  onToggleMobileMenu,
  liveUser,
  liveTasks,
  liveQuests,
  liveGoals,
}) => {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('7d');
  const [dateRangeText, setDateRangeText] = useState('Sep 5, 2025 – Sep 11, 2025');
  const [searchQuery, setSearchQuery] = useState('');
  const [bottomTab, setBottomTab] = useState<'insights' | 'milestones'>('insights');
  const [activeDetailModal, setActiveDetailModal] = useState<string | null>(null);

  // Dynamic KPI synchronized with live backend state
  const dynamicKpi = React.useMemo(() => {
    const baseKpi = getTimeRangeKpi(timeRange);
    if (!liveUser && !liveTasks && !liveQuests) return baseKpi;
    const completedTasks = liveTasks ? liveTasks.filter((t) => t.completed).length : baseKpi.tasksCompleted;
    const totalTasks = liveTasks ? liveTasks.length : baseKpi.tasksTotal;
    const streak = liveUser ? (liveUser as any).streakDays ?? liveUser.streakDays : baseKpi.currentStreakDays;
    const mp = liveUser ? (liveUser as any).momentumPoints ?? liveUser.totalPoints : baseKpi.momentumPoints;
    const completedQuests = liveQuests ? liveQuests.filter((q) => q.completed).length : 0;
    const totalQuests = liveQuests ? liveQuests.length : 4;
    const ratio = Math.round(((completedTasks + completedQuests) / Math.max(1, totalTasks + totalQuests)) * 100);

    return {
      ...baseKpi,
      overallConsistency: ratio > 0 ? ratio : baseKpi.overallConsistency,
      currentStreakDays: streak !== undefined ? streak : baseKpi.currentStreakDays,
      tasksCompleted: completedTasks,
      tasksTotal: totalTasks,
      momentumPoints: mp,
    };
  }, [timeRange, liveUser, liveTasks, liveQuests]);

  // Synchronized goals from Goals page & Backend
  const dynamicGoals: AnalyticsGoalItem[] = React.useMemo(() => {
    if (!liveGoals || liveGoals.length === 0) return initialAnalyticsGoals;
    return liveGoals.map((g) => ({
      id: g.id,
      title: g.title,
      percentage: g.progress,
      category: g.category,
      icon: g.category === 'Career' ? 'dsa' : g.category === 'Health' ? 'shape' : g.category === 'Projects' ? 'portfolio' : 'books',
      color: g.color || '#6366F1',
    }));
  }, [liveGoals]);

  const handleTimeRangeChange = (range: AnalyticsTimeRange) => {
    setTimeRange(range);
    switch (range) {
      case '7d':
        setDateRangeText('Sep 5, 2025 – Sep 11, 2025');
        break;
      case '30d':
        setDateRangeText('Aug 12, 2025 – Sep 11, 2025');
        break;
      case '3m':
        setDateRangeText('Jun 11, 2025 – Sep 11, 2025');
        break;
      case '1y':
        setDateRangeText('Sep 11, 2024 – Sep 11, 2025');
        break;
      case 'all':
        setDateRangeText('Jan 1, 2024 – Present');
        break;
    }
  };

  return (
    <div 
      id="analytics-page-root"
      className="flex-1 flex flex-col min-w-0 bg-[#080F1A] text-[#F1F5F9] font-sans pb-24 lg:pb-12 min-h-screen"
    >
      {/* 1. Header Bar matching Desktop (72px) & Tablet/Mobile (58-64px) */}
      <header 
        id="analytics-top-header"
        className="h-16 lg:h-[72px] px-4 sm:px-6 lg:px-8 border-b border-white/6 flex items-center justify-between gap-4 sticky top-0 bg-[#080F1A]/95 backdrop-blur-md z-20"
      >
        {/* Left: Mobile hamburger + Search bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Hamburger button (visible on <1024px) */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 border border-white/6 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo on Tablet/Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">
              L
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">LifeRPG</span>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, goals, or anything..."
              className="w-full h-10 pl-9.5 pr-14 rounded-xl bg-[#0F1723] border border-white/7 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-mono text-[#64748B] bg-white/4 border border-white/7 px-1.5 py-0.5 rounded pointer-events-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right Controls: Theme, Notifications, Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 sm:p-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 border border-white/6 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Notification Bell with red badge */}
          <div className="relative">
            <button
              onClick={() => setActiveDetailModal('notifications')}
              className="p-2 sm:p-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 border border-white/6 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-[#080F1A]" />
          </div>

          {/* User Avatar */}
          <div 
            onClick={() => setActiveDetailModal('profile')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] p-0.5 cursor-pointer hover:ring-2 hover:ring-[#818CF8]/50 transition-all flex items-center justify-center shrink-0"
            title="Alex (Level 12)"
          >
            <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Analytics Page Body */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-[1440px] w-full mx-auto flex flex-col gap-4 sm:gap-5">
        
        {/* Hero Section: Title, perspective gradient, subtitle, right quote */}
        <AnalyticsHeader />

        {/* Time Range Pills + Date Range Selector */}
        <TimeRangeControls
          timeRange={timeRange}
          setTimeRange={handleTimeRangeChange}
          dateRangeText={dateRangeText}
          onDateRangeClick={() => setActiveDetailModal('daterange')}
        />

        {/* KPI Cards (Overall Consistency, Current Streak, Tasks Completed, Momentum Points) */}
        <AnalyticsKpiGrid
          data={dynamicKpi}
          onOpenKpiDetail={(type) => setActiveDetailModal(type)}
        />

        {/* Primary Charts Row: Consistency Trend (66%) + Habit Breakdown (33%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <ConsistencyTrendCard data={initialTrendPoints} />
          </div>
          <div className="lg:col-span-4 flex flex-col">
            <HabitBreakdownCard categories={initialHabitBreakdown} />
          </div>
        </div>

        {/* Secondary Analytics Row: Most Consistent Habits, Activity Heatmap, Time Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch">
          <div className="flex flex-col">
            <MostConsistentHabitsCard
              habits={initialConsistentHabits}
              onSeeAll={() => setActiveDetailModal('habits')}
            />
          </div>
          <div className="flex flex-col">
            <ActivityHeatmapCard days={initialHeatmapDays} />
          </div>
          <div className="flex flex-col md:col-span-2 lg:col-span-1">
            <TimeDistributionCard
              habitItems={initialTimeDistributionHabits}
              taskItems={initialTimeDistributionTasks}
            />
          </div>
        </div>

        {/* Bottom Desktop Grid: Goal Progress + Insights (with option to view Milestones) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          {/* Goal Progress: 4-5 cols on desktop */}
          <div className="lg:col-span-5 flex flex-col">
            <GoalProgressCard
              goals={dynamicGoals}
              onSeeAll={() => setActiveDetailModal('goals')}
            />
          </div>

          {/* Insights / Milestones: 7 cols on desktop */}
          <div className="lg:col-span-7 flex flex-col">
            {bottomTab === 'insights' ? (
              <div className="relative">
                <InsightsCard
                  insights={initialAnalyticsInsights}
                  onSeeAll={() => setBottomTab('milestones')}
                />
              </div>
            ) : (
              <div className="relative">
                <AchievementsCard
                  achievements={initialAnalyticsAchievements}
                  onSeeAll={() => setBottomTab('insights')}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Dialog for drilldown details (e.g. See All, Date Range, etc.) */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-[#0F1723] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 text-white relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/8">
              <h3 className="text-base font-bold text-white capitalize">
                {activeDetailModal === 'daterange'
                  ? 'Custom Date Range'
                  : activeDetailModal === 'notifications'
                  ? 'Recent Notifications'
                  : activeDetailModal === 'profile'
                  ? 'Alex (Level 12)'
                  : `${activeDetailModal} Details`}
              </h3>
              <button
                onClick={() => setActiveDetailModal(null)}
                className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 text-xs sm:text-sm text-[#94A3B8] space-y-3">
              {activeDetailModal === 'daterange' && (
                <div>
                  <p className="text-white font-medium mb-3">Select a date range preset or pick custom dates:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['This Week', 'Last Week', 'This Month', 'Last 30 Days', 'Last Quarter', 'Year to Date'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setDateRangeText(preset);
                          setActiveDetailModal(null);
                        }}
                        className="p-2.5 rounded-xl bg-white/4 hover:bg-[#6366F1] hover:text-white border border-white/6 text-left transition-colors font-medium text-xs text-white/90"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeDetailModal === 'consistency' && (
                <div className="space-y-2 text-xs">
                  <p className="text-white font-semibold text-sm">Overall Consistency: 82%</p>
                  <p>Calculated across all tracked daily habits and planned task check-ins during the current evaluation period.</p>
                  <div className="p-3 rounded-xl bg-white/4 border border-white/6 mt-2">
                    <p className="text-[#34D399] font-medium">↑ 12% improvement over previous 7-day cycle.</p>
                    <p className="text-[#94A3B8] mt-1">Best performing day: Thursday (92% completion).</p>
                  </div>
                </div>
              )}

              {activeDetailModal === 'streak' && (
                <div className="space-y-2 text-xs">
                  <p className="text-white font-semibold text-sm">Current Active Streak: 6 Days</p>
                  <p>You have logged into LifeRPG and fulfilled your baseline daily quota 6 days in a row without missing a single day.</p>
                  <p className="text-[#34D399]">Only 1 day left to unlock the 7-Day Consistency Master milestone!</p>
                </div>
              )}

              {activeDetailModal === 'tasks' && (
                <div className="space-y-2 text-xs">
                  <p className="text-white font-semibold text-sm">Tasks Completed: 28 of 34 (82.3%)</p>
                  <p>6 pending tasks remaining for this cycle. Keep going to maximize your completion velocity.</p>
                </div>
              )}

              {activeDetailModal === 'momentum' && (
                <div className="space-y-2 text-xs">
                  <p className="text-white font-semibold text-sm">4,320 Momentum Points</p>
                  <p>Momentum Points reflect your ongoing productivity cadence and habit consistency over time.</p>
                  <p className="text-[#A78BFA]">+540 MP earned this current week.</p>
                </div>
              )}

              {activeDetailModal === 'habits' && (
                <div className="space-y-2">
                  <p className="text-white font-medium">All Monitored Habits (Sorted by Consistency):</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {initialConsistentHabits.map(h => (
                      <div key={h.id} className="flex justify-between items-center p-2 rounded-lg bg-white/4 text-xs">
                        <span className="text-white">{h.name}</span>
                        <span className="font-bold text-[#818CF8]">{h.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDetailModal === 'goals' && (
                <div className="space-y-2">
                  <p className="text-white font-medium">Quarterly Active Goals:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {initialAnalyticsGoals.map(g => (
                      <div key={g.id} className="flex justify-between items-center p-2 rounded-lg bg-white/4 text-xs">
                        <div>
                          <p className="text-white font-medium">{g.title}</p>
                          <p className="text-[10px] text-[#64748B]">{g.category}</p>
                        </div>
                        <span className="font-bold text-[#34D399]">{g.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDetailModal === 'notifications' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/4 border border-white/6">
                    <p className="text-white font-medium">Weekly Analytics Summary Ready</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">Your consistency rose by +12% compared to last week.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/4 border border-white/6">
                    <p className="text-white font-medium">Streak Alert</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">You are on a 6-day streak! Don&apos;t forget your evening reading.</p>
                  </div>
                </div>
              )}

              {activeDetailModal === 'profile' && (
                <div className="space-y-2 text-xs">
                  <p className="text-white font-bold text-sm">Alex • Productivity Specialist</p>
                  <p>Current Level: 12 • Total Momentum Points: 4,320 MP</p>
                  <p className="text-[#94A3B8]">Productivity profile configured with strict habit tracking cadence.</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/8 flex justify-end">
              <button
                onClick={() => setActiveDetailModal(null)}
                className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-xs font-semibold text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
