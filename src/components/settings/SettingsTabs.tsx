import React from 'react';
import {
  User,
  Palette,
  Bell,
  Shield,
  Layers,
  Sliders,
} from 'lucide-react';
import { SettingsTabId } from '../../types';

interface SettingsTabsProps {
  activeTab: SettingsTabId;
  onSelectTab: (tab: SettingsTabId) => void;
}

interface TabItem {
  id: SettingsTabId;
  label: string;
  icon: React.ElementType;
}

export const settingsTabList: TabItem[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield },
  { id: 'connected-apps', label: 'Connected Apps', icon: Layers },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
];

export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-1">
      <div className="flex items-center gap-2 min-w-max">
        {settingsTabList.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`settings-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--accent-color)',
                      borderColor: 'var(--accent-color)',
                      boxShadow: '0 2px 14px var(--accent-glow)',
                    }
                  : undefined
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap select-none cursor-pointer ${
                isActive
                  ? 'text-white border'
                  : 'bg-white dark:bg-[#101722] hover:bg-slate-100 dark:hover:bg-[#141D2A] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F5F7FB] border border-slate-200 dark:border-white/[0.06]'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  isActive ? 'text-white' : 'text-slate-400 dark:text-[#7D8494]'
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
