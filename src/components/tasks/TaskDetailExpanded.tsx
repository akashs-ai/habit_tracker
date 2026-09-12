import React, { useState } from 'react';
import { 
  Check, 
  Calendar, 
  Flag, 
  Paperclip, 
  Plus, 
  Pencil, 
  Bookmark, 
  MoreHorizontal,
  FileText,
  Trash2
} from 'lucide-react';
import { TaskItem } from '../../types';

interface TaskDetailExpandedProps {
  task: TaskItem;
  onToggleComplete: (id: string) => void;
  onUpdateTask: (updated: TaskItem) => void;
  onClose?: () => void;
}

export const TaskDetailExpanded: React.FC<TaskDetailExpandedProps> = ({
  task,
  onToggleComplete,
  onUpdateTask,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [noteInput, setNoteInput] = useState(task.notes || '');

  const handleToggleSubtask = (subtaskId: string) => {
    if (!task.subtasks) return;
    const updatedSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks
    });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSt = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    onUpdateTask({
      ...task,
      subtasks: [...(task.subtasks || []), newSt]
    });
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const handleSaveNote = () => {
    onUpdateTask({
      ...task,
      notes: noteInput
    });
  };

  return (
    <div 
      id={`task-detail-expanded-${task.id}`}
      className="bg-white dark:bg-[#18181B] border border-[#E2E8F0] dark:border-[#27272A] rounded-2xl p-5 shadow-sm mt-3 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
              task.completed 
                ? 'bg-[#6366F1] border-[#6366F1] text-white' 
                : 'border-[#CBD5E1] dark:border-[#475569] hover:border-[#6366F1]'
            }`}
          >
            {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          {/* Title & Description */}
          <div className="flex-1">
            <h3 className={`text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] ${task.completed ? 'line-through text-opacity-60' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-[#94A3B8] dark:text-[#64748B]">
          <button className="p-1.5 hover:text-[#0F172A] dark:hover:text-[#F8FAFC] rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#27272A]">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:text-[#0F172A] dark:hover:text-[#F8FAFC] rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#27272A]">
            <Bookmark className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:text-[#0F172A] dark:hover:text-[#F8FAFC] rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#27272A]">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta Pills: Labels, Priority, Due Date */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#F1F5F9] dark:border-[#27272A]">
        {task.labels.map((lbl) => (
          <span 
            key={lbl}
            className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#4F46E5] dark:text-[#A5B4FC]"
          >
            {lbl}
          </span>
        ))}

        {task.priority === 'high' && (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FEE2E2] dark:bg-[#450A0A] text-[#EF4444]">
            <Flag className="w-3 h-3 fill-current" />
            <span>High</span>
          </span>
        )}

        <div className="flex items-center gap-1 text-xs text-[#64748B] dark:text-[#94A3B8] ml-auto">
          <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>{task.dueText}</span>
        </div>
      </div>

      {/* Subtasks Checklist */}
      <div className="mt-4 flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-[#64748B]">
          Subtasks
        </h4>
        <div className="flex flex-col gap-1.5 pl-1">
          {task.subtasks?.map((st) => (
            <label 
              key={st.id} 
              className="flex items-center gap-2.5 text-xs text-[#334155] dark:text-[#CBD5E1] cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={st.completed}
                onChange={() => handleToggleSubtask(st.id)}
                className="w-4 h-4 rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] cursor-pointer"
              />
              <span className={st.completed ? 'line-through text-[#94A3B8] dark:text-[#64748B]' : ''}>
                {st.title}
              </span>
            </label>
          ))}

          {isAddingSubtask ? (
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Enter subtask name..."
                autoFocus
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 text-xs bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5]"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSubtask(false)}
                className="px-2 text-xs text-[#64748B] hover:text-[#0F172A]"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingSubtask(true)}
              className="flex items-center gap-1.5 text-xs text-[#6366F1] dark:text-[#A5B4FC] font-medium hover:underline w-fit mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add subtask</span>
            </button>
          )}
        </div>
      </div>

      {/* Note Input */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          onBlur={handleSaveNote}
          placeholder="Add note..."
          className="flex-1 h-9 px-3 text-xs bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
        />
      </div>

      {/* Attachments */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2.5">
          {task.attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#27272A] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs"
            >
              <div className="w-6 h-6 rounded bg-[#FEE2E2] dark:bg-[#450A0A] flex items-center justify-center text-[#EF4444]">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">{att.name}</span>
                <span className="text-[10px] text-[#94A3B8]">{att.size}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
