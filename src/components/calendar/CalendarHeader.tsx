import React from 'react';
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';
import { CalendarViewType } from '../../types';

interface CalendarHeaderProps {
  currentView: CalendarViewType;
  onChangeView: (view: CalendarViewType) => void;
  currentMonthLabel: string; // "March 2025"
  onPrevPeriod: () => void;
  onNextPeriod: () => void;
  onGoToToday: () => void;
  onOpenAddEvent: () => void;
  onOpenViewOptions: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentView,
  onChangeView,
  currentMonthLabel,
  onPrevPeriod,
  onNextPeriod,
  onGoToToday,
  onOpenAddEvent,
  onOpenViewOptions,
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
          <h1 className="text-2xl sm:text-[32px] font-bold text-[#F5F7FF] tracking-tight leading-tight">
            Calendar
          </h1>
          <p className="text-xs sm:text-sm text-[#A6AEC0] mt-1 hidden sm:block">
            Plan your time. Build the life you want.
          </p>
          <p className="text-xs text-[#A6AEC0] mt-0.5 sm:hidden">
            Plan your time.
          </p>
        </div>

        {/* Primary + Add Event Action */}
        <button
          id="calendar-add-event-btn"
          onClick={onOpenAddEvent}
          className="h-10 px-4 sm:px-5 rounded-[9px] bg-[#6C63FF] hover:bg-[#7B73FF] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Controls Row: View Switcher, Date Navigation, and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pt-1">
        {/* Left: View Switcher Tabs & Filter */}
        <div className="flex items-center gap-2">
          {/* Desktop & Tablet View Tabs */}
          <div className="inline-flex h-[38px] p-[3px] bg-[#111318] border border-white/8 rounded-[9px]">
            {views.map((v) => {
              const isActive = currentView === v.id;
              return (
                <button
                  key={v.id}
                  id={`view-tab-${v.id}`}
                  onClick={() => onChangeView(v.id)}
                  className={`h-8 px-3 sm:px-3.5 rounded-[7px] text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#6C63FF] text-white shadow-xs'
                      : 'text-[#A6AEC0] hover:text-[#F5F7FF]'
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
            className="w-[38px] h-[38px] rounded-[9px] bg-[#111318] border border-white/8 flex items-center justify-center text-[#A6AEC0] hover:text-[#F5F7FF] hover:bg-[#151820] transition-colors"
            title="Calendar Options & Legend"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Date Navigation Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1">
            <button
              id="date-nav-prev"
              onClick={onPrevPeriod}
              className="w-[38px] h-[38px] rounded-[8px] bg-[#151820] hover:bg-[#1A1D24] border border-white/8 flex items-center justify-center text-[#A6AEC0] hover:text-white transition-colors"
              aria-label="Previous Period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="date-nav-today"
              onClick={onGoToToday}
              className="h-[38px] px-3.5 rounded-[8px] bg-[#151820] hover:bg-[#1A1D24] border border-white/8 text-xs font-medium text-[#F5F7FF] transition-colors"
            >
              Today
            </button>

            <button
              id="date-nav-next"
              onClick={onNextPeriod}
              className="w-[38px] h-[38px] rounded-[8px] bg-[#151820] hover:bg-[#1A1D24] border border-white/8 flex items-center justify-center text-[#A6AEC0] hover:text-white transition-colors"
              aria-label="Next Period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month Label */}
          <span className="text-base sm:text-lg font-semibold text-[#F5F7FF] pl-2 whitespace-nowrap">
            {currentMonthLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
