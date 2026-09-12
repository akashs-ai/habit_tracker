import React, { useMemo } from 'react';
import { Clock, MapPin, Plus, CheckCircle2, Circle } from 'lucide-react';
import { CalendarEvent } from '../../types';
import { 
  formatFullDayHeader, 
  getLiveTodayISO, 
  getCurrentTimeInfo,
  isTimeSlotMatching,
  parseTimeSlotTo24H,
  parseHourTo24,
  isToday as checkIsToday
} from '../../utils/dateUtils';

interface CalendarDayViewProps {
  selectedDate: string;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onAddEvent: (initialTime?: string) => void;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  selectedDate,
  events,
  onSelectEvent,
  onAddEvent,
}) => {
  const todayISO = useMemo(() => getLiveTodayISO(), []);
  const isToday = checkIsToday(selectedDate, todayISO);

  const hours = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
    '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
  ];

  const dayEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDate);
  }, [events, selectedDate]);

  // Local live time info
  const timeInfo = useMemo(() => getCurrentTimeInfo(), []);
  const currentHour = timeInfo.hour24;
  const currentMinute = timeInfo.minute;
  const showNowLine = isToday && currentHour >= 6 && currentHour <= 23;

  const isEventInSlot = (evt: CalendarEvent, hourLabel: string): boolean => {
    return isTimeSlotMatching(evt.startTime, hourLabel);
  };

  return (
    <div 
      id="calendar-day-view-container" 
      className="w-full bg-[#0F1217] border border-white/8 rounded-xl p-4 sm:p-6 shadow-sm"
    >
      {/* Header with full day information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/8 mb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#F5F7FF]">
              {formatFullDayHeader(selectedDate)}
            </h3>
            {isToday && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6C63FF] text-white">
                TODAY
              </span>
            )}
          </div>
          <p className="text-xs text-[#6F7789] mt-0.5">
            {dayEvents.length} event{dayEvents.length === 1 ? '' : 's'} scheduled for this day
          </p>
        </div>
        <button
          onClick={() => onAddEvent()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#6C63FF] hover:bg-[#7B73FF] text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Hourly Schedule Timeline */}
      <div className="flex flex-col divide-y divide-white/6 relative">
        {hours.map((hour) => {
          const matchEvts = dayEvents.filter((e) => isEventInSlot(e, hour));
          const slot24 = parseHourTo24(hour);
          const isCurrentSlot = isToday && slot24 === currentHour;

          return (
            <div 
              key={hour} 
              className="flex items-start gap-4 py-3 min-h-[64px] group relative hover:bg-white/[0.015] transition-colors rounded-lg px-1 cursor-pointer"
              onClick={() => onAddEvent(hour)}
            >
              {/* Live Time Indicator */}
              {isCurrentSlot && showNowLine && (
                <div 
                  className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                  style={{ top: `${(currentMinute / 60) * 100}%` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-4 ring-[#EF4444]/30 -ml-1" />
                  <div className="flex-1 h-[2px] bg-[#EF4444]" />
                  <span className="text-[10px] font-bold text-[#EF4444] bg-[#0F1217] px-1.5 py-0.5 rounded border border-[#EF4444]/30 mr-2">
                    NOW
                  </span>
                </div>
              )}

              {/* Hour Column */}
              <div className="w-20 text-right text-xs font-medium text-[#6F7789] pt-1 shrink-0 group-hover:text-[#F5F7FF] transition-colors">
                {hour}
              </div>

              {/* Event Stack in this hour */}
              <div className="flex-1 flex flex-col gap-2">
                {matchEvts.length > 0 ? (
                  matchEvts.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className="p-3.5 rounded-xl bg-[#151820] hover:bg-[#1A1D24] border border-white/8 hover:border-white/14 cursor-pointer transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden"
                      style={{ borderLeftWidth: '4px', borderLeftColor: evt.color }}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-semibold text-[#F5F7FF] flex items-center gap-2">
                          <span>{evt.title}</span>
                          {evt.priority === 'high' && (
                            <span className="w-2 h-2 rounded-full bg-[#EF4444]" title="High Priority" />
                          )}
                        </div>
                        <div className="text-xs text-[#A6AEC0] flex items-center flex-wrap gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#6F7789]" />
                            {evt.allDay ? 'All Day' : `${evt.startTime} – ${evt.endTime || ''}`}
                          </span>
                          {evt.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#6F7789]" />
                              {evt.location}
                            </span>
                          )}
                          {evt.subtasks && evt.subtasks.length > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-[#A6AEC0]">
                              <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                              {evt.subtasks.filter((s) => s.completed).length}/{evt.subtasks.length} subtasks
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span 
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider"
                          style={{ backgroundColor: `${evt.color}20`, color: evt.color }}
                        >
                          {evt.category}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-4 flex items-center text-[11px] text-white/10 group-hover:text-white/30 transition-colors">
                    + Click to schedule at {hour}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
