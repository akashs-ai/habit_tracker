import React, { useState } from 'react';
import {
  Shield,
  MessageSquare,
  ChevronDown,
  Lock,
  ArrowRight,
  Check,
} from 'lucide-react';
import { GoogleCalendarTile } from './ModelLogos';

interface PermissionsSectionProps {
  permission: 'read_only' | 'no_access';
  useInCoach: boolean;
  onPermissionChange: (perm: 'read_only' | 'no_access') => void;
  onToggleUseInCoach: () => void;
  onManageAllPermissions: () => void;
  onLearnMore: () => void;
}

export const PermissionsSection: React.FC<PermissionsSectionProps> = ({
  permission,
  useInCoach,
  onPermissionChange,
  onToggleUseInCoach,
  onManageAllPermissions,
  onLearnMore,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <section className="bg-[#101722] border border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#201B4B] border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8] shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg md:text-[19px] font-bold text-[#F5F7FB] tracking-tight">
              Permissions
            </h2>
            <p className="text-xs md:text-sm text-[#94A3B8]">
              Control what your AI Coach can access from your connected tools.
            </p>
          </div>
        </div>

        <button
          onClick={onManageAllPermissions}
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-[#818CF8] hover:text-[#A5B4FC] transition-colors self-start sm:self-auto group"
        >
          <span>Manage all permissions</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Permission Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1: Google Calendar Permission */}
        <div className="p-4 md:p-5 rounded-xl bg-[#141D2A] border border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <GoogleCalendarTile className="w-10 h-10" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#F5F7FB] truncate">
                Google Calendar
              </h3>
              <p className="text-xs text-[#94A3B8] truncate">
                Read events and schedule
              </p>
            </div>
          </div>

          {/* Custom Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3.5 py-2 rounded-lg bg-[#1F2B3E] hover:bg-[#27354A] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B5CE2]"
            >
              <span>{permission === 'read_only' ? 'Read only' : 'No access'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-[#141D2A] border border-white/10 shadow-xl py-1.5 z-30 text-xs">
                  <button
                    onClick={() => {
                      onPermissionChange('read_only');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-[#F5F7FB] hover:bg-white/10 flex items-center justify-between transition-colors"
                  >
                    <span>Read only</span>
                    {permission === 'read_only' && (
                      <Check className="w-3.5 h-3.5 text-[#5B5CE2]" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onPermissionChange('no_access');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-[#F5F7FB] hover:bg-white/10 flex items-center justify-between transition-colors"
                  >
                    <span>No access</span>
                    {permission === 'no_access' && (
                      <Check className="w-3.5 h-3.5 text-[#5B5CE2]" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 2: AI Coach Access Toggle */}
        <div className="p-4 md:p-5 rounded-xl bg-[#141D2A] border border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#101722] border border-white/10 flex items-center justify-center text-[#94A3B8] shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#F5F7FB] truncate">
                Use in AI Coach
              </h3>
              <p className="text-xs text-[#94A3B8] truncate">
                Allow calendar context in conversations
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={useInCoach}
            onClick={onToggleUseInCoach}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] focus:ring-offset-2 focus:ring-offset-[#141D2A] ${
              useInCoach ? 'bg-[#5B5CE2]' : 'bg-[#334155]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                useInCoach ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Security Footer Note */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#818CF8] shrink-0" />
          <span>
            We use secure connections (OAuth). You can manage or revoke access anytime.
          </span>
        </div>

        <button
          onClick={onLearnMore}
          className="inline-flex items-center gap-1 text-[#818CF8] hover:text-[#A5B4FC] transition-colors self-start sm:self-auto group font-medium"
        >
          <span>Learn more</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
};
