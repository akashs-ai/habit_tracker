import React from 'react';
import { Plus, Laptop, Utensils, Gamepad2, Dumbbell, BookOpen, Clock, Calendar as CalIcon, Check } from 'lucide-react';
import { CalendarEvent } from '../../types';
import { formatReadableDate, getRelativeDayLabel, isToday } from '../../utils/dateUtils';

interface SelectedDayPanelProps {
  selectedDate: string; // "YYYY-MM-DD"
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEvent: () => void;
  onToggleTaskComplete?: (taskId: string) => void;
}

export const SelectedDayPanel: React.FC<SelectedDayPanelProps> = ({
  selectedDate,
  events,
  onSelectEvent,
  onAddEvent,
  onToggleTaskComplete,
}) => {
  // Format selectedDate e.g. "Tue, 11 Mar 2026"
  const formattedDate = React.useMemo(() => {
    return formatReadableDate(selectedDate);
  }, [selectedDate]);

  const relativeLabel = React.useMemo(() => {
    return getRelativeDayLabel(selectedDate);
  }, [selectedDate]);

  const isCurrentDay = React.useMemo(() => {
    return isToday(selectedDate);
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
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F5F7FF]">
          {formattedDate}
        </h3>
        {isCurrentDay ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6C63FF] text-white">
            TODAY
          </span>
        ) : (
          <span className="text-[10px] font-medium text-slate-500 dark:text-[#A6AEC0]">
            {relativeLabel}
          </span>
        )}
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-2">
        {events.length > 0 ? (
          events.map((evt) => {
            const IconComponent = getEventIcon(evt.category, evt.title);
            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="group flex items-center justify-between p-3 bg-slate-100 dark:bg-[#151820] hover:bg-slate-200 dark:hover:bg-[#1A1D24] border border-slate-200 dark:border-white/6 hover:border-slate-300 dark:hover:border-white/12 rounded-lg cursor-pointer transition-all duration-150 relative overflow-hidden"
              >
                {/* Left Colored Accent Stripe */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: evt.color }}
                />

                <div className="flex items-center gap-3 pl-1.5 min-w-0 flex-1">
                  {(evt.isAutoTask || evt.taskId || evt.completed !== undefined) && (
                    <button
                      type="button"
                      title={evt.completed ? "Mark as Incomplete" : "Mark as Complete"}
                      onClick={(e) => {
                        e.stopPropagation();
                        const taskId = evt.taskId || evt.id.replace('task-evt-', '');
                        if (onToggleTaskComplete) {
                          onToggleTaskComplete(taskId);
                        }
                      }}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        evt.completed
                          ? 'bg-[#10B981] border-[#10B981] text-white shadow-xs'
                          : 'border-slate-400 dark:border-white/30 hover:border-[#6C63FF] bg-white/5'
                      }`}
                    >
                      {evt.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-semibold truncate transition-colors group-hover:text-slate-950 dark:group-hover:text-white ${
                      evt.completed 
                        ? 'line-through text-slate-400 dark:text-[#6F7789]' 
                        : 'text-slate-900 dark:text-[#F5F7FF]'
                    }`}>
                      {evt.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-[#A6AEC0] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-[#6F7789]" />
                      <span>
                        {evt.allDay ? 'All day' : `${evt.startTime || ''} – ${evt.endTime || ''}`}
                      </span>
                      {evt.completed && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#10B981]/15 text-[#10B981]">
                          Completed
                        </span>
                      )}
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
          <div className="py-6 px-4 bg-slate-50 dark:bg-[#151820] border border-slate-200 dark:border-white/6 rounded-lg text-center">
            <p className="text-xs text-slate-500 dark:text-[#6F7789]">No events scheduled for this day.</p>
          </div>
        )}

        {/* + Add Event Button */}
        <button
          onClick={onAddEvent}
          className="flex items-center justify-center gap-1.5 h-9 rounded-lg border border-dashed border-slate-300 dark:border-white/12 hover:border-[#6C63FF] hover:bg-[#6C63FF]/5 text-xs text-slate-600 dark:text-[#A6AEC0] hover:text-[#6C63FF] transition-colors mt-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Event</span>
        </button>
      </div>
    </div>
  );
};
