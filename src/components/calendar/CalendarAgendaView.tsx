import React from 'react';
import { CalendarEvent } from '../../types';
import { Clock, MapPin } from 'lucide-react';

interface CalendarAgendaViewProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({
  events,
  onSelectEvent,
}) => {
  // Sort events by date and time
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  // Group by date
  const grouped = sortedEvents.reduce((acc, evt) => {
    acc[evt.date] = acc[evt.date] || [];
    acc[evt.date].push(evt);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <div className="w-full bg-[#0F1217] border border-white/8 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col gap-6">
      {Object.entries(grouped).map(([dateStr, dateEventsList]) => {
        const dateEvents = dateEventsList as CalendarEvent[];
        let displayHeader = dateStr;
        try {
          const parts = dateStr.split('-');
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          displayHeader = d.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        } catch {}

        return (
          <div key={dateStr} className="flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold text-[#6C63FF] uppercase tracking-wider">
              {displayHeader}
            </h4>

            <div className="flex flex-col gap-2">
              {dateEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="p-3 bg-[#151820] hover:bg-[#1A1D24] border border-white/6 hover:border-white/12 rounded-lg cursor-pointer transition-all flex items-center justify-between"
                  style={{ borderLeftWidth: '3.5px', borderLeftColor: evt.color }}
                >
                  <div>
                    <div className="text-sm font-semibold text-[#F5F7FF]">{evt.title}</div>
                    <div className="text-xs text-[#A6AEC0] flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#6F7789]" />
                        {evt.allDay ? 'All day' : `${evt.startTime || ''} – ${evt.endTime || ''}`}
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
                    className="text-[10px] font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider"
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
  );
};
