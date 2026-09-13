import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, X } from 'lucide-react';

interface GuestBannerProps {
  onOpenSignUp: () => void;
  onDismiss?: () => void;
}

export const GuestBanner: React.FC<GuestBannerProps> = ({ onOpenSignUp, onDismiss }) => {
  return (
    <aside 
      aria-label="Guest Mode Notification"
      className="bg-gradient-to-r from-[#1E1B4B] via-[#2E1065] to-[#1E1B4B] border-b border-[#6366F1]/30 px-4 sm:px-6 py-2.5 text-xs text-white flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-md relative z-30"
    >
      <div className="flex items-center gap-2.5 text-center sm:text-left">
        <span className="w-5 h-5 rounded-full bg-[#6366F1]/30 flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-[#A5B4FC]" />
        </span>
        <p className="font-medium text-[#E0E7FF]">
          <span className="font-bold text-white">Guest Explorer Mode</span>
          <span className="hidden md:inline"> — Explore freely. All your habits, XP, and stats will be saved when you create an account.</span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenSignUp}
          className="px-3.5 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#5254E2] active:scale-[0.99] text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5"
        >
          <span>Save Progress & Create Account</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-md text-[#A5B4FC] hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss guest notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
};
