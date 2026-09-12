import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  searchQuery,
  setSearchQuery,
}) => {
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
      <div className="flex items-center gap-4 sm:gap-6 pl-3">
        {/* Notification Bell with Badge */}
        <button
          id="notification-bell-btn"
          className="relative p-2 rounded-xl text-[#4B5563] dark:text-[#A1A1AA] hover:bg-[#F3F4F6] dark:hover:bg-[#18181B] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white dark:ring-[#111113]" />
        </button>

        {/* Motivational Daily Quote (visible on md+) */}
        <div id="header-quote" className="hidden md:block max-w-[280px] lg:max-w-xs text-right">
          <p className="text-xs text-[#52525B] dark:text-[#A1A1AA] font-normal italic leading-tight">
            &ldquo;A better you is a collection of better days.&rdquo;
          </p>
        </div>

        {/* User Avatar Circle */}
        <div id="header-avatar" className="relative cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Alex"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#7C6CFF]/25 shadow-xs"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] rounded-full ring-2 ring-white dark:ring-[#111113]" />
        </div>
      </div>
    </header>
  );
};
