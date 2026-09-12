import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, MapPin, Repeat, AlignLeft } from 'lucide-react';
import { CalendarEvent, EventCategory } from '../../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  initialDate?: string;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate = '2025-03-11',
}) => {
  const [activeTab, setActiveTab] = useState<'Event' | 'Task' | 'Focus Block' | 'Reminder'>('Event');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [repeat, setRepeat] = useState('Does not repeat');
  const [selectedColor, setSelectedColor] = useState('#7C5CFF');
  const [description, setDescription] = useState('');

  const colorPalette = [
    { color: '#7C5CFF', label: 'Study / Project' },
    { color: '#3B82F6', label: 'Work' },
    { color: '#22C55E', label: 'Workout / Health' },
    { color: '#06B6D4', label: 'Entertainment' },
    { color: '#F59E0B', label: 'Personal' },
    { color: '#EF4444', label: 'Deadline' },
    { color: '#EC4899', label: 'Social' },
    { color: '#94A3B8', label: 'Other' },
  ];

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let category: EventCategory = 'study';
    if (selectedColor === '#22C55E') category = 'workout';
    else if (selectedColor === '#3B82F6') category = 'project';
    else if (selectedColor === '#EC4899') category = 'social';
    else if (selectedColor === '#F59E0B') category = 'personal';
    else if (selectedColor === '#EF4444') category = 'health';
    else if (selectedColor === '#06B6D4') category = 'entertainment';
    else if (selectedColor === '#94A3B8') category = 'other';

    onSave({
      title: title.trim(),
      date,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      allDay,
      category,
      location: location.trim() || undefined,
      repeat: repeat !== 'Does not repeat' ? repeat : undefined,
      color: selectedColor,
      description: description.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setLocation('');
    onClose();
  };

  return (
    <div 
      id="add-event-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        id="add-event-modal"
        className="w-full max-w-[560px] bg-[#151820] text-[#F5F7FF] border border-white/10 rounded-[14px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Tabs */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div className="flex items-center gap-1.5 p-1 bg-[#111318] rounded-xl border border-white/8 text-xs font-medium">
            {(['Event', 'Task', 'Focus Block', 'Reminder'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-[#6C63FF] text-white shadow-xs'
                    : 'text-[#A6AEC0] hover:text-[#F5F7FF]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A6AEC0] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 text-xs sm:text-sm">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[#A6AEC0] mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. DSA Practice"
              autoFocus
              className="w-full h-10 px-3.5 bg-[#111318] border border-white/10 rounded-lg text-[#F5F7FF] placeholder:text-[#6F7789] focus:outline-none focus:border-[#6C63FF] transition-colors"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#A6AEC0] mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 px-3.5 bg-[#111318] border border-white/10 rounded-lg text-[#F5F7FF] focus:outline-none focus:border-[#6C63FF] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#A6AEC0]">
                  Time
                </label>
                <label className="flex items-center gap-1.5 text-xs text-[#A6AEC0] cursor-pointer">
                  <span>All day</span>
                  <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-[#111318] border-white/20 text-[#6C63FF] focus:ring-0"
                  />
                </label>
              </div>

              {!allDay ? (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full h-10 px-3 bg-[#111318] border border-white/10 rounded-lg text-[#F5F7FF] text-xs focus:outline-none focus:border-[#6C63FF]"
                  />
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="11:00 AM"
                    className="w-full h-10 px-3 bg-[#111318] border border-white/10 rounded-lg text-[#F5F7FF] text-xs focus:outline-none focus:border-[#6C63FF]"
                  />
                </div>
              ) : (
                <div className="h-10 px-3.5 bg-[#111318] border border-white/10 rounded-lg text-[#6F7789] text-xs flex items-center">
                  All day event
                </div>
              )}
            </div>
          </div>

          {/* Location & Repeat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#A6AEC0] mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location (optional)"
                className="w-full h-10 px-3.5 bg-[#111318] border border-white/10 rounded-lg text-[#F5F7FF] placeholder:text-[#6F7789] focus:outline-none focus:border-[#6C63FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A6AEC0] mb-1.5">
                Repeat
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="w-full h-10 px-3.5 bg-[#111318] border border-white/10 rounded-lg text-[#F5F7FF] focus:outline-none focus:border-[#6C63FF] cursor-pointer"
              >
                <option value="Does not repeat">Does not repeat</option>
                <option value="Daily">Daily</option>
                <option value="Every weekday">Every weekday (Mon-Fri)</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-medium text-[#A6AEC0] mb-2">
              Color
            </label>
            <div className="flex items-center gap-2.5">
              {colorPalette.map((cp) => (
                <button
                  key={cp.color}
                  type="button"
                  onClick={() => setSelectedColor(cp.color)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    selectedColor === cp.color 
                      ? 'ring-2 ring-white scale-110' 
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: cp.color }}
                  title={cp.label}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#A6AEC0] mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              className="w-full p-3 bg-[#111318] border border-white/10 rounded-lg text-[#F5F7FF] placeholder:text-[#6F7789] focus:outline-none focus:border-[#6C63FF] resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/8">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg text-xs font-medium text-[#A6AEC0] hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="h-10 px-5 rounded-lg text-xs font-semibold bg-[#6C63FF] hover:bg-[#7B73FF] text-white shadow-xs transition-colors disabled:opacity-50"
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
