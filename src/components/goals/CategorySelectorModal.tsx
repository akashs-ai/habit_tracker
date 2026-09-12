import React, { useState } from 'react';
import { X, Code, Heart, BookOpen, User, FolderGit2, Plus, Check } from 'lucide-react';
import { GoalCategory } from '../../types';

interface CategorySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: GoalCategory;
  onSelectCategory: (category: GoalCategory) => void;
}

export const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
}) => {
  const [currentSelected, setCurrentSelected] = useState<GoalCategory>(selectedCategory);

  if (!isOpen) return null;

  const categories: { id: GoalCategory; label: string; icon: any; color: string }[] = [
    { id: 'Career', label: 'Career', icon: Code, color: '#6C63FF' },
    { id: 'Health', label: 'Health', icon: Heart, color: '#31C48D' },
    { id: 'Learning', label: 'Learning', icon: BookOpen, color: '#F59E0B' },
    { id: 'Personal', label: 'Personal', icon: User, color: '#FF5C67' },
    { id: 'Projects', label: 'Projects', icon: FolderGit2, color: '#4F8CFF' },
    { id: 'Custom', label: 'Custom', icon: Plus, color: '#06B6D4' },
  ];

  const handleConfirm = () => {
    onSelectCategory(currentSelected);
    onClose();
  };

  return (
    <div
      id="category-selector-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="category-selector-modal-card"
        className="w-full max-w-[460px] bg-[#141821] text-[#F7F8FC] border border-white/10 rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.5)] p-5 sm:p-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <h3 className="text-base font-semibold text-[#F7F8FC]">
            Choose a category
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#697388] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid (2 rows x 3 cols) */}
        <div className="grid grid-cols-3 gap-3 my-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = currentSelected === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setCurrentSelected(cat.id)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-[#6C63FF]/20 border-[#6C63FF] shadow-xs'
                    : 'bg-[#0E1118] hover:bg-[#181D27] border-white/8 text-[#A5AEC2] hover:text-white'
                }`}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                  style={{
                    backgroundColor: `${cat.color}25`,
                    color: cat.color,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <span className="text-xs font-semibold text-[#F7F8FC]">
                  {cat.label}
                </span>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#6C63FF] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#A5AEC2] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#7B73FF] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
