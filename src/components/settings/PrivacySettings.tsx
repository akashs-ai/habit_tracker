import React from 'react';
import {
  FileText,
  Download,
  Trash2,
  ChevronRight,
} from 'lucide-react';

interface PrivacySettingsProps {
  onOpenDataUsage: () => void;
  onOpenDownloadData: () => void;
  onOpenDeleteAccount: () => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  onOpenDataUsage,
  onOpenDownloadData,
  onOpenDeleteAccount,
}) => {
  return (
    <div className="space-y-6">
      <section className="bg-[#101722] border border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-sm">
        {/* Header */}
        <div className="pb-6 border-b border-white/[0.06]">
          <h2 className="text-lg md:text-[19px] font-bold text-[#F5F7FB] tracking-tight">
            Privacy & Data
          </h2>
          <p className="text-xs md:text-sm text-[#94A3B8] mt-0.5">
            You control your data. Here's how we keep it safe.
          </p>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.06]">
          {/* Row 1: Data usage */}
          <button
            type="button"
            onClick={onOpenDataUsage}
            className="w-full py-4 sm:py-5 flex items-center justify-between text-left hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB] group-hover:text-[#818CF8] transition-colors">
                  Data usage
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Learn how your data is used.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#F5F7FB] transition-colors" />
          </button>

          {/* Row 2: Download my data */}
          <button
            type="button"
            onClick={onOpenDownloadData}
            className="w-full py-4 sm:py-5 flex items-center justify-between text-left hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB] group-hover:text-[#818CF8] transition-colors">
                  Download my data
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Get a copy of your data.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#F5F7FB] transition-colors" />
          </button>

          {/* Row 3: Delete my account */}
          <div className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444] shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">
                  Delete my account
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Permanently delete your account.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-open-delete-account"
              onClick={onOpenDeleteAccount}
              className="px-4 py-2 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444] border border-[#EF4444]/30 text-xs md:text-sm font-semibold text-[#EF4444] hover:text-white transition-all self-start sm:self-auto shadow-xs"
            >
              Delete account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
