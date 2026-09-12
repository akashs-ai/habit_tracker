import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Laptop, Utensils, Gamepad2, Dumbbell, BookOpen, Clock, Calendar as CalIcon, Plus } from 'lucide-react';
import { CalendarEvent } from '../../types';
import { 
  getMonthGridDays, 
  getLiveTodayISO, 
  parseDateISO, 
  getMonthYearLabel, 
  formatReadableDate,
  shiftDateMonths 
} from '../../utils/dateUtils';

interface MobileCalendarViewProps {
  selectedDate: string; // "YYYY-MM-DD"
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
  const todayISO = useMemo(() => getLiveTodayISO(), []);

  // Internal view date for mobile month navigation
  const [viewDate, setViewDate] = useState(() => {
    return parseDateISO(selectedDate);
  });

  const monthLabel = useMemo(() => {
    return getMonthYearLabel(viewDate.getFullYear(), viewDate.getMonth());
  }, [viewDate]);

  const days = useMemo(() => {
    return getMonthGridDays(viewDate.getFullYear(), viewDate.getMonth(), todayISO);
  }, [viewDate, todayISO]);

  const handlePrevMonth = () => {
    setViewDate(shiftDateMonths(viewDate, -1));
  };

  const handleNextMonth = () => {
    setViewDate(shiftDateMonths(viewDate, 1));
  };

  // Map events by date
  const eventsByDate = useMemo(() => {
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
    if (t.includes('lunch') || t.includes('food') || t.includes('dinner')) return Utensils;
    if (t.includes('gym') || t.includes('workout') || t.includes('run')) return Dumbbell;
    if (t.includes('read') || t.includes('book') || t.includes('study')) return BookOpen;
    if (t.includes('design') || t.includes('project') || t.includes('ui') || t.includes('code')) return Laptop;
    return CalIcon;
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Month Compact Calendar Card */}
      <div className="bg-[#0F1217] border border-white/8 rounded-xl p-3.5 shadow-sm">
        {/* Header: Dynamic Month & Navigation */}
        <div className="flex items-center justify-between pb-3 px-1">
          <span className="text-sm font-semibold text-[#F5F7FF]">
            {monthLabel}
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 rounded-md text-[#A6AEC0] hover:text-white hover:bg-white/5 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 rounded-md text-[#A6AEC0] hover:text-white hover:bg-white/5 transition-colors"
              title="Next Month"
            >
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
            const isToday = item.date === todayISO;
            const cellEvents = eventsByDate.get(item.date) || [];

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(item.date)}
                className={`h-[42px] rounded-lg flex flex-col items-center justify-center transition-all relative ${
                  isToday
                    ? 'bg-[#6C63FF] text-white font-bold ring-2 ring-[#6C63FF]/30'
                    : isSelected
                    ? 'border border-[#6C63FF] bg-[#6C63FF]/15 text-[#6C63FF] font-semibold'
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

      {/* Selected-Day Section: e.g. Sat, 12 Sep 2026 */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F5F7FF]">
              {formatReadableDate(selectedDate)}
            </h3>
            {selectedDate === todayISO && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#6C63FF] text-white">
                TODAY
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6F7789]">
              {selectedDayEvents.length} event{selectedDayEvents.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={onOpenAddEvent}
              className="p-1 rounded-md bg-[#6C63FF] text-white hover:bg-[#7B73FF] transition-colors"
              title="Add event"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map((evt) => {
              const Icon = getEventIcon(evt.title);
              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="flex items-center justify-between p-3.5 bg-[#151820] hover:bg-[#1A1D24] border border-white/8 rounded-xl cursor-pointer transition-all relative overflow-hidden shadow-xs"
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
                      <span>{evt.allDay ? 'All Day' : `${evt.startTime} – ${evt.endTime || ''}`}</span>
                    </span>
                  </div>

                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-2"
                    style={{ backgroundColor: `${evt.color}15`, color: evt.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 rounded-xl bg-[#151820]/50 border border-white/6 text-center">
              <p className="text-xs text-[#A6AEC0]">No events scheduled for this day.</p>
              <button
                onClick={onOpenAddEvent}
                className="mt-2 text-xs font-semibold text-[#6C63FF] hover:underline"
              >
                + Schedule an event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
