import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronDown,
  Layout,
  Sparkles,
  Eye,
} from 'lucide-react';
import { AppearanceSettings as AppearanceSettingsType } from '../../types';
import { accentColors } from '../../data/settingsMockData';

interface AppearanceSettingsProps {
  settings: AppearanceSettingsType;
  onUpdateSettings: (newSettings: Partial<AppearanceSettingsType>) => void;
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  settings,
  onUpdateSettings,
  isDark,
  setIsDark,
}) => {
  const [densityOpen, setDensityOpen] = useState(false);

  const handleThemeSelect = (theme: 'light' | 'dark' | 'system') => {
    onUpdateSettings({ theme });
    if (theme === 'dark') setIsDark(true);
    else if (theme === 'light') setIsDark(false);
    else {
      // System
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-[#101722] border border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-sm space-y-7">
        {/* Header */}
        <div className="pb-6 border-b border-white/[0.06]">
          <h2 className="text-lg md:text-[19px] font-bold text-[#F5F7FB] tracking-tight">
            Appearance
          </h2>
          <p className="text-xs md:text-sm text-[#94A3B8] mt-0.5">
            Customize how LifeRPG looks and feels for you.
          </p>
        </div>

        {/* Section 1: Theme */}
        <div>
          <h3 className="text-sm font-semibold text-[#F5F7FB] mb-3">Theme</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light */}
            <button
              type="button"
              onClick={() => handleThemeSelect('light')}
              className={`p-4 rounded-xl flex items-center gap-3.5 transition-all text-left ${
                settings.theme === 'light'
                  ? 'bg-[#141D2A] border-2 border-[#5B5CE2] shadow-[0_0_16px_rgba(99,102,241,0.2)] text-[#F5F7FB]'
                  : 'bg-[#141D2A]/60 border border-white/[0.06] hover:border-white/20 text-[#94A3B8] hover:text-[#F5F7FB]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#F5F7FB]">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold block">Light</span>
                <span className="text-[11px] text-[#64748B]">Clean daylight mode</span>
              </div>
              {settings.theme === 'light' && (
                <div className="w-5 h-5 rounded-full bg-[#5B5CE2] flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Dark */}
            <button
              type="button"
              onClick={() => handleThemeSelect('dark')}
              className={`p-4 rounded-xl flex items-center gap-3.5 transition-all text-left ${
                settings.theme === 'dark'
                  ? 'bg-[#141D2A] border-2 border-[#5B5CE2] shadow-[0_0_16px_rgba(99,102,241,0.2)] text-[#F5F7FB]'
                  : 'bg-[#141D2A]/60 border border-white/[0.06] hover:border-white/20 text-[#94A3B8] hover:text-[#F5F7FB]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#818CF8]">
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold block">Dark</span>
                <span className="text-[11px] text-[#64748B]">Gentle dark canvas</span>
              </div>
              {settings.theme === 'dark' && (
                <div className="w-5 h-5 rounded-full bg-[#5B5CE2] flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>

            {/* System */}
            <button
              type="button"
              onClick={() => handleThemeSelect('system')}
              className={`p-4 rounded-xl flex items-center gap-3.5 transition-all text-left ${
                settings.theme === 'system'
                  ? 'bg-[#141D2A] border-2 border-[#5B5CE2] shadow-[0_0_16px_rgba(99,102,241,0.2)] text-[#F5F7FB]'
                  : 'bg-[#141D2A]/60 border border-white/[0.06] hover:border-white/20 text-[#94A3B8] hover:text-[#F5F7FB]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#F5F7FB]">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold block">System</span>
                <span className="text-[11px] text-[#64748B]">Sync with OS</span>
              </div>
              {settings.theme === 'system' && (
                <div className="w-5 h-5 rounded-full bg-[#5B5CE2] flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Accent Color */}
        <div className="pt-4 border-t border-white/[0.06]">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-[#F5F7FB]">Accent color</h3>
            <p className="text-xs text-[#94A3B8]">Choose a color that feels like you.</p>
          </div>
          <div className="flex items-center gap-3.5 flex-wrap">
            {accentColors.map((color) => {
              const isSelected = settings.accentColor.toLowerCase() === color.hex.toLowerCase() ||
                (color.id === 'purple' && settings.accentColor === '#6C63FF');

              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onUpdateSettings({ accentColor: color.hex })}
                  title={color.name}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#101722] scale-110 shadow-md'
                      : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Interface Density */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8]">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F5F7FB]">Interface density</h3>
              <p className="text-xs text-[#94A3B8]">Make the interface more compact or spacious.</p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDensityOpen(!densityOpen)}
              className="px-4 py-2 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] flex items-center gap-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B5CE2]"
            >
              <span className="capitalize">{settings.interfaceDensity}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform ${densityOpen ? 'rotate-180' : ''}`} />
            </button>

            {densityOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setDensityOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-[#141D2A] border border-white/10 shadow-xl py-1.5 z-30 text-xs">
                  <button
                    onClick={() => {
                      onUpdateSettings({ interfaceDensity: 'comfortable' });
                      setDensityOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-[#F5F7FB] hover:bg-white/10 flex items-center justify-between transition-colors"
                  >
                    <span>Comfortable</span>
                    {settings.interfaceDensity === 'comfortable' && (
                      <Check className="w-3.5 h-3.5 text-[#5B5CE2]" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onUpdateSettings({ interfaceDensity: 'compact' });
                      setDensityOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-[#F5F7FB] hover:bg-white/10 flex items-center justify-between transition-colors"
                  >
                    <span>Compact</span>
                    {settings.interfaceDensity === 'compact' && (
                      <Check className="w-3.5 h-3.5 text-[#5B5CE2]" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: Motion & Animations Toggle */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F5F7FB]">Motion & animations</h3>
              <p className="text-xs text-[#94A3B8]">Control UI animations and transitions.</p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.motionEnabled}
            onClick={() => onUpdateSettings({ motionEnabled: !settings.motionEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] ${
              settings.motionEnabled ? 'bg-[#5B5CE2]' : 'bg-[#334155]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.motionEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Section 5: Reduced Motion Toggle */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8]">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F5F7FB]">Reduced motion</h3>
              <p className="text-xs text-[#94A3B8]">Minimize animations for accessibility.</p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.reducedMotion}
            onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] ${
              settings.reducedMotion ? 'bg-[#5B5CE2]' : 'bg-[#334155]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  );
};
