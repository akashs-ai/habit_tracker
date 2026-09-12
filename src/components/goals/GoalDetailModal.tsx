import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Edit2, 
  MoreHorizontal, 
  Check, 
  Plus, 
  Flag, 
  Calendar, 
  CheckSquare, 
  Trash2,
  Code,
  Heart,
  BookOpen,
  Globe,
  Target,
  Brain
} from 'lucide-react';
import { DetailedGoal } from '../../types';

interface GoalDetailModalProps {
  goal: DetailedGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateGoal: (updatedGoal: DetailedGoal) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  goal,
  isOpen,
  onClose,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'milestones' | 'notes'>('overview');
  const [newSubgoalTitle, setNewSubgoalTitle] = useState('');
  const [isAddingSubgoal, setIsAddingSubgoal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesContent, setNotesContent] = useState(goal?.notes || '');

  if (!isOpen || !goal) return null;

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

  // Subgoal toggle
  const handleToggleSubgoal = (subgoalId: string) => {
    if (!goal.subtasks) return;
    const updatedSubtasks = goal.subtasks.map((st) =>
      st.id === subgoalId ? { ...st, completed: !st.completed } : st
    );

    const completedCount = updatedSubtasks.filter((s) => s.completed).length;
    const progress = Math.round((completedCount / updatedSubtasks.length) * 100);

    onUpdateGoal({
      ...goal,
      subtasks: updatedSubtasks,
      progress,
    });
  };

