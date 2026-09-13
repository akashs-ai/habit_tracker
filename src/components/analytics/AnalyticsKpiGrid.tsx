import React from 'react';
import { Flame, Check, Sparkles, ChevronRight, BarChart2 } from 'lucide-react';
import { AnalyticsKpiData } from '../../types';

interface AnalyticsKpiGridProps {
  data: AnalyticsKpiData;
  onOpenKpiDetail?: (type: string) => void;
}

export const AnalyticsKpiGrid: React.FC<AnalyticsKpiGridProps> = ({
  data,
  onOpenKpiDetail,
}) => {
  // Circular progress math for KPI 1:
  // radius = 21, circumference = 2 * Math.PI * 21 = ~131.95
  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.overallConsistency / 100) * circumference;

  return (
    <div 
      id="analytics-kpi-grid"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-3.5"
    >
      {/* 1. Overall Consistency */}
      <div
        onClick={() => onOpenKpiDetail?.('consistency')}
        className="h-[108px] sm:h-[114px] p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0F1723] hover:bg-slate-50 dark:hover:bg-[#131D2D] border border-slate-200 dark:border-white/7 hover:border-slate-300 dark:hover:border-white/12 shadow-xs transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Circular Progress Ring */}
          <div className="relative w-12 h-12 sm:w-13 sm:h-13 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
              <circle
                cx="26"
                cy="26"
                r={radius}
                className="stroke-slate-200 dark:stroke-white/8 fill-none"
                strokeWidth="4.5"
              />
              <circle
                cx="26"
                cy="26"
                r={radius}
                className="stroke-sky-500 dark:stroke-[#38BDF8] fill-none transition-all duration-500"
                strokeWidth="4.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {data.overallConsistency}%
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              Overall Consistency
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-[#34D399] font-medium flex items-center gap-1 mt-0.5 whitespace-nowrap">
              <span>↑ {data.consistencyChange}% from last week</span>
            </p>
          </div>
        </div>

        {/* Mini Sparkline in Top Right */}
        <div className="hidden sm:flex items-center self-start text-slate-400 dark:text-[#64748B] opacity-70 group-hover:opacity-100 transition-opacity">
          <BarChart2 className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Current Streak */}
      <div 
        onClick={() => onOpenKpiDetail?.('streak')}
        className="h-[108px] sm:h-[114px] p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0F1723] hover:bg-slate-50 dark:hover:bg-[#131D2D] border border-slate-200 dark:border-white/7 hover:border-slate-300 dark:hover:border-white/12 shadow-xs transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-[#F97316]/12 border border-orange-200 dark:border-[#F97316]/20 flex items-center justify-center text-[#F97316] shrink-0">
            <Flame className="w-5 h-5 fill-[#F97316]" />
          </div>

          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none tabular-nums">
              {data.currentStreakDays} Days
            </p>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium mt-1 truncate">
              Current Streak
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-[#34D399] font-medium mt-0.5 flex items-center gap-0.5">
              <span>↑ {data.streakChangeDays} days</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center self-start text-slate-400 dark:text-[#64748B] opacity-70 group-hover:opacity-100 transition-opacity">
          <BarChart2 className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Tasks Completed */}
      <div 
        onClick={() => onOpenKpiDetail?.('tasks')}
        className="h-[108px] sm:h-[114px] p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0F1723] hover:bg-slate-50 dark:hover:bg-[#131D2D] border border-slate-200 dark:border-white/7 hover:border-slate-300 dark:hover:border-white/12 shadow-xs transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-[#34D399]/12 border border-emerald-200 dark:border-[#34D399]/20 flex items-center justify-center text-emerald-600 dark:text-[#34D399] shrink-0">
            <Check className="w-5 h-5 stroke-[2.8]" />
          </div>

          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none tabular-nums">
              {data.tasksCompleted} / {data.tasksTotal}
            </p>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium mt-1 truncate">
              Tasks Completed
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-[#34D399] font-medium mt-0.5 flex items-center gap-0.5">
              <span>↑ {data.tasksChangePct}%</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center self-start text-slate-400 dark:text-[#64748B] opacity-70 group-hover:opacity-100 transition-opacity">
          <BarChart2 className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Momentum Points */}
      <div 
        onClick={() => onOpenKpiDetail?.('momentum')}
        className="h-[108px] sm:h-[114px] p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0F1723] hover:bg-slate-50 dark:hover:bg-[#131D2D] border border-slate-200 dark:border-white/7 hover:border-slate-300 dark:hover:border-white/12 shadow-xs transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-[#8B5CF6]/15 border border-purple-200 dark:border-[#8B5CF6]/25 flex items-center justify-center text-purple-600 dark:text-[#A78BFA] shrink-0">
            <Sparkles className="w-5 h-5 fill-purple-500 dark:fill-[#A78BFA]" />
          </div>

          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none tabular-nums">
              {data.momentumPoints.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium mt-1 truncate">
              Momentum Points
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-[#34D399] font-medium mt-0.5 flex items-center gap-0.5 whitespace-nowrap">
              <span>↑ {data.momentumPointsWeeklyGain} this week</span>
            </p>
          </div>
        </div>

        <div className="flex items-center text-slate-400 dark:text-[#64748B] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
