import React, { useState } from 'react';
import { X, Bookmark } from 'lucide-react';
import { QuickNote } from '../types';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (note: QuickNote) => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onAddNote,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<QuickNote['type']>('yellow');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddNote({
      id: `note-${Date.now()}`,
      type,
      title: title.trim(),
      content: content.trim() || undefined,
    });

    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="add-note-modal"
        className="w-full max-w-sm bg-white dark:bg-[#18181B] rounded-3xl p-6 shadow-2xl border border-[#E5E7EB] dark:border-[#27272A] relative"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FEF08A] text-[#854D0E] flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-[#111827] dark:text-[#FAFAFA]">
              Add Quick Note
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#4B5563] dark:text-[#A1A1AA] mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Focus thought"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-[#F9FAFB] dark:bg-[#111113] text-xs text-[#111827] dark:text-[#FAFAFA] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C6CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] dark:text-[#A1A1AA] mb-1">
              Note Text
            </label>
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your reflection or reminder..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#27272A] bg-[#F9FAFB] dark:bg-[#111113] text-xs text-[#111827] dark:text-[#FAFAFA] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C6CFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B5563] dark:text-[#A1A1AA] mb-1">
              Card Color
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setType('yellow')}
                className={`w-7 h-7 rounded-lg bg-[#FEF08A] border-2 transition-all ${
                  type === 'yellow' ? 'border-[#854D0E] scale-110' : 'border-transparent'
                }`}
              />
              <button
                type="button"
                onClick={() => setType('purple')}
                className={`w-7 h-7 rounded-lg bg-[#DDD6FE] border-2 transition-all ${
                  type === 'purple' ? 'border-[#5B21B6] scale-110' : 'border-transparent'
                }`}
              />
              <button
                type="button"
                onClick={() => setType('pink')}
                className={`w-7 h-7 rounded-lg bg-[#FECDD3] border-2 transition-all ${
                  type === 'pink' ? 'border-[#9F1239] scale-110' : 'border-transparent'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB] dark:border-[#27272A]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6B7280]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#7C6CFF] text-white shadow-xs"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
