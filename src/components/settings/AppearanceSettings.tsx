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
import { applyAppearanceToDOM } from '../../utils/appearanceManager';

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
    const updated = { ...settings, theme };
    const darkEffective = applyAppearanceToDOM(updated);
    setIsDark(darkEffective);
    onUpdateSettings({ theme });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-[#101722] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-xs space-y-7 transition-colors">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200 dark:border-white/[0.06]">
          <h2 className="text-lg md:text-[19px] font-bold text-slate-900 dark:text-[#F5F7FB] tracking-tight">
            Appearance
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Customize how LifeRPG looks and feels for you.
          </p>
        </div>

        {/* Section 1: Theme */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F5F7FB] mb-3">Theme</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light */}
            <button
              id="theme-select-light"
              type="button"
              onClick={() => handleThemeSelect('light')}
              style={
                settings.theme === 'light'
                  ? {
                      borderColor: 'var(--accent-color)',
                      boxShadow: '0 0 16px var(--accent-glow)',
                    }
                  : undefined
              }
              className={`p-4 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                settings.theme === 'light'
                  ? 'bg-slate-50 dark:bg-[#141D2A] border-2 text-slate-900 dark:text-[#F5F7FB]'
                  : 'bg-white dark:bg-[#141D2A]/60 border border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F5F7FB]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-white/5 flex items-center justify-center text-amber-500 dark:text-[#F5F7FB] shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold block">Light</span>
                <span className="text-[11px] text-slate-500 dark:text-[#64748B]">Clean daylight mode</span>
              </div>
              {settings.theme === 'light' && (
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Dark */}
            <button
              id="theme-select-dark"
              type="button"
              onClick={() => handleThemeSelect('dark')}
              style={
                settings.theme === 'dark'
                  ? {
                      borderColor: 'var(--accent-color)',
                      boxShadow: '0 0 16px var(--accent-glow)',
                    }
                  : undefined
              }
              className={`p-4 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                settings.theme === 'dark'
                  ? 'bg-slate-50 dark:bg-[#141D2A] border-2 text-slate-900 dark:text-[#F5F7FB]'
                  : 'bg-white dark:bg-[#141D2A]/60 border border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F5F7FB]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 dark:bg-white/5 flex items-center justify-center text-indigo-500 dark:text-[#818CF8] shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold block">Dark</span>
                <span className="text-[11px] text-slate-500 dark:text-[#64748B]">Gentle dark canvas</span>
              </div>
              {settings.theme === 'dark' && (
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>

            {/* System */}
            <button
              id="theme-select-system"
              type="button"
              onClick={() => handleThemeSelect('system')}
              style={
                settings.theme === 'system'
                  ? {
                      borderColor: 'var(--accent-color)',
                      boxShadow: '0 0 16px var(--accent-glow)',
                    }
                  : undefined
              }
              className={`p-4 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                settings.theme === 'system'
                  ? 'bg-slate-50 dark:bg-[#141D2A] border-2 text-slate-900 dark:text-[#F5F7FB]'
                  : 'bg-white dark:bg-[#141D2A]/60 border border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F5F7FB]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-500/10 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-[#F5F7FB] shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold block">System</span>
                <span className="text-[11px] text-slate-500 dark:text-[#64748B]">Sync with OS</span>
              </div>
              {settings.theme === 'system' && (
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Accent Color */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06]">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F5F7FB]">Accent color</h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Choose a color that feels like you.</p>
          </div>
          <div className="flex items-center gap-3.5 flex-wrap">
            {accentColors.map((color) => {
              const isSelected =
                settings.accentColor.toLowerCase() === color.hex.toLowerCase() ||
                (color.id === 'purple' && (settings.accentColor === '#6C63FF' || settings.accentColor === '#5B5CE2'));

              return (
                <button
                  key={color.id}
                  id={`accent-swatch-${color.id}`}
                  type="button"
                  onClick={() => onUpdateSettings({ accentColor: color.hex })}
                  title={color.name}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110 shadow-md'
                      : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    boxShadow: isSelected ? `0 0 12px ${color.hex}80` : undefined,
                  }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-xs" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Interface Density */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#141D2A] flex items-center justify-center text-slate-700 dark:text-[#818CF8]">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F5F7FB]">Interface density</h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Make the interface more compact or spacious.</p>
            </div>
          </div>

          <div className="relative">
            <button
              id="density-dropdown-trigger"
              type="button"
              onClick={() => setDensityOpen(!densityOpen)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#141D2A] hover:bg-slate-200 dark:hover:bg-[#1A2536] border border-slate-200 dark:border-white/10 text-xs md:text-sm font-medium text-slate-900 dark:text-[#F5F7FB] flex items-center gap-2.5 transition-colors focus:outline-none focus:ring-2 cursor-pointer"
              style={{ '--tw-ring-color': 'var(--accent-color)' } as React.CSSProperties}
            >
              <span className="capitalize">{settings.interfaceDensity}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8] transition-transform ${densityOpen ? 'rotate-180' : ''}`} />
            </button>

            {densityOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setDensityOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white dark:bg-[#141D2A] border border-slate-200 dark:border-white/10 shadow-xl py-1.5 z-30 text-xs">
                  <button
                    id="density-option-comfortable"
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ interfaceDensity: 'comfortable' });
                      setDensityOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      settings.interfaceDensity === 'comfortable'
                        ? 'font-bold text-slate-900 dark:text-[#F5F7FB] bg-slate-100 dark:bg-white/5'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>Comfortable</span>
                    {settings.interfaceDensity === 'comfortable' && (
                      <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                    )}
                  </button>
                  <button
                    id="density-option-compact"
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ interfaceDensity: 'compact' });
                      setDensityOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      settings.interfaceDensity === 'compact'
                        ? 'font-bold text-slate-900 dark:text-[#F5F7FB] bg-slate-100 dark:bg-white/5'
                        : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>Compact</span>
                    {settings.interfaceDensity === 'compact' && (
                      <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: Motion & Animations Toggle */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#141D2A] flex items-center justify-center text-slate-700 dark:text-[#818CF8]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F5F7FB]">Motion & animations</h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Control UI animations and transitions.</p>
            </div>
          </div>

          <button
            id="motion-toggle-btn"
            type="button"
            role="switch"
            aria-checked={settings.motionEnabled}
            onClick={() => onUpdateSettings({ motionEnabled: !settings.motionEnabled })}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            style={{
              backgroundColor: settings.motionEnabled ? 'var(--accent-color)' : (isDark ? '#334155' : '#CBD5E1'),
            }}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.motionEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Section 5: Reduced Motion Toggle */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#141D2A] flex items-center justify-center text-slate-700 dark:text-[#818CF8]">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F5F7FB]">Reduced motion</h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Minimize animations for accessibility.</p>
            </div>
          </div>

          <button
            id="reduced-motion-toggle-btn"
            type="button"
            role="switch"
            aria-checked={settings.reducedMotion}
            onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            style={{
              backgroundColor: settings.reducedMotion ? 'var(--accent-color)' : (isDark ? '#334155' : '#CBD5E1'),
            }}
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

