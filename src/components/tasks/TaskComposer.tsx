import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Flag, 
  Tag, 
  RotateCw, 
  Command, 
  X,
  Check
} from 'lucide-react';
import { TaskItem, TaskPriority } from '../../types';
import { getTodayISO, addDaysISO } from '../../utils/dateUtils';

interface TaskComposerProps {
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  defaultCategory?: 'today' | 'upcoming' | 'overdue' | 'someday';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PRESET_TAGS = [
  { name: 'Personal', color: '#6366F1' },
  { name: 'Work', color: '#3B82F6' },
  { name: 'Study', color: '#8B5CF6' },
  { name: 'Health', color: '#10B981' },
  { name: 'Workout', color: '#22C55E' },
  { name: 'Projects', color: '#F59E0B' },
  { name: 'Reading', color: '#06B6D4' },
  { name: 'Finance', color: '#14B8A6' },
  { name: 'Urgent', color: '#EF4444' },
];

export const TaskComposer: React.FC<TaskComposerProps> = ({
  onAddTask,
  defaultCategory = 'today',
  isOpen,
  onOpenChange
}) => {
  const [internalFocused, setInternalFocused] = useState(false);
  const isFocused = isOpen !== undefined ? isOpen : internalFocused;

  const setIsFocused = (val: boolean) => {
    setInternalFocused(val);
    onOpenChange?.(val);
  };

  const [title, setTitle] = useState('');
  const [dueText, setDueText] = useState('Today');
  const [priority, setPriority] = useState<TaskPriority>('low');
  const [labels, setLabels] = useState<string[]>(['Personal']);
  const [customTagInput, setCustomTagInput] = useState('');
  
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [hasEmptyError, setHasEmptyError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically whenever composer opens
  useEffect(() => {
    if (isFocused) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [isFocused]);

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

  const toggleTag = (tagName: string) => {
    setLabels((prev) => {
      if (prev.includes(tagName)) {
        const next = prev.filter((t) => t !== tagName);
        return next.length > 0 ? next : ['Personal'];
      } else {
        return [...prev, tagName];
      }
    });
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!labels.includes(trimmed)) {
      setLabels((prev) => [...prev, trimmed]);
    }
    setCustomTagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setHasEmptyError(true);
      setTimeout(() => setHasEmptyError(false), 2400);
      inputRef.current?.focus();
      return;
    }
    setHasEmptyError(false);

    const localToday = getTodayISO();
    let computedCategory = defaultCategory;
    let computedDueDate = localToday;

    const dueLower = dueText.toLowerCase();
    if (dueLower.includes('tomorrow')) {
      computedCategory = 'upcoming';
      computedDueDate = addDaysISO(localToday, 1);
    } else if (dueLower.includes('next week') || dueLower.includes('next')) {
      computedCategory = 'upcoming';
      computedDueDate = addDaysISO(localToday, 7);
    } else if (dueLower.includes('someday')) {
      computedCategory = 'someday';
    }

    onAddTask({
      title: title.trim(),
      description: '',
      completed: false,
      viewCategory: computedCategory,
      dueText: dueText,
      dueTime: '10:00 AM',
      dueDate: computedDueDate,
      clientDate: localToday,
      labels: labels.length > 0 ? labels : ['Personal'],
      priority: priority,
      xpReward: 15
    });

    setTitle('');
    setIsFocused(false);
    setShowSlashMenu(false);
    setShowPriorityMenu(false);
    setShowLabelMenu(false);
    setShowDateMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      setShowSlashMenu(false);
      setShowPriorityMenu(false);
      setShowLabelMenu(false);
      setShowDateMenu(false);
    }
  };

