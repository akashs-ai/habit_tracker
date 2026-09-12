import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronDown, BarChart2 } from 'lucide-react';

interface TasksRightPanelProps {
  completedCount: number;
  remainingCount: number;
  overdueCount: number;
  totalCount: number;
}

export const TasksRightPanel: React.FC<TasksRightPanelProps> = ({
  completedCount = 3,
  remainingCount = 2,
  overdueCount = 1,
  totalCount = 8
}) => {
  // Focus Mode Timer State
  const [selectedDuration, setSelectedDuration] = useState(25); // minutes
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const handleSelectDuration = (mins: number) => {
    setSelectedDuration(mins);
    setSecondsLeft(mins * 60);
    setIsActive(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(selectedDuration * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Donut chart math for 5/8 Tasks
  const ratio = totalCount > 0 ? (completedCount + 2) / totalCount : 0.625; // 5/8 representation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ratio * circumference;

  return (
    <div 
      id="tasks-right-widgets" 
      className="w-full lg:w-[280px] xl:w-[320px] shrink-0 flex flex-col gap-4"
    >
      {/* 1. Today's Progress Card */}
      <div 
        id="todays-progress-card"
        className="bg-white dark:bg-[#121214] border border-[#E2E8F0] dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xs transition-all"
      >
        <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-4">
          Today&apos;s Progress
        </h3>

        {/* Donut and mini bar chart */}
        <div className="flex items-center justify-around gap-4 py-1">
          {/* Circular Donut */}
          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={radius}
                className="text-[#F1F5F9] dark:text-[#27272A]"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                className="text-[#6366F1] transition-all duration-700 ease-out"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-none">
                5<span className="text-xs font-normal text-[#64748B]">/8</span>
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Tasks</span>
            </div>
          </div>

          {/* Mini Activity Bar Visual */}
          <div className="flex items-end gap-1.5 h-14 px-2">
            <div className="w-2 bg-[#EEF2FF] dark:bg-[#1E1B4B] rounded-t h-6" />
            <div className="w-2 bg-[#C7D2FE] dark:bg-[#312E81] rounded-t h-8" />
            <div className="w-2 bg-[#818CF8] dark:bg-[#4338CA] rounded-t h-12" />
            <div className="w-2 bg-[#6366F1] rounded-t h-10" />
            <div className="w-2 bg-[#4F46E5] rounded-t h-14" />
          </div>
        </div>

        {/* 3 Metric Summary stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#F1F5F9] dark:border-[#27272A] text-center">
          <div>
            <span className="block text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {completedCount}
            </span>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Completed</span>
          </div>
          <div>
            <span className="block text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {remainingCount}
            </span>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Remaining</span>
          </div>
          <div>
            <span className="block text-base font-bold text-[#EF4444]">
              {overdueCount}
            </span>
            <span className="text-[11px] text-[#EF4444]">Overdue</span>
          </div>
        </div>
      </div>

      {/* 2. Mountain Landscape Scenic Motivation Banner */}
      <div 
        id="scenic-mountain-banner"
        className="relative h-28 sm:h-32 rounded-2xl overflow-hidden border border-[#E2E8F0] dark:border-[#27272A] shadow-xs group"
      >
        {/* Background Image / SVG Mountains */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#334155] to-[#64748B]">
          <svg className="absolute bottom-0 w-full h-full object-cover" viewBox="0 0 400 150" preserveAspectRatio="none">
            {/* Distant mountains */}
            <path d="M0,150 L0,70 L60,40 L130,85 L200,30 L270,75 L330,25 L400,60 L400,150 Z" fill="#475569" opacity="0.6" />
            {/* Mid mountain peaks */}
            <path d="M0,150 L0,90 L80,50 L160,110 L240,45 L320,95 L400,70 L400,150 Z" fill="#334155" opacity="0.8" />
            {/* Foreground mountains */}
            <path d="M0,150 L0,110 L90,75 L180,120 L280,65 L400,105 L400,150 Z" fill="#1E293B" />
          </svg>
        </div>

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Handwritten / Elegant Script Overlay */}
        <div className="relative h-full flex flex-col justify-end p-4 text-white">
          <p 
            className="text-sm sm:text-base font-serif italic text-white/95 drop-shadow-sm tracking-wide leading-snug"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            &ldquo;Discipline today, a stronger you tomorrow.&rdquo;
          </p>
        </div>
      </div>

      {/* 3. Focus Mode Card */}
      <div 
        id="focus-mode-widget"
        className="bg-white dark:bg-[#121214] border border-[#E2E8F0] dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xs"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Focus Mode
          </h3>

          {/* Duration Selector Dropdown */}
          <div className="relative inline-block">
            <select
              value={selectedDuration}
              onChange={(e) => handleSelectDuration(Number(e.target.value))}
              disabled={isActive}
              className="text-xs bg-[#F8FAFC] dark:bg-[#18181B] border border-[#E2E8F0] dark:border-[#27272A] rounded-lg px-2.5 py-1 text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
            >
              <option value={15}>15 min</option>
              <option value={25}>25 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
        </div>

        {/* Digital Clock Display */}
        <div className="my-3 text-center">
          <span className="text-3xl sm:text-4xl font-mono font-bold tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
            {formatTime(secondsLeft)}
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 mt-3">
          <button
            id="start-focus-btn"
            onClick={toggleTimer}
            className={`flex-1 h-10 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
              isActive
                ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
                : 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:opacity-90'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          {secondsLeft < selectedDuration * 60 && (
            <button
              onClick={resetTimer}
              className="h-10 px-3 rounded-xl border border-[#E2E8F0] dark:border-[#27272A] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#18181B] transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
