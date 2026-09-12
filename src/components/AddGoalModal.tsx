import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { Goal } from '../types';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: Goal) => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onAddGoal,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Goal['category']>('career');
  const [totalUnits, setTotalUnits] = useState(5);
  const [unitLabel, setUnitLabel] = useState('milestones');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let iconType: Goal['iconType'] = 'target';
    let color = '#6366F1';
    if (category === 'health') {
      iconType = 'dumbbell';
      color = '#EF4444';
    } else if (category === 'education') {
      iconType = 'book';
      color = '#F59E0B';
    }

    onAddGoal({
      id: `goal-${Date.now()}`,
      title: title.trim(),
      progressPercent: 0,
      completedUnits: 0,
      totalUnits,
      unitLabel,
      category,
      iconType,
      color,
    });

    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="add-goal-modal"
        className="w-full max-w-md bg-white dark:bg-[#18181B] rounded-3xl p-6 shadow-2xl border border-[#E5E7EB] dark:border-[#27272A] relative"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EEECFF] text-[#6366F1] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-[#111827] dark:text-[#FAFAFA]">
              New Long-Term Goal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-[#27272A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] dark:text-[#A1A1AA] mb-1">
              Goal Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Master TypeScript & Node.js"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-[#F9FAFB] dark:bg-[#111113] text-sm text-[#111827] dark:text-[#FAFAFA] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C6CFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] dark:text-[#A1A1AA] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Goal['category'])}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-[#F9FAFB] dark:bg-[#111113] text-xs text-[#111827] dark:text-[#FAFAFA]"
              >
                <option value="career">Career / Tech</option>
                <option value="health">Fitness & Health</option>
                <option value="education">Education & Books</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4B5563] dark:text-[#A1A1AA] mb-1">
                Unit Type
              </label>
              <input
                type="text"
                value={unitLabel}
                onChange={(e) => setUnitLabel(e.target.value)}
                placeholder="milestones, books, hours"
                className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-[#F9FAFB] dark:bg-[#111113] text-xs text-[#111827] dark:text-[#FAFAFA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] dark:text-[#A1A1AA] mb-1">
              Target Milestones: {totalUnits}
            </label>
            <input
              type="range"
              min="2"
              max="50"
              value={totalUnits}
              onChange={(e) => setTotalUnits(Number(e.target.value))}
              className="w-full accent-[#7C6CFF]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E7EB] dark:border-[#27272A]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#27272A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#7C6CFF] hover:bg-[#6857F5] text-white shadow-xs"
            >
              Set Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
