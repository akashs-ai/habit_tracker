import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Flag, 
  Tag, 
  RotateCw, 
  Command, 
  X 
} from 'lucide-react';
import { TaskItem, TaskPriority } from '../../types';

interface TaskComposerProps {
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  defaultCategory?: 'today' | 'upcoming' | 'overdue' | 'someday';
}

export const TaskComposer: React.FC<TaskComposerProps> = ({
  onAddTask,
  defaultCategory = 'today'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [title, setTitle] = useState('');
  const [dueText, setDueText] = useState('Today');
  const [priority, setPriority] = useState<TaskPriority>('low');
  const [labels, setLabels] = useState<string[]>(['Personal']);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Parse natural language or handle slash commands
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);

    if (val.endsWith('/')) {
      setShowSlashMenu(true);
    } else if (!val.includes('/')) {
      setShowSlashMenu(false);
    }
  };

  const handleSlashCommand = (cmd: string) => {
    const cleanTitle = title.replace(/\/.*$/, '').trim();
    if (cmd === '/today') {
      setDueText('Today');
      setTitle(cleanTitle ? cleanTitle + ' ' : '');
    } else if (cmd === '/tomorrow') {
      setDueText('Tomorrow');
      setTitle(cleanTitle ? cleanTitle + ' ' : '');
    } else if (cmd === '/next week') {
      setDueText('Next week');
      setTitle(cleanTitle ? cleanTitle + ' ' : '');
    } else if (cmd === '/priority') {
      setShowPriorityMenu(true);
      setTitle(cleanTitle ? cleanTitle + ' ' : '');
    } else if (cmd === '/label') {
      setShowLabelMenu(true);
      setTitle(cleanTitle ? cleanTitle + ' ' : '');
    }
    setShowSlashMenu(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: '',
      completed: false,
      viewCategory: dueText.toLowerCase().includes('tomorrow') || dueText.toLowerCase().includes('next') ? 'upcoming' : defaultCategory,
      dueText: dueText,
      labels: labels.length > 0 ? labels : ['Personal'],
      priority: priority,
      xpReward: 15
    });

    setTitle('');
    setIsFocused(false);
    setShowSlashMenu(false);
    setShowPriorityMenu(false);
    setShowLabelMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      setShowSlashMenu(false);
    }
  };

  return (
    <div className="relative mb-4">
      {!isFocused ? (
        // Unfocused single-line bar
        <div
          id="quick-add-task-trigger"
          onClick={() => {
            setIsFocused(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="h-[48px] px-4 rounded-xl border border-[#E2E8F0] dark:border-[#27272A] bg-white dark:bg-[#121214] hover:bg-[#F8FAFC] dark:hover:bg-[#18181B] flex items-center justify-between cursor-text transition-colors text-sm text-[#94A3B8] select-none"
        >
          <div className="flex items-center gap-2.5">
            <Plus className="w-4 h-4 text-[#6366F1]" />
            <span className="text-[#64748B] dark:text-[#94A3B8]">
              Add a task... (Type &apos;/&apos; for commands)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#CBD5E1] dark:text-[#52525B]">
            <Command className="w-3.5 h-3.5" />
          </div>
        </div>
      ) : (
        // Focused composer state
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#121214] border-2 border-[#6366F1]/60 dark:border-[#6366F1]/50 rounded-2xl p-4 shadow-md transition-all animate-in fade-in zoom-in-98 duration-150"
        >
          {/* Main Title Input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Read 20 pages everyday at 9pm"
              className="w-full text-sm sm:text-base font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] bg-transparent focus:outline-none"
            />
          </div>

          {/* Quick Active Chips Preview */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-[#F1F5F9] dark:border-[#27272A]">
            <span className="text-xs text-[#6366F1] bg-[#EEF2FF] dark:bg-[#1E1B4B] px-2 py-0.5 rounded-md font-medium">
              📅 {dueText}
            </span>

            {priority !== 'low' && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                priority === 'high' ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#FEF3C7] text-[#D97706]'
              }`}>
                🚩 {priority}
              </span>
            )}

            {labels.map((lbl) => (
              <span key={lbl} className="text-xs bg-[#F1F5F9] dark:bg-[#27272A] text-[#475569] dark:text-[#CBD5E1] px-2 py-0.5 rounded-md">
                🏷️ {lbl}
              </span>
            ))}
          </div>

          {/* Composer Footer Actions */}
          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8]">
              {/* Date Quick Button */}
              <button
                type="button"
                onClick={() => setDueText(dueText === 'Today' ? 'Tomorrow' : 'Today')}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                title="Toggle Date"
              >
                <Calendar className="w-4 h-4" />
              </button>

              {/* Priority Flag Button */}
              <button
                type="button"
                onClick={() => setPriority(priority === 'high' ? 'low' : priority === 'medium' ? 'high' : 'medium')}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                title="Cycle Priority"
              >
                <Flag className="w-4 h-4" />
              </button>

              {/* Tag Button */}
              <button
                type="button"
                onClick={() => {
                  const lbl = window.prompt('Enter label (Study, Health, Personal, Projects, Workout):');
                  if (lbl) setLabels([lbl]);
                }}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                title="Add Label"
              >
                <Tag className="w-4 h-4" />
              </button>

              {/* Recurrence Button */}
              <button
                type="button"
                onClick={() => setDueText(dueText + ' (Daily)')}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                title="Repeat"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Cancel & Submit */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFocused(false)}
                className="px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                Add Task
              </button>
            </div>
          </div>

          {/* Slash Command Suggestions Menu */}
          {showSlashMenu && (
            <div className="mt-3 p-1.5 bg-[#F8FAFC] dark:bg-[#18181B] border border-[#E2E8F0] dark:border-[#27272A] rounded-xl shadow-sm text-xs flex flex-col gap-0.5 animate-in fade-in duration-100">
              <button
                type="button"
                onClick={() => handleSlashCommand('/today')}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-white dark:hover:bg-[#27272A]"
              >
                <span className="font-semibold text-[#6366F1]">/today</span>
                <span className="text-[#64748B]">Set due date to today</span>
              </button>
              <button
                type="button"
                onClick={() => handleSlashCommand('/tomorrow')}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-white dark:hover:bg-[#27272A]"
              >
                <span className="font-semibold text-[#6366F1]">/tomorrow</span>
                <span className="text-[#64748B]">Set due date to tomorrow</span>
              </button>
              <button
                type="button"
                onClick={() => handleSlashCommand('/next week')}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-white dark:hover:bg-[#27272A]"
              >
                <span className="font-semibold text-[#6366F1]">/next week</span>
                <span className="text-[#64748B]">Set due date to next week</span>
              </button>
              <button
                type="button"
                onClick={() => handleSlashCommand('/everyday')}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-white dark:hover:bg-[#27272A]"
              >
                <span className="font-semibold text-[#6366F1]">/everyday</span>
                <span className="text-[#64748B]">Make it a recurring task</span>
              </button>
              <button
                type="button"
                onClick={() => handleSlashCommand('/label')}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-white dark:hover:bg-[#27272A]"
              >
                <span className="font-semibold text-[#6366F1]">/label</span>
                <span className="text-[#64748B]">Add a label</span>
              </button>
              <button
                type="button"
                onClick={() => handleSlashCommand('/priority')}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-white dark:hover:bg-[#27272A]"
              >
                <span className="font-semibold text-[#6366F1]">/priority</span>
                <span className="text-[#64748B]">Set priority (high, medium, low)</span>
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
