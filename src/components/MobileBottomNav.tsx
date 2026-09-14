import React from 'react';
import { Home, CheckSquare, Calendar, Target, Gift, Bot } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'ai-coach', label: 'AI Coach', icon: Bot },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white/95 dark:bg-[#080F1A]/95 backdrop-blur-lg border-t border-slate-200 dark:border-white/7 px-2 flex items-center justify-around z-40 pb-safe shadow-xl transition-colors"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || 
          (item.id === 'tasks' && activeTab === 'quests') ||
          (item.id === 'ai-coach' && (activeTab === 'coach' || activeTab === 'aicoach' || activeTab === 'ai_coach'));
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-indigo-600 dark:text-[#818CF8]'
                : 'text-slate-500 dark:text-[#64748B] hover:text-slate-900 dark:hover:text-[#94A3B8]'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4] text-indigo-600 dark:text-[#818CF8]' : 'stroke-2 text-slate-400 dark:text-[#64748B]'}`} />
            <span className={`text-[10px] ${isActive ? 'font-bold text-indigo-600 dark:text-[#818CF8]' : 'font-medium text-slate-500 dark:text-[#64748B]'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
