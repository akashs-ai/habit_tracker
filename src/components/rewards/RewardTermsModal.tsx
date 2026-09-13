import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Lock, Award, Clock } from 'lucide-react';
import { REWARD_TERMS_POLICY, RewardTermsSection } from '../../../server/terms';

interface RewardTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const RewardTermsModal: React.FC<RewardTermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  if (!isOpen) return null;

  const policy = REWARD_TERMS_POLICY;

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'eligibility':
        return <Award className="w-4 h-4 text-[#818CF8]" />;
      case 'accurate-progress':
        return <CheckCircle2 className="w-4 h-4 text-[#34D399]" />;
      case 'one-time-claims':
        return <Lock className="w-4 h-4 text-[#F59E0B]" />;
      case 'availability':
        return <Clock className="w-4 h-4 text-[#38BDF8]" />;
      case 'verification':
        return <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />;
      case 'abuse-manipulation':
        return <AlertTriangle className="w-4 h-4 text-[#F87171]" />;
      default:
        return <FileText className="w-4 h-4 text-[#818CF8]" />;
    }
  };

  return (
    <div 
      id="reward-terms-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="reward-terms-modal-card"
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-[#0F131C] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#141926]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-[#818CF8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Reward Claim Terms & Conditions
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-white/6 text-[10px] font-mono text-indigo-600 dark:text-[#818CF8] font-semibold border border-indigo-100 dark:border-transparent">
                  v{policy.version}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#9AA3B5] mt-0.5">
                Last updated: {policy.lastUpdated}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/8 flex items-center justify-center text-slate-600 dark:text-[#9AA3B5] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable Clauses */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm text-slate-700 dark:text-[#CBD5E1] custom-scrollbar">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs sm:text-sm text-indigo-900 dark:text-[#C7D2FE] leading-relaxed flex items-start gap-3">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-[#818CF8] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block mb-1">Authoritative Claim Standard:</span>
              {policy.summary}
            </div>
          </div>

          {/* Section Clauses */}
          <div className="space-y-4">
            {policy.sections.map((section: RewardTermsSection) => (
              <div 
                key={section.id} 
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141924]/70 border border-slate-200 dark:border-white/6 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  {getSectionIcon(section.id)}
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                    {section.title}
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed mb-2">
                  {section.content}
                </p>

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-1.5 pl-4 mt-2">
                    {section.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-xs text-slate-600 dark:text-[#9AA3B5] list-disc marker:text-[#6366F1]">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Compliance notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#171B26] border border-slate-200 dark:border-white/5 text-[11px] text-slate-500 dark:text-[#64748B] flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-[#818CF8] shrink-0" />
            <span>All reward claim transactions are cryptographically verified and recorded in the server audit log.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#141926]/70 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-[#64748B] hidden sm:inline">
            By unlocking rewards, you agree to these authoritative terms.
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/6 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
            {onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:opacity-90 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                I Understand & Agree
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
