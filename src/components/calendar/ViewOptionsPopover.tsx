import React from 'react';
import { 
  Calendar as CalIcon, 
  CalendarDays, 
  Clock, 
  List, 
  Plus, 
  RotateCcw, 
  Search, 
  X 
} from 'lucide-react';
import { CalendarViewType } from '../../types';

interface ViewOptionsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: CalendarViewType;
  onChangeView: (view: CalendarViewType) => void;
  onAddEvent: () => void;
  onGoToToday: () => void;
}

export const ViewOptionsPopover: React.FC<ViewOptionsPopoverProps> = ({
  isOpen,
  onClose,
  currentView,
  onChangeView,
  onAddEvent,
  onGoToToday,
}) => {
  if (!isOpen) return null;

  const views: { id: CalendarViewType; label: string; icon: any; shortcut: string }[] = [
    { id: 'month', label: 'Month', icon: CalIcon, shortcut: '⌘ 1' },
    { id: 'week', label: 'Week', icon: CalendarDays, shortcut: '⌘ 2' },
    { id: 'day', label: 'Day', icon: Clock, shortcut: '⌘ 3' },
    { id: 'agenda', label: 'Agenda', icon: List, shortcut: '⌘ 4' },
  ];

  const categories = [
    { name: 'Study', color: '#7C5CFF' },
    { name: 'Projects', color: '#3B82F6' },
    { name: 'Workout', color: '#22C55E' },
    { name: 'Social', color: '#EC4899' },
    { name: 'Personal', color: '#F59E0B' },
    { name: 'Health', color: '#EF4444' },
    { name: 'Entertainment', color: '#06B6D4' },
    { name: 'Other', color: '#94A3B8' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[540px] bg-[#151820] text-[#F5F7FF] border border-white/10 rounded-[14px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/8">
          <h3 className="text-sm font-semibold text-[#F5F7FF]">Calendar Preferences & Legend</h3>
          <button onClick={onClose} className="p-1 rounded text-[#A6AEC0] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* View Options */}
          <div>
            <h4 className="text-xs font-semibold text-[#A6AEC0] uppercase tracking-wider mb-2">
              View Options
            </h4>
            <div className="flex flex-col gap-1">
              {views.map((v) => {
                const Icon = v.icon;
                const isActive = currentView === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      onChangeView(v.id);
                      onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#6C63FF] text-white shadow-xs'
                        : 'bg-[#111318] text-[#A6AEC0] hover:text-[#F5F7FF] hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{v.label}</span>
                    </div>
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-[#A6AEC0]">
                      {v.shortcut}
                    </kbd>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <h4 className="text-xs font-semibold text-[#A6AEC0] uppercase tracking-wider mt-4 mb-2">
              Quick Actions
            </h4>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  onAddEvent();
                  onClose();
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-[#111318] text-[#A6AEC0] hover:text-[#F5F7FF] hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[#6C63FF]" />
                  <span>Add Event</span>
                </div>
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-[#A6AEC0]">⌘ N</kbd>
              </button>

              <button
                onClick={() => {
                  onGoToToday();
                  onClose();
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-[#111318] text-[#A6AEC0] hover:text-[#F5F7FF] hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Go to Today</span>
                </div>
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-[#A6AEC0]">⌘ T</kbd>
              </button>
            </div>
          </div>

          {/* Event Types / Colors Legend */}
          <div>
            <h4 className="text-xs font-semibold text-[#A6AEC0] uppercase tracking-wider mb-2">
              Event Types / Colors
            </h4>
            <div className="grid grid-cols-2 gap-2 bg-[#111318] p-3 rounded-xl border border-white/6">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2 text-xs text-[#F5F7FF]">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: cat.color }} 
                  />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>

            {/* Interaction States Example */}
            <h4 className="text-xs font-semibold text-[#A6AEC0] uppercase tracking-wider mt-4 mb-2">
              Interaction States
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="p-2 rounded bg-[#111318] border border-white/8 text-[#A6AEC0]">
                Default
              </div>
              <div className="p-2 rounded bg-[#1A1D24] border border-white/16 text-[#F5F7FF]">
                Hover
              </div>
              <div className="p-2 rounded bg-[#6C63FF]/20 border border-[#6C63FF] text-[#F5F7FF]">
                Selected
              </div>
              <div className="p-2 rounded bg-[#6C63FF]/10 border border-dashed border-[#6C63FF]/60 text-[#A6AEC0] opacity-80">
                Dragging
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
