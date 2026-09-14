import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle2 } from 'lucide-react';

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
}

export const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      id="terms-privacy-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="terms-privacy-modal-card"
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-[#101726] border border-white/10 shadow-2xl overflow-hidden text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0A0F1D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8]">
              {activeTab === 'terms' ? <FileText className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Last updated: March 2025 • LifeRPG Platform
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-[#0D1322] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'terms'
                ? 'border-[#6366F1] text-white'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'privacy'
                ? 'border-[#6366F1] text-white'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
          {activeTab === 'terms' ? (
            <>
              <section className="space-y-2">
                <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#818CF8]" />
                  1. Acceptance of Terms
                </h4>
                <p>
                  By creating an account on LifeRPG, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                  2. Account Security & Verification
                </h4>
                <p>
                  You are responsible for safeguarding your credentials. You must provide a valid email address that you own and control. LifeRPG requires email verification to ensure account authenticity and prevent unauthorized access.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#94A3B8]">
                  <li>One account per individual user.</li>
                  <li>Usernames must not impersonate others or violate intellectual property rights.</li>
                  <li>Passwords must meet minimum security criteria (at least 8 characters).</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-sm sm:text-base">
                  3. Fair Play & Progression Integrity
                </h4>
                <p>
                  LifeRPG is designed to inspire genuine personal growth and habit building. Any attempt to exploit system vulnerabilities, manipulate XP or Momentum Points through automated scripts, or create fraudulent records is prohibited.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-sm sm:text-base">
                  4. Termination
                </h4>
                <p>
                  LifeRPG reserves the right to suspend or terminate accounts that violate these Terms of Service or engage in malicious or abusive behavior.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2">
                <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#818CF8]" />
                  1. Information We Collect
                </h4>
                <p>
                  We collect information necessary to deliver and personalize your gamified self-improvement experience:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#94A3B8]">
                  <li>Account Information: Name, email address, username, and authentication tokens.</li>
                  <li>App Activity: Quests, habits, goals, notes, and milestones you record.</li>
                  <li>Preferences: Theme mode, notification settings, and avatar choices.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-sm sm:text-base">
                  2. How We Protect Your Data
                </h4>
                <p>
                  Your personal data is encrypted in transit and at rest. Access to user data is governed by strict Row-Level Security (RLS) policies ensuring that your habits, tasks, and notes can only be viewed and updated by you.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-sm sm:text-base">
                  3. Email Communications
                </h4>
                <p>
                  We send transactional emails necessary for account operation, including signup email verification links, password resets, and critical account security notices. We never sell your email to third parties.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white text-sm sm:text-base">
                  4. Your Rights
                </h4>
                <p>
                  You have the right to access, export, or delete your account and associated personal data at any time through your Account Settings.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0A0F1D] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#6366F1]/20"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
