import React from 'react';
import { Flame, Crown, BarChart3 } from 'lucide-react';
import { UserProfile } from '../types';

interface HeroBannerProps {
  user: UserProfile;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ user }) => {
  // Donut progress calculation: 780 / 1200 = 65%
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(user.currentXp / user.nextLevelXp, 1);
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <section id="hero-section" className="flex flex-col gap-5">
      {/* Title & Greeting */}
      <div id="greeting-area" className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight flex items-center gap-2">
          <span>Good morning, {user.name}!</span>
          <span className="text-2xl sm:text-3xl animate-pulse">👋</span>
        </h1>
        <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#A1A1AA] font-normal">
          Consistent today, Extraordinary tomorrow.
        </p>
      </div>

      {/* Hero Banner with Panorama & Embedded Bento Cards */}
      <div 
        id="hero-banner-card"
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E7EAF0] dark:border-[#27272A] shadow-xs transition-all"
      >
        {/* Landscape Panorama Background */}
        <div className="relative h-44 sm:h-52 w-full bg-gradient-to-b from-[#E8EFFE] via-[#F2EEFB] to-[#FCEEEA] dark:from-[#182038] dark:via-[#201C34] dark:to-[#2A1D2B] overflow-hidden">
          {/* Subtle sun glow */}
          <div className="absolute top-4 left-1/3 w-40 h-40 rounded-full bg-[#FFEAC2]/50 blur-3xl" />

          {/* Majestic mountain panorama SVG */}
          <svg 
            className="absolute bottom-0 w-full h-36 sm:h-44 object-cover" 
            viewBox="0 0 1000 240" 
            preserveAspectRatio="none" 
            fill="none"
          >
            {/* Back ridge */}
            <path 
              d="M0,240 L0,140 Q120,70 240,130 Q380,40 520,110 Q660,30 800,105 Q920,50 1000,90 L1000,240 Z" 
              fill="#C7D7F8" 
              opacity="0.45" 
            />
            {/* Mid mountain peaks with snow hints */}
            <path 
              d="M0,240 L0,165 L110,110 L230,170 L340,85 L440,150 L560,70 L690,145 L820,65 L940,135 L1000,105 L1000,240 Z" 
              fill="#B4C6EE" 
              opacity="0.65" 
            />
            {/* Front dramatic mountain peaks */}
            <path 
              d="M0,240 L0,180 L90,130 L180,195 L290,115 L400,175 L520,95 L640,170 L770,85 L890,155 L1000,120 L1000,240 Z" 
              fill="#8FA8DC" 
              opacity="0.85" 
            />
            {/* Snow highlights on peaks */}
            <polygon points="340,85 320,115 360,115" fill="#FFFFFF" opacity="0.6" />
            <polygon points="560,70 540,102 580,102" fill="#FFFFFF" opacity="0.6" />
            <polygon points="770,85 750,112 790,112" fill="#FFFFFF" opacity="0.6" />
            <polygon points="520,95 505,120 535,120" fill="#FFFFFF" opacity="0.7" />
          </svg>

          {/* Soft atmospheric mist */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-[#111113]/95 dark:via-[#111113]/40" />

          {/* Handwritten Quote in the top right */}
          <div className="absolute top-4 sm:top-6 right-6 sm:right-10 text-right select-none transform -rotate-1">
            <span className="font-handwriting text-2xl sm:text-3xl lg:text-4xl text-[#2B3674] dark:text-[#D1D9FF] font-semibold tracking-wide drop-shadow-2xs">
              Progress, not perfection.
            </span>
          </div>
        </div>

        {/* 4 Bento Overview Cards */}
        <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-md p-4 sm:p-5 border-t border-[#E7EAF0]/80 dark:border-[#27272A]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            
            {/* Bento Card 1: Level Progress */}
            <div 
              id="stat-card-level"
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-[#7C6CFF]/40 transition-all"
            >
              {/* Circular Donut Progress */}
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    className="stroke-[#E0E2EC] dark:stroke-[#2E2E36]"
                    strokeWidth="4.5"
                    fill="none"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    className="stroke-[#6366F1] transition-all duration-700 ease-out"
                    strokeWidth="4.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-[#6366F1]">65%</span>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[#111827] dark:text-[#FAFAFA]">Level {user.level}</span>
                </div>
                <p className="text-xs font-semibold text-[#4B5563] dark:text-[#D1D5DB]">
                  {user.currentXp.toLocaleString()} / {user.nextLevelXp.toLocaleString()} XP
                </p>
                <p className="text-[11px] text-[#9CA3AF] dark:text-[#80808A]">
                  Next level in {user.nextLevelXp - user.currentXp} XP
                </p>
              </div>
            </div>

            {/* Bento Card 2: Day Streak */}
            <div 
              id="stat-card-streak"
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-[#F97316]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFF4ED] dark:bg-[#2B1B14] flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 text-[#EA580C] dark:text-[#FB923C] fill-[#EA580C]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-[#111827] dark:text-[#FAFAFA] leading-tight">
                  {user.streakDays}
                </span>
                <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                  Day Streak
                </span>
              </div>
            </div>

            {/* Bento Card 3: Total Points */}
            <div 
              id="stat-card-points"
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-[#EAB308]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FEFCE8] dark:bg-[#262312] flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6 text-[#CA8A04] dark:text-[#FACC15] fill-[#CA8A04]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-[#111827] dark:text-[#FAFAFA] leading-tight">
                  {user.totalPoints}
                </span>
                <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                  Total Points
                </span>
              </div>
            </div>

            {/* Bento Card 4: Quests Done This Week */}
            <div 
              id="stat-card-quests-done"
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-[#22C55E]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] dark:bg-[#14261C] flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6 text-[#16A34A] dark:text-[#4ADE80]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-[#111827] dark:text-[#FAFAFA] leading-tight">
                  {user.questsDoneThisWeek}
                </span>
                <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                  Quests Done This Week
                </span>
              </div>
            </div>

          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-end gap-1.5 pt-3 pr-1">
            <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB] dark:bg-[#3F3F46]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB] dark:bg-[#3F3F46]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB] dark:bg-[#3F3F46]" />
          </div>
        </div>
      </div>
    </section>
  );
};
