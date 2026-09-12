import React, { useState } from 'react';
import { 
  Check, 
  Flag, 
  MoreVertical, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Trash2
} from 'lucide-react';
import { TaskItem } from '../../types';
import { TaskDetailExpanded } from './TaskDetailExpanded';

interface TaskRowProps {
  task: TaskItem;
  onToggleComplete: (id: string) => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onToggleComplete,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(task.id === 'task-1'); // Default expand first task to show rich detail
  const [isCompleting, setIsCompleting] = useState(false);
  const [showXpAnim, setShowXpAnim] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      setIsCompleting(true);
      setShowXpAnim(true);
      setTimeout(() => {
        onToggleComplete(task.id);
        setIsCompleting(false);
      }, 350);
      setTimeout(() => {
        setShowXpAnim(false);
      }, 1200);
    } else {
      onToggleComplete(task.id);
    }
  };

  const getLabelBadgeStyle = (label: string) => {
    const l = label.toLowerCase();
    if (l === 'study' || l === 'dsa') {
      return 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#1E1B4B] dark:text-[#A5B4FC]';
    }
    if (l === 'health') {
      return 'bg-[#ECFDF5] text-[#059669] dark:bg-[#064E3B] dark:text-[#6EE7B7]';
    }
    if (l === 'reading') {
      return 'bg-[#EEF2FF] text-[#6366F1] dark:bg-[#1E1B4B] dark:text-[#C7D2FE]';
    }
    if (l === 'projects') {
      return 'bg-[#FAF5FF] text-[#9333EA] dark:bg-[#3B0764] dark:text-[#E9D5FF]';
    }
    if (l === 'personal') {
      return 'bg-[#FFF1F2] text-[#E11D48] dark:bg-[#4C0519] dark:text-[#FECDD3]';
    }
    if (l === 'workout') {
      return 'bg-[#FEF3C7] text-[#D97706] dark:bg-[#451A03] dark:text-[#FDE68A]';
    }
    return 'bg-[#F1F5F9] text-[#475569] dark:bg-[#1E293B] dark:text-[#94A3B8]';
  };

  const getPriorityColor = () => {
    if (task.priority === 'high') return 'text-[#EF4444]';
    if (task.priority === 'medium') return 'text-[#F59E0B]';
    return 'text-[#94A3B8] dark:text-[#64748B]';
  };

  const isCompleted = task.completed || isCompleting;

  return (
    <div className="flex flex-col group">
      {/* Main Tactile Task Row */}
      <div 
        id={`task-row-${task.id}`}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative min-h-[56px] sm:min-h-[62px] px-3.5 sm:px-4 py-2.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer select-none ${
          isExpanded 
            ? 'bg-[#FAFAFC] dark:bg-[#18181B] border-[#CBD5E1] dark:border-[#3F3F46] shadow-xs'
            : isCompleted
            ? 'bg-[#F8FAFC]/60 dark:bg-[#121214]/60 border-[#F1F5F9] dark:border-[#1F1F23]'
            : 'bg-white dark:bg-[#121214] border-[#E2E8F0] dark:border-[#27272A] hover:bg-[#F8FAFC] dark:hover:bg-[#18181B] hover:border-[#CBD5E1] dark:hover:border-[#3F3F46]'
        }`}
      >
        {/* Left Section: Completion Control + Title + Tags */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Circular Completion Button */}
          <div className="relative shrink-0">
            <button
              id={`task-check-${task.id}`}
              onClick={handleCompleteClick}
              aria-label={isCompleted ? 'Mark incomplete' : 'Mark completed'}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 transform active:scale-90 ${
                isCompleted 
                  ? 'bg-[#6366F1] border-[#6366F1] text-white' 
                  : 'border-[#CBD5E1] dark:border-[#52525B] hover:border-[#6366F1] bg-transparent'
              }`}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in-50 duration-150" />}
            </button>

            {/* Rising XP micro-celebration animation */}
            {showXpAnim && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#6366F1] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md shadow-md pointer-events-none flex items-center gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Sparkles className="w-2.5 h-2.5 fill-white" />
                <span>+{task.xpReward || 15}XP</span>
              </div>
            )}
          </div>

          {/* Title and Labels */}
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            <span className={`text-sm font-medium transition-colors ${
              isCompleted 
                ? 'line-through text-[#94A3B8] dark:text-[#64748B]' 
                : 'text-[#0F172A] dark:text-[#F8FAFC]'
            }`}>
              {task.title}
            </span>

            {/* Tags / Labels */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {task.labels.map((label) => (
                <span 
                  key={label}
                  className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md ${getLabelBadgeStyle(label)}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Due Date, Priority Flag, Actions Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Due Text */}
          <span className={`text-xs font-normal whitespace-nowrap ${
            isCompleted 
              ? 'text-[#94A3B8] dark:text-[#64748B]' 
              : 'text-[#64748B] dark:text-[#94A3B8]'
          }`}>
            {task.dueText}
          </span>

          {/* Priority Flag */}
          <Flag className={`w-3.5 h-3.5 fill-current ${getPriorityColor()}`} />

          {/* More actions button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] transition-colors"
              aria-label="Task options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Context menu popover */}
            {showMenu && (
              <div 
                className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#18181B] border border-[#E2E8F0] dark:border-[#27272A] rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#27272A] flex items-center justify-between"
                >
                  <span>{isExpanded ? 'Collapse' : 'Expand details'}</span>
                </button>
                <button
                  onClick={() => {
                    onToggleComplete(task.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#27272A]"
                >
                  <span>{task.completed ? 'Mark incomplete' : 'Mark complete'}</span>
                </button>
                <div className="border-t border-[#F1F5F9] dark:border-[#27272A] my-1" />
                <button
                  onClick={() => {
                    onDeleteTask(task.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#450A0A] flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Task Detail (Subtasks, Notes, Attachments) */}
      {isExpanded && (
        <TaskDetailExpanded
          task={task}
          onToggleComplete={onToggleComplete}
          onUpdateTask={onUpdateTask}
          onClose={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};
