import React, { useMemo } from 'react';
import { ArrowRight, Code, Heart, BookOpen, User, FolderGit2, Flag } from 'lucide-react';
import { DetailedGoal } from '../../types';

interface GoalBottomRowProps {
  goals?: DetailedGoal[];
  onOpenTimelineModal?: () => void;
  onOpenCategoryModal?: () => void;
  categoryCounts: Record<string, number>;
}

export const GoalBottomRow: React.FC<GoalBottomRowProps> = ({
  goals = [],
  onOpenTimelineModal,
  onOpenCategoryModal,
  categoryCounts,
}) => {
  const categoriesList = [
    { name: 'Career', count: categoryCounts['Career'] || 0, color: '#6C63FF', icon: Code },
    { name: 'Health', count: categoryCounts['Health'] || 0, color: '#31C48D', icon: Heart },
    { name: 'Learning', count: categoryCounts['Learning'] || 0, color: '#F59E0B', icon: BookOpen },
    { name: 'Personal', count: categoryCounts['Personal'] || 0, color: '#FF5C67', icon: User },
    { name: 'Projects', count: categoryCounts['Projects'] || 0, color: '#4F8CFF', icon: FolderGit2 },
  ];

  // Dynamically extract milestones from real active goals, sorted chronologically
  const timelineMilestones = useMemo(() => {
    const rawMilestones: { title: string; targetDate: string; completed: boolean }[] = [];
    
    for (const g of goals) {
      if (g.status === 'archived') continue;
      if (g.milestones && g.milestones.length > 0) {
        for (const m of g.milestones) {
          rawMilestones.push({
            title: m.title,
            targetDate: m.targetDate || '',
            completed: Boolean(m.completed),
          });
        }
      }
    }

    // Sort chronologically by targetDate, placing missing/invalid dates at the end deterministically
    rawMilestones.sort((a, b) => {
      const timeA = a.targetDate ? new Date(a.targetDate).getTime() : NaN;
      const timeB = b.targetDate ? new Date(b.targetDate).getTime() : NaN;
      const validA = !isNaN(timeA);
      const validB = !isNaN(timeB);

      if (validA && validB) {
        if (timeA !== timeB) return timeA - timeB;
      } else if (validA && !validB) {
        return -1;
      } else if (!validA && validB) {
        return 1;
      }
      return a.title.localeCompare(b.title);
    });

    const list = rawMilestones.slice(0, 4).map((m, idx) => ({
      step: `M${idx + 1}`,
      title: m.title,
      date: m.targetDate || 'Upcoming',
      completed: m.completed,
      isCurrent: false,
    }));

    // Mark the first non-completed milestone as current
    let foundCurrent = false;
    for (const item of list) {
      if (!item.completed && !foundCurrent) {
        item.isCurrent = true;
        foundCurrent = true;
      }
    }

    return list;
  }, [goals]);

  const completedTimelineCount = timelineMilestones.filter((m) => m.completed).length;
  const timelineProgressPercent = timelineMilestones.length > 0
    ? Math.round((completedTimelineCount / timelineMilestones.length) * 100)
    : 0;

  return (
    <div
      id="goals-bottom-row"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
    >
      {/* 1. Goal Milestones Card */}
      <div className="bg-white dark:bg-[#141821] border border-slate-200 dark:border-white/8 rounded-[14px] p-5 flex flex-col justify-between shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-colors">
        <div className="flex items-center justify-between pb-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-[#F7F8FC]">
            Goal Milestones
          </h4>
          <button
            onClick={onOpenTimelineModal}
            className="flex items-center gap-1 text-xs text-[#6C63FF] hover:text-[#8B82FF] font-medium transition-colors cursor-pointer"
          >
            <span>View Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timeline visualization */}
        {timelineMilestones.length > 0 ? (
          <div className="relative py-4 my-auto">
            {/* Base Track */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 bg-slate-200 dark:bg-white/10" />

            {/* Active Filled Track */}
            <div 
              className="absolute top-1/2 left-4 h-0.5 -translate-y-1/2 bg-[#6C63FF] transition-all duration-500" 
              style={{ width: `${Math.max(5, timelineProgressPercent * 0.85)}%` }}
            />

            {/* Milestone Nodes */}
            <div className="relative flex items-center justify-between px-1">
              {timelineMilestones.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center group max-w-[72px] text-center">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      item.isCurrent
                        ? 'bg-[#6C63FF] border-[#6C63FF] ring-4 ring-[#6C63FF]/20'
                        : item.completed
                        ? 'bg-[#6C63FF] border-[#6C63FF]'
                        : 'bg-white dark:bg-[#141821] border-slate-300 dark:border-white/20'
                    }`}
                  />
                  <span className="text-[11px] font-medium text-slate-900 dark:text-[#F7F8FC] mt-2 truncate w-full" title={item.title}>
                    {item.step}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-[#697388] truncate w-full">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-5 text-center my-auto flex flex-col items-center justify-center">
            <Flag className="w-6 h-6 text-slate-300 dark:text-[#697388]/50 mb-1.5" />
            <p className="text-xs text-slate-500 dark:text-[#697388]">
              No milestones created yet.
            </p>
            <span className="text-[11px] text-slate-400 dark:text-[#697388]/80 mt-0.5">
              Add milestones to your goals to populate timeline.
            </span>
          </div>
        )}
      </div>

      {/* 2. Goal Categories Card */}
      <div className="bg-white dark:bg-[#141821] border border-slate-200 dark:border-white/8 rounded-[14px] p-5 flex flex-col justify-between shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-colors">
        <div className="flex items-center justify-between pb-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-[#F7F8FC]">
            Goal Categories
          </h4>
          <button
            onClick={onOpenCategoryModal}
            className="flex items-center gap-1 text-xs text-[#6C63FF] hover:text-[#8B82FF] font-medium transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories summary chips / rows */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-2">
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                onClick={onOpenCategoryModal}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5"
                  style={{
                    backgroundColor: `${cat.color}20`,
                    color: cat.color,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-900 dark:text-[#F7F8FC]">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#697388]">
                  {cat.count} {cat.count === 1 ? 'goal' : 'goals'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Motivational Inspiration Card */}
      <div className="relative overflow-hidden bg-slate-900 dark:bg-[#141821] border border-slate-200 dark:border-white/8 rounded-[14px] p-5 flex flex-col justify-between shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.18)] md:col-span-2 lg:col-span-1 min-h-[140px] transition-colors">
        {/* Background Sunset Graphic */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <svg
            viewBox="0 0 400 160"
            preserveAspectRatio="none"
            className="w-full h-full object-cover"
          >
            <defs>
              <linearGradient id="cardSky" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E1934" />
                <stop offset="60%" stopColor="#3F2342" />
                <stop offset="100%" stopColor="#9C4A52" />
              </linearGradient>
            </defs>
            <rect width="400" height="160" fill="url(#cardSky)" />
            <circle cx="290" cy="90" r="22" fill="#FCE3A1" opacity="0.8" />
            {/* Mountains */}
            <polygon
              points="100,160 170,105 230,135 280,95 340,140 400,110 400,160"
              fill="#141824"
              opacity="0.9"
            />
            <polygon
              points="130,160 210,120 270,145 320,115 380,150 400,135 400,160"
              fill="#0E1118"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full">
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight italic">
            “Discipline today, <br /> a brighter tomorrow.”
          </h3>
        </div>
      </div>
    </div>
  );
};
