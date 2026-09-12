import React from 'react';
import { CalendarEvent } from '../../types';

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
  // Week days surrounding March 11, 2025 (Sun Mar 9 to Sat Mar 15)
  const weekDays = [
    { name: 'Sun', day: 9, date: '2025-03-09' },
    { name: 'Mon', day: 10, date: '2025-03-10' },
    { name: 'Tue', day: 11, date: '2025-03-11', isToday: true },
    { name: 'Wed', day: 12, date: '2025-03-12' },
    { name: 'Thu', day: 13, date: '2025-03-13' },
    { name: 'Fri', day: 14, date: '2025-03-14' },
    { name: 'Sat', day: 15, date: '2025-03-15' },
  ];

  const hours = [
    '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', 
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', 
    '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
  ];

  return (
    <div className="w-full bg-[#0F1217] border border-white/8 rounded-xl overflow-x-auto">
      {/* Header with week days */}
      <div className="grid grid-cols-8 border-b border-white/8 bg-[#111318] min-w-[700px]">
        <div className="p-3 text-xs font-semibold text-[#6F7789] text-center border-r border-white/8">
          Time
        </div>
        {weekDays.map((wd) => {
          const isSelected = selectedDate === wd.date;
          return (
            <div
              key={wd.date}
              onClick={() => onSelectDate(wd.date)}
              className={`p-2 text-center cursor-pointer transition-colors ${
                isSelected ? 'bg-[#6C63FF]/10' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="text-[11px] font-medium text-[#6F7789]">{wd.name}</div>
              <div
                className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs mt-0.5 ${
                  wd.isToday
                    ? 'bg-[#6C63FF] text-white font-bold'
                    : isSelected
                    ? 'text-[#6C63FF] font-semibold'
                    : 'text-[#F5F7FF]'
                }`}
              >
                {wd.day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Body Grid */}
      <div className="divide-y divide-white/8 min-w-[700px]">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 min-h-[52px]">
            {/* Hour label */}
            <div className="p-2 text-[10px] font-medium text-[#6F7789] text-center border-r border-white/8">
              {hour}
            </div>

            {/* 7 Columns */}
            {weekDays.map((wd) => {
              // Find events matching this date and approximate hour
              const dayEvts = events.filter(
                (e) => e.date === wd.date && (e.startTime?.startsWith(hour.split(' ')[0]) || (hour === '10 AM' && e.title.includes('UI')) || (hour === '1 PM' && e.title.includes('Lunch')) || (hour === '10 PM' && e.title.includes('Free Fire')))
              );

              return (
                <div
                  key={wd.date}
                  onClick={() => onAddEventOnDate(wd.date)}
                  className="border-r border-white/8 p-1 hover:bg-white/[0.02] transition-colors relative cursor-pointer"
                >
                  {dayEvts.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className="p-1.5 rounded text-[10px] font-medium bg-[#151820] hover:bg-[#1A1D24] border border-white/10 text-[#F5F7FF] truncate cursor-pointer shadow-xs"
                      style={{ borderLeftWidth: '3px', borderLeftColor: evt.color }}
                    >
                      <div className="font-semibold truncate">{evt.title}</div>
                      <div className="text-[9px] text-[#A6AEC0]">{evt.startTime}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
