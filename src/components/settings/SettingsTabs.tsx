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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap select-none ${
                isActive
                  ? 'bg-gradient-to-r from-[#2B236F] to-[#3E32A0] text-white shadow-[0_2px_12px_rgba(99,102,241,0.25)] border border-[#6366F1]/40'
                  : 'bg-[#101722] hover:bg-[#141D2A] text-[#94A3B8] hover:text-[#F5F7FB] border border-white/[0.06]'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  isActive ? 'text-white' : 'text-[#7D8494]'
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
