import React from 'react';
import {
  GraduationCap,
  ClipboardCheck,
  Target,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Bot
} from 'lucide-react';

interface YourCoachCardProps {
  onOpenCoachDetails?: () => void;
}

export const YourCoachCard: React.FC<YourCoachCardProps> = ({ onOpenCoachDetails }) => {
  return (
    <div
      id="ai-coach-status-card"
      className="p-4 sm:p-5 rounded-2xl bg-[#0F1723] border border-white/7 flex flex-col justify-between gap-4 shadow-sm select-none"
    >
      {/* Card Header: Title + Online Status */}
      <div className="flex items-center justify-between pb-2 border-b border-white/6">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
          Your Coach
        </h3>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 text-[11px] font-semibold text-[#34D399]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>Online</span>
        </div>
      </div>

      {/* Desktop Feature Checklist */}
      <div className="hidden lg:flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 text-xs text-white/90">
          <div className="w-6 h-6 rounded-md bg-[#6366F1]/15 flex items-center justify-center text-[#818CF8]">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span>Personalized guidance</span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-white/90">
          <div className="w-6 h-6 rounded-md bg-[#34D399]/15 flex items-center justify-center text-[#34D399]">
            <ClipboardCheck className="w-3.5 h-3.5" />
          </div>
          <span>Actionable suggestions</span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-white/90">
          <div className="w-6 h-6 rounded-md bg-[#F43F5E]/15 flex items-center justify-center text-[#FB7185]">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span>Helps you stay consistent</span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-white/90">
          <div className="w-6 h-6 rounded-md bg-[#F59E0B]/15 flex items-center justify-center text-[#FBBF24]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>Learns from your progress</span>
        </div>
      </div>

      {/* Tablet & Mobile Row: 3 compact pill badges */}
      <div className="lg:hidden grid grid-cols-3 gap-2 py-1">
        <div className="flex flex-col items-center text-center gap-1 p-2 rounded-xl bg-white/4 border border-white/6">
          <ShieldCheck className="w-4 h-4 text-[#818CF8]" />
          <span className="text-[10px] font-medium text-white/90">Personalized</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1 p-2 rounded-xl bg-white/4 border border-white/6">
          <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          <span className="text-[10px] font-medium text-white/90">Actionable</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1 p-2 rounded-xl bg-white/4 border border-white/6">
          <Bot className="w-4 h-4 text-[#FBBF24]" />
          <span className="text-[10px] font-medium text-white/90">Learns from you</span>
        </div>
      </div>

      {/* Quote Footer (Desktop & Tablet) */}
      <div className="p-3 rounded-xl bg-white/3 border border-white/5 text-center mt-1">
        <p className="text-[11px] italic font-serif text-[#94A3B8] leading-snug">
          &ldquo;Better questions. Better decisions. A better you.&rdquo;
        </p>
        <span className="text-[9px] text-[#64748B] font-sans font-semibold tracking-wider uppercase mt-1 block">
          — LifeRPG
        </span>
      </div>
    </div>
  );
};
