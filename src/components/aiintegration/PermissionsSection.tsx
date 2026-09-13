import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  MessageSquare,
  ChevronDown,
  Lock,
  ArrowRight,
  Check,
  CalendarCheck2,
  Eye,
  Slash
} from 'lucide-react';
import { GoogleCalendarTile } from './ModelLogos';
import { CalendarPermissionLevel } from '../../types';

interface PermissionsSectionProps {
  permission: CalendarPermissionLevel;
  useInCoach: boolean;
  onPermissionChange: (perm: CalendarPermissionLevel) => void;
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const permissionOptions: Array<{
    id: CalendarPermissionLevel;
    label: string;
    description: string;
    icon: typeof Eye;
  }> = [
    {
      id: 'read_edit',
      label: 'Read & edit',
      description: 'Read events and actively manage or create schedule updates',
      icon: CalendarCheck2,
    },
    {
      id: 'read_only',
      label: 'Read only',
      description: 'Read events and schedule context',
      icon: Eye,
    },
    {
      id: 'no_access',
      label: 'No access',
      description: 'Calendar integration disabled',
      icon: Slash,
    },
  ];

  const currentOption = permissionOptions.find((opt) => opt.id === permission) || permissionOptions[0];

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
              Control what your AI Coach can access and modify from your connected tools.
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
            <GoogleCalendarTile className="w-10 h-10 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#F5F7FB] truncate">
                  Google Calendar
                </h3>
                {permission === 'read_edit' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#5B5CE2]/20 text-[#A5B4FC] border border-[#5B5CE2]/30">
                    Write Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] truncate">
                {permission === 'read_edit'
                  ? 'Read events and actively manage or create schedule updates'
                  : permission === 'read_only'
                  ? 'Read events and schedule context'
                  : 'Calendar integration disabled'}
              </p>
            </div>
          </div>

          {/* Custom Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              id="google-calendar-permission-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3.5 py-2 rounded-lg bg-[#1F2B3E] hover:bg-[#27354A] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B5CE2]"
            >
              <span>{currentOption.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div 
                id="google-calendar-permission-menu"
                className="absolute right-0 mt-1.5 w-64 rounded-xl bg-[#141D2A] border border-white/10 shadow-2xl py-1.5 z-30 text-xs divide-y divide-white/5"
              >
                {permissionOptions.map((opt) => {
                  const isSelected = permission === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      id={`permission-opt-${opt.id}`}
                      onClick={() => {
                        onPermissionChange(opt.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 transition-colors ${
                        isSelected ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#818CF8]' : 'text-[#64748B]'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`font-medium ${isSelected ? 'text-[#F5F7FB]' : 'text-[#94A3B8]'}`}>
                            {opt.label}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#818CF8] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5 leading-tight line-clamp-2">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
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
            We use secure Google OAuth credentials. Write-enabled permissions permit AI Coach calendar actions.
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
