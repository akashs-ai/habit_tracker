import React, { useState } from 'react';
import { 
  X, 
  Info, 
  Flag, 
  CheckSquare, 
  Calendar, 
  Sparkles, 
  ChevronRight,
  Code,
  Heart,
  BookOpen,
  User,
  FolderGit2
} from 'lucide-react';
import { DetailedGoal, GoalCategory } from '../../types';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (newGoal: Omit<DetailedGoal, 'id'>) => void;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onCreateGoal,
}) => {
  const [activeStep, setActiveStep] = useState<'basic' | 'milestones' | 'tasks' | 'review'>('basic');

  const now = new Date();
  const currentYearEnd = `${now.getFullYear()}-12-31`;
  const defaultMilestoneDate = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Career');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(currentYearEnd);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');

  // Milestones & Tasks for next steps
  const [milestone1, setMilestone1] = useState('Complete DSA Basics');
  const [milestoneDate1, setMilestoneDate1] = useState(defaultMilestoneDate);
  const [task1, setTask1] = useState('Complete fundamental modules');
  const [task2, setTask2] = useState('Build initial prototype');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const categoryColors: Record<GoalCategory, string> = {
      Career: '#6C63FF',
      Health: '#31C48D',
      Learning: '#8B82FF',
      Personal: '#F59E0B',
      Projects: '#4F8CFF',
      Custom: '#06B6D4',
    };

    const categoryIcons: Record<GoalCategory, string> = {
      Career: 'code',
      Health: 'heart',
      Learning: 'brain',
      Personal: 'book',
      Projects: 'globe',
      Custom: 'target',
    };

    // Format dueDate to e.g. "Dec 31, 2025"
    let formattedDue = dueDate;
    try {
      const parts = dueDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      formattedDue = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {}

    onCreateGoal({
      title: title.trim(),
      category,
      description: description.trim() || 'Focus on consistent execution and daily progress.',
      progress: 0,
      completedTasks: 0,
      totalTasks: 10,
      dueDate: formattedDue,
      priority,
      status: 'active',
      color: categoryColors[category] || '#6C63FF',
      icon: categoryIcons[category] || 'target',
      subtasks: [
        { id: `st-${Date.now()}-1`, title: task1 || 'Complete foundational steps', completed: false },
        { id: `st-${Date.now()}-2`, title: task2 || 'Execute key milestone', completed: false },
      ],
      milestones: [
        { id: `m-${Date.now()}-1`, title: milestone1 || 'Phase 1 Complete', targetDate: milestoneDate1 || '2025-06-30', completed: false },
      ],
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setActiveStep('basic');
    onClose();
  };

  const steps = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'milestones', label: 'Milestones', icon: Flag },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'review', label: 'Review & Create', icon: Sparkles },
  ];

  return (
    <div
      id="create-goal-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="create-goal-modal-card"
        className="w-full max-w-[720px] bg-[#141821] text-[#F7F8FC] border border-white/10 rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col md:flex-row min-h-[460px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Stepper Sidebar (desktop & tablet) */}
        <div className="w-full md:w-56 bg-[#0E1118] p-5 border-b md:border-b-0 md:border-r border-white/8 flex md:flex-col justify-between shrink-0">
          <div className="flex flex-col gap-1 w-full">
            <h3 className="text-sm font-semibold text-[#F7F8FC] mb-4 hidden md:block">
              Create Goal
            </h3>

            <div className="flex md:flex-col gap-1 w-full overflow-x-auto no-scrollbar">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = activeStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id as any)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap ${
                      isActive
                        ? 'bg-[#6C63FF] text-white shadow-xs'
                        : 'text-[#697388] hover:text-[#A5AEC2] hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden md:block pt-4 border-t border-white/8 text-[11px] text-[#697388] leading-relaxed">
            Break big ambitions down into measurable daily steps.
          </div>
        </div>

        {/* Right Form Content */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between">
          <div>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/8">
              <h4 className="text-base font-semibold text-[#F7F8FC]">
                {activeStep === 'basic' && 'Basic Goal Details'}
                {activeStep === 'milestones' && 'Add Key Milestones'}
                {activeStep === 'tasks' && 'Initial Action Tasks'}
                {activeStep === 'review' && 'Review & Finalize'}
              </h4>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#697388] hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Basic Info */}
            {activeStep === 'basic' && (
              <div className="flex flex-col gap-4 mt-5">
                {/* Goal Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider mb-1.5">
                    Goal Title <span className="text-[#FF5C67]">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. Become a software engineer"
                    autoFocus
                    className="w-full h-10 px-3.5 bg-[#0E1118] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F7F8FC] placeholder:text-[#697388] focus:outline-none focus:border-[#6C63FF]"
                  />
                </div>

                {/* Category & Priority Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as GoalCategory)}
                      className="w-full h-10 px-3 bg-[#0E1118] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F7F8FC] focus:outline-none focus:border-[#6C63FF]"
                    >
                      <option value="Career">Career</option>
                      <option value="Health">Health</option>
                      <option value="Learning">Learning</option>
                      <option value="Personal">Personal</option>
                      <option value="Projects">Projects</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider mb-1.5">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full h-10 px-3 bg-[#0E1118] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F7F8FC] focus:outline-none focus:border-[#6C63FF]"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider mb-1.5">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Why is this goal important to you?"
                    rows={3}
                    className="w-full p-3 bg-[#0E1118] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F7F8FC] placeholder:text-[#697388] focus:outline-none focus:border-[#6C63FF] resize-none"
                  />
                </div>

                {/* Target Date */}
                <div>
                  <label className="block text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider mb-1.5">
                    Target Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full h-10 px-3.5 bg-[#0E1118] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F7F8FC] focus:outline-none focus:border-[#6C63FF]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Milestones */}
            {activeStep === 'milestones' && (
              <div className="flex flex-col gap-4 mt-5">
                <p className="text-xs text-[#A5AEC2]">
                  Set meaningful checkpoints along your journey to track progress easily.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider mb-1.5">
                    Key Milestone 1
                  </label>
                  <input
                    type="text"
                    value={milestone1}
                    onChange={(e) => setMilestone1(e.target.value)}
                    placeholder="E.g. Complete foundational certification"
                    className="w-full h-10 px-3.5 bg-[#0E1118] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F7F8FC] focus:outline-none focus:border-[#6C63FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider mb-1.5">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={milestoneDate1}
                    onChange={(e) => setMilestoneDate1(e.target.value)}
                    className="w-full h-10 px-3.5 bg-[#0E1118] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F7F8FC] focus:outline-none focus:border-[#6C63FF]"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Tasks */}
            {activeStep === 'tasks' && (
              <div className="flex flex-col gap-4 mt-5">
                <p className="text-xs text-[#A5AEC2]">
                  List initial daily or weekly actions required to begin momentum.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider mb-1.5">
                    Action Task 1
                  </label>
                  <input
                    type="text"
                    value={task1}
                    onChange={(e) => setTask1(e.target.value)}
                    placeholder="E.g. Setup development environment and repository"
                    className="w-full h-10 px-3.5 bg-[#0E1118] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F7F8FC] focus:outline-none focus:border-[#6C63FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5AEC2] uppercase tracking-wider mb-1.5">
                    Action Task 2
                  </label>
                  <input
                    type="text"
                    value={task2}
                    onChange={(e) => setTask2(e.target.value)}
                    placeholder="E.g. Build first practice module"
                    className="w-full h-10 px-3.5 bg-[#0E1118] border border-white/10 rounded-xl text-xs sm:text-sm text-[#F7F8FC] focus:outline-none focus:border-[#6C63FF]"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review & Create */}
            {activeStep === 'review' && (
              <div className="flex flex-col gap-3 mt-5 bg-[#0E1118] p-4 rounded-xl border border-white/6 text-xs text-[#A5AEC2]">
                <div className="flex items-center justify-between pb-2 border-b border-white/6">
                  <span className="font-semibold text-[#F7F8FC] text-sm">{title || 'Untitled Goal'}</span>
                  <span className="px-2 py-0.5 rounded bg-[#6C63FF]/20 text-[#8B82FF] font-semibold">
                    {category}
                  </span>
                </div>
                <div>
                  <strong className="text-[#F7F8FC]">Target Date:</strong> {dueDate}
                </div>
                <div>
                  <strong className="text-[#F7F8FC]">Priority:</strong> {priority.toUpperCase()}
                </div>
                {description && (
                  <div>
                    <strong className="text-[#F7F8FC]">Description:</strong> {description}
                  </div>
                )}
                <div>
                  <strong className="text-[#F7F8FC]">Milestone:</strong> {milestone1} ({milestoneDate1})
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/8 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#A5AEC2] hover:text-white transition-colors"
            >
              Cancel
            </button>

            {activeStep !== 'review' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 'basic') setActiveStep('milestones');
                  else if (activeStep === 'milestones') setActiveStep('tasks');
                  else if (activeStep === 'tasks') setActiveStep('review');
                }}
                disabled={!title.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#7B73FF] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#7B73FF] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Create Goal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
