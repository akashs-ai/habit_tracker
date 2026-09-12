import React, { useMemo } from 'react';
import { CalendarEvent } from '../../types';
import { getMonthGridDays, getLiveTodayISO, parseDateISO } from '../../utils/dateUtils';

interface CalendarMonthViewProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEventOnDate: (date: string) => void;
  viewYear?: number;
  viewMonth?: number;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  selectedDate,
  onSelectDate,
  events,
  onSelectEvent,
  onAddEventOnDate,
  viewYear,
  viewMonth,
}) => {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayISO = useMemo(() => getLiveTodayISO(), []);

  // Compute active year and month
  const { year, month } = useMemo(() => {
    if (viewYear !== undefined && viewMonth !== undefined) {
      return { year: viewYear, month: viewMonth };
    }
    const d = parseDateISO(selectedDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [viewYear, viewMonth, selectedDate]);

  // Dynamically compute calendar grid for this month & year
  const monthDays = useMemo(() => {
    return getMonthGridDays(year, month, todayISO);
  }, [year, month, todayISO]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((evt) => {
      const list = map.get(evt.date) || [];
      list.push(evt);
      map.set(evt.date, list);
    });
    return map;
  }, [events]);

  return (
    <div 
      id="calendar-month-grid-container"
      className="w-full bg-[#0F1217] border border-white/8 rounded-xl overflow-hidden shadow-sm"
    >
      {/* 7 Column Headers */}
      <div className="grid grid-cols-7 border-b border-white/8 bg-[#111318]">
        {weekdays.map((day) => (
          <div
            key={day}
            className="h-[42px] flex items-center justify-center text-xs font-semibold text-[#6F7789] uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-white/8">
        {monthDays.map((cell) => {
          const isSelected = selectedDate === cell.date;
          const isToday = cell.date === todayISO;
          const dayEvents = eventsByDate.get(cell.date) || [];
          const maxVisible = 3;
          const visibleEvents = dayEvents.slice(0, maxVisible);
          const overflowCount = dayEvents.length - maxVisible;

          return (
            <div
              key={cell.date}
              onClick={() => onSelectDate(cell.date)}
              onDoubleClick={() => onAddEventOnDate(cell.date)}
              className={`min-h-[96px] sm:min-h-[110px] lg:min-h-[120px] p-2 transition-all flex flex-col justify-between cursor-pointer group select-none relative ${
                isSelected
                  ? 'border-2 border-[#6C63FF] bg-[#6C63FF]/8 z-10 shadow-xs'
                  : isToday
                  ? 'bg-white/[0.02]'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              {/* Top Row: Date Number */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                    isToday
                      ? 'bg-[#6C63FF] text-white font-bold ring-2 ring-[#6C63FF]/30'
                      : isSelected
                      ? 'text-[#6C63FF] font-bold bg-[#6C63FF]/15'
                      : cell.isCurrentMonth
                      ? 'text-[#F5F7FF] font-medium'
                      : 'text-[#4F5665]'
                  }`}
                >
                  {cell.day}
                </span>

                {/* Micro Add indicator on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddEventOnDate(cell.date);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-[10px] text-[#A6AEC0] hover:text-[#6C63FF] transition-opacity px-1 rounded hover:bg-white/5"
                  title="Add Event on this date"
                >
                  +
                </button>
              </div>

              {/* Event chips */}
              <div className="flex flex-col gap-1 mt-1 flex-1">
                {visibleEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(evt);
                    }}
                    className="w-full text-left px-2 py-1 rounded bg-[#151820] hover:bg-[#1A1D24] border border-white/6 hover:border-white/12 transition-all group/chip cursor-pointer relative overflow-hidden"
                    style={{ borderLeftWidth: '3px', borderLeftColor: evt.color }}
                  >
                    <div className="text-[10px] font-semibold text-[#F5F7FF] truncate leading-tight group-hover/chip:text-white">
                      {evt.title}
                    </div>
                    {evt.startTime && !evt.allDay && (
                      <div className="text-[9px] text-[#A6AEC0] truncate leading-tight">
                        {evt.startTime}
                        {evt.endTime ? ` – ${evt.endTime}` : ''}
                      </div>
                    )}
                  </div>
                ))}

                {/* Overflow count if more events exist */}
                {overflowCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDate(cell.date);
                    }}
                    className="text-[10px] font-medium text-[#6C63FF] hover:underline text-left px-1 mt-0.5"
                  >
                    +{overflowCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
