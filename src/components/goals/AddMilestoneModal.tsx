import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { DetailedGoal } from '../../types';

interface AddMilestoneModalProps {
  goal: DetailedGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onAddMilestone: (goalId: string, milestone: { title: string; targetDate: string; notes?: string }) => void;
}

export const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
  goal,
  isOpen,
  onClose,
  onAddMilestone,
}) => {
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [targetDate, setTargetDate] = useState('2025-03-31');
  const [notes, setNotes] = useState('');

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;

    onAddMilestone(goal.id, {
      title: milestoneTitle.trim(),
      targetDate,
      notes: notes.trim() || undefined,
    });

    setMilestoneTitle('');
    setNotes('');
    onClose();
  };

  return (
    <div
      id="add-milestone-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="add-milestone-modal-card"
        className="w-full max-w-[460px] bg-white dark:bg-[#141821] text-slate-900 dark:text-[#F7F8FC] border border-slate-200 dark:border-white/10 rounded-[16px] shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/8">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F7F8FC]">
              Add Milestone
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#697388] mt-0.5">
              Target for: {goal.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-[#697388] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-5">
          {/* Milestone Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-[#A5AEC2] uppercase tracking-wider mb-1.5">
              Milestone Title
            </label>
            <input
              type="text"
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="E.g. Complete DSA Basics"
              autoFocus
              className="w-full h-10 px-3.5 bg-slate-100 dark:bg-[#0E1118] border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F7F8FC] placeholder:text-slate-400 dark:placeholder:text-[#697388] focus:outline-none focus:border-[#6C63FF]"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-[#A5AEC2] uppercase tracking-wider mb-1.5">
              Target Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-100 dark:bg-[#0E1118] border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F7F8FC] focus:outline-none focus:border-[#6C63FF]"
              />
            </div>
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-[#A5AEC2] uppercase tracking-wider mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full p-3 bg-slate-100 dark:bg-[#0E1118] border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#F7F8FC] placeholder:text-slate-400 dark:placeholder:text-[#697388] focus:outline-none focus:border-[#6C63FF] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/8 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-[#A5AEC2] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!milestoneTitle.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#7B73FF] disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              Add Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
