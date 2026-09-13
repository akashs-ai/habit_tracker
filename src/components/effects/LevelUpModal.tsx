import React, { useEffect } from 'react';
import { Crown, Sparkles, Zap, Shield, ChevronRight, Award } from 'lucide-react';
import { soundFx } from '../../utils/audioFx';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  unlockedBonuses?: {
    gold: number;
    attributes: string[];
    title: string;
  };
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  unlockedBonuses = {
    gold: 150,
    attributes: ['+5 Strength', '+5 Intellect', '+5 Discipline'],
    title: newLevel >= 5 ? 'Seasoned Adventurer' : newLevel >= 3 ? 'Journeyman Pathfinder' : 'Initiate Pathfinder',
  },
}) => {
  useEffect(() => {
    if (isOpen) {
      soundFx.playLevelUp();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark blur backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Radiant Sunburst Animation */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[600px] h-[600px] rounded-full bg-radial from-amber-400/20 via-indigo-600/10 to-transparent blur-2xl animate-pulse" />
      </div>

      {/* Main Celebration Dialog */}
      <div 
        id="level-up-modal-card"
        className="relative z-10 w-full max-w-md bg-[#0D1017] border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_60px_-15px_rgba(245,158,11,0.3)] animate-in fade-in zoom-in-90 duration-300 overflow-hidden"
      >
        {/* Golden top crest */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Floating Crown / Shield Emblem */}
        <div className="relative mx-auto mb-5 w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl animate-ping" style={{ animationDuration: '3s' }} />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 p-0.5 shadow-xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
            <div className="w-full h-full bg-[#0E121B] rounded-[14px] flex flex-col items-center justify-center">
              <Crown className="w-8 h-8 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]" />
              <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase">LVL</span>
            </div>
          </div>
        </div>

        {/* Level Up Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ascension Achieved</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
          LEVEL {newLevel}!
        </h2>
        <p className="text-sm font-semibold text-amber-300/90 mb-6">
          {unlockedBonuses.title}
        </p>

        {/* Stat Rewards Grid */}
        <div className="bg-[#121622] border border-white/8 rounded-2xl p-4 mb-6 text-left">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Rank Rewards Granted</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                🪙
              </div>
              <div>
                <div className="text-xs font-bold text-white">+{unlockedBonuses.gold} Gold</div>
                <div className="text-[10px] text-gray-400">Vault Deposit</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">+All Stats</div>
                <div className="text-[10px] text-gray-400">Attributes Boost</div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/6 flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Vitality restored</span>
            </div>
            <span className="text-emerald-400 font-bold">100% HP</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="level-up-continue-btn"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-[#0A0D14] font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Claim Rewards & Continue</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
