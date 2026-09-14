import React from 'react';
import { 
  Home, 
  CheckSquare, 
  Target, 
  Calendar, 
  Users, 
  Gift, 
  TrendingUp, 
  Bot, 
  Cpu,
  Sun, 
  Moon, 
  Monitor,
  Settings, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { AuthUser } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  themeMode?: 'light' | 'dark' | 'system';
  onSetThemeMode?: (mode: 'light' | 'dark' | 'system') => void;
  userLevel: number;
  currentUser?: AuthUser | null;
  momentumPoints?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  themeMode,
  onSetThemeMode,
  userLevel,
  currentUser,
  momentumPoints = 4320,
}) => {
  const primaryNavItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const aiNavItems = [
    { id: 'ai-coach', label: 'AI Coach', icon: Bot },
    { id: 'ai-integration', label: 'AI Integration', icon: Cpu },
  ];

  return (
    <aside 
      id="main-sidebar" 
      className="w-64 bg-white dark:bg-[#0D1015] border-r border-[#E7EAF0] dark:border-white/6 flex flex-col justify-between h-screen sticky top-0 px-4 py-5 select-none transition-colors duration-200 z-30"
    >
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div id="brand-header" className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-none">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display font-bold text-lg text-[#111827] dark:text-[#FAFAFA] tracking-tight">LifeRPG</span>
            </div>
            <p className="text-[10px] text-[#858D9D] dark:text-[#8E8E93] font-medium tracking-wide">A better you, everyday.</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav id="sidebar-nav" className="flex flex-col gap-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'tasks' && activeTab === 'quests');
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3.5 h-10 rounded-[10px] text-sm font-medium transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#EEEFFF] dark:bg-[#2A2165] text-[#5B5CE2] dark:text-[#8B7CFF]'
                    : 'text-[#5E6470] dark:text-[#A1A1AA] hover:bg-[#F7F8FA] dark:hover:bg-[#18181B] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#5B5CE2] dark:text-[#8B7CFF]' : 'text-[#7D8494] dark:text-[#80808A]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Divider after Analytics */}
          <div className="my-2 border-t border-[#E7EAF0] dark:border-[#27272A]" />

          {/* AI Section Items */}
          {aiNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'ai-coach' && (activeTab === 'coach' || activeTab === 'aicoach' || activeTab === 'ai_coach'));
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#EEEFFF] dark:bg-gradient-to-r dark:from-[#2B236F] dark:to-[#3E32A0] text-[#5B5CE2] dark:text-white shadow-[0_2px_12px_rgba(99,102,241,0.25)] border border-transparent dark:border-white/10'
                    : 'text-[#5E6470] dark:text-[#A1A1AA] hover:bg-[#F7F8FA] dark:hover:bg-[#18181B] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#5B5CE2] dark:text-white' : 'text-[#7D8494] dark:text-[#80808A]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area */}
      <div className="flex flex-col gap-4 pt-2">
        {/* Motivational Landscape Card */}
        <div 
          id="sidebar-motivation-card" 
          onClick={() => setActiveTab('ai-coach')}
          title="Consult AI Coach"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#EBF0FF] to-[#DCE6FF] dark:from-[#1A2035] dark:to-[#141829] p-3.5 border border-[#DCE4FA] dark:border-[#252E4A] cursor-pointer hover:border-[#6366F1]/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[12px] font-medium leading-tight text-[#2B3674] dark:text-[#B5C7F7]">
              Discipline today, <br />
              a stronger you tomorrow.
            </p>
            <span className="text-[10px] text-[#5B5CE2] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Coach &rarr;
            </span>
          </div>

          {/* Clean Landscape Vector Illustration */}
          <div className="relative h-20 w-full rounded-xl overflow-hidden bg-gradient-to-b from-[#A5C0F3] via-[#7FA4E8] to-[#5885DE] dark:from-[#253966] dark:to-[#172342]">
            {/* Sunrise / Sun */}
            <div className="absolute top-2 right-5 w-6 h-6 rounded-full bg-[#FFE6A5] blur-[1px] opacity-80" />
            
            {/* Distant Mountains */}
            <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 200 80" preserveAspectRatio="none" fill="none">
              <path d="M0,80 L35,35 L80,60 L130,22 L175,55 L200,40 L200,80 Z" fill="#6A8ECF" opacity="0.65" />
              <path d="M15,80 L65,42 L110,65 L160,30 L200,58 L200,80 Z" fill="#5077C0" opacity="0.85" />
              <path d="M-10,80 L40,55 L90,75 L140,50 L190,70 L210,80 Z" fill="#3B5FA8" />
            </svg>

            {/* Pine silhouettes in foreground */}
            <svg className="absolute bottom-0 left-2 w-14 h-8" viewBox="0 0 50 30" fill="#203E7B">
              <polygon points="12,4 6,24 18,24" />
              <polygon points="22,2 15,26 29,26" />
              <polygon points="34,6 28,24 40,24" />
            </svg>
          </div>
        </div>

        {/* Light / Dark / System Mode Toggle */}
        <div id="theme-toggle-container" className="bg-[#F3F4F6] dark:bg-[#18181B] p-1 rounded-xl flex items-center justify-between text-xs font-medium gap-1">
          <button
            id="theme-btn-light"
            onClick={() => {
              if (onSetThemeMode) onSetThemeMode('light');
              else setIsDark(false);
            }}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${
              (themeMode ? themeMode === 'light' : !isDark)
                ? 'bg-white text-[#111827] shadow-xs font-semibold'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>
          <button
            id="theme-btn-dark"
            onClick={() => {
              if (onSetThemeMode) onSetThemeMode('dark');
              else setIsDark(true);
            }}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${
              (themeMode ? themeMode === 'dark' : isDark)
                ? 'bg-[#27272A] text-white shadow-xs font-semibold'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
          <button
            id="theme-btn-system"
            onClick={() => {
              if (onSetThemeMode) {
                onSetThemeMode('system');
              } else {
                const sysDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
                setIsDark(sysDark);
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${
              themeMode === 'system'
                ? 'bg-white dark:bg-[#27272A] text-[#111827] dark:text-white shadow-xs font-semibold'
                : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>System</span>
          </button>
        </div>

        {/* User Card */}
        <div 
          id="sidebar-user-card" 
          onClick={() => setActiveTab('settings')}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F7F8FA] dark:hover:bg-[#18181B] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src={currentUser?.avatarUrl || (typeof window !== 'undefined' ? localStorage.getItem('liferpg_user_avatar') : null) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
              alt={currentUser?.fullName || "Avatar"} 
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#7C6CFF]/20 shrink-0" 
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-[#111827] dark:text-[#FAFAFA] leading-tight truncate">
                  {currentUser?.fullName || (currentUser?.isGuest ? 'Guest' : 'Alex')}
                </p>
                {currentUser?.isGuest && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#F59E0B]/20 text-[#F59E0B]">
                    GUEST
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                <span>Lvl {userLevel}</span>
                <span>•</span>
                <span className="text-[#818CF8] font-semibold">{momentumPoints.toLocaleString()} MP</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
        </div>

        {/* Settings button */}
        <button 
          id="sidebar-settings-btn"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 text-left ${
            activeTab === 'settings'
              ? 'bg-[#EEEFFF] dark:bg-gradient-to-r dark:from-[#2B236F] dark:to-[#3E32A0] text-[#5B5CE2] dark:text-white shadow-[0_2px_12px_rgba(99,102,241,0.25)] border border-transparent dark:border-white/10 font-semibold'
              : 'text-[#5E6470] dark:text-[#A1A1AA] hover:bg-[#F7F8FA] dark:hover:bg-[#18181B] hover:text-[#111827] dark:hover:text-[#FAFAFA]'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#5B5CE2] dark:text-white' : 'text-[#7D8494] dark:text-[#80808A]'}`} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
