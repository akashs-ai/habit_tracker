import React from 'react';
import { CalendarEvent } from '../../types';

interface CalendarMonthViewProps {
  selectedDate: string; // "2025-03-11"
  onSelectDate: (date: string) => void;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEventOnDate: (date: string) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  selectedDate,
  onSelectDate,
  events,
  onSelectEvent,
  onAddEventOnDate,
}) => {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // March 2025 calendar days (including trailing days from Feb and leading days of Apr)
  const monthDays = [
    // Week 1 (Feb 23 - Mar 1)
    { day: 23, isCurrentMonth: false, date: '2025-02-23' },
    { day: 24, isCurrentMonth: false, date: '2025-02-24' },
    { day: 25, isCurrentMonth: false, date: '2025-02-25' },
    { day: 26, isCurrentMonth: false, date: '2025-02-26' },
    { day: 27, isCurrentMonth: false, date: '2025-02-27' },
    { day: 28, isCurrentMonth: false, date: '2025-02-28' },
    { day: 1, isCurrentMonth: true, date: '2025-03-01' },

    // Week 2 (Mar 2 - Mar 8)
    { day: 2, isCurrentMonth: true, date: '2025-03-02' },
    { day: 3, isCurrentMonth: true, date: '2025-03-03' },
    { day: 4, isCurrentMonth: true, date: '2025-03-04' },
    { day: 5, isCurrentMonth: true, date: '2025-03-05' },
    { day: 6, isCurrentMonth: true, date: '2025-03-06' },
    { day: 7, isCurrentMonth: true, date: '2025-03-07' },
    { day: 8, isCurrentMonth: true, date: '2025-03-08' },

    // Week 3 (Mar 9 - Mar 15)
    { day: 9, isCurrentMonth: true, date: '2025-03-09' },
    { day: 10, isCurrentMonth: true, date: '2025-03-10' },
    { day: 11, isCurrentMonth: true, date: '2025-03-11', isToday: true },
    { day: 12, isCurrentMonth: true, date: '2025-03-12' },
    { day: 13, isCurrentMonth: true, date: '2025-03-13' },
    { day: 14, isCurrentMonth: true, date: '2025-03-14' },
    { day: 15, isCurrentMonth: true, date: '2025-03-15' },

    // Week 4 (Mar 16 - Mar 22)
    { day: 16, isCurrentMonth: true, date: '2025-03-16' },
    { day: 17, isCurrentMonth: true, date: '2025-03-17' },
    { day: 18, isCurrentMonth: true, date: '2025-03-18' },
    { day: 19, isCurrentMonth: true, date: '2025-03-19' },
    { day: 20, isCurrentMonth: true, date: '2025-03-20' },
    { day: 21, isCurrentMonth: true, date: '2025-03-21' },
    { day: 22, isCurrentMonth: true, date: '2025-03-22' },

    // Week 5 (Mar 23 - Mar 29)
    { day: 23, isCurrentMonth: true, date: '2025-03-23' },
    { day: 24, isCurrentMonth: true, date: '2025-03-24' },
    { day: 25, isCurrentMonth: true, date: '2025-03-25' },
    { day: 26, isCurrentMonth: true, date: '2025-03-26' },
    { day: 27, isCurrentMonth: true, date: '2025-03-27' },
    { day: 28, isCurrentMonth: true, date: '2025-03-28' },
    { day: 29, isCurrentMonth: true, date: '2025-03-29' },

    // Week 6 (Mar 30 - Apr 5)
    { day: 30, isCurrentMonth: true, date: '2025-03-30' },
    { day: 31, isCurrentMonth: true, date: '2025-03-31' },
    { day: 1, isCurrentMonth: false, date: '2025-04-01' },
    { day: 2, isCurrentMonth: false, date: '2025-04-02' },
    { day: 3, isCurrentMonth: false, date: '2025-04-03' },
    { day: 4, isCurrentMonth: false, date: '2025-04-04' },
    { day: 5, isCurrentMonth: false, date: '2025-04-05' },
  ];

  // Group events by date
  const eventsByDate = React.useMemo(() => {
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
      className="w-full bg-[#0F1217] dark:bg-[#0F1217] border border-white/8 rounded-xl overflow-hidden shadow-sm"
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
          const isToday = cell.isToday || cell.date === '2025-03-11';
          const dayEvents = eventsByDate.get(cell.date) || [];
          const maxVisible = 3;
          const visibleEvents = dayEvents.slice(0, maxVisible);
          const overflowCount = dayEvents.length - maxVisible;

          return (
            <div
              key={cell.date}
              onClick={() => onSelectDate(cell.date)}
              onDoubleClick={() => onAddEventOnDate(cell.date)}
              className={`min-h-[92px] sm:min-h-[105px] lg:min-h-[115px] p-2 transition-all flex flex-col justify-between cursor-pointer group select-none relative ${
                isSelected
                  ? 'border border-[#6C63FF]/70 bg-[#6C63FF]/5 z-10'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              {/* Top Row: Date Number */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                    isToday
                      ? 'bg-[#6C63FF] text-white font-bold'
                      : isSelected
                      ? 'text-[#6C63FF] font-semibold'
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
                  className="opacity-0 group-hover:opacity-100 text-[10px] text-[#A6AEC0] hover:text-[#6C63FF] transition-opacity px-1"
                  title="Add Event"
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
