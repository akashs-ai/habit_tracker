import React from 'react';
import { ArrowRight, Flame, Sparkles, Sun, Check, Target, Compass, Award } from 'lucide-react';
import { RewardBadge } from '../../types';

interface BadgeProgressSectionProps {
  badges: RewardBadge[];
  nextBadge: {
    id: string;
    name: string;
    currentDays: number;
    totalDays: number;
    daysRemaining: number;
    progressPercentage: number;
  };
  onSelectBadge: (badge: RewardBadge) => void;
  onViewNextBadgeDetails: () => void;
  onSeeAllBadges?: () => void;
}

export const BadgeProgressSection: React.FC<BadgeProgressSectionProps> = ({
  badges,
  nextBadge,
  onSelectBadge,
  onViewNextBadgeDetails,
  onSeeAllBadges,
}) => {
  const renderBadgeIcon = (badge: RewardBadge) => {
    switch (badge.iconType) {
      case 'first-step':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {/* Seedling / Leaf geometric */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22v-8M12 14c-4 0-7-3-7-7 4 0 7 3 7 7zm0 0c4 0 7-3 7-7-4 0-7 3-7 7z" />
            </svg>
          </div>
        );

      case '7-day':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sun className="w-6 h-6 stroke-[2.2]" />
          </div>
        );

      case '30-day':
        return (
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Flame className="w-6 h-6 fill-indigo-400 stroke-indigo-400" />
          </div>
        );

      case 'early-riser':
        return (
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Sun className="w-6 h-6 stroke-[2.2]" />
          </div>
        );

      case 'deep-work':
        return (
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Flame className="w-6 h-6 fill-cyan-400 stroke-cyan-400" />
          </div>
        );

      case 'goal-crusher':
        return (
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Target className="w-6 h-6" />
          </div>
        );

      case 'liferpg':
        return (
          <div className="w-12 h-12 rounded-2xl bg-slate-500/15 border border-slate-500/30 flex items-center justify-center text-slate-300">
            <Award className="w-6 h-6" />
          </div>
        );

      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div id="badge-progress-container" className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
      
      {/* 1. Left 2-Columns: Badge Progress */}
      <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-white/6 flex flex-col justify-between shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Badge Progress</h3>
            <p className="text-xs text-slate-500 dark:text-[#9AA3B5] mt-0.5">Collect badges. Show your journey.</p>
          </div>

          {onSeeAllBadges && (
            <button
              onClick={onSeeAllBadges}
              className="text-xs font-semibold text-indigo-600 dark:text-[#818CF8] hover:text-indigo-700 dark:hover:text-[#A5B4FC] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable / Grid Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3 mt-4 overflow-x-auto pb-1">
          {badges.map((badge) => {
            const isOwned = badge.status === 'owned';

            return (
              <div
                key={badge.id}
                onClick={() => onSelectBadge(badge)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E1218] border border-slate-200 dark:border-white/4 hover:border-indigo-500/30 transition-all flex flex-col items-center text-center cursor-pointer group justify-between min-h-[140px]"
              >
                {/* Badge Icon Emblem */}
                <div className="group-hover:scale-105 transition-transform">
                  {renderBadgeIcon(badge)}
                </div>

                {/* Badge Title & Requirement */}
                <div className="my-2 min-w-0 w-full">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#A5B4FC] transition-colors truncate">
                    {badge.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-[#687185] mt-0.5 line-clamp-1">
                    {badge.requirement}
                  </p>
                </div>

                {/* Status / Price Tag */}
                {isOwned ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Owned
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#F59E0B]">
                    <Flame className="w-3 h-3" />
                    <span>{badge.cost?.toLocaleString()} MP</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Right 1-Column: Your Next Badge */}
      <div 
        id="your-next-badge-card"
        className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-white/6 flex flex-col justify-between shadow-xs"
      >
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Your Next Badge</h3>
          
          {/* Circular Glowing Flame Emblem */}
          <div className="flex flex-col items-center text-center my-4">
            <div className="relative w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-[#F97316]/30 via-[#EA580C] to-[#F59E0B]/20 flex items-center justify-center shadow-[0_0_25px_rgba(234,88,12,0.25)]">
              <div className="w-full h-full rounded-full bg-slate-50 dark:bg-[#0E1218] flex items-center justify-center">
                <Flame className="w-9 h-9 fill-[#F97316] text-[#F97316] filter drop-shadow-[0_0_8px_rgba(249,115,22,0.7)]" />
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5">
              {nextBadge.name}
            </h4>

            {/* Days Progress */}
            <p className="text-xs text-slate-600 dark:text-[#9AA3B5] mt-1 font-semibold">
              <span className="text-slate-900 dark:text-white font-extrabold">{nextBadge.currentDays}</span> / {nextBadge.totalDays} days
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/8 overflow-hidden mt-3 max-w-[200px]">
              <div 
                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#6366F1] rounded-full transition-all duration-500" 
                style={{ width: `${nextBadge.progressPercentage}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-[#687185] mt-1.5 font-medium">
              {nextBadge.daysRemaining} days remaining
            </p>
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={onViewNextBadgeDetails}
          className="w-full h-9 rounded-xl bg-[#6366F1] hover:bg-[#7C7FF5] text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          View Details
        </button>
      </div>

    </div>
  );
};
