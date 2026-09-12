import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Quest } from '../types';

interface AddQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuest: (quest: Omit<Quest, 'id' | 'completed'>) => void;
}

export const AddQuestModal: React.FC<AddQuestModalProps> = ({
  isOpen,
  onClose,
  onAddQuest,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<Quest['category']>('focus');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [attribute, setAttribute] = useState<Quest['attribute']>('Intellect');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const xpReward = durationMinutes >= 30 ? 50 : durationMinutes >= 20 ? 30 : 20;

    onAddQuest({
      title: title.trim(),
      subtitle: subtitle.trim() || 'Daily habit building quest.',
      category,
      durationMinutes,
      xpReward,
      attribute,
    });

    setTitle('');
    setSubtitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="add-quest-modal"
        className="w-full max-w-md bg-white dark:bg-[#18181B] rounded-3xl p-6 shadow-2xl border border-[#E5E7EB] dark:border-[#27272A] relative"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EEECFF] text-[#6366F1] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-[#111827] dark:text-[#FAFAFA]">
              New Quest
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
              Quest Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Review system architecture"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-[#F9FAFB] dark:bg-[#111113] text-sm text-[#111827] dark:text-[#FAFAFA] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C6CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] dark:text-[#A1A1AA] mb-1">
              Description / Motivation
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g., Strengthen core system design skills"
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
                onChange={(e) => setCategory(e.target.value as Quest['category'])}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-[#F9FAFB] dark:bg-[#111113] text-xs text-[#111827] dark:text-[#FAFAFA]"
              >
                <option value="focus">Focus</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4B5563] dark:text-[#A1A1AA] mb-1">
                Attribute Boost
              </label>
              <select
                value={attribute}
                onChange={(e) => setAttribute(e.target.value as Quest['attribute'])}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-[#F9FAFB] dark:bg-[#111113] text-xs text-[#111827] dark:text-[#FAFAFA]"
              >
                <option value="Intellect">Intellect</option>
                <option value="Discipline">Discipline</option>
                <option value="Strength">Strength</option>
                <option value="Knowledge">Knowledge</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] dark:text-[#A1A1AA] mb-1">
              Estimated Duration: {durationMinutes} min
            </label>
            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
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
              Create Quest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
