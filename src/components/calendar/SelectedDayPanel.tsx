import React from 'react';
import { Plus, Laptop, Utensils, Gamepad2, Dumbbell, BookOpen, Clock, Calendar as CalIcon } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface SelectedDayPanelProps {
  selectedDate: string; // "2025-03-11"
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEvent: () => void;
}

export const SelectedDayPanel: React.FC<SelectedDayPanelProps> = ({
  selectedDate,
  events,
  onSelectEvent,
  onAddEvent,
}) => {
  // Format selectedDate e.g. "Tue, 11 Mar 2025"
  const formattedDate = React.useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const getEventIcon = (category: string, title: string) => {
    const t = title.toLowerCase();
    if (t.includes('free fire') || t.includes('game')) return Gamepad2;
    if (t.includes('lunch') || t.includes('food')) return Utensils;
    if (t.includes('gym') || t.includes('workout')) return Dumbbell;
    if (t.includes('read') || t.includes('book')) return BookOpen;
    if (t.includes('design') || t.includes('project') || t.includes('ui')) return Laptop;
    return CalIcon;
  };

  return (
    <div id="selected-day-panel" className="flex flex-col gap-2.5">
      {/* Date Header */}
      <h3 className="text-xs sm:text-sm font-semibold text-[#F5F7FF] px-1">
        {formattedDate}
      </h3>

      {/* Events List */}
      <div className="flex flex-col gap-2">
        {events.length > 0 ? (
          events.map((evt) => {
            const IconComponent = getEventIcon(evt.category, evt.title);
            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="group flex items-center justify-between p-3 bg-[#151820] hover:bg-[#1A1D24] border border-white/6 hover:border-white/12 rounded-lg cursor-pointer transition-all duration-150 relative overflow-hidden"
              >
                {/* Left Colored Accent Stripe */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: evt.color }}
                />

                <div className="flex items-center gap-3 pl-1.5 min-w-0 flex-1">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-[#F5F7FF] truncate group-hover:text-white transition-colors">
                      {evt.title}
                    </span>
                    <span className="text-[11px] text-[#A6AEC0] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#6F7789]" />
                      <span>
                        {evt.allDay ? 'All day' : `${evt.startTime || ''} – ${evt.endTime || ''}`}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Right Category Icon */}
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ 
                    backgroundColor: `${evt.color}15`, 
                    color: evt.color 
                  }}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 px-4 bg-[#151820] border border-white/6 rounded-lg text-center">
            <p className="text-xs text-[#6F7789]">No events scheduled for this day.</p>
          </div>
        )}

        {/* + Add Event Button */}
        <button
          onClick={onAddEvent}
          className="flex items-center justify-center gap-1.5 h-9 rounded-lg border border-dashed border-white/12 hover:border-[#6C63FF] hover:bg-[#6C63FF]/5 text-xs text-[#A6AEC0] hover:text-[#6C63FF] transition-colors mt-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Event</span>
        </button>
      </div>
    </div>
  );
};
