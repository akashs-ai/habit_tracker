import React from 'react';
import { Plus, SlidersHorizontal, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarViewType } from '../../types';

interface CalendarHeaderProps {
  currentView: CalendarViewType;
  onChangeView: (view: CalendarViewType) => void;
  currentMonthLabel?: string;
  onPrevPeriod?: () => void;
  onNextPeriod?: () => void;
  onGoToToday?: () => void;
  onOpenAddEvent: () => void;
  onOpenViewOptions: () => void;
  onConnectGoogleCalendar?: () => void;
  isConnected?: boolean;
  isConnecting?: boolean;
  isSyncing?: boolean;
  googleAccountName?: string | null;
  onDisconnectGoogleCalendar?: () => void;
  onSyncGoogleCalendar?: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentView,
  onChangeView,
  onOpenAddEvent,
  onOpenViewOptions,
  onConnectGoogleCalendar,
  isConnected = false,
  isConnecting = false,
  isSyncing = false,
  googleAccountName,
  onDisconnectGoogleCalendar,
  onSyncGoogleCalendar,
}) => {
  const views: { id: CalendarViewType; label: string }[] = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
    { id: 'agenda', label: 'Agenda' },
  ];

  return (
    <div id="calendar-page-header" className="flex flex-col gap-5">
      {/* Top Title & Primary Add Event Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 dark:text-[#F5F7FF] tracking-tight leading-tight">
            Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#A6AEC0] mt-1 hidden sm:block">
            Plan your time. Build the life you want.
          </p>
          <p className="text-xs text-slate-500 dark:text-[#A6AEC0] mt-0.5 sm:hidden">
            Plan your time.
          </p>
        </div>

        {/* Primary + Add Event Action */}
        <button
          id="calendar-add-event-btn"
          onClick={onOpenAddEvent}
          className="h-10 px-4 sm:px-5 rounded-[9px] bg-[#6C63FF] hover:bg-[#7B73FF] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Controls Row: View Switcher, Filter, and Connect with Google Calendar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pt-1">
        {/* Left: View Switcher Tabs & Filter */}
        <div className="flex items-center gap-2">
          {/* Desktop & Tablet View Tabs */}
          <div className="inline-flex h-[38px] p-[3px] bg-slate-200/80 dark:bg-[#111318] border border-slate-300/80 dark:border-white/8 rounded-[9px]">
            {views.map((v) => {
              const isActive = currentView === v.id;
              return (
                <button
                  key={v.id}
                  id={`view-tab-${v.id}`}
                  onClick={() => onChangeView(v.id)}
                  className={`h-8 px-3 sm:px-3.5 rounded-[7px] text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#6C63FF] text-white shadow-xs'
                      : 'text-slate-600 dark:text-[#A6AEC0] hover:text-slate-900 dark:hover:text-[#F5F7FF]'
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>

          {/* Filter / View Options Trigger */}
          <button
            onClick={onOpenViewOptions}
            className="w-[38px] h-[38px] rounded-[9px] bg-slate-200/80 dark:bg-[#111318] border border-slate-300/80 dark:border-white/8 flex items-center justify-center text-slate-600 dark:text-[#A6AEC0] hover:text-slate-900 dark:hover:text-[#F5F7FF] hover:bg-slate-300/70 dark:hover:bg-[#151820] transition-colors cursor-pointer"
            title="Calendar Options & Legend"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Connect with Google Calendar Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <button
                id="btn-google-calendar-sync"
                onClick={onSyncGoogleCalendar}
                disabled={isSyncing}
                className="h-[38px] px-3.5 rounded-[9px] bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2 transition-colors shrink-0 shadow-2xs cursor-pointer disabled:opacity-60"
                title={googleAccountName ? `Connected to ${googleAccountName}` : 'Synced with Google Calendar'}
              >
                <span className={`w-2 h-2 rounded-full bg-emerald-500 ${isSyncing ? 'animate-ping' : ''}`} />
                <span className="max-w-[140px] truncate sm:max-w-none">
                  {isSyncing ? 'Syncing...' : googleAccountName ? `Synced: ${googleAccountName}` : 'Google Synced'}
                </span>
              </button>

              <button
                id="btn-google-calendar-disconnect"
                onClick={onDisconnectGoogleCalendar}
                className="h-[38px] px-3 rounded-[9px] bg-slate-100 hover:bg-slate-200 dark:bg-[#151820] dark:hover:bg-[#1A1E27] border border-slate-200 dark:border-white/8 text-xs text-slate-600 hover:text-slate-900 dark:text-[#A6AEC0] dark:hover:text-[#F5F7FF] transition-colors shrink-0 cursor-pointer"
                title="Disconnect Google Account"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              id="btn-connect-google-calendar"
              onClick={onConnectGoogleCalendar}
              disabled={isConnecting}
              className="h-[38px] px-3.5 sm:px-4 rounded-[9px] bg-white hover:bg-slate-50 dark:bg-[#151821] dark:hover:bg-[#1B202A] border border-slate-300 dark:border-white/15 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm flex items-center gap-2.5 transition-all shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {/* Official Google 'G' Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isConnecting ? 'Authenticating...' : 'Connect with Google Calendar'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
