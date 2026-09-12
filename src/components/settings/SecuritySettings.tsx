import React from 'react';
import {
  KeyRound,
  ShieldCheck,
  Laptop,
  Bell,
  ArrowLeft,
} from 'lucide-react';
import { SecuritySettings as SecuritySettingsType } from '../../types';

interface SecuritySettingsProps {
  security: SecuritySettingsType;
  onUpdateSecurity: (newSec: Partial<SecuritySettingsType>) => void;
  onOpenChangePassword: () => void;
  onOpenManageSessions: () => void;
  onBackToAccount?: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  security,
  onUpdateSecurity,
  onOpenChangePassword,
  onOpenManageSessions,
  onBackToAccount,
}) => {
  return (
    <div className="space-y-6">
      {onBackToAccount && (
        <button
          type="button"
          onClick={onBackToAccount}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#818CF8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Account</span>
        </button>
      )}

      <section className="bg-[#101722] border border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-sm">
        {/* Header */}
        <div className="pb-6 border-b border-white/[0.06]">
          <h2 className="text-lg md:text-[19px] font-bold text-[#F5F7FB] tracking-tight">
            Security
          </h2>
          <p className="text-xs md:text-sm text-[#94A3B8] mt-0.5">
            Keep your account safe and secure.
          </p>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.06]">
          {/* Row 1: Password */}
          <div className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">Password</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {security.lastPasswordChange}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-change-password-row"
              onClick={onOpenChangePassword}
              className="px-4 py-2 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] transition-colors self-start sm:self-auto"
            >
              Change
            </button>
          </div>

          {/* Row 2: Two-factor authentication */}
          <div className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">
                  Two-factor authentication
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Add an extra layer of security
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onUpdateSecurity({ twoFactorAuth: !security.twoFactorAuth })
              }
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-colors self-start sm:self-auto ${
                security.twoFactorAuth
                  ? 'bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]'
                  : 'bg-[#5B5CE2] hover:bg-[#4E4FD1] text-white shadow-xs'
              }`}
            >
              {security.twoFactorAuth ? 'Enabled' : 'Enable'}
            </button>
          </div>

          {/* Row 3: Active sessions */}
          <div className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">Active sessions</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Manage devices where you're logged in
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenManageSessions}
              className="px-4 py-2 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] transition-colors self-start sm:self-auto"
            >
              Manage
            </button>
          </div>

          {/* Row 4: Login alerts */}
          <div className="py-4 sm:py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">Login alerts</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Get notified about new logins
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={security.loginAlerts}
              onClick={() => onUpdateSecurity({ loginAlerts: !security.loginAlerts })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] ${
                security.loginAlerts ? 'bg-[#5B5CE2]' : 'bg-[#334155]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  security.loginAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
