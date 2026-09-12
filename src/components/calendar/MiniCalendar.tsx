import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthGridDays, getLiveTodayISO, parseDateISO } from '../../utils/dateUtils';

interface MiniCalendarProps {
  currentMonth: string; // e.g. "September 2026"
  selectedDate: string; // e.g. "2026-09-12"
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  hasEventsDates?: Set<string>;
  viewYear?: number;
  viewMonth?: number;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentMonth,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  hasEventsDates = new Set(),
  viewYear,
  viewMonth,
}) => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayISO = useMemo(() => getLiveTodayISO(), []);

  const { year, month } = useMemo(() => {
    if (viewYear !== undefined && viewMonth !== undefined) {
      return { year: viewYear, month: viewMonth };
    }
    const d = parseDateISO(selectedDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [viewYear, viewMonth, selectedDate]);

  const calendarDays = useMemo(() => {
    return getMonthGridDays(year, month, todayISO);
  }, [year, month, todayISO]);

  return (
    <div 
      id="mini-calendar-widget"
      className="bg-[#111318] border border-white/8 rounded-xl p-4 shadow-xs"
    >
      {/* Mini Calendar Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs sm:text-sm font-semibold text-[#F5F7FF]">
          {currentMonth}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevMonth}
            className="p-1 rounded text-[#A6AEC0] hover:text-white hover:bg-white/5 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1 rounded text-[#A6AEC0] hover:text-white hover:bg-white/5 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {daysOfWeek.map((day, idx) => (
          <span key={idx} className="text-[11px] font-medium text-[#6F7789]">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((item, idx) => {
          const isSelected = selectedDate === item.date;
          const isToday = item.date === todayISO;
          return (
            <button
              key={idx}
              onClick={() => onSelectDate(item.date)}
              className={`w-7 h-7 mx-auto rounded-full flex flex-col items-center justify-center text-[11px] transition-all relative ${
                isToday
                  ? 'bg-[#6C63FF] text-white font-bold ring-2 ring-[#6C63FF]/30'
                  : isSelected
                  ? 'border border-[#6C63FF] text-[#6C63FF] font-medium bg-[#6C63FF]/15'
                  : !item.isCurrentMonth
                  ? 'text-[#4F5665]'
                  : 'text-[#F5F7FF] hover:bg-white/5'
              }`}
            >
              <span>{item.day}</span>
              {hasEventsDates.has(item.date) && !isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-[#6C63FF] absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
