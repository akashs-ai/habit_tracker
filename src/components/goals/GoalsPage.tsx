import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Menu, 
  Plus, 
  ChevronDown, 
  ArrowUpDown,
  SlidersHorizontal 
} from 'lucide-react';
import { DetailedGoal, GoalStatus, GoalSortOption, GoalCategory } from '../../types';
import { GoalsHeader } from './GoalsHeader';
import { GoalsOverviewCard } from './GoalsOverviewCard';
import { GoalCard } from './GoalCard';
import { GoalBottomRow } from './GoalBottomRow';
import { CreateGoalModal } from './CreateGoalModal';
import { GoalDetailModal } from './GoalDetailModal';
import { AddMilestoneModal } from './AddMilestoneModal';
import { CategorySelectorModal } from './CategorySelectorModal';

interface GoalsPageProps {
  goals: DetailedGoal[];
  onAddGoal: (goal: Omit<DetailedGoal, 'id'>) => void;
  onUpdateGoal: (goal: DetailedGoal) => void;
  onDeleteGoal: (id: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onToggleMobileMenu: () => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  isDark,
  setIsDark,
  onToggleMobileMenu,
}) => {
  // Navigation filter state
  const [activeTab, setActiveTab] = useState<'all' | GoalStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<GoalSortOption>('priority');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGoalForDetail, setSelectedGoalForDetail] = useState<DetailedGoal | null>(null);
  const [goalForMilestone, setGoalForMilestone] = useState<DetailedGoal | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<GoalCategory | null>(null);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: goals.length,
      active: goals.filter((g) => g.status === 'active').length,
      completed: goals.filter((g) => g.status === 'completed').length,
      archived: goals.filter((g) => g.status === 'archived').length,
    };
  }, [goals]);

  // Overall progress calculation
  const overallProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const activeAndDone = goals.filter((g) => g.status !== 'archived');
    if (activeAndDone.length === 0) return 0;
    const sum = activeAndDone.reduce((acc, g) => acc + g.progress, 0);
    return Math.round(sum / activeAndDone.length);
  }, [goals]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    goals.forEach((g) => {
      map[g.category] = (map[g.category] || 0) + 1;
    });
    return map;
  }, [goals]);

  // Filter & Sort goals
  const filteredGoals = useMemo(() => {
    let list = [...goals];

    // Filter by tab
    if (activeTab !== 'all') {
      list = list.filter((g) => g.status === activeTab);
    }

    // Filter by category if chosen in modal
    if (activeCategoryFilter) {
      list = list.filter((g) => g.category === activeCategoryFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      switch (sortOption) {
        case 'priority': {
          const priorityWeights = { high: 3, medium: 2, low: 1 };
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        }
        case 'progress':
          return b.progress - a.progress;
        case 'dueDate':
          return a.dueDate.localeCompare(b.dueDate);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'recentlyUpdated':
        default:
          return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      }
    });

    return list;
  }, [goals, activeTab, activeCategoryFilter, searchQuery, sortOption]);

  // Handlers for GoalCard actions
  const handleDuplicateGoal = (goal: DetailedGoal) => {
    onAddGoal({
      ...goal,
      title: `${goal.title} (Copy)`,
      status: 'active',
      progress: 0,
    });
  };

  const handleToggleArchive = (goal: DetailedGoal) => {
    onUpdateGoal({
      ...goal,
      status: goal.status === 'archived' ? 'active' : 'archived',
    });
  };

  const handleAddMilestoneToGoal = (
    goalId: string,
    milestone: { title: string; targetDate: string; notes?: string }
  ) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;

    const newM = {
      id: `m-${Date.now()}`,
      title: milestone.title,
      targetDate: milestone.targetDate,
      notes: milestone.notes,
      completed: false,
    };

    onUpdateGoal({
      ...target,
      milestones: [...(target.milestones || []), newM],
    });
  };

  return (
    <div
      id="goals-page-root"
      className="min-h-screen bg-[#08090D] text-[#F7F8FC] flex flex-col flex-1 pb-24 lg:pb-12 select-none"
    >
      {/* Top Header Bar */}
      <header
        id="goals-top-header"
        className="h-[72px] bg-[#0E1118]/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 border-b border-white/6 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          {/* Mobile Menu Trigger */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#A5AEC2] hover:text-white hover:bg-white/5"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Input */}
          <div className="relative w-full max-w-sm sm:max-w-md">
            <Search className="w-4 h-4 text-[#697388] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals, or type / for commands..."
              className="w-full h-10 pl-9 pr-14 bg-[#141821] border border-white/8 rounded-xl text-xs sm:text-sm text-[#F7F8FC] placeholder:text-[#697388] focus:outline-none focus:ring-1 focus:ring-[#6C63FF] focus:border-[#6C63FF] transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-[#A5AEC2] bg-[#0E1118] border border-white/10 rounded shadow-2xs">
                ⌘ K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3.5 pl-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl text-[#A5AEC2] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#F5B942]" />
            ) : (
              <Moon className="w-4 h-4 text-[#A5AEC2]" />
            )}
          </button>

          <button
            className="relative p-2 rounded-xl text-[#A5AEC2] hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5C67] rounded-full ring-2 ring-[#0E1118]" />
          </button>

          <div className="w-8 h-8 rounded-full bg-[#6C63FF] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            A
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1520px] w-full mx-auto flex flex-col gap-6">
        {/* Goals Page Header with Filter Tabs & New Goal CTA */}
        <GoalsHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={counts}
          onOpenCreateGoal={() => setIsCreateModalOpen(true)}
        />

        {/* Overview Banner Card */}
        <GoalsOverviewCard
          totalGoals={counts.all}
          activeGoals={counts.active}
          completedGoals={counts.completed}
          overallProgress={overallProgress}
        />

        {/* Your Goals Section Header with Sort & Search controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#F7F8FC]">
              Your Goals
            </h2>
            {activeCategoryFilter && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-[#6C63FF]/20 text-[#8B82FF]">
                <span>{activeCategoryFilter}</span>
                <button
                  onClick={() => setActiveCategoryFilter(null)}
                  className="hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                id="goals-sort-dropdown-trigger"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="h-9 px-3 bg-[#141821] hover:bg-[#181D27] border border-white/8 rounded-xl text-xs font-medium text-[#A5AEC2] hover:text-[#F7F8FC] flex items-center gap-1.5 transition-colors"
              >
                <span>Sort: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 top-10 w-44 bg-[#181D27] border border-white/12 rounded-xl shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                  {[
                    { id: 'priority', label: 'Priority' },
                    { id: 'progress', label: 'Progress' },
                    { id: 'dueDate', label: 'Due date' },
                    { id: 'recentlyUpdated', label: 'Recently updated' },
                    { id: 'alphabetical', label: 'Alphabetical' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSortOption(opt.id as GoalSortOption);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                        sortOption === opt.id
                          ? 'bg-[#6C63FF]/20 text-[#8B82FF] font-semibold'
                          : 'text-[#A5AEC2] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Search Field inside section */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#697388] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search goals..."
                className="h-9 pl-8 pr-3 bg-[#141821] border border-white/8 rounded-xl text-xs text-[#F7F8FC] placeholder:text-[#697388] focus:outline-none focus:border-[#6C63FF] w-36 sm:w-44 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Goal Cards Grid: 3 columns on desktop, 2 on tablet, 1 on mobile */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onSelect={(g) => setSelectedGoalForDetail(g)}
                onEdit={(g) => setSelectedGoalForDetail(g)}
                onAddMilestone={(g) => setGoalForMilestone(g)}
                onDuplicate={handleDuplicateGoal}
                onToggleArchive={handleToggleArchive}
                onDelete={onDeleteGoal}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-[#141821] border border-white/8 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[#F7F8FC]">No goals found</h3>
            <p className="text-xs text-[#697388] mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No goals matched your search query "${searchQuery}".`
                : 'Turn something important into a clear, actionable goal.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-[#6C63FF] hover:bg-[#7B73FF] text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create your first goal</span>
            </button>
          </div>
        )}

        {/* Bottom Content Row: Milestones, Categories, Motivational Inspiration */}
        <GoalBottomRow
          categoryCounts={categoryCounts}
          onOpenTimelineModal={() => {
            // Focus on milestones
            if (goals.length > 0) setSelectedGoalForDetail(goals[0]);
          }}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        />
      </main>

      {/* Mobile Floating Action Button '+' (52x52px, positioned at bottom: 76px; right: 18px) */}
      <button
        id="mobile-floating-add-goal"
        onClick={() => setIsCreateModalOpen(true)}
        className="sm:hidden fixed right-[18px] bottom-[76px] w-[52px] h-[52px] rounded-full bg-[#6C63FF] hover:bg-[#7B73FF] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all z-30"
        aria-label="New goal"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGoal={onAddGoal}
      />

      <GoalDetailModal
        goal={selectedGoalForDetail}
        isOpen={!!selectedGoalForDetail}
        onClose={() => setSelectedGoalForDetail(null)}
        onUpdateGoal={onUpdateGoal}
        onDeleteGoal={onDeleteGoal}
      />

      <AddMilestoneModal
        goal={goalForMilestone}
        isOpen={!!goalForMilestone}
        onClose={() => setGoalForMilestone(null)}
        onAddMilestone={handleAddMilestoneToGoal}
      />

      <CategorySelectorModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        selectedCategory={activeCategoryFilter || 'Career'}
        onSelectCategory={(cat) => setActiveCategoryFilter(cat)}
      />
    </div>
  );
};
