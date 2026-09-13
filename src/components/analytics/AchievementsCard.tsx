import React from 'react';
import { Award, Sun, Zap, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { AnalyticsAchievement } from '../../types';

interface AchievementsCardProps {
  achievements: AnalyticsAchievement[];
  onSeeAll?: () => void;
}

export const AchievementsCard: React.FC<AchievementsCardProps> = ({
  achievements,
  onSeeAll,
}) => {
  const getIcon = (type: AnalyticsAchievement['icon']) => {
    switch (type) {
      case 'streak':
        return <Award className="w-4 h-4 text-[#F59E0B]" />;
      case 'riser':
        return <Sun className="w-4 h-4 text-[#FBBF24]" />;
      case 'focus':
        return <Zap className="w-4 h-4 text-[#38BDF8]" />;
      case 'consistency':
        return <CheckCircle2 className="w-4 h-4 text-[#34D399]" />;
      case 'crusher':
        return <Shield className="w-4 h-4 text-[#A855F7]" />;
    }
  };

  return (
    <div 
      id="analytics-achievements-card"
      className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0F1723] border border-slate-200 dark:border-white/7 shadow-xs flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Key Milestones
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Evidence-based productivity achievements.
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

      {/* Milestones list */}
      <div className="flex flex-col gap-2.5 pt-3">
        {achievements.slice(0, 4).map((ach) => (
          <div
            key={ach.id}
            className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-50 dark:bg-white/3 hover:bg-slate-100/80 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/5 transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/8 flex items-center justify-center shrink-0">
                {getIcon(ach.icon)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-white/90 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {ach.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate mt-0.5">
                  {ach.description}
                </p>
              </div>
            </div>

            {ach.earnedDate && (
              <span className="text-[10px] text-slate-400 dark:text-[#64748B] whitespace-nowrap tabular-nums">
                {ach.earnedDate}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
