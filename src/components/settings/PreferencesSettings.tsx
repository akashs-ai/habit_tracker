import React, { useState } from 'react';
import {
  Globe,
  Clock,
  Calendar,
  Compass,
  FileBarChart,
  AlertCircle,
  ChevronDown,
  Check,
} from 'lucide-react';
import { PreferenceSettings as PreferenceSettingsType } from '../../types';

interface PreferencesSettingsProps {
  preferences: PreferenceSettingsType;
  onUpdatePreferences: (newPrefs: Partial<PreferenceSettingsType>) => void;
}

export const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({
  preferences,
  onUpdatePreferences,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const languages = ['English (US)', 'English (UK)', 'Español', 'Français', 'Deutsch', '日本語'];
  const timezones = [
    '(GMT+5:30) India Standard Time',
    '(GMT-8:00) Pacific Time (US & Canada)',
    '(GMT-5:00) Eastern Time (US & Canada)',
    '(GMT+0:00) Greenwich Mean Time (London)',
    '(GMT+1:00) Central European Time (Paris)',
    '(GMT+9:00) Japan Standard Time (Tokyo)',
  ];
  const weekStartOptions = ['Monday', 'Sunday', 'Saturday'];
  const landingPages = ['Home', 'Tasks', 'Calendar', 'Goals', 'Analytics', 'AI Coach'];

  return (
    <div className="space-y-6">
      <section className="bg-[#101722] border border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-sm">
        {/* Header */}
        <div className="pb-6 border-b border-white/[0.06]">
          <h2 className="text-lg md:text-[19px] font-bold text-[#F5F7FB] tracking-tight">
            Preferences
          </h2>
          <p className="text-xs md:text-sm text-[#94A3B8] mt-0.5">
            Fine-tune your experience.
          </p>
        </div>

        {/* Settings Rows */}
        <div className="divide-y divide-white/[0.06]">
          {/* Row 1: Language */}
          <div className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">Language</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Choose your preferred language.
                </p>
              </div>
            </div>

            <div className="relative self-start sm:self-auto min-w-[180px]">
              <button
                type="button"
                onClick={() => toggleDropdown('language')}
                className="w-full px-4 py-2 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] flex items-center justify-between gap-2.5 transition-colors"
              >
                <span>{preferences.language}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              {openDropdown === 'language' && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setOpenDropdown(null)}
                  />
                  <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#141D2A] border border-white/10 shadow-xl py-1.5 z-30 text-xs max-h-56 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          onUpdatePreferences({ language: lang });
                          setOpenDropdown(null);
                        }}
                        className="w-full px-3.5 py-2 text-left text-[#F5F7FB] hover:bg-white/10 flex items-center justify-between"
                      >
                        <span>{lang}</span>
                        {preferences.language === lang && (
                          <Check className="w-3.5 h-3.5 text-[#5B5CE2]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Time zone */}
          <div className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">Time zone</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Set your local time zone.
                </p>
              </div>
            </div>

            <div className="relative self-start sm:self-auto min-w-[240px]">
              <button
                type="button"
                onClick={() => toggleDropdown('timezone')}
                className="w-full px-4 py-2 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] flex items-center justify-between gap-2.5 transition-colors truncate"
              >
                <span className="truncate">{preferences.timezone}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              </button>

              {openDropdown === 'timezone' && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setOpenDropdown(null)}
                  />
                  <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-[#141D2A] border border-white/10 shadow-xl py-1.5 z-30 text-xs max-h-56 overflow-y-auto">
                    {timezones.map((tz) => (
                      <button
                        key={tz}
                        onClick={() => {
                          onUpdatePreferences({ timezone: tz });
                          setOpenDropdown(null);
                        }}
                        className="w-full px-3.5 py-2 text-left text-[#F5F7FB] hover:bg-white/10 flex items-center justify-between"
                      >
                        <span className="truncate">{tz}</span>
                        {preferences.timezone === tz && (
                          <Check className="w-3.5 h-3.5 text-[#5B5CE2] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 3: Start week on */}
          <div className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">Start week on</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Choose the first day of the week.
                </p>
              </div>
            </div>

            <div className="relative self-start sm:self-auto min-w-[150px]">
              <button
                type="button"
                onClick={() => toggleDropdown('weekStartsOn')}
                className="w-full px-4 py-2 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] flex items-center justify-between gap-2.5 transition-colors"
              >
                <span>{preferences.weekStartsOn}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              {openDropdown === 'weekStartsOn' && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setOpenDropdown(null)}
                  />
                  <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-[#141D2A] border border-white/10 shadow-xl py-1.5 z-30 text-xs">
                    {weekStartOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          onUpdatePreferences({ weekStartsOn: opt });
                          setOpenDropdown(null);
                        }}
                        className="w-full px-3.5 py-2 text-left text-[#F5F7FB] hover:bg-white/10 flex items-center justify-between"
                      >
                        <span>{opt}</span>
                        {preferences.weekStartsOn === opt && (
                          <Check className="w-3.5 h-3.5 text-[#5B5CE2]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 4: Default view */}
          <div className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">Default view</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Choose your default landing page.
                </p>
              </div>
            </div>

            <div className="relative self-start sm:self-auto min-w-[150px]">
              <button
                type="button"
                onClick={() => toggleDropdown('defaultLandingPage')}
                className="w-full px-4 py-2 rounded-xl bg-[#141D2A] hover:bg-[#1A2536] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] flex items-center justify-between gap-2.5 transition-colors"
              >
                <span>{preferences.defaultLandingPage}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              {openDropdown === 'defaultLandingPage' && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setOpenDropdown(null)}
                  />
                  <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-[#141D2A] border border-white/10 shadow-xl py-1.5 z-30 text-xs">
                    {landingPages.map((pg) => (
                      <button
                        key={pg}
                        onClick={() => {
                          onUpdatePreferences({ defaultLandingPage: pg });
                          setOpenDropdown(null);
                        }}
                        className="w-full px-3.5 py-2 text-left text-[#F5F7FB] hover:bg-white/10 flex items-center justify-between"
                      >
                        <span>{pg}</span>
                        {preferences.defaultLandingPage === pg && (
                          <Check className="w-3.5 h-3.5 text-[#5B5CE2]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Row 5: Weekly summary */}
          <div className="py-4 sm:py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <FileBarChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">Weekly summary</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Get a weekly progress summary.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={preferences.weeklySummary}
              onClick={() => onUpdatePreferences({ weeklySummary: !preferences.weeklySummary })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] ${
                preferences.weeklySummary ? 'bg-[#5B5CE2]' : 'bg-[#334155]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.weeklySummary ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 6: Confirm before deleting */}
          <div className="py-4 sm:py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#141D2A] flex items-center justify-center text-[#818CF8] shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F7FB]">Confirm before deleting</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Ask for confirmation before destructive actions.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={preferences.confirmBeforeDelete}
              onClick={() =>
                onUpdatePreferences({ confirmBeforeDelete: !preferences.confirmBeforeDelete })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] ${
                preferences.confirmBeforeDelete ? 'bg-[#5B5CE2]' : 'bg-[#334155]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.confirmBeforeDelete ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
