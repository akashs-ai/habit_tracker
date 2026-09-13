import React from 'react';
import { ArrowRight, Laptop, Dumbbell, Film, Calendar as CalIcon } from 'lucide-react';
import { CalendarEvent } from '../../types';
import { formatUpcomingDateLabel } from '../../utils/dateUtils';

interface UpcomingEventsPanelProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onViewAll?: () => void;
}

export const UpcomingEventsPanel: React.FC<UpcomingEventsPanelProps> = ({
  events,
  onSelectEvent,
  onViewAll,
}) => {
  const getEventIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('movie') || t.includes('night')) return Film;
    if (t.includes('gym') || t.includes('workout')) return Dumbbell;
    if (t.includes('project') || t.includes('work')) return Laptop;
    return CalIcon;
  };

  // Take next 4-5 upcoming events
  const upcomingList = events.slice(0, 4);

  return (
    <div id="upcoming-events-panel" className="flex flex-col gap-2.5">
      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F5F7FF] px-1">
        Upcoming (Next 7 Days)
      </h3>

      <div className="flex flex-col gap-1.5">
        {upcomingList.map((evt) => {
          const Icon = getEventIcon(evt.title);
          return (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt)}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#151820] cursor-pointer transition-colors group"
            >
              {/* Icon */}
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ 
                  backgroundColor: `${evt.color}18`, 
                  color: evt.color 
                }}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Title & Date */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-slate-900 dark:text-[#F5F7FF] truncate group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                  {evt.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#6F7789] truncate">
                  {formatUpcomingDateLabel(evt.date, evt.startTime)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onViewAll}
        className="flex items-center gap-1 text-xs text-[#6C63FF] hover:text-[#7B73FF] font-medium px-1 py-1 w-fit transition-colors mt-0.5 cursor-pointer"
      >
        <span>View All</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
