import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal, 
  Plus, 
  Search,
  Sun,
  Moon,
  Bell,
  Menu,
  Sparkles
} from 'lucide-react';
import { TaskItem, TaskView, TaskPriority } from '../../types';
import { TaskSubNav } from './TaskSubNav';
import { TaskRow } from './TaskRow';
import { TaskComposer } from './TaskComposer';
import { TasksRightPanel } from './TasksRightPanel';
import { getTodayDate, isToday, shiftDateDays, formatReadableDate, formatDateISO } from '../../utils/dateUtils';

interface TasksPageProps {
  tasks: TaskItem[];
  onToggleComplete: (id: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onToggleMobileMenu: () => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  onToggleComplete,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  isDark,
  setIsDark,
  onToggleMobileMenu,
}) => {
  const [activeView, setActiveView] = useState<TaskView>('today');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskDate, setTaskDate] = useState<Date>(() => getTodayDate());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Check if taskDate is today using unified dateUtils
  const isSelectedDateToday = useMemo(() => {
    return isToday(taskDate);
  }, [taskDate]);

  const selectedDateLabel = useMemo(() => {
    const iso = formatDateISO(taskDate);
    if (isSelectedDateToday) {
      return `Today, ${formatReadableDate(iso)}`;
    }
    return formatReadableDate(iso);
  }, [taskDate, isSelectedDateToday]);

  const handlePrevDay = () => {
    setTaskDate(prev => shiftDateDays(prev, -1));
  };

  const handleNextDay = () => {
    setTaskDate(prev => shiftDateDays(prev, 1));
  };

  const handleResetToToday = () => {
    setTaskDate(getTodayDate());
  };

  // Compute View Counts
  const counts = useMemo(() => {
    return {
      inbox: tasks.filter(t => !t.completed).length,
      today: tasks.filter(t => t.viewCategory === 'today' && !t.completed).length,
      upcoming: tasks.filter(t => t.viewCategory === 'upcoming' && !t.completed).length,
      overdue: tasks.filter(t => t.viewCategory === 'overdue' && !t.completed).length,
      someday: tasks.filter(t => t.viewCategory === 'someday' && !t.completed).length,
      all: tasks.length,
      completed: tasks.filter(t => t.completed).length,
    };
  }, [tasks]);

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesLabel = task.labels.some(l => l.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesLabel) return false;
      }

      // Label filter
      if (selectedLabel) {
        if (!task.labels.includes(selectedLabel)) return false;
      }

      // Priority filter
      if (selectedPriority) {
        if (task.priority !== selectedPriority) return false;
      }

      // View category filter
      if (activeView === 'today') {
        return task.viewCategory === 'today' || (!task.completed && task.dueText.toLowerCase().includes('today'));
      }
      if (activeView === 'upcoming') {
        return task.viewCategory === 'upcoming' || task.dueText.toLowerCase().includes('tomorrow') || task.dueText.toLowerCase().includes('next');
      }
      if (activeView === 'overdue') {
        return task.viewCategory === 'overdue';
      }
      if (activeView === 'someday') {
        return task.viewCategory === 'someday';
      }
      if (activeView === 'completed') {
        return task.completed;
      }
      if (activeView === 'inbox') {
        return !task.completed;
      }
      return true; // 'all'
    });
  }, [tasks, searchQuery, selectedLabel, selectedPriority, activeView]);

  const viewPills: { id: TaskView; label: string; count: number }[] = [
    { id: 'today', label: 'Today', count: counts.today },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'overdue', label: 'Overdue', count: counts.overdue },
    { id: 'someday', label: 'Someday', count: counts.someday },
    { id: 'all', label: 'All', count: counts.all },
  ];

  return (
    <div id="tasks-page-root" className="min-h-screen bg-[#FAFAFC] dark:bg-[#09090B] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col flex-1 pb-24 lg:pb-12">
      
      {/* Top Header Bar strictly matching the spec */}
      <header 
        id="tasks-top-header"
        className="h-[72px] bg-white/80 dark:bg-[#111113]/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 border-b border-[#E2E8F0] dark:border-[#27272A] flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          {/* Mobile Menu Trigger */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#18181B]"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar with ⌘ K */}
          <div className="relative w-full max-w-sm sm:max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, tags, or type / for commands..."
              className="w-full h-10 pl-9 pr-14 bg-[#F8FAFC] dark:bg-[#18181B] border border-[#E2E8F0] dark:border-[#27272A] rounded-xl text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] bg-white dark:bg-[#27272A] border border-[#E2E8F0] dark:border-[#334155] rounded shadow-2xs">
                ⌘ K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Header Icons */}
        <div className="flex items-center gap-2 sm:gap-3.5 pl-3">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#18181B] transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#F59E0B]" />
            ) : (
              <Moon className="w-4 h-4 text-[#64748B]" />
            )}
          </button>

          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#18181B] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white dark:ring-[#111113]" />
          </button>

          {/* User Avatar Circle */}
          <div className="w-8 h-8 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            A
          </div>
        </div>
      </header>

      {/* Main Page Workspace Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1520px] w-full mx-auto flex flex-col gap-6">
        
        {/* Title Header & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Tasks
            </h1>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Turn your plans into progress.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Date Switcher */}
            <div className="flex items-center bg-white dark:bg-[#121214] border border-[#E2E8F0] dark:border-[#27272A] rounded-xl px-2 py-1 shadow-2xs text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]">
              <button 
                onClick={handlePrevDay}
                className="p-1 hover:text-[#6366F1] rounded transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-medium">{selectedDateLabel}</span>
              <button 
                onClick={handleNextDay}
                className="p-1 hover:text-[#6366F1] rounded transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              {!isSelectedDateToday && (
                <button
                  onClick={handleResetToToday}
                  className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#6366F1] bg-[#6366F1]/10 hover:bg-[#6366F1]/20 transition-colors"
                >
                  Today
                </button>
              )}
            </div>

            {/* Filter Trigger Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-1.5 h-9 px-3.5 bg-white dark:bg-[#121214] border border-[#E2E8F0] dark:border-[#27272A] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#18181B] transition-colors shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Filter</span>
              </button>

              {/* Filter Popover */}
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#18181B] border border-[#E2E8F0] dark:border-[#27272A] rounded-xl shadow-lg p-2 z-30 text-xs">
                  <div className="font-semibold text-[#64748B] px-2 py-1 uppercase text-[10px]">Filter by Priority</div>
                  <button 
                    onClick={() => { setSelectedPriority(null); setShowFilterDropdown(false); }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#27272A]"
                  >
                    All Priorities
                  </button>
                  <button 
                    onClick={() => { setSelectedPriority('high'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] text-[#EF4444]"
                  >
                    High Priority
                  </button>
                  <button 
                    onClick={() => { setSelectedPriority('medium'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] text-[#F59E0B]"
                  >
                    Medium Priority
                  </button>
                  <button 
                    onClick={() => { setSelectedPriority('low'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] text-[#64748B]"
                  >
                    Low Priority
                  </button>
                </div>
              )}
            </div>

            {/* + Add Task Primary Action Button */}
            <button
              id="header-add-task-btn"
              onClick={() => setIsComposerOpen(true)}
              className="flex items-center gap-1.5 h-9 px-4 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl text-xs sm:text-sm font-medium shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* View Switcher Pills Row (Today, Upcoming, Overdue, Someday, All) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {viewPills.map((pill) => {
            const isActive = activeView === pill.id && !selectedLabel && !selectedPriority;
            return (
              <button
                key={pill.id}
                id={`pill-${pill.id}`}
                onClick={() => {
                  setActiveView(pill.id);
                  setSelectedLabel(null);
                  setSelectedPriority(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#6366F1] text-white shadow-xs'
                    : 'bg-white dark:bg-[#121214] border border-[#E2E8F0] dark:border-[#27272A] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <span>{pill.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-medium ${
                  isActive 
                    ? 'bg-white/25 text-white' 
                    : 'bg-[#F1F5F9] dark:bg-[#27272A] text-[#64748B] dark:text-[#94A3B8]'
                }`}>
                  {pill.count}
                </span>
              </button>
            );
          })}

          {/* Active Filter Chips (if filtered by Label or Priority) */}
          {selectedLabel && (
            <div className="flex items-center gap-1 bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#6366F1] dark:text-[#A5B4FC] text-xs px-2.5 py-1 rounded-full font-medium">
              <span>Label: {selectedLabel}</span>
              <button onClick={() => setSelectedLabel(null)} className="hover:opacity-75">×</button>
            </div>
          )}

          {selectedPriority && (
            <div className="flex items-center gap-1 bg-[#FEF3C7] dark:bg-[#451A03] text-[#D97706] dark:text-[#FDE68A] text-xs px-2.5 py-1 rounded-full font-medium">
              <span>Priority: {selectedPriority}</span>
              <button onClick={() => setSelectedPriority(null)} className="hover:opacity-75">×</button>
            </div>
          )}
        </div>

        {/* 3-Column / Workspace Responsive Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
          
          {/* Left Column: Sub-navigation (Hidden on small mobile, visible on lg screens) */}
          <div className="hidden lg:block">
            <TaskSubNav
              activeView={activeView}
              setActiveView={setActiveView}
              selectedLabel={selectedLabel}
              setSelectedLabel={setSelectedLabel}
              selectedPriority={selectedPriority}
              setSelectedPriority={setSelectedPriority}
              counts={counts}
            />
          </div>

          {/* Center Column: Main Task List Stream */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-3">
            {/* Quick Add Task Composer */}
            <TaskComposer
              onAddTask={onAddTask}
              defaultCategory={activeView === 'upcoming' ? 'upcoming' : 'today'}
            />

            {/* Task Rows List */}
            {filteredTasks.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                  />
                ))}
              </div>
            ) : (
              // Empty State matching Section 22
              <div className="bg-white dark:bg-[#121214] border border-[#E2E8F0] dark:border-[#27272A] rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] dark:bg-[#1E1B4B] flex items-center justify-center text-[#6366F1] mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  You&apos;re clear for today.
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-xs mt-1">
                  A quiet day is progress too. Turn your next plan into focused action.
                </p>
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#6366F1] text-white rounded-xl text-xs font-semibold hover:bg-[#4F46E5] transition-colors"
                >
                  Add a task
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Progress & Focus Widgets */}
          <div className="w-full lg:w-auto">
            <TasksRightPanel
              completedCount={counts.completed || 3}
              remainingCount={counts.today || 2}
              overdueCount={counts.overdue || 1}
              totalCount={counts.all || 8}
            />
          </div>

        </div>

      </main>

      {/* Floating Mobile Action Button '+' (matching mobile 390x844 view in image) */}
      <button
        id="mobile-fab-add-task"
        onClick={() => {
          const quickTitle = window.prompt('Quick Add Task:');
          if (quickTitle) {
            onAddTask({
              title: quickTitle,
              completed: false,
              viewCategory: 'today',
              dueText: 'Today',
              labels: ['Personal'],
              priority: 'low',
              xpReward: 10
            });
          }
        }}
        className="lg:hidden fixed bottom-20 right-6 w-12 h-12 rounded-full bg-[#6366F1] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all z-30"
        aria-label="Add new task"
      >
        <Plus className="w-6 h-6" />
      </button>

    </div>
  );
};
