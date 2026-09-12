import React, { useState } from 'react';
import { X, Sparkles, Flame, Check, Lock, ShieldCheck, AlertCircle, FileText } from 'lucide-react';
import { RewardItem } from '../../types';

interface RewardDetailModalProps {
  reward: RewardItem | null;
  isOpen: boolean;
  onClose: () => void;
  userPoints: number;
  onUnlock: (reward: RewardItem, termsAccepted: boolean) => Promise<void> | void;
  onActivate: (reward: RewardItem) => void;
  onOpenTerms?: () => void;
}

export const RewardDetailModal: React.FC<RewardDetailModalProps> = ({
  reward,
  isOpen,
  onClose,
  userPoints,
  onUnlock,
  onActivate,
  onOpenTerms,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [claimError, setClaimError] = useState<string | null>(null);

  if (!isOpen || !reward) return null;

  const canAfford = userPoints >= reward.cost;
  const isOwned = reward.status === 'owned';
  const isActive = reward.status === 'active';

  const handleUnlockClick = async () => {
    if (!termsAccepted) {
      setClaimError('You must agree to the Reward Claim Terms & Conditions before claiming.');
      return;
    }

    try {
      setIsProcessing(true);
      setClaimError(null);
      await onUnlock(reward, termsAccepted);
    } catch (err: any) {
      setClaimError(err.message || 'Failed to claim reward.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="reward-detail-modal"
        className="w-full max-w-[460px] rounded-3xl bg-[#11161D] border border-white/10 p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/6 hover:bg-white/12 border border-white/8 flex items-center justify-center text-[#9AA3B5] hover:text-white transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Large Visual Preview Box */}
        <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-[#0F1422] to-[#171E32] border border-white/8 relative overflow-hidden flex items-center justify-center">
          <div className="absolute top-2 left-3 px-2 py-0.5 rounded-md bg-white/8 border border-white/10 text-[10px] font-bold text-[#A5B4FC]">
            {reward.badgeTag}
          </div>

          {reward.previewType === 'aurora-theme' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute top-2 w-32 h-16 rounded-full bg-cyan-400/20 blur-2xl" />
              <div className="absolute top-4 w-40 h-20 rounded-full bg-indigo-500/20 blur-2xl" />
              <div className="w-44 h-24 rounded-xl bg-[#0B0F19]/90 border border-white/10 p-2 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="w-14 h-1.5 rounded bg-white/20" />
                </div>
                <div className="space-y-1">
                  <div className="w-full h-1.5 rounded bg-indigo-500/40" />
                  <div className="w-3/4 h-1.5 rounded bg-white/15" />
                </div>
                <div className="text-[9px] text-[#818CF8] font-mono">Aurora UI Active</div>
              </div>
            </div>
          )}

          {reward.previewType === 'focus-icons' && (
            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-[#1C2337] border border-white/8 flex items-center justify-center text-indigo-300">
                  <Sparkles className="w-5 h-5" />
                </div>
              ))}
            </div>
          )}

          {reward.previewType === 'flame-badge' && (
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#F59E0B]/20 blur-2xl" />
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-[#F59E0B] flex items-center justify-center">
                <Flame className="w-9 h-9 fill-[#F97316] text-[#F97316]" />
              </div>
            </div>
          )}

          {reward.previewType === 'glass-frame' && (
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(56,189,248,0.4)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0D1017] flex items-center justify-center text-white font-bold text-base">
                A
              </div>
            </div>
          )}

          {reward.previewType === 'completion-effect' && (
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.6)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Content Details */}
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {reward.name}
          </h3>
          <p className="text-xs text-[#9AA3B5] mt-1 leading-relaxed">
            {reward.description}
          </p>
        </div>

        {/* Momentum Points Cost Display */}
        <div className="p-3 rounded-xl bg-white/4 border border-white/6 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#9AA3B5]">Price</span>
          <div className="flex items-center gap-1.5 text-sm font-extrabold text-white">
            <Flame className="w-4 h-4 text-[#F59E0B]" />
            <span>{reward.cost.toLocaleString()} Momentum Points</span>
          </div>
        </div>

        {/* Includes Bullet Points per Spec */}
        {reward.includes && reward.includes.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-white">Includes:</p>
            <div className="space-y-1">
              {reward.includes.map((inc, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#9AA3B5]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms Agreement & Validation for Unowned Items */}
        {!isOwned && !isActive && (
          <div className="space-y-2 pt-1 border-t border-white/6">
            <div className="flex items-start gap-2 text-[11px] text-[#9AA3B5]">
              <input
                type="checkbox"
                id="agree-reward-terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 rounded bg-[#171E32] border-white/20 text-[#6366F1] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="agree-reward-terms" className="leading-tight select-none cursor-pointer">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="text-[#818CF8] hover:underline font-semibold"
                >
                  Reward Claim Terms & Conditions
                </button>{' '}
                (one-time unlock, verified backend progress).
              </label>
            </div>

            {claimError && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{claimError}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-[#64748B]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#34D399]" />
                Server-validated claim
              </span>
              <span>Single-use unlock</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isActive ? (
            <button
              disabled
              className="w-full h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Currently Active</span>
            </button>
          ) : isOwned ? (
            <button
              onClick={() => onActivate(reward)}
              className="w-full h-10 rounded-xl bg-[#6366F1] hover:bg-[#7C7FF5] text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25"
            >
              Use {reward.badgeTag}
            </button>
          ) : (
            <button
              onClick={handleUnlockClick}
              disabled={!canAfford || isProcessing || !termsAccepted}
              className={`w-full h-10 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                canAfford && termsAccepted
                  ? 'bg-[#6366F1] hover:bg-[#7C7FF5] text-white shadow-indigo-600/25'
                  : 'bg-white/5 text-[#9AA3B5] border border-white/8 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying claim with server...
                </span>
              ) : !termsAccepted ? (
                <span>Accept Terms to Unlock</span>
              ) : canAfford ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Unlock for {reward.cost.toLocaleString()} MP</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Not enough points ({userPoints.toLocaleString()} / {reward.cost.toLocaleString()})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
