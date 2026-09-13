import React, { useMemo } from 'react';
import { CalendarEvent } from '../../types';
import { 
  getWeekDaysForDate, 
  getLiveTodayISO, 
  getCurrentTimeInfo,
  isTimeSlotMatching 
} from '../../utils/dateUtils';

interface CalendarWeekViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEventOnDate: (date: string) => void;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  selectedDate,
  onSelectDate,
  events,
  onSelectEvent,
  onAddEventOnDate,
}) => {
  const todayISO = useMemo(() => getLiveTodayISO(), []);
  const weekDays = useMemo(() => getWeekDaysForDate(selectedDate, todayISO), [selectedDate, todayISO]);

  const hours = [
    '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', 
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', 
    '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
  ];

  // Local live time position indicator
  const timeInfo = useMemo(() => getCurrentTimeInfo(), []);
  const currentHour = timeInfo.hour24;
  const currentMinute = timeInfo.minute;
  const showNowLine = currentHour >= 6 && currentHour <= 23;

  // Helper to match event to an hour slot using unified dateUtils
  const isEventInHour = (evt: CalendarEvent, hourLabel: string): boolean => {
    return isTimeSlotMatching(evt.startTime, hourLabel);
  };

  return (
    <div 
      id="calendar-week-grid-container"
      className="w-full bg-white dark:bg-[#0F1217] border border-slate-200 dark:border-white/8 rounded-xl overflow-x-auto shadow-sm transition-colors"
    >
      {/* Header with week days */}
      <div className="grid grid-cols-8 border-b border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#111318] min-w-[760px] sticky top-0 z-10">
        <div className="p-3 text-xs font-semibold text-slate-500 dark:text-[#6F7789] text-center border-r border-slate-200 dark:border-white/8 flex items-center justify-center">
          Time
        </div>
        {weekDays.map((wd) => {
          const isSelected = selectedDate === wd.date;
          return (
            <div
              key={wd.date}
              onClick={() => onSelectDate(wd.date)}
              className={`p-2.5 text-center cursor-pointer transition-colors border-r border-slate-200 dark:border-white/8 last:border-r-0 ${
                isSelected 
                  ? 'bg-[#6C63FF]/15' 
                  : wd.isToday 
                  ? 'bg-indigo-50/60 dark:bg-white/[0.03]' 
                  : 'hover:bg-slate-100/60 dark:hover:bg-white/[0.02]'
              }`}
            >
              <div className={`text-[11px] font-semibold uppercase tracking-wider ${
                wd.isToday ? 'text-[#6C63FF]' : 'text-slate-500 dark:text-[#6F7789]'
              }`}>
                {wd.name}
              </div>
              <div
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs mt-1 transition-all ${
                  wd.isToday
                    ? 'bg-[#6C63FF] text-white font-bold ring-2 ring-[#6C63FF]/30'
                    : isSelected
                    ? 'bg-slate-200 dark:bg-white/10 text-[#6C63FF] font-bold'
                    : 'text-slate-800 dark:text-[#F5F7FF] font-medium'
                }`}
              >
                {wd.day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Body Grid */}
      <div className="divide-y divide-slate-200 dark:divide-white/8 min-w-[760px] relative">
        {hours.map((hour) => {
          const [hNumStr, hPeriod] = hour.split(' ');
          let h24 = parseInt(hNumStr, 10);
          if (hPeriod === 'PM' && h24 !== 12) h24 += 12;
          if (hPeriod === 'AM' && h24 === 12) h24 = 0;
          const isCurrentHourSlot = h24 === currentHour;

          return (
            <div key={hour} className="grid grid-cols-8 min-h-[58px] relative group">
              {/* Hour label */}
              <div className="p-2 text-[11px] font-medium text-slate-500 dark:text-[#6F7789] text-center border-r border-slate-200 dark:border-white/8 bg-slate-50/80 dark:bg-[#0D0F13]/50 flex items-center justify-center">
                {hour}
              </div>

              {/* 7 Columns */}
              {weekDays.map((wd) => {
                const dayEvts = events.filter((e) => e.date === wd.date && isEventInHour(e, hour));
                const isTodayCol = wd.date === todayISO;

                return (
                  <div
                    key={wd.date}
                    onClick={() => onAddEventOnDate(wd.date)}
                    className={`border-r border-slate-200 dark:border-white/8 last:border-r-0 p-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors relative cursor-pointer ${
                      wd.date === selectedDate ? 'bg-[#6C63FF]/5' : ''
                    }`}
                  >
                    {/* Live time indicator line across today's column */}
                    {isTodayCol && isCurrentHourSlot && showNowLine && (
                      <div 
                        className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                        style={{ top: `${(currentMinute / 60) * 100}%` }}
                      >
                        <div className="w-2 h-2 rounded-full bg-[#EF4444] -ml-1 ring-2 ring-white/50" />
                        <div className="flex-1 h-[2px] bg-[#EF4444]" />
                      </div>
                    )}

                    <div className="flex flex-col gap-1 w-full h-full">
                      {dayEvts.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(evt);
                          }}
                          className="p-1.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-[#151820] hover:bg-slate-200 dark:hover:bg-[#1A1D24] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-[#F5F7FF] cursor-pointer shadow-xs transition-all relative overflow-hidden"
                          style={{ borderLeftWidth: '3.5px', borderLeftColor: evt.color }}
                        >
                          <div className="font-semibold truncate text-slate-800 dark:text-[#F5F7FF]">{evt.title}</div>
                          <div className="text-[9px] text-slate-500 dark:text-[#A6AEC0] flex items-center gap-1 mt-0.5">
                            <span>{evt.startTime}</span>
                            {evt.endTime && <span>– {evt.endTime}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
