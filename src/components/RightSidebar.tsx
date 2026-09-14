import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  MoreVertical, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Sparkles, 
  Compass, 
  Target, 
  LineChart, 
  GraduationCap,
  Bookmark,
  Heart,
  ArrowRight,
  Bot
} from 'lucide-react';
import { QuickNote } from '../types';

interface RightSidebarProps {
  notes: QuickNote[];
  onAddNote?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ notes, onAddNote, onNavigateTab }) => {
  // Focus Mode State
  const [focusDuration, setFocusDuration] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [selectedDurationOption, setSelectedDurationOption] = useState<'25' | '50' | 'custom'>('25');

  // AI Coach Feedback state
  const [coachResponse, setCoachResponse] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsRemaining]);

  const handleSelectDuration = (val: '25' | '50' | 'custom') => {
    setSelectedDurationOption(val);
    const mins = val === '25' ? 25 : val === '50' ? 50 : 15;
    setFocusDuration(mins);
    setSecondsRemaining(mins * 60);
    setIsTimerRunning(false);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setSecondsRemaining(focusDuration * 60);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const handlePromptClick = (action: string) => {
    switch (action) {
      case 'habits':
        setCoachResponse('Scheduled 15m evening reading session for optimal habit stacking.');
        break;
      case 'goal':
        setCoachResponse('Target milestone updated: 2 DSA problems scheduled for 10:30 AM.');
        break;
      case 'progress':
        setCoachResponse('You are ahead by +12% compared to last week. Peak focus is 10 AM - 12 PM.');
        break;
      case 'plan':
        setCoachResponse('Generated 45m deep work block + 10m recovery break for this afternoon.');
        break;
      default:
        setCoachResponse('Optimizing your schedule for high cognitive energy...');
    }
    setTimeout(() => {
      setCoachResponse(null);
    }, 4500);
  };

  return (
    <aside id="right-column-widgets" className="flex flex-col gap-5">
      
      {/* 1. Focus Mode Card */}
      <div 
        id="focus-mode-card"
        className="bg-white dark:bg-[#111113] border border-[#E7EAF0] dark:border-[#27272A] rounded-2xl p-5 shadow-xs transition-all"
      >
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E293B] text-white flex items-center justify-center">
              <Droplet className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#111827] dark:text-[#FAFAFA] leading-tight">
                Focus Mode
              </h3>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                Stay in the zone. Do more.
              </p>
            </div>
          </div>

          <button className="text-[#9CA3AF] hover:text-[#4B5563] dark:hover:text-[#D1D5DB] transition-colors p-1">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Timer Selection Pills */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => handleSelectDuration('25')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
              selectedDurationOption === '25'
                ? 'bg-[#111827] dark:bg-[#FAFAFA] text-white dark:text-[#111827] border-[#111827] dark:border-[#FAFAFA] shadow-xs'
                : 'bg-[#F9FAFB] dark:bg-[#18181B] text-[#4B5563] dark:text-[#A1A1AA] border-[#E5E7EB] dark:border-[#27272A] hover:border-[#9CA3AF]'
            }`}
          >
            <span>{selectedDurationOption === '25' ? '✓' : '○'}</span>
            <span>25 min</span>
          </button>

          <button
            onClick={() => handleSelectDuration('50')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
              selectedDurationOption === '50'
                ? 'bg-[#111827] dark:bg-[#FAFAFA] text-white dark:text-[#111827] border-[#111827] dark:border-[#FAFAFA] shadow-xs'
                : 'bg-[#F9FAFB] dark:bg-[#18181B] text-[#4B5563] dark:text-[#A1A1AA] border-[#E5E7EB] dark:border-[#27272A] hover:border-[#9CA3AF]'
            }`}
          >
            <span>{selectedDurationOption === '50' ? '✓' : '○'}</span>
            <span>50 min</span>
          </button>

          <button
            onClick={() => handleSelectDuration('custom')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
              selectedDurationOption === 'custom'
                ? 'bg-[#111827] dark:bg-[#FAFAFA] text-white dark:text-[#111827] border-[#111827] dark:border-[#FAFAFA] shadow-xs'
                : 'bg-[#F9FAFB] dark:bg-[#18181B] text-[#4B5563] dark:text-[#A1A1AA] border-[#E5E7EB] dark:border-[#27272A] hover:border-[#9CA3AF]'
            }`}
          >
            <span>{selectedDurationOption === 'custom' ? '✓' : '○'}</span>
            <span>Custom</span>
          </button>
        </div>

        {/* Live Timer Display (if running or paused) */}
        {isTimerRunning && (
          <div className="text-center mb-3">
            <span className="font-display font-bold text-2xl text-[#111827] dark:text-[#FAFAFA] tracking-wider">
              {formatTime(secondsRemaining)}
            </span>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTimer}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#111827] dark:bg-[#FAFAFA] hover:bg-[#1F2937] dark:hover:bg-white text-white dark:text-[#111827] text-xs font-semibold transition-all shadow-xs"
          >
            {isTimerRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Focus</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{secondsRemaining < focusDuration * 60 ? 'Resume Focus' : 'Start Focus'}</span>
              </>
            )}
          </button>

          {secondsRemaining < focusDuration * 60 && (
            <button
              onClick={resetTimer}
              className="p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] text-[#6B7280] hover:text-[#111827] dark:hover:text-white"
              title="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Quick Notes Card */}
      <div 
        id="quick-notes-card"
        className="bg-white dark:bg-[#111113] border border-[#E7EAF0] dark:border-[#27272A] rounded-2xl p-5 shadow-xs"
      >
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-bold text-base text-[#111827] dark:text-[#FAFAFA]">
            Quick Notes
          </h3>
          <button
            onClick={onAddNote}
            className="p-1 rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-[#18181B] text-[#6B7280] dark:text-[#9CA3AF] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {notes.map((note) => {
            const isYellow = note.type === 'yellow';
            const isPurple = note.type === 'purple';
            const isPink = note.type === 'pink';

            return (
              <div
                key={note.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  isYellow
                    ? 'bg-[#FEFCE8] dark:bg-[#232010] border-[#FEF08A] dark:border-[#383313]'
                    : isPurple
                    ? 'bg-[#F5F3FF] dark:bg-[#1A182E] border-[#DDD6FE] dark:border-[#2C274E]'
                    : 'bg-[#FFF1F2] dark:bg-[#281318] border-[#FECDD3] dark:border-[#421E25]'
                }`}
              >
                {/* Note Type Icon */}
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                    isYellow
                      ? 'bg-[#FEF08A] text-[#854D0E]'
                      : isPurple
                      ? 'bg-[#DDD6FE] text-[#5B21B6]'
                      : 'bg-[#FECDD3] text-[#9F1239]'
                  }`}
                >
                  {isYellow && <Bookmark className="w-3.5 h-3.5 fill-current" />}
                  {isPurple && <Sparkles className="w-3.5 h-3.5 fill-current" />}
                  {isPink && <Heart className="w-3.5 h-3.5 fill-current" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-[#111827] dark:text-[#FAFAFA] mb-0.5">
                    {note.title}
                  </h4>
                  {note.content && (
                    <p className="text-xs text-[#4B5563] dark:text-[#A1A1AA]">
                      {note.content}
                    </p>
                  )}
                  {note.bullets && (
                    <ul className="text-xs text-[#4B5563] dark:text-[#A1A1AA] flex flex-col gap-0.5 mt-0.5">
                      {note.bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#7C6CFF]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AI Coach Card (Beta) */}
      <div 
        id="ai-coach-card"
        className="bg-white dark:bg-[#111113] border border-[#E7EAF0] dark:border-[#27272A] rounded-2xl p-5 shadow-xs"
      >
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => onNavigateTab?.('ai-coach')}
            className="flex items-center gap-2 group text-left cursor-pointer transition-transform active:scale-[0.98]"
            title="Open AI Coach"
          >
            <h3 className="font-bold text-base text-[#111827] dark:text-[#FAFAFA] group-hover:text-[#6366F1] dark:group-hover:text-[#818CF8] transition-colors flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-[#6366F1] dark:text-[#818CF8]" />
              <span>AI Coach</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEECFF] text-[#6366F1] dark:bg-[#232147] dark:text-[#A5B4FC]">
              Beta
            </span>
          </button>

          {onNavigateTab && (
            <button
              type="button"
              id="ai-coach-open-link"
              onClick={() => onNavigateTab('ai-coach')}
              className="text-xs font-semibold text-[#6366F1] dark:text-[#818CF8] hover:text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Open</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mascot & Speech Bubble */}
        <div 
          onClick={() => onNavigateTab?.('ai-coach')}
          title="Click to consult AI Coach"
          className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F9FD] dark:bg-[#18181B] border border-[#EAEFF8] dark:border-[#27272A] mb-3.5 cursor-pointer hover:border-[#6366F1]/40 hover:bg-[#EEECFF]/30 dark:hover:bg-[#1E1B4B]/20 transition-all group"
        >
          {/* Friendly Robot Avatar Vector */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#A855F7] p-0.5 shrink-0 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#1E1B4B] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              {/* Antenna */}
              <div className="absolute top-1 w-1 h-1.5 bg-[#A855F7] rounded-full" />
              {/* Eyes */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_6px_#38BDF8]" />
                <span className="w-1.5 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_6px_#38BDF8]" />
              </div>
              {/* Smile */}
              <div className="absolute bottom-2 w-3 h-1 border-b-2 border-[#38BDF8] rounded-full" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-xs font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight">
                Good morning, Alex!
              </p>
              <span className="text-[10px] text-[#6366F1] dark:text-[#818CF8] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Chat &rarr;
              </span>
            </div>
            <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">
              {coachResponse || 'You have 90 minutes available today. Want me to optimize your plan?'}
            </p>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="flex flex-col gap-2 mb-3.5">
          <button
            type="button"
            id="ai-coach-open-workspace-btn"
            onClick={() => onNavigateTab?.('ai-coach')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C6CFF] hover:from-[#5457E5] hover:to-[#6D5CEB] active:scale-[0.99] text-white text-xs font-semibold transition-all shadow-xs shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open AI Coach Workspace</span>
            <Sparkles className="w-3.5 h-3.5 fill-white" />
          </button>
        </div>

        {/* 4 Quick Prompt Chips (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              handlePromptClick('habits');
              onNavigateTab?.('ai-coach');
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#F8F9FA] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] hover:border-[#7C6CFF] text-[11px] font-medium text-[#4B5563] dark:text-[#A1A1AA] hover:text-[#7C6CFF] transition-all text-left cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 shrink-0 text-[#6B7280]" />
            <span className="truncate">Suggest habits</span>
          </button>

          <button
            onClick={() => {
              handlePromptClick('goal');
              onNavigateTab?.('ai-coach');
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#F8F9FA] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] hover:border-[#7C6CFF] text-[11px] font-medium text-[#4B5563] dark:text-[#A1A1AA] hover:text-[#7C6CFF] transition-all text-left cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 shrink-0 text-[#6B7280]" />
            <span className="truncate">Adjust my goal</span>
          </button>

          <button
            onClick={() => {
              handlePromptClick('progress');
              onNavigateTab?.('ai-coach');
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#F8F9FA] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] hover:border-[#7C6CFF] text-[11px] font-medium text-[#4B5563] dark:text-[#A1A1AA] hover:text-[#7C6CFF] transition-all text-left cursor-pointer"
          >
            <LineChart className="w-3.5 h-3.5 shrink-0 text-[#6B7280]" />
            <span className="truncate">Explain progress</span>
          </button>

          <button
            onClick={() => {
              handlePromptClick('plan');
              onNavigateTab?.('ai-coach');
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#F8F9FA] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] hover:border-[#7C6CFF] text-[11px] font-medium text-[#4B5563] dark:text-[#A1A1AA] hover:text-[#7C6CFF] transition-all text-left cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0 text-[#6B7280]" />
            <span className="truncate">Study plan</span>
          </button>
        </div>
      </div>

      {/* 4. Bottom Inspirational Plant Art Card */}
      <div 
        id="inspirational-plant-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F0ECE6] via-[#EFEBE6] to-[#ECE7E0] dark:from-[#211E1A] dark:to-[#1C1A17] p-4 border border-[#E3DDD5] dark:border-[#332E27] flex items-center justify-between min-h-[110px]"
      >
        {/* Potted Plant Illustration */}
        <div className="relative w-20 h-24 shrink-0">
          <svg viewBox="0 0 80 100" className="w-full h-full">
            {/* Ceramic Pot */}
            <path d="M22,65 L26,92 L54,92 L58,65 Z" fill="#D3CBC2" />
            <path d="M20,63 L60,63 L58,67 L22,67 Z" fill="#BDB4AA" />
            {/* Soil */}
            <ellipse cx="40" cy="65" rx="17" ry="3" fill="#6B5949" />
            {/* Snake plant upright leaves with yellow trim */}
            <path d="M40,65 Q36,35 34,10 Q40,30 42,65 Z" fill="#2E6643" />
            <path d="M34,10 Q37,28 39,65" stroke="#E3C966" strokeWidth="1.2" fill="none" />
            
            <path d="M32,65 Q22,42 20,24 Q28,40 35,65 Z" fill="#3B7D54" />
            <path d="M20,24 Q26,38 32,65" stroke="#E3C966" strokeWidth="1" fill="none" />
            
            <path d="M46,65 Q58,40 58,20 Q50,38 43,65 Z" fill="#275638" />
            <path d="M58,20 Q52,38 46,65" stroke="#E3C966" strokeWidth="1" fill="none" />

            <path d="M40,65 Q45,30 48,15 Q43,36 38,65 Z" fill="#4B9B68" />
          </svg>
        </div>

        {/* Script Motivational Quote */}
        <div className="flex-1 pl-3 text-right">
          <p className="font-handwriting text-xl sm:text-2xl text-[#3E3833] dark:text-[#D5CDC5] leading-snug font-semibold select-none">
            Discipline <br />
            today, <br />
            a brighter <br />
            tomorrow.
          </p>
        </div>
      </div>

    </aside>
  );
};