  // Add subgoal
  const handleAddSubgoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubgoalTitle.trim()) return;

    const newSubtask = {
      id: `st-${Date.now()}`,
      title: newSubgoalTitle.trim(),
      completed: false,
    };

    const updatedSubtasks = [...(goal.subtasks || []), newSubtask];
    const completedCount = updatedSubtasks.filter((s) => s.completed).length;
    const progress = Math.round((completedCount / updatedSubtasks.length) * 100);

    onUpdateGoal({
      ...goal,
      subtasks: updatedSubtasks,
      progress,
    });

    setNewSubgoalTitle('');
    setIsAddingSubgoal(false);
  };

  // Save notes
  const handleSaveNotes = () => {
    onUpdateGoal({
      ...goal,
      notes: notesContent,
    });
    setIsEditingNotes(false);
  };

  // SVG circular progress calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goal.progress / 100) * circumference;

  return (
    <div
      id="goal-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="goal-detail-modal-card"
        className="w-full max-w-[640px] bg-[#141821] text-[#F7F8FC] border border-white/10 rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-150 p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#697388] hover:text-[#F7F8FC] hover:bg-white/5 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Goal Icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
            >
              <IconComponent className="w-4 h-4" />
            </div>

            {/* Title & Category */}
            <div className="flex flex-col min-w-0">
              <h3 className="text-base font-semibold text-[#F7F8FC] truncate">
                {goal.title}
              </h3>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider w-fit"
                style={{ color: goal.color }}
              >
                {goal.category}
              </span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 text-[#697388]">
            <button
              onClick={() => setIsEditingNotes(!isEditingNotes)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/5 hover:text-white transition-colors text-xs font-medium"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                aria-label="More"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-8 w-36 bg-[#181D27] border border-white/10 rounded-xl shadow-2xl py-1 z-30 animate-in fade-in duration-100">
                  <button
                    onClick={() => {
                      onDeleteGoal(goal.id);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#FF5C67] hover:bg-[#FF5C67]/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete goal</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-white/6 overflow-x-auto no-scrollbar">
          {(['overview', 'tasks', 'milestones', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[#6C63FF] text-white'
                  : 'text-[#697388] hover:text-[#A5AEC2] hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="mt-5 flex flex-col gap-5">
            {/* Metrics Row: Gauge + Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0E1118] p-4 rounded-xl border border-white/6 items-center">
              {/* Circular Gauge */}
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
                    <circle
                      cx="35"
                      cy="35"
                      r={radius}
                      className="stroke-white/10"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="35"
                      cy="35"
                      r={radius}
                      className="stroke-[#6C63FF] transition-all duration-700 ease-out"
                      strokeWidth="5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-[#F7F8FC]">
                    {goal.progress}%
                  </span>
                </div>
              </div>

              {/* Tasks completed */}
              <div className="flex flex-col">
                <span className="text-base font-bold text-[#F7F8FC] tabular-nums">
                  {goal.completedTasks}/{goal.totalTasks}
                </span>
                <span className="text-[11px] text-[#697388]">Tasks completed</span>
              </div>

              {/* Target date */}
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#F7F8FC]">
                  {goal.dueDate}
                </span>
                <span className="text-[11px] text-[#697388]">Target date</span>
              </div>

              {/* Priority */}
              <div className="flex flex-col">
                <span className="flex items-center gap-1 text-xs font-semibold text-[#FF5C67]">
                  <Flag className="w-3 h-3 fill-current" />
                  <span>{goal.priority.toUpperCase()}</span>
                </span>
                <span className="text-[11px] text-[#697388]">Priority</span>
              </div>
            </div>

            {/* Description */}
            {goal.description && (
              <div className="bg-[#0E1118] p-3.5 rounded-xl border border-white/6 text-xs text-[#A5AEC2] leading-relaxed">
                {goal.description}
              </div>
            )}

            {/* Subgoals Checklist */}
            <div>
              <h4 className="text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider mb-2">
                Subgoals
              </h4>

              <div className="flex flex-col gap-1.5">
                {goal.subtasks?.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => handleToggleSubgoal(st.id)}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs text-[#F7F8FC]"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        st.completed
                          ? 'bg-[#6C63FF] border-[#6C63FF] text-white'
                          : 'border-white/20 hover:border-[#6C63FF]'
                      }`}
                    >
                      {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={st.completed ? 'line-through text-[#697388]' : ''}>
                      {st.title}
                    </span>
                  </div>
                ))}

                {isAddingSubgoal ? (
                  <form onSubmit={handleAddSubgoal} className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newSubgoalTitle}
                      onChange={(e) => setNewSubgoalTitle(e.target.value)}
                      placeholder="Add subtask title..."
                      autoFocus
                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-white/12 bg-[#0E1118] text-[#F7F8FC] focus:outline-none focus:border-[#6C63FF]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs bg-[#6C63FF] text-white rounded-lg hover:bg-[#7B73FF]"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingSubgoal(false)}
                      className="px-2 text-xs text-[#697388] hover:text-white"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingSubgoal(true)}
                    className="flex items-center gap-1.5 text-xs text-[#6C63FF] hover:text-[#8B82FF] font-medium w-fit mt-1 pl-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add subgoal</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tasks */}
        {activeTab === 'tasks' && (
          <div className="mt-5 flex flex-col gap-3">
            <p className="text-xs text-[#697388]">
              Track execution tasks contributing directly to this overarching goal.
            </p>
            <div className="flex flex-col gap-2">
              {goal.subtasks?.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-3 bg-[#0E1118] rounded-xl border border-white/6 text-xs text-[#F7F8FC]"
                >
                  <span className={st.completed ? 'line-through text-[#697388]' : ''}>
                    {st.title}
                  </span>
                  <button
                    onClick={() => handleToggleSubgoal(st.id)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold ${
                      st.completed
                        ? 'bg-[#31C48D]/20 text-[#31C48D]'
                        : 'bg-white/5 text-[#A5AEC2] hover:bg-[#6C63FF] hover:text-white'
                    }`}
                  >
                    {st.completed ? 'Done' : 'Mark Complete'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Milestones */}
        {activeTab === 'milestones' && (
          <div className="mt-5 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider mb-1">
              Key Checkpoints
            </h4>
            <div className="flex flex-col gap-2">
              {goal.milestones?.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 bg-[#0E1118] rounded-xl border border-white/6 text-xs text-[#F7F8FC]"
                >
                  <div>
                    <div className="font-semibold text-[#F7F8FC]">{m.title}</div>
                    <div className="text-[11px] text-[#697388] mt-0.5">Target: {m.targetDate}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      m.completed ? 'bg-[#31C48D]/20 text-[#31C48D]' : 'bg-white/10 text-[#697388]'
                    }`}
                  >
                    {m.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Notes */}
        {activeTab === 'notes' && (
          <div className="mt-5 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider">
              Strategic Notes & Reflections
            </h4>
            <textarea
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              placeholder="Jot down notes, insights, roadblocks, or next steps..."
              rows={5}
              className="w-full p-3.5 bg-[#0E1118] border border-white/10 rounded-xl text-xs text-[#F7F8FC] focus:outline-none focus:border-[#6C63FF] resize-none leading-relaxed"
            />
            <button
              onClick={handleSaveNotes}
              className="self-end px-4 py-1.5 rounded-lg bg-[#6C63FF] hover:bg-[#7B73FF] text-white text-xs font-semibold transition-colors"
            >
              Save Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
