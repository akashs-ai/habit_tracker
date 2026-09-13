import React from 'react';
import { Plus } from 'lucide-react';
import { GoalStatus } from '../../types';

interface GoalsHeaderProps {
  activeTab: 'all' | GoalStatus;
  setActiveTab: (tab: 'all' | GoalStatus) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
    archived: number;
  };
  onOpenCreateGoal: () => void;
}

export const GoalsHeader: React.FC<GoalsHeaderProps> = ({
  activeTab,
  setActiveTab,
  counts,
  onOpenCreateGoal,
}) => {
  const tabs: { id: 'all' | GoalStatus; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'archived', label: 'Archived', count: counts.archived },
  ];

  return (
    <div id="goals-page-header" className="flex flex-col gap-5">
      {/* Top Title & Motivational Quote */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 dark:text-[#F7F8FC] tracking-tight leading-tight">
            Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#A5AEC2] mt-1">
            Turn your vision into reality.
          </p>
        </div>

        {/* Motivational quote (subtle, right aligned on desktop) */}
        <p className="text-xs text-slate-400 dark:text-[#697388] italic self-start sm:self-auto sm:text-right max-w-xs mt-1 sm:mt-0">
          “Big goals are just small steps, consistently taken.”
        </p>
      </div>

      {/* Tabs & New Goal Button Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`filter-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`h-9 px-3.5 sm:px-4 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#6C63FF] text-white shadow-xs'
                    : 'bg-white dark:bg-[#141821] hover:bg-slate-50 dark:hover:bg-[#181D27] text-slate-600 dark:text-[#A5AEC2] hover:text-slate-900 dark:hover:text-[#F7F8FC] border border-slate-200 dark:border-white/8 shadow-xs'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[11px] font-medium ${isActive ? 'text-white/80' : 'text-slate-400 dark:text-[#697388]'}`}>
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* + New Goal Button */}
        <button
          id="btn-new-goal"
          onClick={onOpenCreateGoal}
          className="h-9 sm:h-10 px-4 sm:px-5 rounded-[10px] bg-[#6C63FF] hover:bg-[#7B73FF] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 transition-colors shrink-0 active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>
    </div>
  );
};
