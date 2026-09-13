import React from 'react';
import { BookOpen, Dumbbell, Moon, Code, Sparkles, Droplet, ArrowRight } from 'lucide-react';
import { ConsistentHabitItem } from '../../types';

interface MostConsistentHabitsCardProps {
  habits: ConsistentHabitItem[];
  onSeeAll?: () => void;
}

export const MostConsistentHabitsCard: React.FC<MostConsistentHabitsCardProps> = ({
  habits,
  onSeeAll,
}) => {
  const getIcon = (type: ConsistentHabitItem['icon']) => {
    switch (type) {
      case 'reading':
        return <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />;
      case 'workout':
        return <Dumbbell className="w-3.5 h-3.5 text-[#EC4899]" />;
      case 'sleep':
        return <Moon className="w-3.5 h-3.5 text-[#818CF8]" />;
      case 'coding':
        return <Code className="w-3.5 h-3.5 text-[#06B6D4]" />;
      case 'meditation':
        return <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />;
      case 'water':
        return <Droplet className="w-3.5 h-3.5 text-[#3B82F6]" />;
    }
  };

  return (
    <div 
      id="analytics-consistent-habits-card"
      className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F1723] border border-slate-200 dark:border-white/7 shadow-xs flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Most Consistent Habits
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Your top performing habits this period.
          </p>
        </div>

        <button
          onClick={onSeeAll}
          className="text-xs text-indigo-600 dark:text-[#818CF8] hover:text-indigo-700 dark:hover:text-[#A5B4FC] font-medium flex items-center gap-1 transition-colors cursor-pointer group"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Habit list rows */}
      <div className="flex flex-col gap-2.5 pt-3">
        {habits.slice(0, 5).map((habit) => (
          <div key={habit.id} className="flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Icon */}
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/8 flex items-center justify-center shrink-0">
                {getIcon(habit.icon)}
              </div>

              {/* Title & Bar */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-medium text-slate-800 dark:text-white/90 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {habit.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white tabular-nums">
                    {habit.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-white/7 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#6366F1] to-[#818CF8]"
                    style={{ width: `${habit.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
