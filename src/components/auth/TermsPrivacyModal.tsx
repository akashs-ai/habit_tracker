import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Lock, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY, LegalDocument } from '../../data/legalContent';

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
  onAccept,
  showAcceptButton = false,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  const currentDoc: LegalDocument = activeTab === 'terms' ? TERMS_AND_CONDITIONS : PRIVACY_POLICY;

  return (
    <div
      id="terms-privacy-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="terms-privacy-modal-card"
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl bg-[#101726] border border-white/10 shadow-2xl overflow-hidden text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-white/10 bg-[#0A0F1D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8]">
              {activeTab === 'terms' ? <FileText className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {currentDoc.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#6366F1]/20 text-[#A5B4FC] border border-[#6366F1]/30">
                  v{currentDoc.version}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Effective: {currentDoc.effectiveDate} • LifeRPG Platform
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
            Terms & Conditions
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

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
          {/* Introduction Box */}
          <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-white/5 text-xs sm:text-sm text-[#E2E8F0] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#818CF8]">
              <Info className="w-4 h-4" />
              <span>Overview & Scope</span>
            </div>
            <p className="text-[#94A3B8] leading-relaxed">
              {currentDoc.introduction}
            </p>
          </div>

          {/* Document Sections */}
          <div className="space-y-6">
            {currentDoc.sections.map((section) => (
              <section key={section.id} id={section.id} className="space-y-2.5 scroll-mt-4">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#6366F1]/20 border border-[#6366F1]/30 text-[#A5B4FC] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {section.number}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base tracking-tight">
                      {section.title}
                    </h4>
                    {section.summary && (
                      <p className="text-[11px] text-[#818CF8] mt-0.5">
                        {section.summary}
                      </p>
                    )}
                  </div>
                </div>

                {section.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-[#CBD5E1] pl-7">
                    {p}
                  </p>
                ))}

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="pl-12 space-y-1 text-[#94A3B8] list-disc">
                    {section.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* Contact Footer in Content */}
          <div className="pt-4 border-t border-white/10 text-xs text-[#94A3B8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Questions regarding this document?</span>
            <span className="text-[#818CF8] font-medium">{currentDoc.contactEmail}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0A0F1D] flex items-center justify-between gap-3">
          <span className="text-xs text-[#64748B]">
            LifeRPG Platform v2.1
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#CBD5E1] text-xs font-semibold transition-colors"
            >
              Close
            </button>
            {showAcceptButton && onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#6366F1]/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span>Agree & Accept</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
