import React, { useState } from 'react';
import { 
  X, 
  Pencil, 
  MoreHorizontal, 
  Flag, 
  Plus, 
  Check, 
  Trash2, 
  FileCode, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { CalendarEvent } from '../../types';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateEvent: (updated: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const [newSubtask, setNewSubtask] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (!isOpen || !event) return null;

  const handleToggleSubtask = (subtaskId: string) => {
    if (!event.subtasks) return;
    const updatedSubtasks = event.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateEvent({
      ...event,
      subtasks: updatedSubtasks,
    });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const newSt = {
      id: `st-${Date.now()}`,
      title: newSubtask.trim(),
      completed: false,
    };
    onUpdateEvent({
      ...event,
      subtasks: [...(event.subtasks || []), newSt],
    });
    setNewSubtask('');
    setIsAddingSubtask(false);
  };

  return (
    <div
      id="event-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="event-detail-card"
        className="w-full max-w-[480px] bg-[#151820] text-[#F5F7FF] border border-white/10 rounded-[14px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Row: Title & Action icons */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Color Accent Pill */}
            <div 
              className="w-1.5 h-12 rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: event.color }}
            />
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#F5F7FF] tracking-tight">
                {event.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#A6AEC0] mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#6F7789]" />
                <span>
                  {event.allDay ? 'All day' : `${event.startTime || ''} – ${event.endTime || ''}`}
                </span>
                {event.location && (
                  <>
                    <span className="text-[#6F7789]">•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#6F7789]" />
                      {event.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#A6AEC0]">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* More Menu Dropdown */}
        {showMoreMenu && (
          <div className="absolute right-6 top-14 w-36 bg-[#1A1D24] border border-white/10 rounded-xl shadow-xl py-1 z-30 animate-in fade-in duration-100">
            <button
              onClick={() => {
                onDeleteEvent(event.id);
                onClose();
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-[#EF4444] hover:bg-[#EF4444]/15 flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete event</span>
            </button>
          </div>
        )}

        {/* Badges: Category & Priority */}
        <div className="flex items-center gap-2 mt-3.5">
          <span 
            className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider"
            style={{ 
              backgroundColor: `${event.color}25`, 
              color: event.color 
            }}
          >
            {event.category}
          </span>

          {event.priority === 'high' && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F25567]/20 text-[#F25567]">
              <Flag className="w-3 h-3 fill-current" />
              <span>High</span>
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs sm:text-sm text-[#A6AEC0] mt-3.5 leading-relaxed bg-[#111318] p-3 rounded-lg border border-white/6">
            {event.description}
          </p>
        )}

        {/* Subtasks Section */}
        <div className="mt-4 flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-[#A6AEC0] uppercase tracking-wider">
            Subtasks
          </h4>
          <div className="flex flex-col gap-1.5">
            {event.subtasks?.map((st) => (
              <label
                key={st.id}
                className="flex items-center gap-2.5 text-xs text-[#F5F7FF] cursor-pointer hover:bg-white/5 p-1.5 rounded-lg transition-colors"
              >
                <div
                  onClick={() => handleToggleSubtask(st.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    st.completed
                      ? 'bg-[#6C63FF] border-[#6C63FF] text-white'
                      : 'border-white/20 hover:border-[#6C63FF]'
                  }`}
                >
                  {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className={st.completed ? 'line-through text-[#6F7789]' : ''}>
                  {st.title}
                </span>
              </label>
            ))}

            {isAddingSubtask ? (
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Subtask name..."
                  autoFocus
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-white/15 bg-[#111318] text-[#F5F7FF] focus:outline-none focus:border-[#6C63FF]"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 text-xs bg-[#6C63FF] text-white rounded-lg hover:bg-[#7B73FF]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSubtask(false)}
                  className="px-2 text-xs text-[#A6AEC0] hover:text-white"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingSubtask(true)}
                className="flex items-center gap-1.5 text-xs text-[#6C63FF] hover:text-[#7B73FF] font-medium w-fit mt-1 pl-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add subtask</span>
              </button>
            )}
          </div>
        </div>

        {/* Attachments Section */}
        {event.attachments && event.attachments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/8">
            <h4 className="text-xs font-semibold text-[#A6AEC0] uppercase tracking-wider mb-2">
              Attachments
            </h4>
            <div className="flex flex-wrap gap-2">
              {event.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-3 py-2 bg-[#111318] border border-white/8 rounded-xl text-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#6C63FF]/20 text-[#6C63FF] flex items-center justify-center">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-[#F5F7FF]">{att.name}</div>
                    <div className="text-[10px] text-[#6F7789]">{att.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
