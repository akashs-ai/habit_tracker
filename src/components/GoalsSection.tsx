import React, { useState } from 'react';
import { Target, Dumbbell, BookOpen, Plus } from 'lucide-react';
import { Goal } from '../types';

interface GoalsSectionProps {
  goals: Goal[];
  onAddGoal?: () => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({ goals, onAddGoal }) => {
  const [activeFilter, setActiveFilter] = useState<'Active' | 'Completed' | 'Archived'>('Active');

  const getGoalIcon = (type: Goal['iconType'], color: string) => {
    switch (type) {
      case 'target':
        return <Target className="w-5 h-5" style={{ color }} />;
      case 'dumbbell':
        return <Dumbbell className="w-5 h-5" style={{ color }} />;
      case 'book':
        return <BookOpen className="w-5 h-5" style={{ color }} />;
      default:
        return <Target className="w-5 h-5" style={{ color }} />;
    }
  };

  const getIconBg = (color: string) => {
    switch (color) {
      case '#6366F1':
        return 'bg-[#EEECFF] dark:bg-[#201F3D]';
      case '#EF4444':
        return 'bg-[#FEE2E2] dark:bg-[#341818]';
      case '#F59E0B':
        return 'bg-[#FEF3C7] dark:bg-[#332511]';
      default:
        return 'bg-[#EEECFF] dark:bg-[#201F3D]';
    }
  };

  return (
    <section id="goals-section" className="flex flex-col gap-4">
      {/* Header with Navigation Filters and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight">
            Goals
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#F3F4F6] dark:bg-[#18181B] p-1 rounded-xl text-xs font-medium">
            {(['Active', 'Completed', 'Archived'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeFilter === filter
                    ? 'bg-[#111827] text-white dark:bg-[#FAFAFA] dark:text-[#111827] shadow-xs'
                    : 'text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <button
          id="add-goal-btn"
          onClick={onAddGoal}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#7C6CFF] border border-[#DDD6FE] dark:border-[#3D3A66] hover:bg-[#EEECFF] dark:hover:bg-[#201F3D] px-3.5 py-1.5 rounded-xl transition-all shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goal Cards 3-column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            id={`goal-card-${goal.id}`}
            className="bg-white dark:bg-[#111113] border border-[#E7EAF0] dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-4"
          >
            {/* Goal Icon Badge */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getIconBg(goal.color)}`}>
              {getGoalIcon(goal.iconType, goal.color)}
            </div>

            {/* Goal Details & Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-semibold text-xs sm:text-sm text-[#111827] dark:text-[#FAFAFA] truncate">
                  {goal.title}
                </h4>
                <span className="text-xs font-bold text-[#111827] dark:text-[#FAFAFA] ml-2 shrink-0">
                  {goal.progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#F1F2F6] dark:bg-[#202025] rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${goal.progressPercent}%`,
                    backgroundColor: goal.color,
                  }}
                />
              </div>

              {/* Milestones Label */}
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] text-right">
                {goal.completedUnits}/{goal.totalUnits} {goal.unitLabel}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
