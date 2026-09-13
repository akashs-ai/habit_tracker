import React from 'react';
import {
  KeyRound,
  Database,
  Grid,
  Shield,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  Sparkles,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { UserSettingsProfile, SettingsTabId, AuthUser } from '../../types';

interface AccountSettingsProps {
  profile: UserSettingsProfile;
  currentUser?: AuthUser | null;
  onOpenEditProfile: () => void;
  onOpenChangePassword: () => void;
  onOpenSecurity: () => void;
  onOpenManageData: () => void;
  onOpenConnectedApps: () => void;
  onOpenFeedback: () => void;
  onOpenHelp: () => void;
  onOpenAuthModal?: (screen: 'login' | 'signup' | 'guest_prompt') => void;
  onLogout?: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  profile,
  currentUser,
  onOpenEditProfile,
  onOpenChangePassword,
  onOpenSecurity,
  onOpenManageData,
  onOpenConnectedApps,
  onOpenFeedback,
  onOpenHelp,
  onOpenAuthModal,
  onLogout,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Column (8 cols on desktop) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Guest Mode Conversion Banner */}
        {currentUser?.isGuest && onOpenAuthModal && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 dark:from-[#201B4B] via-indigo-100/50 dark:via-[#1E1B4B] to-slate-50 dark:to-[#12192B] border border-indigo-200 dark:border-[#6366F1]/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-[#6366F1]/20 border border-indigo-200 dark:border-[#6366F1]/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-[#818CF8]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">You are exploring in Guest Mode</h3>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-0.5 leading-relaxed">
                  Convert your guest session to a permanent account so your habit progress, XP, and streaks are never lost.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuthModal('signup')}
              className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#5254E2] text-xs font-semibold text-white transition-all shadow-md shadow-[#6366F1]/25 shrink-0 self-stretch sm:self-auto text-center"
            >
              Create Account to Save
            </button>
          </div>
        )}

        {/* Profile Card */}
        <section className="bg-white dark:bg-[#101722] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-sm transition-colors">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h2 className="text-lg md:text-[19px] font-bold text-slate-900 dark:text-[#F5F7FB] tracking-tight">
                Profile
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-[#94A3B8] mt-0.5">
                Update your personal information and how you appear on LifeRPG.
              </p>
            </div>
            <button
              type="button"
              id="btn-edit-profile"
              onClick={onOpenEditProfile}
              className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141D2A] dark:hover:bg-[#1A2536] border border-slate-200 dark:border-white/10 text-xs md:text-sm font-medium text-slate-800 dark:text-[#F5F7FB] transition-colors self-start sm:self-auto shadow-xs focus:outline-none focus:ring-2 focus:ring-[#5B5CE2]"
            >
              Edit Profile
            </button>
          </div>

          {/* Profile Details Content */}
          <div className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
              {/* Avatar with Glow Ring & Click to Edit */}
              <div
                id="account-profile-avatar-clickable"
                onClick={onOpenEditProfile}
                title="Click to change profile picture"
                className="relative shrink-0 group cursor-pointer"
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-[#6366F1]/40 group-hover:ring-[#818CF8] group-hover:scale-105 transition-all shadow-md"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#22C55E] ring-2 ring-white dark:ring-[#101722]" />
              </div>

              {/* Name & Bio */}
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-[#F5F7FB] tracking-tight">
                    {profile.displayName}
                  </h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-[#201B4B] text-indigo-700 dark:text-[#818CF8] border border-indigo-200 dark:border-[#6366F1]/30">
                    <Sparkles className="w-3 h-3" />
                    <span>Level {profile.level}</span>
                    <span>•</span>
                    <span>{profile.mp.toLocaleString()} MP</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-600 dark:text-[#94A3B8] mt-1.5 leading-relaxed italic">
                  “{profile.bio}”
                </p>
              </div>
            </div>

            {/* Metadata Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-white/[0.06] text-xs md:text-sm">
              <div className="bg-slate-50 dark:bg-[#141D2A]/70 p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.04]">
                <span className="text-[11px] font-medium text-slate-500 dark:text-[#64748B] uppercase tracking-wider block mb-1">
                  Email
                </span>
                <span className="text-slate-900 dark:text-[#F5F7FB] font-medium break-all">
                  {profile.email}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-[#141D2A]/70 p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.04]">
                <span className="text-[11px] font-medium text-slate-500 dark:text-[#64748B] uppercase tracking-wider block mb-1">
                  Member since
                </span>
                <span className="text-slate-900 dark:text-[#F5F7FB] font-medium">
                  {profile.memberSince}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-[#141D2A]/70 p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.04]">
                <span className="text-[11px] font-medium text-slate-500 dark:text-[#64748B] uppercase tracking-wider block mb-1">
                  Username
                </span>
                <span className="text-indigo-600 dark:text-[#818CF8] font-medium">
                  @{profile.username}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-[#F5F7FB] mb-3 px-1">
            Quick actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Change password */}
            <button
              type="button"
              id="quick-action-password"
              onClick={onOpenChangePassword}
              className="group text-left p-5 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#101722] dark:hover:bg-[#141D2A] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-400 dark:hover:border-[#6366F1]/40 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-[#201B4B] border border-indigo-200/60 dark:border-[#6366F1]/30 flex items-center justify-center text-indigo-600 dark:text-[#818CF8] mb-3 group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FB] group-hover:text-indigo-600 dark:group-hover:text-[#818CF8] transition-colors">
                  Change password
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                  Keep your account secure
                </p>
              </div>
            </button>

            {/* Card 2: Manage data */}
            <button
              type="button"
              id="quick-action-data"
              onClick={onOpenManageData}
              className="group text-left p-5 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#101722] dark:hover:bg-[#141D2A] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-400 dark:hover:border-[#6366F1]/40 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-[#201B4B] border border-indigo-200/60 dark:border-[#6366F1]/30 flex items-center justify-center text-indigo-600 dark:text-[#818CF8] mb-3 group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FB] group-hover:text-indigo-600 dark:group-hover:text-[#818CF8] transition-colors">
                  Manage data
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                  Export or delete your data
                </p>
              </div>
            </button>

            {/* Card 3: Connected apps */}
            <button
              type="button"
              id="quick-action-apps"
              onClick={onOpenConnectedApps}
              className="group text-left p-5 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#101722] dark:hover:bg-[#141D2A] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-400 dark:hover:border-[#6366F1]/40 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-[#201B4B] border border-indigo-200/60 dark:border-[#6366F1]/30 flex items-center justify-center text-indigo-600 dark:text-[#818CF8] mb-3 group-hover:scale-105 transition-transform">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F7FB] group-hover:text-indigo-600 dark:group-hover:text-[#818CF8] transition-colors">
                  Connected apps
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                  Manage your integrations
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column (4 cols on desktop) */}
      <div className="lg:col-span-4 space-y-5">
        {/* Inspirational Card */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] shadow-sm p-6 flex flex-col justify-between min-h-[180px]">
          {/* Custom SVG Night Landscape */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid slice"
              viewBox="0 0 300 200"
              fill="none"
            >
              <defs>
                <linearGradient id="nightSky" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E1B4B" />
                  <stop offset="50%" stopColor="#172138" />
                  <stop offset="100%" stopColor="#0B101E" />
                </linearGradient>
                <radialGradient id="moonGlow" cx="75%" cy="30%" r="40%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
                  <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="300" height="200" fill="url(#nightSky)" />
              {/* Moon */}
              <circle cx="230" cy="55" r="28" fill="url(#moonGlow)" />
              <circle cx="230" cy="55" r="10" fill="#FEF9C3" />
              {/* Mountains */}
              <path
                d="M40 200L110 110L160 160L210 90L270 170L320 120L340 200H40Z"
                fill="#0F172A"
                fillOpacity="0.8"
              />
              <path
                d="M-20 200L50 130L120 200H-20Z"
                fill="#0A0F1D"
                fillOpacity="0.9"
              />
              <path
                d="M150 200L210 140L280 200H150Z"
                fill="#090D18"
              />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B101E]/90 via-[#0E1524]/60 to-transparent" />
          </div>

          <div className="relative z-10">
            <h4 className="text-base md:text-lg font-bold text-[#F5F7FB] leading-snug">
              Small settings.
              <br />
              A bigger tomorrow.
            </h4>
          </div>
          <div className="relative z-10 pt-6">
            <span className="text-[11px] font-medium tracking-wide uppercase text-[#818CF8]">
              LifeRPG Account
            </span>
          </div>
        </div>

        {/* Quick Menu List */}
        <div className="bg-white dark:bg-[#101722] border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-white/[0.06] transition-colors">
          {/* Item 1 */}
          <button
            type="button"
            onClick={onOpenSecurity}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#141D2A] flex items-center justify-center text-indigo-600 dark:text-[#818CF8]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-[#F5F7FB] group-hover:text-indigo-600 dark:group-hover:text-[#818CF8] transition-colors">
                  Account security
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  Keep your account safe
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#64748B] group-hover:text-slate-700 dark:group-hover:text-[#F5F7FB] transition-colors" />
          </button>

          {/* Item 2 */}
          <button
            type="button"
            onClick={onOpenManageData}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#141D2A] flex items-center justify-center text-indigo-600 dark:text-[#818CF8]">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-[#F5F7FB] group-hover:text-indigo-600 dark:group-hover:text-[#818CF8] transition-colors">
                  Manage data
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  Export or delete your data
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#64748B] group-hover:text-slate-700 dark:group-hover:text-[#F5F7FB] transition-colors" />
          </button>

          {/* Item 3 */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#141D2A] flex items-center justify-center text-indigo-600 dark:text-[#818CF8]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-[#F5F7FB] group-hover:text-indigo-600 dark:group-hover:text-[#818CF8] transition-colors">
                  Help & support
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  Get help or contact us
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#64748B] group-hover:text-slate-700 dark:group-hover:text-[#F5F7FB] transition-colors" />
          </button>

          {/* Item 4 */}
          <button
            type="button"
            onClick={onOpenFeedback}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#141D2A] flex items-center justify-center text-indigo-600 dark:text-[#818CF8]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-[#F5F7FB] group-hover:text-indigo-600 dark:group-hover:text-[#818CF8] transition-colors">
                  Give feedback
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  Help us improve LifeRPG
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#64748B] group-hover:text-slate-700 dark:group-hover:text-[#F5F7FB] transition-colors" />
          </button>

          {/* Item 5: Switch Account */}
          {onOpenAuthModal && (
            <button
              type="button"
              onClick={() => onOpenAuthModal('login')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#141D2A] flex items-center justify-center text-indigo-600 dark:text-[#818CF8]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs md:text-sm font-semibold text-slate-900 dark:text-[#F5F7FB] group-hover:text-indigo-600 dark:group-hover:text-[#818CF8] transition-colors">
                    Switch account
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                    Sign in with another profile
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#64748B] group-hover:text-slate-700 dark:group-hover:text-[#F5F7FB] transition-colors" />
            </button>
          )}

          {/* Item 6: Log Out */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-rose-50 dark:hover:bg-[#EF4444]/10 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-[#EF4444]/20 flex items-center justify-center text-rose-600 dark:text-[#EF4444]">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs md:text-sm font-semibold text-rose-600 dark:text-[#F87171] transition-colors">
                    Log out
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                    Sign out of your active session
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400 dark:text-[#EF4444]/60 group-hover:text-rose-600 dark:group-hover:text-[#EF4444] transition-colors" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
