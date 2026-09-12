import React from 'react';
import { Target, Calendar, Sparkles, GraduationCap, Dumbbell, Zap } from 'lucide-react';
import { CoachRobotAvatar } from './CoachRobotAvatar';

interface CoachHeroBannerProps {
  onSelectAction: (actionText: string) => void;
}

export const CoachHeroBanner: React.FC<CoachHeroBannerProps> = ({ onSelectAction }) => {
  return (
    <div
      id="ai-coach-hero-banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F1626] via-[#10192D] to-[#162035] border border-white/8 p-5 sm:p-6 lg:p-7 shadow-xl select-none"
    >
      {/* Background Mountain Silhouettes on Right Side (matching the image) */}
      <div className="absolute right-0 top-0 bottom-0 w-2/5 sm:w-1/2 pointer-events-none opacity-25 overflow-hidden">
        <svg
          className="absolute right-0 bottom-0 h-full w-auto"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M50 200 L160 80 L230 150 L310 50 L400 130 L400 200 Z"
            fill="#3B82F6"
            opacity="0.3"
          />
          <path
            d="M120 200 L210 110 L280 160 L360 85 L400 120 L400 200 Z"
            fill="#6366F1"
            opacity="0.4"
          />
          <circle cx="340" cy="65" r="30" fill="#F59E0B" opacity="0.25" filter="blur(8px)" />
        </svg>
      </div>

      {/* Desktop Layout: Horizontal with Robot on Left */}
      <div className="hidden lg:flex items-center gap-7 relative z-10">
        <CoachRobotAvatar size="lg" />

        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Hey Alex! <span className="inline-block hover:rotate-12 transition-transform">👋</span>
          </h2>
          <p className="text-xl font-bold text-white tracking-tight mt-0.5">
            How can I help you today?
          </p>
          <p className="text-xs text-[#94A3B8] mt-1.5 max-w-xl leading-relaxed">
            Whether it&apos;s study, fitness, productivity or life in general — I&apos;m here to support your journey.
          </p>

          {/* Action Pills Row */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => onSelectAction('Get Study Plan')}
              className="h-8.5 px-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/8 text-xs font-semibold text-white transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Study Plan</span>
            </button>
            <button
              onClick={() => onSelectAction('Build a Habit')}
              className="h-8.5 px-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/8 text-xs font-semibold text-white transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
            >
              <span>Build a Habit</span>
            </button>
            <button
              onClick={() => onSelectAction('Improve Focus')}
              className="h-8.5 px-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/8 text-xs font-semibold text-white transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Improve Focus</span>
            </button>
            <button
              onClick={() => onSelectAction('Plan My Day')}
              className="h-8.5 px-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/8 text-xs font-semibold text-white transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Plan My Day</span>
            </button>
            <button
              onClick={() => onSelectAction('Ask Anything')}
              className="h-8.5 px-3.5 rounded-xl bg-white/6 hover:bg-white/12 border border-white/8 text-xs font-semibold text-white transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Ask Anything</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tablet & Mobile Layout: Centered Avatar with Squircle Icon Grid (matching image) */}
      <div className="lg:hidden flex flex-col items-center text-center relative z-10">
        <CoachRobotAvatar size="md" className="mb-3" />

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-1.5">
          Hey Alex! <span>👋</span>
        </h2>
        <p className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
          How can I help you today?
        </p>
        <p className="text-xs text-[#94A3B8] mt-1 max-w-sm sm:max-w-md leading-relaxed">
          Whether it&apos;s study, fitness, productivity or life in general — I&apos;m here to support you.
        </p>

        {/* 4 Squircle Action Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 w-full max-w-sm sm:max-w-md">
          {/* Study */}
          <button
            onClick={() => onSelectAction('Create a study plan')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/25 flex items-center justify-center text-[#38BDF8] group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[11px] font-medium text-white/90 truncate">
              <span className="hidden sm:inline">Study Plan</span>
              <span className="inline sm:hidden">Study</span>
            </span>
          </button>

          {/* Workout */}
          <button
            onClick={() => onSelectAction('Suggest a workout routine')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#C084FC]/15 border border-[#C084FC]/25 flex items-center justify-center text-[#C084FC] group-hover:scale-105 transition-transform">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[11px] font-medium text-white/90 truncate">Workout</span>
          </button>

          {/* Focus */}
          <button
            onClick={() => onSelectAction('Improve my focus')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F97316]/15 border border-[#F97316]/25 flex items-center justify-center text-[#F97316] group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[11px] font-medium text-white/90 truncate">Focus</span>
          </button>

          {/* Plan */}
          <button
            onClick={() => onSelectAction('Plan my day')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#60A5FA]/15 border border-[#60A5FA]/25 flex items-center justify-center text-[#60A5FA] group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[11px] font-medium text-white/90 truncate">
              <span className="hidden sm:inline">Plan Day</span>
              <span className="inline sm:hidden">Plan</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
