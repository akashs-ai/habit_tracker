import React, { useState } from 'react';
import { 
  ArrowRight, 
  Crown, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  CalendarCheck, 
  Target, 
  Zap, 
  Check,
  Palette,
  LayoutGrid,
  Shield,
  User,
  Sliders
} from 'lucide-react';
import { CollectionItem, WaysToEarnItem } from '../../types';

interface RewardsBottomRowProps {
  collectionItems: CollectionItem[];
  waysToEarn: WaysToEarnItem[];
  userPoints: number;
  onUnlockPremium: () => void;
  onSelectCollectionItem?: (item: CollectionItem) => void;
  onViewAllCollection?: () => void;
}

export const RewardsBottomRow: React.FC<RewardsBottomRowProps> = ({
  collectionItems,
  waysToEarn,
  userPoints,
  onUnlockPremium,
  onSelectCollectionItem,
  onViewAllCollection,
}) => {
  const [activeCollectionFilter, setActiveCollectionFilter] = useState<string>('Themes (2)');

  const canAffordPremium = userPoints >= 5000;

  const renderWayIcon = (icon: WaysToEarnItem['icon']) => {
    switch (icon) {
      case 'habit':
        return <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'habits-all':
        return <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'task':
        return <Check className="w-3.5 h-3.5 text-cyan-400" />;
      case 'goal':
        return <Target className="w-3.5 h-3.5 text-purple-400" />;
      case 'streak-7':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'streak-30':
        return <Zap className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const renderCollectionMiniGraphic = (item: CollectionItem) => {
    switch (item.type) {
      case 'Theme':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-950 to-indigo-900 border border-white/10 flex items-center justify-center">
            <Palette className="w-4 h-4 text-sky-400" />
          </div>
        );
      case 'Icon Pack':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#151D33] border border-white/10 flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-indigo-400" />
          </div>
        );
      case 'Badge':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
        );
      case 'Profile':
        return (
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
            <User className="w-4 h-4 text-cyan-400" />
          </div>
        );
      case 'Animation':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        );
    }
  };

  return (
    <div id="rewards-bottom-row" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
      
      {/* 1. Left: Your Collection */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#11161D] border border-white/6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Your Collection</h3>
              <p className="text-xs text-[#9AA3B5] mt-0.5">8 / 42 rewards unlocked</p>
            </div>

            {onViewAllCollection && (
              <button
                onClick={onViewAllCollection}
                className="text-xs font-semibold text-[#818CF8] hover:text-[#A5B4FC] flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none my-2.5">
            {['Themes (2)', 'Icons (3)', 'Badges (3)', 'Profile (1)', 'Animations (1)'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveCollectionFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  activeCollectionFilter === filter
                    ? 'bg-white/12 text-white border border-white/10'
                    : 'bg-white/4 text-[#9AA3B5] hover:bg-white/8 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Mini Items Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
            {collectionItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectCollectionItem && onSelectCollectionItem(item)}
                className="p-2 rounded-xl bg-[#0E1218] border border-white/4 hover:border-indigo-500/30 transition-all flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="group-hover:scale-105 transition-transform">
                  {renderCollectionMiniGraphic(item)}
                </div>
                <span className="text-[10px] font-bold text-white mt-1.5 truncate max-w-full">
                  {item.name}
                </span>
                <span className="text-[9px] text-[#687185] truncate max-w-full">
                  {item.type}
                </span>
              </div>
            ))}
            
            {/* More / Ellipsis pill */}
            <div 
              onClick={onViewAllCollection}
              className="p-2 rounded-xl bg-[#0E1218] border border-white/4 hover:border-white/15 transition-all flex flex-col items-center justify-center text-center cursor-pointer text-[#687185] hover:text-white"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs">
                ...
              </div>
              <span className="text-[10px] font-medium text-[#687185] mt-1.5">More</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle: Ways to Earn MP */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#11161D] border border-white/6 flex flex-col justify-between">
        <div>
          <div className="pb-2 border-b border-white/5">
            <h3 className="text-base font-bold text-white tracking-tight">Ways to Earn MP</h3>
            <p className="text-xs text-[#9AA3B5] mt-0.5">The more consistent you are, the more you earn.</p>
          </div>

          {/* Ways list */}
          <div className="divide-y divide-white/4 mt-2">
            {waysToEarn.map((way) => (
              <div key={way.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center shrink-0">
                    {renderWayIcon(way.icon)}
                  </div>
                  <span className="text-white text-xs truncate">{way.action}</span>
                </div>

                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px] shrink-0 font-mono">
                  +{way.points} MP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Right: Get Premium for 30 Days */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#11161D] border border-white/6 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle crown glow */}
        <div className="absolute top-2 right-2 w-24 h-24 rounded-full bg-[#FBBF24]/10 blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Get Premium for 30 Days</h3>
            </div>
          </div>

          <p className="text-xs text-[#9AA3B5] mt-3 leading-relaxed">
            Unlock all premium features using your Momentum Points.
          </p>

          <div className="mt-4 flex items-center gap-1.5 text-base font-extrabold text-white">
            <Flame className="w-4 h-4 text-[#F59E0B]" />
            <span>5,000 MP</span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <button
            onClick={onUnlockPremium}
            className={`w-full h-9 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5 ${
              canAffordPremium
                ? 'bg-[#6366F1] hover:bg-[#7C7FF5] text-white shadow-indigo-600/25'
                : 'bg-white/5 text-[#9AA3B5] border border-white/8 hover:bg-white/10'
            }`}
          >
            <span>Unlock</span>
          </button>
        </div>
      </div>

    </div>
  );
};
