import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Crown,
  BarChart3,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  CheckCircle2,
  Swords,
  Sparkles,
  Clock,
  Trophy,
  Gift,
  ShieldCheck,
  Activity,
  BrainCircuit,
  Bot,
  TrendingUp,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { UserProfile, MotivationalQuote } from '../types';
import { getCurrentTimeInfo, formatFullDayHeader, getLiveTodayISO } from '../utils/dateUtils';

interface HeroBannerProps {
  user: UserProfile;
  onNavigateTab?: (tab: string) => void;
  activeQuote?: MotivationalQuote;
  onOpenQuotesModal?: () => void;
}

const TOTAL_SLIDES = 4;
const SLIDE_INTERVAL_MS = 4800;

export const HeroBanner: React.FC<HeroBannerProps> = ({ 
  user, 
  onNavigateTab,
  activeQuote,
  onOpenQuotesModal
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Donut progress calculation for Slide 1
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const safeNextLevelXp = Math.max(1, user.nextLevelXp || 500);
  const safeCurrentXp = Math.max(0, user.currentXp || 0);
  const progressRatio = Math.min(Math.max(0, safeCurrentXp / safeNextLevelXp), 1);
  const strokeDashoffset = circumference - progressRatio * circumference;
  const progressPercent = Math.round(progressRatio * 100);

  const { greeting: timeGreeting } = getCurrentTimeInfo();
  const liveDateString = formatFullDayHeader(getLiveTodayISO());

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = useCallback((newIndex: number, newDirection?: number) => {
    setDirection(newDirection !== undefined ? newDirection : newIndex > currentSlide ? 1 : -1);
    setCurrentSlide(newIndex);
  }, [currentSlide]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
  }, []);

  // Automatic timer with pause on hover & manual pause
  useEffect(() => {
    if (isPaused || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, SLIDE_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isHovered, handleNext]);

  // Touch swipe handling for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <section id="hero-section" className="flex flex-col gap-5">
      {/* Title & Greeting */}
      <div id="greeting-area" className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#111827] dark:text-[#FAFAFA] tracking-tight flex items-center gap-2">
            <span>{timeGreeting}, {user.name}!</span>
            <span className="text-2xl sm:text-3xl animate-pulse">👋</span>
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#A1A1AA] font-normal">
            Consistent today, Extraordinary tomorrow.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#18181B] border border-[#E7EAF0] dark:border-[#27272A] text-xs font-semibold text-[#374151] dark:text-[#E4E4E7] shadow-2xs self-start sm:self-auto">
          <CalendarIcon className="w-3.5 h-3.5 text-[#7C6CFF]" />
          <span>{liveDateString}</span>
        </div>
      </div>

      {/* Flipkart-Style Interactive Auto-Sliding Carousel */}
      <div 
        id="hero-banner-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E7EAF0] dark:border-[#27272A] shadow-xs bg-white dark:bg-[#111113] transition-all select-none"
      >
        {/* Animated Progress Bar (Pauses on hover) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 z-20 overflow-hidden">
          {!isPaused && !isHovered && (
            <motion.div
              key={currentSlide}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: SLIDE_INTERVAL_MS / 1000, ease: 'linear' }}
              className="h-full"
              style={{ backgroundColor: 'var(--accent-color, #6366F1)' }}
            />
          )}
        </div>

        {/* Carousel Slide Area with Framer Motion transitions */}
        <div className="relative min-h-[380px] sm:min-h-[360px] w-full overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex flex-col"
            >
              {/* ==========================================================
                  SLIDE 1: HERO - MOUNTAIN BANNER & QUICK STATS CARDS
                  ========================================================== */}
              {currentSlide === 0 && (
                <div id="carousel-slide-1" className="flex flex-col w-full">
                  {/* Landscape Panorama Background */}
                  <div className="relative h-44 sm:h-52 w-full bg-gradient-to-b from-[#E8EFFE] via-[#F2EEFB] to-[#FCEEEA] dark:from-[#182038] dark:via-[#201C34] dark:to-[#2A1D2B] overflow-hidden">
                    {/* Subtle sun glow */}
                    <div className="absolute top-4 left-1/3 w-40 h-40 rounded-full bg-[#FFEAC2]/50 blur-3xl" />

                    {/* Mountain panorama SVG */}
                    <svg 
                      className="absolute bottom-0 w-full h-36 sm:h-44 object-cover" 
                      viewBox="0 0 1000 240" 
                      preserveAspectRatio="none" 
                      fill="none"
                    >
                      <path 
                        d="M0,240 L0,140 Q120,70 240,130 Q380,40 520,110 Q660,30 800,105 Q920,50 1000,90 L1000,240 Z" 
                        fill="#C7D7F8" 
                        opacity="0.45" 
                      />
                      <path 
                        d="M0,240 L0,165 L110,110 L230,170 L340,85 L440,150 L560,70 L690,145 L820,65 L940,135 L1000,105 L1000,240 Z" 
                        fill="#B4C6EE" 
                        opacity="0.65" 
                      />
                      <path 
                        d="M0,240 L0,180 L90,130 L180,195 L290,115 L400,175 L520,95 L640,170 L770,85 L890,155 L1000,120 L1000,240 Z" 
                        fill="#8FA8DC" 
                        opacity="0.85" 
                      />
                      <polygon points="340,85 320,115 360,115" fill="#FFFFFF" opacity="0.6" />
                      <polygon points="560,70 540,102 580,102" fill="#FFFFFF" opacity="0.6" />
                      <polygon points="770,85 750,112 790,112" fill="#FFFFFF" opacity="0.6" />
                      <polygon points="520,95 505,120 535,120" fill="#FFFFFF" opacity="0.7" />
                    </svg>

                    {/* Soft atmospheric mist */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-[#111113]/95 dark:via-[#111113]/40" />

                    {/* Slide Badge Pill */}
                    <div className="absolute top-4 left-4 sm:left-6 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-md border border-white/40 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Hero Overview</span>
                    </div>

                    {/* Handwritten Quote in the top right */}
                    <div 
                      id="hero-banner-quote-container"
                      onClick={onOpenQuotesModal}
                      className="absolute top-4 sm:top-6 right-6 sm:right-10 text-right select-none transform -rotate-1 cursor-pointer group"
                      title="Click to change or inscribe daily wisdom quotes"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpenQuotesModal?.();
                        }
                      }}
                    >
                      <span className="font-handwriting text-2xl sm:text-3xl lg:text-4xl text-[#2B3674] dark:text-[#D1D9FF] font-semibold tracking-wide drop-shadow-2xs group-hover:text-[#7C6CFF] dark:group-hover:text-amber-300 transition-colors">
                        {activeQuote?.text || 'Progress, not perfection.'}
                      </span>
                      <div className="text-[11px] text-[#556987] dark:text-slate-400 group-hover:text-[#7C6CFF] dark:group-hover:text-amber-300 transition-colors italic flex items-center justify-end gap-1 mt-0.5">
                        <span>— {activeQuote?.author || 'Alex Rivera'}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-sans font-bold px-1.5 py-0.2 rounded-md bg-white/80 dark:bg-black/40">Edit ✎</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Bento Overview Cards */}
                  <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-md p-4 sm:p-5 border-t border-[#E7EAF0]/80 dark:border-[#27272A]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                      {/* Bento Card 1: Level Progress */}
                      <div 
                        id="stat-card-level"
                        className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-[#7C6CFF]/40 transition-all cursor-pointer"
                        onClick={() => onNavigateTab?.('tasks')}
                      >
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
                            <span className="text-[11px] font-bold text-[#6366F1]">{progressPercent}%</span>
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
                            Next level in {Math.max(0, safeNextLevelXp - safeCurrentXp)} XP
                          </p>
                        </div>
                      </div>

                      {/* Bento Card 2: Day Streak */}
                      <div 
                        id="stat-card-streak"
                        className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-[#F97316]/40 transition-all cursor-pointer"
                        onClick={() => onNavigateTab?.('rewards')}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF4ED] dark:bg-[#2B1B14] flex items-center justify-center shrink-0">
                          <Flame className="w-6 h-6 text-[#EA580C] dark:text-[#FB923C] fill-[#EA580C]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display text-2xl font-bold text-[#111827] dark:text-[#FAFAFA] leading-tight">
                            {user.streakDays ?? 0}
                          </span>
                          <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                            Day Streak
                          </span>
                        </div>
                      </div>

                      {/* Bento Card 3: Total Points */}
                      <div 
                        id="stat-card-points"
                        className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-[#EAB308]/40 transition-all cursor-pointer"
                        onClick={() => onNavigateTab?.('rewards')}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#FEFCE8] dark:bg-[#262312] flex items-center justify-center shrink-0">
                          <Crown className="w-6 h-6 text-[#CA8A04] dark:text-[#FACC15] fill-[#CA8A04]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display text-2xl font-bold text-[#111827] dark:text-[#FAFAFA] leading-tight">
                            {(user.momentumPoints ?? user.totalPoints ?? 0).toLocaleString()}
                          </span>
                          <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                            Total Points
                          </span>
                        </div>
                      </div>

                      {/* Bento Card 4: Quests Done This Week */}
                      <div 
                        id="stat-card-quests-done"
                        className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-[#22C55E]/40 transition-all cursor-pointer"
                        onClick={() => onNavigateTab?.('tasks')}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] dark:bg-[#14261C] flex items-center justify-center shrink-0">
                          <BarChart3 className="w-6 h-6 text-[#16A34A] dark:text-[#4ADE80]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display text-2xl font-bold text-[#111827] dark:text-[#FAFAFA] leading-tight">
                            {user.questsDoneThisWeek ?? 0}
                          </span>
                          <span className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                            Quests Done This Week
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================================
                  SLIDE 2: FEATURE - QUESTS & TASKS MANAGEMENT
                  ========================================================== */}
              {currentSlide === 1 && (
                <div id="carousel-slide-2" className="flex flex-col w-full">
                  {/* Visual Showcase Stage */}
                  <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#042F2E] text-white p-5 sm:p-7 overflow-hidden flex items-center justify-between">
                    {/* Background cosmic glow & shapes */}
                    <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 right-1/4 w-60 h-60 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

                    {/* Left Info */}
                    <div className="relative z-10 max-w-xl flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ⚡ Gamified Productivity Engine
                        </span>
                        <span className="hidden sm:inline-block text-xs text-slate-400">Daily Quest System</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                        Turn Routine Habits into Epic RPG Quests
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-md line-clamp-2">
                        Rank tasks from F to S-tier, collect real XP drops on completion, and build lasting momentum.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => onNavigateTab?.('tasks')}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold shadow-md transition-all cursor-pointer"
                        >
                          <span>Open Quest Log</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Right Interactive Hologram Preview */}
                    <div className="hidden md:flex relative z-10 w-64 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-3.5 shadow-2xl flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          <Swords className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Active Quest</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          Rank S
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-300 line-clamp-1">
                        Morning Deep Focus & 5km Run
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                        <span className="text-emerald-400 font-semibold">+150 XP Reward</span>
                        <span className="text-slate-400">Streak Safe</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Feature Bento Cards */}
                  <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-md p-4 sm:p-5 border-t border-[#E7EAF0]/80 dark:border-[#27272A]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-indigo-500/40 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Daily Habit Rituals</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Auto-resetting daily missions</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-emerald-500/40 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dynamic Difficulty</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Tiered XP scaling rewards</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-amber-500/40 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Skill Upgrades</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Strength, Intellect & Vitality</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-rose-500/40 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Urgency Radar</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Due today reminders & tags</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================================
                  SLIDE 3: FEATURE - STREAKS & REWARDS
                  ========================================================== */}
              {currentSlide === 2 && (
                <div id="carousel-slide-3" className="flex flex-col w-full">
                  {/* Visual Showcase Stage */}
                  <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-[#2A1208] via-[#3B1909] to-[#1E1106] text-white p-5 sm:p-7 overflow-hidden flex items-center justify-between">
                    {/* Background amber-flame aura */}
                    <div className="absolute -top-10 left-10 w-52 h-52 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />

                    {/* Left Info */}
                    <div className="relative z-10 max-w-xl flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          🔥 Streaks & Armory Rewards
                        </span>
                        <span className="hidden sm:inline-block text-xs text-orange-200/60">Milestone Vault</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                        Never Break the Chain, Claim Spoils
                      </h3>
                      <p className="text-xs sm:text-sm text-amber-100/80 max-w-md line-clamp-2">
                        Amass consecutive days to unlock XP multipliers, streak freeze shields, and customized rewards.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => onNavigateTab?.('rewards')}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:brightness-110 text-xs font-bold shadow-md transition-all cursor-pointer"
                        >
                          <span>Explore Armory & Rewards</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Right Interactive Hologram Preview */}
                    <div className="hidden md:flex relative z-10 w-64 bg-black/50 backdrop-blur-md rounded-2xl border border-amber-500/30 p-3.5 shadow-2xl flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Streak Protection</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/30 text-orange-300">
                          Equipped
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-200">
                        {user.streakDays} Day Hot Streak (2.0x XP)
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                        <span className="text-amber-400 font-semibold">1 Freeze Shield Ready</span>
                        <span className="text-slate-400">Vault Level 4</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Feature Bento Cards */}
                  <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-md p-4 sm:p-5 border-t border-[#E7EAF0]/80 dark:border-[#27272A]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-orange-500/40 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-400">
                          <Flame className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Streak Multipliers</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Boost gains up to 2.5x XP</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-amber-500/40 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Hall of Trophies</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Unlock 24+ achievements</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-yellow-500/40 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 flex items-center justify-center shrink-0 text-yellow-600 dark:text-yellow-400">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Rewards Bazaar</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Redeem points for rewards</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-blue-500/40 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Streak Freeze</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Missed day protection tokens</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================================
                  SLIDE 4: FEATURE - ANALYTICS & AI COACH
                  ========================================================== */}
              {currentSlide === 3 && (
                <div id="carousel-slide-4" className="flex flex-col w-full">
                  {/* Visual Showcase Stage */}
                  <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-[#0C1222] via-[#1E1B4B] to-[#172554] text-white p-5 sm:p-7 overflow-hidden flex items-center justify-between">
                    {/* Background neural cyber grid */}
                    <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/4 w-52 h-52 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

                    {/* Left Info */}
                    <div className="relative z-10 max-w-xl flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigateTab?.('ai-coach')}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors cursor-pointer"
                        >
                          🧠 Analytics & AI Coach
                        </button>
                        <span className="hidden sm:inline-block text-xs text-cyan-200/60">Autonomous Insights</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                        Data-Driven Growth & Intelligent Coaching
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-md line-clamp-2">
                        Spot weekly productivity patterns, balance life attributes, and receive actionable coaching debriefs.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          id="hero-consult-ai-coach-btn"
                          onClick={() => onNavigateTab?.('ai-coach')}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
                        >
                          <span>Consult AI Coach</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Right Interactive Hologram Preview */}
                    <div 
                      id="hero-ai-coach-observation-card"
                      onClick={() => onNavigateTab?.('ai-coach')}
                      title="Open AI Coach"
                      className="hidden md:flex relative z-10 w-64 bg-slate-950/70 backdrop-blur-md rounded-2xl border border-cyan-500/30 hover:border-cyan-400 p-3.5 shadow-2xl flex-col gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-cyan-400" />
                          <span>AI Coach Observation</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                          Peak Focus
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-300 line-clamp-2">
                        "Your completion rate is 84% higher when tackling morning workout quests before 9 AM!"
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                        <span className="text-emerald-400 font-semibold">Weekly Velocity: +18%</span>
                        <span className="text-slate-400">Gemini Powered</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Feature Bento Cards */}
                  <div className="bg-white/95 dark:bg-[#111113]/95 backdrop-blur-md p-4 sm:p-5 border-t border-[#E7EAF0]/80 dark:border-[#27272A]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                      <div 
                        onClick={() => onNavigateTab?.('analytics')}
                        className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-cyan-500/40 transition-all cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center shrink-0 text-cyan-600 dark:text-cyan-400">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Velocity Curves</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">7-day performance trends</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => onNavigateTab?.('analytics')}
                        className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-indigo-500/40 transition-all cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                          <BrainCircuit className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Life Stats Radar</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Holistic attribute balance</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => onNavigateTab?.('ai-coach')}
                        className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-purple-500/40 transition-all cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Action Protocols</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Tailored habit strategies</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => onNavigateTab?.('analytics')}
                        className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#E9ECF5] dark:border-[#27272A] hover:border-emerald-500/40 transition-all cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Level Forecasts</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Predict next rank advancement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Manual Arrow Controls (Appear prominent on hover or touch) */}
        <button
          id="carousel-prev-btn"
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 top-20 sm:top-24 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          id="carousel-next-btn"
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 top-20 sm:top-24 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Carousel Indicator Bar (Flipkart-Style Dots & Navigation Pill) */}
        <div 
          id="carousel-dots-container"
          className="bg-white/95 dark:bg-[#111113]/95 px-4 sm:px-5 pb-3.5 pt-1 flex items-center justify-between border-t border-slate-100 dark:border-white/[0.04]"
        >
          {/* Slide Chip Info */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {currentSlide === 0
                ? 'Overview'
                : currentSlide === 1
                ? 'Quests & Habits'
                : currentSlide === 2
                ? 'Streaks & Rewards'
                : 'Analytics & AI'}
            </span>
            <span>•</span>
            <span>{currentSlide + 1} of {TOTAL_SLIDES}</span>
          </div>

          {/* Dots and Play/Pause */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play/Pause Toggle */}
            <button
              id="carousel-pause-play-btn"
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Resume auto-sliding' : 'Pause auto-sliding'}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Clickable Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL_SLIDES }).map((_, index) => {
                const isActive = currentSlide === index;
                return (
                  <button
                    key={index}
                    id={`carousel-dot-${index + 1}`}
                    type="button"
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      isActive
                        ? 'w-6 h-2 shadow-xs'
                        : 'w-2 h-2 bg-slate-300 dark:bg-white/25 hover:bg-slate-400 dark:hover:bg-white/50'
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: 'var(--accent-color, #6366F1)',
                            boxShadow: '0 0 8px var(--accent-glow, rgba(99,102,241,0.4))',
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
