import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  currentMonth: string; // e.g. "Mar 2025"
  selectedDate: string; // e.g. "2025-03-11"
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  hasEventsDates?: Set<string>;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentMonth,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  hasEventsDates = new Set(),
}) => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Days for March 2025:
  // Feb 23 to Mar 1 (padding from Feb), Mar 1 to 31, Apr 1 to 5 (padding into Apr)
  const calendarDays = [
    { day: 23, month: 2, isPadding: true, date: '2025-02-23' },
    { day: 24, month: 2, isPadding: true, date: '2025-02-24' },
    { day: 25, month: 2, isPadding: true, date: '2025-02-25' },
    { day: 26, month: 2, isPadding: true, date: '2025-02-26' },
    { day: 27, month: 2, isPadding: true, date: '2025-02-27' },
    { day: 28, month: 2, isPadding: true, date: '2025-02-28' },
    { day: 1, month: 3, isPadding: false, date: '2025-03-01' },
    { day: 2, month: 3, isPadding: false, date: '2025-03-02' },
    { day: 3, month: 3, isPadding: false, date: '2025-03-03' },
    { day: 4, month: 3, isPadding: false, date: '2025-03-04' },
    { day: 5, month: 3, isPadding: false, date: '2025-03-05' },
    { day: 6, month: 3, isPadding: false, date: '2025-03-06' },
    { day: 7, month: 3, isPadding: false, date: '2025-03-07' },
    { day: 8, month: 3, isPadding: false, date: '2025-03-08' },
    { day: 9, month: 3, isPadding: false, date: '2025-03-09' },
    { day: 10, month: 3, isPadding: false, date: '2025-03-10' },
    { day: 11, month: 3, isPadding: false, date: '2025-03-11', isToday: true },
    { day: 12, month: 3, isPadding: false, date: '2025-03-12' },
    { day: 13, month: 3, isPadding: false, date: '2025-03-13' },
    { day: 14, month: 3, isPadding: false, date: '2025-03-14' },
    { day: 15, month: 3, isPadding: false, date: '2025-03-15' },
    { day: 16, month: 3, isPadding: false, date: '2025-03-16' },
    { day: 17, month: 3, isPadding: false, date: '2025-03-17' },
    { day: 18, month: 3, isPadding: false, date: '2025-03-18' },
    { day: 19, month: 3, isPadding: false, date: '2025-03-19' },
    { day: 20, month: 3, isPadding: false, date: '2025-03-20' },
    { day: 21, month: 3, isPadding: false, date: '2025-03-21' },
    { day: 22, month: 3, isPadding: false, date: '2025-03-22' },
    { day: 23, month: 3, isPadding: false, date: '2025-03-23' },
    { day: 24, month: 3, isPadding: false, date: '2025-03-24' },
    { day: 25, month: 3, isPadding: false, date: '2025-03-25' },
    { day: 26, month: 3, isPadding: false, date: '2025-03-26' },
    { day: 27, month: 3, isPadding: false, date: '2025-03-27' },
    { day: 28, month: 3, isPadding: false, date: '2025-03-28' },
    { day: 29, month: 3, isPadding: false, date: '2025-03-29' },
    { day: 30, month: 3, isPadding: false, date: '2025-03-30' },
    { day: 31, month: 3, isPadding: false, date: '2025-03-31' },
    { day: 1, month: 4, isPadding: true, date: '2025-04-01' },
    { day: 2, month: 4, isPadding: true, date: '2025-04-02' },
    { day: 3, month: 4, isPadding: true, date: '2025-04-03' },
    { day: 4, month: 4, isPadding: true, date: '2025-04-04' },
    { day: 5, month: 4, isPadding: true, date: '2025-04-05' },
  ];

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
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1 rounded text-[#A6AEC0] hover:text-white hover:bg-white/5 transition-colors"
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
          const isToday = item.date === '2025-03-11';
          return (
            <button
              key={idx}
              onClick={() => onSelectDate(item.date)}
              className={`w-7 h-7 mx-auto rounded-full flex flex-col items-center justify-center text-[11px] transition-all relative ${
                isToday
                  ? 'bg-[#6C63FF] text-white font-semibold'
                  : isSelected
                  ? 'border border-[#6C63FF] text-[#6C63FF] font-medium bg-[#6C63FF]/10'
                  : item.isPadding
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
