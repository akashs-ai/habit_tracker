import React from 'react';

interface GoalsOverviewCardProps {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overallProgress: number;
}

export const GoalsOverviewCard: React.FC<GoalsOverviewCardProps> = ({
  totalGoals,
  activeGoals,
  completedGoals,
  overallProgress,
}) => {
  // SVG circular progress calculation
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <div
      id="goals-overview-banner"
      className="relative overflow-hidden bg-white dark:bg-[#141821] border border-slate-200 dark:border-white/8 rounded-[16px] p-5 sm:p-6 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.22)] transition-colors"
    >
      {/* Decorative panoramic mountain background in right portion (desktop/tablet) */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 lg:w-5/12 pointer-events-none opacity-30 dark:opacity-75 overflow-hidden">
        <svg
          viewBox="0 0 500 200"
          preserveAspectRatio="none"
          className="w-full h-full object-cover"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#251F3D" />
              <stop offset="50%" stopColor="#4A2545" />
              <stop offset="85%" stopColor="#C86A5E" />
              <stop offset="100%" stopColor="#F9AA6D" />
            </linearGradient>
            <linearGradient id="mtnBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E1934" />
              <stop offset="100%" stopColor="#10111A" />
            </linearGradient>
            <linearGradient id="mtnFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#141824" />
              <stop offset="100%" stopColor="#0B0E14" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="500" height="200" fill="url(#skyGrad)" opacity="0.6" />

          {/* Sun */}
          <circle cx="380" cy="110" r="28" fill="#FCE3A1" opacity="0.9" />
          <circle cx="380" cy="110" r="42" fill="#FCE3A1" opacity="0.25" />

          {/* Back Mountains */}
          <polygon
            points="140,200 230,120 300,160 360,110 440,170 500,130 500,200"
            fill="url(#mtnBack)"
            opacity="0.85"
          />

          {/* Front Mountains */}
          <polygon
            points="180,200 270,140 330,180 400,135 480,185 500,160 500,200"
            fill="url(#mtnFront)"
          />
        </svg>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Quote Row (desktop & tablet) */}
        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-[#A5AEC2] italic tracking-wide mb-4">
          “ A better you is a collection of better days. ”
        </p>

        {/* Metrics Grid / Row */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-10 lg:gap-14">
          {/* Total Goals */}
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F7F8FC] tabular-nums tracking-tight">
              {totalGoals}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-[#697388] mt-0.5">
              Total Goals
            </span>
          </div>

          {/* Active */}
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F7F8FC] tabular-nums tracking-tight">
              {activeGoals}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-[#697388] mt-0.5">
              Active
            </span>
          </div>

          {/* Completed */}
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F7F8FC] tabular-nums tracking-tight">
              {completedGoals}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-[#697388] mt-0.5">
              Completed
            </span>
          </div>

          {/* Overall Progress with Circular Progress Ring */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F7F8FC] tabular-nums tracking-tight">
                {overallProgress}%
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-[#697388] mt-0.5">
                Overall Progress
              </span>
            </div>

            {/* Circular Progress Gauge */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r={radius}
                  className="stroke-slate-200 dark:stroke-white/10"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="30"
                  cy="30"
                  r={radius}
                  className="stroke-[#6C63FF] transition-all duration-1000 ease-out"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
