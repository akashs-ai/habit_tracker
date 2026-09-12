import React, { useState } from 'react';
import {
  Calendar,
  MoreVertical,
  Target,
  Clock,
  BarChart2,
  CalendarDays,
  Check,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { CalendarIntegrationState } from '../../types';
import { GoogleCalendarTile } from './ModelLogos';

interface CalendarSectionProps {
  calendarState: CalendarIntegrationState;
  onManageCalendar: () => void;
  onDisconnectCalendar?: () => void;
  onSyncCalendar?: () => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  calendarState,
  onManageCalendar,
  onDisconnectCalendar,
  onSyncCalendar,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setShowMenu(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      if (onSyncCalendar) onSyncCalendar();
      setTimeout(() => setSyncSuccess(false), 2500);
    }, 900);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Card: Google Calendar Connection Status (~60%) */}
      <section className="lg:col-span-7 bg-[#101722] border border-white/[0.08] rounded-2xl p-6 md:p-7 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#201B4B] border border-[#6366F1]/30 flex items-center justify-center text-[#818CF8] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-[19px] font-bold text-[#F5F7FB] tracking-tight">
                Google Calendar
              </h2>
              <p className="text-xs md:text-sm text-[#94A3B8]">
                Connect your Google Calendar to give your AI Coach your schedule context.
              </p>
            </div>
          </div>

          {/* Connected Account Panel */}
          <div className="p-4 md:p-5 rounded-xl bg-[#141D2A] border border-white/[0.06] mt-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <GoogleCalendarTile className="w-11 h-11" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm md:text-[15px] font-semibold text-[#F5F7FB]">
                      {calendarState.provider}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#22C55E] font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                      Connected
                    </span>
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-0.5 font-normal">
                    {calendarState.account}
                  </div>
                  <p className="text-xs md:text-sm text-[#94A3B8] mt-2.5 leading-relaxed max-w-md">
                    Helps AI Coach understand your availability, upcoming events, and plan your day better.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 relative">
                <button
                  type="button"
                  onClick={onManageCalendar}
                  className="py-2 px-4 rounded-lg bg-[#1E293B] hover:bg-[#27354A] border border-white/10 text-xs md:text-sm font-medium text-[#F5F7FB] transition-colors"
                >
                  Manage
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    aria-label="More options"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[#141D2A] border border-white/10 shadow-xl py-1.5 z-30 text-xs text-[#F5F7FB]">
                        <button
                          onClick={handleSync}
                          className="w-full px-3.5 py-2 text-left hover:bg-white/10 flex items-center gap-2 transition-colors"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#818CF8]' : ''}`} />
                          <span>Sync events now</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onManageCalendar();
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-white/10 flex items-center gap-2 transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Calendar settings</span>
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            if (onDisconnectCalendar) onDisconnectCalendar();
                          }}
                          className="w-full px-3.5 py-2 text-left text-[#FB7185] hover:bg-[#FB7185]/10 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sync Feedback Badge */}
            {syncSuccess && (
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-[#22C55E]">
                <Check className="w-3.5 h-3.5" />
                <span>Calendar events synchronized successfully.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Right Card: Value / Benefits Card (~40%) */}
      <section className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-sm p-6 md:p-7 flex flex-col justify-between min-h-[190px]">
        {/* Landscape SVG Background Artwork */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg
            className="w-full h-full object-cover"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 400 240"
            fill="none"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="45%" stopColor="#1A2035" />
                <stop offset="100%" stopColor="#0B0F19" />
              </linearGradient>
              <radialGradient id="sunGlow" cx="68%" cy="64%" r="45%">
                <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#F97316" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Sky */}
            <rect width="400" height="240" fill="url(#skyGrad)" />
            
            {/* Glowing Sunset Orb */}
            <circle cx="270" cy="155" r="55" fill="url(#sunGlow)" />
            <circle cx="270" cy="155" r="14" fill="#FED7AA" />

            {/* Mountains Silhouette */}
            <path
              d="M120 240L190 145L230 185L290 120L360 210L410 150L440 240H120Z"
              fill="#111827"
              fillOpacity="0.65"
            />
            <path
              d="M-20 240L80 160L160 240H-20Z"
              fill="#0F172A"
              fillOpacity="0.8"
            />
            <path
              d="M180 240L240 180L310 240H180Z"
              fill="#0A0F1D"
              fillOpacity="0.9"
            />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19]/90 via-[#0E1524]/75 to-[#161D30]/60" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full items-center">
          {/* Left Text */}
          <div className="pr-2">
            <h3 className="text-base md:text-lg font-medium italic text-[#F5F7FB] leading-snug">
              Same context.
              <br />
              Better advice.
              <br />
              A more focused you.
            </h3>
          </div>

          {/* Right Supporting Benefits List */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs md:text-sm text-[#F1F5F9]">
              <CalendarDays className="w-4 h-4 text-[#818CF8] shrink-0" />
              <span>Understand your availability</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs md:text-sm text-[#F1F5F9]">
              <Target className="w-4 h-4 text-[#818CF8] shrink-0" />
              <span>Smarter habit recommendations</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs md:text-sm text-[#F1F5F9]">
              <Clock className="w-4 h-4 text-[#818CF8] shrink-0" />
              <span>Avoid scheduling conflicts</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs md:text-sm text-[#F1F5F9]">
              <BarChart2 className="w-4 h-4 text-[#818CF8] shrink-0" />
              <span>Plan your day better</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
