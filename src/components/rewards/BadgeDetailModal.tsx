import React from 'react';
import { X, Shield, Sun, Flame, Target, Award, Check, Calendar } from 'lucide-react';
import { RewardBadge } from '../../types';

interface BadgeDetailModalProps {
  badge: RewardBadge | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleProfileBadge: (badge: RewardBadge) => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  isOpen,
  onClose,
  onToggleProfileBadge,
}) => {
  if (!isOpen || !badge) return null;

  const isOwned = badge.status === 'owned';
  const isProfileBadge = badge.isProfileBadge;

  const renderBadgeEmblem = () => {
    switch (badge.iconType) {
      case 'first-step':
        return (
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)]">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22v-8M12 14c-4 0-7-3-7-7 4 0 7 3 7 7zm0 0c4 0 7-3 7-7-4 0-7 3-7 7z" />
            </svg>
          </div>
        );
      case '7-day':
        return (
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
            <Sun className="w-10 h-10 stroke-[2.5]" />
          </div>
        );
      case '30-day':
        return (
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.3)]">
            <Flame className="w-10 h-10 fill-indigo-400 stroke-indigo-400" />
          </div>
        );
      default:
        return (
          <div className="w-20 h-20 rounded-3xl bg-purple-500/20 border-2 border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
            <Target className="w-10 h-10" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="badge-detail-modal"
        className="w-full max-w-[420px] rounded-3xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/6 hover:bg-slate-200 dark:hover:bg-white/12 border border-slate-200 dark:border-white/8 flex items-center justify-center text-slate-600 dark:text-[#9AA3B5] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Emblem Graphic */}
        <div className="my-2">
          {renderBadgeEmblem()}
        </div>

        {/* Title and Category */}
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-white/6 border border-indigo-200 dark:border-white/8 text-[11px] font-bold text-indigo-600 dark:text-[#A5B4FC]">
            Milestone Badge
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">
            {badge.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9AA3B5] mt-1 leading-relaxed">
            {badge.description}
          </p>
        </div>

        {/* Requirement Box */}
        <div className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/6 text-left">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-[#687185] uppercase tracking-wider">Requirement</p>
          <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{badge.requirement}</p>

          {badge.earnedAt ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 pt-2 border-t border-slate-200 dark:border-white/6">
              <Calendar className="w-3.5 h-3.5" />
              <span>Earned on {badge.earnedAt}</span>
            </div>
          ) : badge.progress !== undefined && badge.maxProgress !== undefined ? (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/6">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#9AA3B5]">
                <span>Progress</span>
                <span className="text-slate-900 dark:text-white font-bold">{badge.progress} / {badge.maxProgress}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/8 overflow-hidden mt-1.5">
                <div 
                  className="h-full bg-indigo-500 rounded-full" 
                  style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-[#687185] mt-1 text-right">
                {badge.maxProgress - badge.progress} remaining
              </p>
            </div>
          ) : null}
        </div>

        {/* Set as profile badge CTA */}
        {isOwned ? (
          <button
            onClick={() => onToggleProfileBadge(badge)}
            className={`w-full h-10 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
              isProfileBadge
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-[#6366F1] hover:bg-[#7C7FF5] text-white shadow-indigo-600/25'
            }`}
          >
            {isProfileBadge ? (
              <>
                <Check className="w-4 h-4" />
                <span>Profile Badge</span>
              </>
            ) : (
              <span>Set as profile badge</span>
            )}
          </button>
        ) : (
          <div className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/6 text-xs text-slate-500 dark:text-[#9AA3B5]">
            Keep being consistent to unlock this recognition badge!
          </div>
        )}
      </div>
    </div>
  );
};
