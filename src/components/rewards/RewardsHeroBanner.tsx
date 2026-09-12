import React from 'react';
import { Sparkles, Flame, BarChart3, Crown, ChevronRight } from 'lucide-react';

interface RewardsHeroBannerProps {
  momentumPoints: number;
  pointsThisWeek: number;
  streakDays: number;
  weeklyConsistency: number;
  level: number;
  currentXP: number;
  maxXP: number;
  onOpenPointsDetail?: () => void;
}

export const RewardsHeroBanner: React.FC<RewardsHeroBannerProps> = ({
  momentumPoints,
  pointsThisWeek,
  streakDays,
  weeklyConsistency,
  level,
  currentXP,
  maxXP,
  onOpenPointsDetail,
}) => {
  const xpPercentage = Math.min(100, Math.round((currentXP / maxXP) * 100));

  return (
    <div 
      id="rewards-hero-banner"
      className="relative rounded-3xl overflow-hidden border border-white/8 bg-[#0D1017] p-5 sm:p-7 lg:p-8 transition-all"
    >
      {/* Scenic Mountain Landscape with Dusk Aurora Silhouette SVG Backdrop */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Sky Ambient Gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 90% 80% at 85% 20%, rgba(99, 102, 241, 0.28) 0%, rgba(30, 27, 75, 0.45) 45%, rgba(13, 16, 23, 0.95) 90%)',
          }}
        />

        {/* Glowing Sun / Dusk Moon in the Upper Right */}
        <div className="absolute top-10 right-28 sm:right-48 w-16 h-16 rounded-full bg-[#FFE4A0]/25 blur-lg pointer-events-none" />
        <div className="absolute top-12 right-30 sm:right-50 w-11 h-11 rounded-full bg-[#FFEAA7]/90 shadow-[0_0_35px_rgba(255,234,167,0.7)] pointer-events-none" />

        {/* Stars */}
        <div className="absolute top-6 left-1/4 w-1 h-1 rounded-full bg-white/60 animate-pulse" />
        <div className="absolute top-14 left-1/3 w-1.5 h-1.5 rounded-full bg-white/70" />
        <div className="absolute top-8 right-1/4 w-1 h-1 rounded-full bg-white/50" />
        <div className="absolute top-16 right-1/3 w-1 h-1 rounded-full bg-white/80" />

        {/* Layered Mountains Vector */}
        <svg 
          className="absolute bottom-0 right-0 w-full lg:w-[68%] h-48 sm:h-56 object-cover opacity-65 lg:opacity-85 pointer-events-none"
          viewBox="0 0 700 220" 
          preserveAspectRatio="none" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Far ridge */}
          <path 
            d="M0 220 L70 140 L160 180 L250 110 L340 165 L430 85 L520 150 L610 95 L700 135 L700 220 Z" 
            fill="#1E1B4B" 
            fillOpacity="0.45" 
          />
          {/* Mid ridge */}
          <path 
            d="M50 220 L130 160 L210 195 L300 130 L400 185 L490 110 L580 170 L660 120 L700 150 L700 220 Z" 
            fill="#171A2E" 
            fillOpacity="0.75" 
          />
          {/* Foreground dark ridge */}
          <path 
            d="M120 220 L220 175 L310 205 L420 150 L530 200 L620 140 L700 180 L700 220 Z" 
            fill="#0D1017" 
            fillOpacity="0.95" 
          />
        </svg>
      </div>

      {/* Top Row: Title / Subtitle + Right Motivational Quote */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="max-w-2xl">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/6 border border-white/8 text-[11px] font-bold tracking-wider text-[#A5B4FC] uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#818CF8]" />
            <span>Rewards</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
            Your consistency{' '}
            <span className="bg-gradient-to-r from-[#A5B4FC] via-[#818CF8] to-[#C7D2FE] bg-clip-text text-transparent">
              unlocks a better you.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-[#9AA3B5] mt-2.5 max-w-xl leading-relaxed">
            Earn Momentum Points (MP) by completing your habits, tasks and goals. Use them to unlock themes, icons, badges and more.
          </p>
        </div>

        {/* Right Quote on Desktop */}
        <div className="hidden lg:block text-right shrink-0 pt-1">
          <p className="text-sm italic font-serif text-white/90 leading-snug">
            &ldquo;Small steps. <br /> A more intentional you.&rdquo;
          </p>
          <span className="text-[11px] font-semibold text-[#818CF8] tracking-wide mt-1 block">
            — LifeRPG
          </span>
        </div>
      </div>

      {/* Hero Stats Row: Momentum Points Card + 3 Mini Stats */}
      <div className="relative z-10 mt-7 pt-5 border-t border-white/6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-center">
        
        {/* 1. Primary Momentum Points Card */}
        <div 
          onClick={onOpenPointsDetail}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#141822]/90 hover:bg-[#181D2A] border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group flex items-center justify-between gap-3 shadow-lg shadow-black/20"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* 4-point sparkle badge */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight tabular-nums">
                  {momentumPoints.toLocaleString()} MP
                </span>
              </div>
              <p className="text-[11px] text-[#818CF8] font-medium tracking-wide">
                Momentum Points
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-[10px] sm:text-[11px] font-bold whitespace-nowrap">
              +{pointsThisWeek} this week
            </span>
            <ChevronRight className="w-4 h-4 text-[#687185] group-hover:text-white transition-colors" />
          </div>
        </div>

        {/* 2. Streak Mini Stat */}
        <div className="p-3.5 rounded-2xl bg-[#121620]/80 border border-white/6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F97316]/15 border border-[#F97316]/25 flex items-center justify-center text-[#F97316] shrink-0">
            <Flame className="w-5 h-5 fill-[#F97316]" />
          </div>
          <div>
            <p className="text-base font-extrabold text-white tracking-tight leading-tight">
              {streakDays} days
            </p>
            <p className="text-[11px] text-[#9AA3B5] font-medium mt-0.5">
              Current Streak
            </p>
          </div>
        </div>

        {/* 3. Consistency Mini Stat */}
        <div className="p-3.5 rounded-2xl bg-[#121620]/80 border border-white/6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/25 flex items-center justify-center text-[#38BDF8] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base font-extrabold text-white tracking-tight leading-tight">
              {weeklyConsistency}%
            </p>
            <p className="text-[11px] text-[#9AA3B5] font-medium mt-0.5">
              Weekly Consistency
            </p>
          </div>
        </div>

        {/* 4. Level & XP Progress Mini Stat */}
        <div className="p-3.5 rounded-2xl bg-[#121620]/80 border border-white/6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/15 border border-[#FBBF24]/25 flex items-center justify-center text-[#FBBF24] shrink-0">
            <Crown className="w-5 h-5 fill-[#FBBF24]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-white">Level {level}</span>
              <span className="text-[10px] text-[#687185] font-mono">
                {currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-full transition-all duration-500" 
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
