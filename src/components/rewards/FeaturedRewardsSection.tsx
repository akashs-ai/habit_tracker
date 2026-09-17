import React from 'react';
import { Sparkles, ArrowRight, Check, Lock, Flame } from 'lucide-react';
import { RewardItem } from '../../types';

interface FeaturedRewardsSectionProps {
  rewards: RewardItem[];
  userPoints: number;
  onSelectReward: (reward: RewardItem) => void;
  onUnlockReward: (reward: RewardItem) => void;
  onSeeAll?: () => void;
}

export const FeaturedRewardsSection: React.FC<FeaturedRewardsSectionProps> = ({
  rewards,
  userPoints,
  onSelectReward,
  onUnlockReward,
  onSeeAll,
}) => {
  const [inFlightRewardId, setInFlightRewardId] = React.useState<string | null>(null);

  const handleCardUnlock = async (reward: RewardItem) => {
    if (inFlightRewardId === reward.id) return;
    try {
      setInFlightRewardId(reward.id);
      await Promise.resolve(onUnlockReward(reward));
    } finally {
      setInFlightRewardId(null);
    }
  };

  const renderPreviewGraphic = (reward: RewardItem) => {
    switch (reward.previewType) {
      case 'aurora-theme':
        return (
          <div className="relative w-full h-28 rounded-xl overflow-hidden bg-gradient-to-br from-[#0B0F19] via-[#151D33] to-[#0A0D14] flex items-center justify-center border border-white/5">
            {/* Aurora Glow */}
            <div className="absolute top-1 left-4 w-20 h-10 rounded-full bg-[#38BDF8]/25 blur-xl pointer-events-none" />
            <div className="absolute top-3 right-6 w-24 h-12 rounded-full bg-[#818CF8]/25 blur-xl pointer-events-none" />
            
            {/* Mountain Ridge SVG */}
            <svg 
              className="absolute bottom-0 w-full h-16 object-cover pointer-events-none opacity-80" 
              viewBox="0 0 200 65" 
              preserveAspectRatio="none"
            >
              <path d="M0,65 L35,28 L75,48 L115,18 L155,42 L185,25 L200,35 L200,65 Z" fill="#1E2746" />
              <path d="M10,65 L55,35 L90,52 L135,26 L175,48 L200,40 L200,65 Z" fill="#0E1322" />
            </svg>
            
            {/* Miniature App UI Hint */}
            <div className="relative z-10 w-24 h-14 rounded-lg bg-[#0F1422]/90 border border-white/10 p-1.5 shadow-lg flex flex-col justify-between">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <div className="w-8 h-1 rounded bg-white/20" />
              </div>
              <div className="space-y-1">
                <div className="w-full h-1 rounded bg-indigo-500/40" />
                <div className="w-3/4 h-1 rounded bg-white/15" />
              </div>
            </div>
          </div>
        );

      case 'focus-icons':
        return (
          <div className="w-full h-28 rounded-xl bg-[#0F1420] border border-white/5 p-2.5 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#1D2438] border border-white/8 flex items-center justify-center text-white shadow-sm">
                <div className="w-4 h-4 rounded-full border border-indigo-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#1D2438] border border-white/8 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#1D2438] border border-white/8 flex items-center justify-center text-white shadow-sm">
                <div className="w-4 h-4 rounded-md border border-cyan-400 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-cyan-400" />
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#1D2438] border border-white/8 flex items-center justify-center text-white shadow-sm">
                <div className="w-4 h-4 rounded-full bg-indigo-500/30 border border-indigo-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'flame-badge':
        return (
          <div className="w-full h-28 rounded-xl bg-[#0F1420] border border-white/5 flex items-center justify-center relative overflow-hidden">
            {/* Ambient flame glow */}
            <div className="absolute w-16 h-16 rounded-full bg-[#F59E0B]/20 blur-xl pointer-events-none" />
            
            {/* Hexagon Shield */}
            <div className="relative w-14 h-16 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 115" fill="none">
                <path 
                  d="M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z" 
                  fill="#1E2333" 
                  stroke="#F59E0B" 
                  strokeWidth="3"
                  strokeOpacity="0.8"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[#F97316]">
                <Flame className="w-7 h-7 fill-[#F97316] filter drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              </div>
            </div>
          </div>
        );

      case 'glass-frame':
        return (
          <div className="w-full h-28 rounded-xl bg-[#0F1420] border border-white/5 flex items-center justify-center relative overflow-hidden">
            {/* Ambient ring glow */}
            <div className="absolute w-16 h-16 rounded-full bg-[#38BDF8]/20 blur-xl pointer-events-none" />

            {/* Glowing Gradient Ring */}
            <div className="relative w-14 h-14 rounded-full p-[3px] bg-gradient-to-tr from-[#38BDF8] via-[#6366F1] to-[#C084FC] shadow-[0_0_15px_rgba(56,189,248,0.35)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0D1017] flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        );

      case 'completion-effect':
        return (
          <div className="w-full h-28 rounded-xl bg-[#0F1420] border border-white/5 flex items-center justify-center relative overflow-hidden">
            {/* Circular ripple rings */}
            <div className="absolute w-20 h-20 rounded-full border border-indigo-500/20 animate-ping opacity-30" />
            <div className="absolute w-16 h-16 rounded-full border border-indigo-400/40" />

            {/* Centered Glowing Checkmark */}
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#818CF8] flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-28 rounded-xl bg-[#0F1420] border border-white/5 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#818CF8]" />
          </div>
        );
    }
  };

  return (
    <section id="featured-rewards-section" className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Featured
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#9AA3B5] mt-0.5">
            Handpicked for your journey.
          </p>
        </div>

        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs font-semibold text-indigo-600 dark:text-[#818CF8] hover:text-indigo-700 dark:hover:text-[#A5B4FC] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 5 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {rewards.map((reward) => {
          const isOwned = reward.status === 'owned';
          const isActive = reward.status === 'active';
          const canAfford = userPoints >= reward.cost;

          return (
            <div
              key={reward.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-white/6 hover:border-indigo-500/35 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div>
                {/* Category Pill Tag */}
                <div className="flex justify-end mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-[#6366F1]/15 border border-indigo-200 dark:border-[#6366F1]/25 text-[10px] font-bold text-indigo-600 dark:text-[#A5B4FC]">
                    {reward.badgeTag}
                  </span>
                </div>

                {/* Preview Graphic */}
                <div 
                  onClick={() => onSelectReward(reward)}
                  className="cursor-pointer group-hover:opacity-95 transition-opacity"
                >
                  {renderPreviewGraphic(reward)}
                </div>

                {/* Title & Description */}
                <div className="mt-3">
                  <h3 
                    onClick={() => onSelectReward(reward)}
                    className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#A5B4FC] transition-colors cursor-pointer leading-tight truncate"
                  >
                    {reward.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#9AA3B5] mt-1 line-clamp-2 leading-relaxed h-8">
                    {reward.description}
                  </p>
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{reward.cost.toLocaleString()} MP</span>
                </div>

                {isActive ? (
                  <button
                    disabled
                    className="w-full h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </button>
                ) : isOwned ? (
                  <button
                    onClick={() => onUnlockReward(reward)}
                    className="w-full h-8 rounded-xl bg-slate-100 dark:bg-white/6 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Use
                  </button>
                ) : (
                  <button
                    onClick={() => handleCardUnlock(reward)}
                    disabled={!canAfford || inFlightRewardId === reward.id}
                    className={`w-full h-8 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                      inFlightRewardId === reward.id
                        ? 'bg-[#6366F1]/70 text-white cursor-wait'
                        : canAfford
                        ? 'bg-[#6366F1] hover:bg-[#7C7FF5] text-white shadow-indigo-600/25 cursor-pointer'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-[#9AA3B5] border border-slate-200 dark:border-white/8 hover:bg-slate-200 dark:hover:bg-white/10 cursor-not-allowed'
                    }`}
                  >
                    {inFlightRewardId === reward.id ? (
                      <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-0.5" />
                    ) : (
                      !canAfford && <Lock className="w-3 h-3 text-slate-400 dark:text-[#687185]" />
                    )}
                    <span>{inFlightRewardId === reward.id ? 'Unlocking...' : 'Unlock'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
