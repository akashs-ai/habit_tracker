import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, LogIn, LogOut, User, Sparkles, ChevronDown, Compass, Settings, Volume2, VolumeX, Flame, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthUser, AppNotification } from '../types';
import { soundFx } from '../utils/audioFx';
import { NotificationDropdown } from './NotificationDropdown';
import { verifyCurrentAuthUserStreak } from '../services/supabaseData';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser?: AuthUser | null;
  onOpenAuthModal?: (screen: 'login' | 'signup' | 'guest_prompt') => void;
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onClearAllNotifications?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onNavigateToSettings,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onClearAllNotifications,
  onNavigateTab,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundFx.getIsMuted());
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleToggleSound = () => {
    const nextMuted = soundFx.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundFx.playCheckmark();
    }
  };

  const [isVerifyingStreak, setIsVerifyingStreak] = useState(false);
  const [streakVerificationResult, setStreakVerificationResult] = useState<{
    rpcStreak?: number;
    profileStreak?: number;
    match?: boolean;
    referenceDate?: string;
    error?: string;
  } | null>(null);

  const handleRunStreakVerification = async () => {
    setIsVerifyingStreak(true);
    setStreakVerificationResult(null);
    try {
      const res = await verifyCurrentAuthUserStreak();
      setStreakVerificationResult(res);
      console.log('✅ Manual Streak Verification Result:', res);
    } catch (err: any) {
      setStreakVerificationResult({ error: err?.message || 'Verification failed' });
    } finally {
      setIsVerifyingStreak(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayName = currentUser?.fullName || (currentUser?.isGuest ? 'Guest Explorer' : 'Alex Das');
  const displayEmail = currentUser?.email || 'iitangaming18@gmail.com';
  const displayAvatar = currentUser?.avatarUrl || (typeof window !== 'undefined' ? localStorage.getItem('liferpg_user_avatar') : null) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

  return (
    <header 
      id="top-header"
      className="h-[72px] bg-white/80 dark:bg-[#111113]/80 backdrop-blur-md sticky top-0 z-20 px-6 sm:px-8 border-b border-[#E7EAF0] dark:border-[#27272A] flex items-center justify-between transition-colors duration-200"
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Trigger */}
        <button
          id="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#5E6470] dark:text-[#A1A1AA] hover:bg-[#F3F4F6] dark:hover:bg-[#18181B]"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div id="global-search-container" className="relative w-full max-w-sm sm:max-w-md">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quests, goals, friends..."
            className="w-full h-10 pl-9 pr-14 bg-[#F8F9FA] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] rounded-xl text-xs sm:text-sm text-[#111827] dark:text-[#FAFAFA] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C6CFF]/30 focus:border-[#7C6CFF] transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-[#6B7280] dark:text-[#9CA3AF] bg-white dark:bg-[#27272A] border border-[#E5E7EB] dark:border-[#34343A] rounded shadow-2xs">
              ⌘ K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Header Section */}
      <div className="flex items-center gap-3 sm:gap-5 pl-3">
        {/* Guest Pill Trigger (if in guest mode) */}
        {currentUser?.isGuest && onOpenAuthModal && (
          <button
            type="button"
            onClick={() => onOpenAuthModal('signup')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6366F1]/15 hover:bg-[#6366F1]/25 border border-[#6366F1]/40 text-[#818CF8] text-xs font-semibold transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Save Progress</span>
          </button>
        )}

        {/* Motivational Daily Quote (visible on lg+) */}
        <div id="header-quote" className="hidden lg:block max-w-[240px] text-right">
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] font-normal italic leading-tight">
            &ldquo;Small steps, bigger tomorrow.&rdquo;
          </p>
        </div>

        {/* Sound Effects Toggle Button */}
        <button
          id="header-sound-toggle-btn"
          type="button"
          onClick={handleToggleSound}
          className={`p-2 rounded-xl border transition-all active:scale-95 ${
            isMuted 
              ? 'text-[#9CA3AF] border-transparent hover:bg-white/5' 
              : 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 shadow-2xs'
          }`}
          title={isMuted ? 'Sound Effects Muted (Click to enable)' : 'Tactile Sound Effects Active (Click to mute)'}
          aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
        </button>

        {/* Notification Bell with Badge & Dropdown */}
        <div ref={notificationRef} className="relative">
          <button
            id="notification-bell-btn"
            type="button"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={`relative p-2 rounded-xl transition-all cursor-pointer ${
              isNotificationOpen
                ? 'bg-[#7C6CFF]/15 text-[#7C6CFF]'
                : 'text-[#4B5563] dark:text-[#A1A1AA] hover:bg-[#F3F4F6] dark:hover:bg-[#18181B]'
            }`}
            aria-label="Notifications"
            aria-expanded={isNotificationOpen}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 bg-[#EF4444] text-white text-[9px] font-bold rounded-full ring-2 ring-white dark:ring-[#111113] flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            notifications={notifications}
            onMarkAsRead={(id) => onMarkNotificationAsRead?.(id)}
            onMarkAllAsRead={() => onMarkAllNotificationsAsRead?.()}
            onClearAll={() => onClearAllNotifications?.()}
            onNavigateToTab={(tab) => onNavigateTab?.(tab)}
          />
        </div>

        {/* User Account Menu Container */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            id="header-avatar-btn"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#7C6CFF]/30 transition-all focus:outline-none"
            aria-expanded={isUserMenuOpen}
          >
            <div className="relative">
              <img
                src={displayAvatar}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#7C6CFF]/25 shadow-xs"
              />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#111113] ${currentUser?.isGuest ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'}`} />
            </div>
          </button>

          {/* User Account Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#101726] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in duration-150">
              {/* Profile Header */}
              <div className="px-4 py-3 border-b border-white/[0.08]">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-white truncate">{displayName}</p>
                  {currentUser?.isGuest ? (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#F59E0B]/20 text-[#FBBF24] rounded-full border border-[#F59E0B]/30">
                      Guest
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#22C55E]/20 text-[#4ADE80] rounded-full border border-[#22C55E]/30">
                      Member
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">{displayEmail}</p>
              </div>

              {/* Action Links */}
              <div className="py-1">
                {currentUser?.isGuest && onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAuthModal('signup');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#818CF8] hover:bg-[#6366F1]/10 flex items-center gap-2.5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#818CF8]" />
                    <span>Save Progress & Sign Up</span>
                  </button>
                )}

                {onNavigateToSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigateToSettings();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#94A3B8]" />
                    <span>Account Settings</span>
                  </button>
                )}

                {/* Manual Streak Verification Trigger */}
                <button
                  type="button"
                  id="header-verify-streak-btn"
                  onClick={handleRunStreakVerification}
                  disabled={isVerifyingStreak}
                  className="w-full px-4 py-2 text-left text-xs text-[#F97316] hover:bg-[#F97316]/10 flex items-center justify-between gap-2.5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Flame className={`w-4 h-4 text-[#F97316] ${isVerifyingStreak ? 'animate-bounce' : ''}`} />
                    <span>{isVerifyingStreak ? 'Calculating streak...' : 'Verify DB Streak (RPC)'}</span>
                  </div>
                  {streakVerificationResult && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      streakVerificationResult.error
                        ? 'bg-red-500/20 text-red-400'
                        : streakVerificationResult.match
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {streakVerificationResult.error ? 'Error' : `${streakVerificationResult.rpcStreak}d`}
                    </span>
                  )}
                </button>

                {/* Streak Verification Result Details */}
                {streakVerificationResult && (
                  <div className="mx-3 my-1 p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] leading-relaxed">
                    {streakVerificationResult.error ? (
                      <div className="flex items-start gap-1.5 text-red-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{streakVerificationResult.error}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Postgres RPC:</span>
                          <span className="font-bold text-amber-400">{streakVerificationResult.rpcStreak} days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Profiles table:</span>
                          <span className="font-bold text-emerald-400">{streakVerificationResult.profileStreak ?? 'N/A'} days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Sync status:</span>
                          <span className={`font-semibold ${streakVerificationResult.match ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {streakVerificationResult.match ? '✓ In Lockstep' : 'Mismatch'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 text-right">
                          Date: {streakVerificationResult.referenceDate}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAuthModal('login');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-[#CBD5E1] hover:text-white hover:bg-white/[0.04] flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-[#94A3B8]" />
                    <span>Switch Account / Sign In</span>
                  </button>
                )}
              </div>

              {/* Log Out */}
              {onLogout && (
                <div className="pt-1 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#F87171] hover:bg-[#EF4444]/10 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
