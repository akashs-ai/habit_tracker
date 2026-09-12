import React from 'react';
import { Clock, MapPin, Plus } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface CalendarDayViewProps {
  selectedDate: string;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEvent: () => void;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  selectedDate,
  events,
  onSelectEvent,
  onAddEvent,
}) => {
  const hours = [
    '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
    '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
  ];

  const dayEvents = events.filter((e) => e.date === selectedDate);

  return (
    <div className="w-full bg-[#0F1217] border border-white/8 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#F5F7FF]">
            Day Schedule — {selectedDate}
          </h3>
          <p className="text-xs text-[#6F7789] mt-0.5">
            {dayEvents.length} event{dayEvents.length === 1 ? '' : 's'} planned
          </p>
        </div>
        <button
          onClick={onAddEvent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C63FF] hover:bg-[#7B73FF] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="flex flex-col divide-y divide-white/6">
        {hours.map((hour) => {
          // Find matching event
          const matchEvts = dayEvents.filter(
            (e) => e.startTime?.startsWith(hour.split(':')[0]) || (hour === '10:00 AM' && e.title.includes('UI')) || (hour === '1:00 PM' && e.title.includes('Lunch')) || (hour === '10:00 PM' && e.title.includes('Free Fire'))
          );

          return (
            <div key={hour} className="flex items-start gap-4 py-3 min-h-[58px] group">
              <div className="w-16 text-right text-xs font-medium text-[#6F7789] pt-1">
                {hour}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                {matchEvts.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className="p-3 rounded-lg bg-[#151820] hover:bg-[#1A1D24] border border-white/8 cursor-pointer transition-all flex items-center justify-between"
                    style={{ borderLeftWidth: '4px', borderLeftColor: evt.color }}
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#F5F7FF]">{evt.title}</div>
                      <div className="text-xs text-[#A6AEC0] flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#6F7789]" />
                          {evt.startTime} – {evt.endTime}
                        </span>
                        {evt.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#6F7789]" />
                            {evt.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <span 
                      className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase"
                      style={{ backgroundColor: `${evt.color}20`, color: evt.color }}
                    >
                      {evt.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