  return (
    <div id="tasks-composer-wrapper" className="relative mb-4">
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
          id="active-task-composer-form"
          onSubmit={handleSubmit}
          className={`bg-white dark:bg-[#121214] border-2 ${
            hasEmptyError ? 'border-rose-500 shadow-rose-500/20' : 'border-[#6366F1]/60 dark:border-[#6366F1]/50'
          } rounded-2xl p-4 shadow-md transition-all animate-in fade-in zoom-in-98 duration-150 relative`}
        >
          {hasEmptyError && (
            <div className="mb-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in">
              Please enter a task title first.
            </div>
          )}
          {/* Main Title Input */}
          <div className="relative">
            <input
              ref={inputRef}
              id="active-task-title-input"
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
            <span className="text-xs text-[#6366F1] bg-[#EEF2FF] dark:bg-[#1E1B4B] px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
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
              <span key={lbl} className="inline-flex items-center gap-1 text-xs bg-[#F1F5F9] dark:bg-[#27272A] text-[#475569] dark:text-[#CBD5E1] px-2 py-0.5 rounded-md">
                🏷️ {lbl}
                <button
                  type="button"
                  onClick={() => toggleTag(lbl)}
                  className="hover:text-[#EF4444] transition-colors ml-0.5"
                  title="Remove tag"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Composer Footer Actions */}
          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8] relative">
              {/* Date Quick Button & Popover */}
              <div className="relative">
                <button
                  type="button"
                  id="task-composer-date-btn"
                  onClick={() => {
                    setShowDateMenu(!showDateMenu);
                    setShowLabelMenu(false);
                    setShowPriorityMenu(false);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showDateMenu 
                      ? 'bg-[#6366F1]/15 text-[#6366F1]' 
                      : 'hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                  title="Select Due Date"
                >
                  <Calendar className="w-4 h-4" />
                </button>

                {showDateMenu && (
                  <div className="absolute left-0 bottom-full mb-2 z-50 w-44 p-1.5 bg-white dark:bg-[#1E1E22] border border-[#E2E8F0] dark:border-[#2E2E32] rounded-xl shadow-lg flex flex-col gap-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <span className="px-2 py-1 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Due Date</span>
                    {[
                      { label: 'Today', value: 'Today' },
                      { label: 'Tomorrow', value: 'Tomorrow' },
                      { label: 'Next week', value: 'Next week' },
                      { label: 'Someday', value: 'Someday' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setDueText(opt.value);
                          setShowDateMenu(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${
                          dueText === opt.value 
                            ? 'bg-[#6366F1] text-white font-medium' 
                            : 'hover:bg-[#F1F5F9] dark:hover:bg-[#2A2A30] text-[#334155] dark:text-[#E2E8F0]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {dueText === opt.value && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority Flag Button & Popover */}
              <div className="relative">
                <button
                  type="button"
                  id="task-composer-priority-btn"
                  onClick={() => {
                    setShowPriorityMenu(!showPriorityMenu);
                    setShowLabelMenu(false);
                    setShowDateMenu(false);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showPriorityMenu 
                      ? 'bg-[#6366F1]/15 text-[#6366F1]' 
                      : 'hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                  title="Set Priority"
                >
                  <Flag className="w-4 h-4" />
                </button>

                {showPriorityMenu && (
                  <div className="absolute left-0 bottom-full mb-2 z-50 w-36 p-1.5 bg-white dark:bg-[#1E1E22] border border-[#E2E8F0] dark:border-[#2E2E32] rounded-xl shadow-lg flex flex-col gap-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <span className="px-2 py-1 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Priority</span>
                    {[
                      { id: 'low', label: 'Low', color: 'text-[#64748B]' },
                      { id: 'medium', label: 'Medium', color: 'text-[#D97706]' },
                      { id: 'high', label: 'High', color: 'text-[#EF4444]' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPriority(p.id as TaskPriority);
                          setShowPriorityMenu(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${
                          priority === p.id 
                            ? 'bg-[#6366F1] text-white font-medium' 
                            : 'hover:bg-[#F1F5F9] dark:hover:bg-[#2A2A30] text-[#334155] dark:text-[#E2E8F0]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Flag className="w-3.5 h-3.5" />
                          {p.label}
                        </span>
                        {priority === p.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tag Button & Interactive Popover */}
              <div className="relative">
                <button
                  type="button"
                  id="task-composer-tag-btn"
                  onClick={() => {
                    setShowLabelMenu(!showLabelMenu);
                    setShowPriorityMenu(false);
                    setShowDateMenu(false);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showLabelMenu 
                      ? 'bg-[#6366F1]/15 text-[#6366F1]' 
                      : 'hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                  title="Select or Add Tags"
                >
                  <Tag className="w-4 h-4" />
                </button>

                {showLabelMenu && (
                  <div 
                    id="task-composer-tag-menu"
                    className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 bg-white dark:bg-[#1E1E22] border border-[#E2E8F0] dark:border-[#2E2E32] rounded-xl shadow-xl flex flex-col gap-2.5 text-xs animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] dark:border-[#27272A] pb-2">
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Select Tags</span>
                      <button
                        type="button"
                        onClick={() => setShowLabelMenu(false)}
                        className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Tag Options Grid */}
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto py-1">
                      {PRESET_TAGS.map((tag) => {
                        const isSelected = labels.includes(tag.name);
                        return (
                          <button
                            key={tag.name}
                            type="button"
                            onClick={() => toggleTag(tag.name)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all select-none ${
                              isSelected
                                ? 'bg-[#6366F1] text-white shadow-2xs'
                                : 'bg-[#F1F5F9] dark:bg-[#27272A] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#E2E8F0] dark:hover:bg-[#323238]'
                            }`}
                          >
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: isSelected ? '#FFFFFF' : tag.color }} 
                            />
                            {tag.name}
                            {isSelected && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Tag Input */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-[#F1F5F9] dark:border-[#27272A]">
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTag();
                          }
                        }}
                        placeholder="Add custom tag..."
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-[#E2E8F0] dark:border-[#2E2E32] bg-transparent text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6366F1]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTag}
                        disabled={!customTagInput.trim()}
                        className="px-2.5 py-1 bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-40 text-white rounded-lg font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recurrence Button */}
              <button
                type="button"
                onClick={() => setDueText(dueText.includes('(Daily)') ? dueText.replace(' (Daily)', '') : dueText + ' (Daily)')}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                title="Toggle Daily Recurrence"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Cancel & Submit */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsFocused(false);
                  setShowLabelMenu(false);
                  setShowPriorityMenu(false);
                  setShowDateMenu(false);
                }}
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
