import React from 'react';
import { ChevronLeft, ChevronRight, Laptop, Utensils, Gamepad2, Dumbbell, BookOpen, Clock, Calendar as CalIcon } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface MobileCalendarViewProps {
  selectedDate: string; // "2025-03-11"
  onSelectDate: (date: string) => void;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenAddEvent: () => void;
}

export const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({
  selectedDate,
  onSelectDate,
  events,
  onSelectEvent,
  onOpenAddEvent,
}) => {
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const days = [
    { day: 23, isCurrentMonth: false, date: '2025-02-23' },
    { day: 24, isCurrentMonth: false, date: '2025-02-24' },
    { day: 25, isCurrentMonth: false, date: '2025-02-25' },
    { day: 26, isCurrentMonth: false, date: '2025-02-26' },
    { day: 27, isCurrentMonth: false, date: '2025-02-27' },
    { day: 28, isCurrentMonth: false, date: '2025-02-28' },
    { day: 1, isCurrentMonth: true, date: '2025-03-01' },
    { day: 2, isCurrentMonth: true, date: '2025-03-02' },
    { day: 3, isCurrentMonth: true, date: '2025-03-03' },
    { day: 4, isCurrentMonth: true, date: '2025-03-04' },
    { day: 5, isCurrentMonth: true, date: '2025-03-05' },
    { day: 6, isCurrentMonth: true, date: '2025-03-06' },
    { day: 7, isCurrentMonth: true, date: '2025-03-07' },
    { day: 8, isCurrentMonth: true, date: '2025-03-08' },
    { day: 9, isCurrentMonth: true, date: '2025-03-09' },
    { day: 10, isCurrentMonth: true, date: '2025-03-10' },
    { day: 11, isCurrentMonth: true, date: '2025-03-11', isToday: true },
    { day: 12, isCurrentMonth: true, date: '2025-03-12' },
    { day: 13, isCurrentMonth: true, date: '2025-03-13' },
    { day: 14, isCurrentMonth: true, date: '2025-03-14' },
    { day: 15, isCurrentMonth: true, date: '2025-03-15' },
    { day: 16, isCurrentMonth: true, date: '2025-03-16' },
    { day: 17, isCurrentMonth: true, date: '2025-03-17' },
    { day: 18, isCurrentMonth: true, date: '2025-03-18' },
    { day: 19, isCurrentMonth: true, date: '2025-03-19' },
    { day: 20, isCurrentMonth: true, date: '2025-03-20' },
    { day: 21, isCurrentMonth: true, date: '2025-03-21' },
    { day: 22, isCurrentMonth: true, date: '2025-03-22' },
    { day: 23, isCurrentMonth: true, date: '2025-03-23' },
    { day: 24, isCurrentMonth: true, date: '2025-03-24' },
    { day: 25, isCurrentMonth: true, date: '2025-03-25' },
    { day: 26, isCurrentMonth: true, date: '2025-03-26' },
    { day: 27, isCurrentMonth: true, date: '2025-03-27' },
    { day: 28, isCurrentMonth: true, date: '2025-03-28' },
    { day: 29, isCurrentMonth: true, date: '2025-03-29' },
    { day: 30, isCurrentMonth: true, date: '2025-03-30' },
    { day: 31, isCurrentMonth: true, date: '2025-03-31' },
    { day: 1, isCurrentMonth: false, date: '2025-04-01' },
    { day: 2, isCurrentMonth: false, date: '2025-04-02' },
    { day: 3, isCurrentMonth: false, date: '2025-04-03' },
    { day: 4, isCurrentMonth: false, date: '2025-04-04' },
    { day: 5, isCurrentMonth: false, date: '2025-04-05' },
  ];

  // Map events by date
  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((evt) => {
      const list = map.get(evt.date) || [];
      list.push(evt);
      map.set(evt.date, list);
    });
    return map;
  }, [events]);

  const selectedDayEvents = eventsByDate.get(selectedDate) || [];

  const getEventIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('free fire') || t.includes('game')) return Gamepad2;
    if (t.includes('lunch') || t.includes('food')) return Utensils;
    if (t.includes('gym') || t.includes('workout')) return Dumbbell;
    if (t.includes('read') || t.includes('book')) return BookOpen;
    if (t.includes('design') || t.includes('project') || t.includes('ui')) return Laptop;
    return CalIcon;
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Month Compact Calendar Card */}
      <div className="bg-[#0F1217] border border-white/8 rounded-xl p-3.5 shadow-sm">
        {/* Header: Mar 2025 */}
        <div className="flex items-center justify-between pb-3 px-1">
          <span className="text-sm font-semibold text-[#F5F7FF]">
            Mar 2025
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded text-[#A6AEC0] hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 rounded text-[#A6AEC0] hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7 Columns: S M T W T F S */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {weekdays.map((wd, i) => (
            <span key={i} className="text-[11px] font-medium text-[#6F7789]">
              {wd}
            </span>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((item, idx) => {
            const isSelected = selectedDate === item.date;
            const isToday = item.date === '2025-03-11';
            const cellEvents = eventsByDate.get(item.date) || [];

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(item.date)}
                className={`h-[42px] rounded-lg flex flex-col items-center justify-center transition-all relative ${
                  isToday
                    ? 'bg-[#6C63FF] text-white font-bold'
                    : isSelected
                    ? 'border border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]'
                    : item.isCurrentMonth
                    ? 'text-[#F5F7FF] hover:bg-white/5'
                    : 'text-[#4F5665]'
                }`}
              >
                <span className="text-xs">{item.day}</span>

                {/* Event Dots (max 3) */}
                {cellEvents.length > 0 && !isToday && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {cellEvents.slice(0, 3).map((e, dotIdx) => (
                      <span
                        key={dotIdx}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: e.color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected-Day Section: e.g. Tue, 11 Mar 2025 */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-[#F5F7FF]">
            Tue, 11 Mar 2025
          </h3>
          <span className="text-xs text-[#6F7789]">
            {selectedDayEvents.length} events
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {selectedDayEvents.map((evt) => {
            const Icon = getEventIcon(evt.title);
            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="flex items-center justify-between p-3.5 bg-[#151820] hover:bg-[#1A1D24] border border-white/8 rounded-xl cursor-pointer transition-all relative overflow-hidden"
              >
                {/* Left accent bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1" 
                  style={{ backgroundColor: evt.color }} 
                />

                <div className="flex flex-col min-w-0 flex-1 pl-2">
                  <span className="text-sm font-semibold text-[#F5F7FF] truncate">
                    {evt.title}
                  </span>
                  <span className="text-xs text-[#A6AEC0] flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-[#6F7789]" />
                    <span>{evt.startTime} – {evt.endTime}</span>
                  </span>
                </div>

                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${evt.color}15`, color: evt.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
