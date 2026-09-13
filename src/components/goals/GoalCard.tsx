import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  CheckSquare, 
  Calendar, 
  Code, 
  Heart, 
  BookOpen, 
  Globe, 
  Target, 
  Brain, 
  ExternalLink,
  Edit2,
  Plus,
  Copy,
  Archive,
  Trash2
} from 'lucide-react';
import { DetailedGoal } from '../../types';

interface GoalCardProps {
  goal: DetailedGoal;
  onSelect: (goal: DetailedGoal) => void;
  onEdit: (goal: DetailedGoal) => void;
  onAddMilestone: (goal: DetailedGoal) => void;
  onDuplicate: (goal: DetailedGoal) => void;
  onToggleArchive: (goal: DetailedGoal) => void;
  onDelete: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onSelect,
  onEdit,
  onAddMilestone,
  onDuplicate,
  onToggleArchive,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getIcon = () => {
    switch (goal.icon) {
      case 'code':
        return Code;
      case 'heart':
        return Heart;
      case 'book':
        return BookOpen;
      case 'globe':
        return Globe;
      case 'target':
        return Target;
      case 'brain':
        return Brain;
      default:
        return Target;
    }
  };

  const IconComponent = getIcon();

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Career':
        return 'bg-[#6C63FF]/15 text-[#8B82FF] border-[#6C63FF]/30';
      case 'Health':
        return 'bg-[#31C48D]/15 text-[#31C48D] border-[#31C48D]/30';
      case 'Learning':
        return 'bg-[#8B82FF]/15 text-[#A5A0FF] border-[#8B82FF]/30';
      case 'Personal':
        return 'bg-[#F59E0B]/15 text-[#F5B942] border-[#F59E0B]/30';
      case 'Projects':
        return 'bg-[#4F8CFF]/15 text-[#4F8CFF] border-[#4F8CFF]/30';
      default:
        return 'bg-white/10 text-[#A5AEC2] border-white/15';
    }
  };

  return (
    <div
      id={`goal-card-${goal.id}`}
      onClick={() => onSelect(goal)}
      className="group relative flex flex-col justify-between bg-white dark:bg-[#141821] hover:bg-slate-50 dark:hover:bg-[#181D27] border border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/16 rounded-[14px] p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 select-none"
    >
      {/* Top Row: Icon + Title/Category + Three-dot Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon Box */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${goal.color}20`,
              borderColor: `${goal.color}40`,
              color: goal.color,
            }}
          >
            <IconComponent className="w-4 h-4" />
          </div>

          {/* Title & Category */}
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-[#F7F8FC] group-hover:text-slate-950 dark:group-hover:text-white truncate">
              {goal.title}
            </h3>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md border w-fit mt-1 leading-none ${getCategoryBadgeColor(
                goal.category
              )}`}
            >
              {goal.category}
            </span>
          </div>
        </div>

        {/* Action Menu Trigger */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-[#697388] hover:text-slate-900 dark:hover:text-[#F7F8FC] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="More actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Three-dot Dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#181D27] border border-slate-200 dark:border-white/12 rounded-xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onSelect(goal);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-[#A5AEC2] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open goal</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(goal);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-[#A5AEC2] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit goal</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onAddMilestone(goal);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-[#A5AEC2] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add milestone</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onDuplicate(goal);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-[#A5AEC2] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onToggleArchive(goal);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-[#A5AEC2] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{goal.status === 'archived' ? 'Unarchive' : 'Archive'}</span>
              </button>

              <div className="my-1 border-t border-slate-200 dark:border-white/8" />

              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(goal.id);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-[#FF5C67] hover:bg-[#FF5C67]/10 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description (max 2 lines clamped) */}
      <p className="text-xs text-slate-600 dark:text-[#A5AEC2] mt-3 line-clamp-2 leading-relaxed min-h-[36px]">
        {goal.description}
      </p>

      {/* Progress Bar & Percentage */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex-1 h-2 bg-slate-200 dark:bg-[#0E1118] rounded-full overflow-hidden mr-3">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${goal.progress}%`,
                backgroundColor: goal.color,
              }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-900 dark:text-[#F7F8FC] tabular-nums shrink-0">
            {goal.progress}%
          </span>
        </div>
      </div>

      {/* Footer: Completed tasks + Due Date + Optional Collaborator */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#697388] mt-3 pt-3 border-t border-slate-200 dark:border-white/6">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="tabular-nums">
              {goal.completedTasks}/{goal.totalTasks} tasks
            </span>
          </span>

          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Due {goal.dueDate}</span>
          </span>
        </div>

        {goal.collaborator && (
          <div
            className="w-5 h-5 rounded-full overflow-hidden border border-slate-300 dark:border-white/10 shrink-0"
            title={goal.collaborator.name}
          >
            {goal.collaborator.avatarUrl ? (
              <img
                src={goal.collaborator.avatarUrl}
                alt={goal.collaborator.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#6C63FF] text-white text-[9px] flex items-center justify-center font-bold">
                {goal.collaborator.name[0]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
