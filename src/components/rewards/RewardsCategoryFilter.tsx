import React from 'react';
import { 
  Palette, 
  LayoutGrid, 
  Shield, 
  User, 
  Sparkles, 
  SlidersHorizontal, 
  Star,
  Search,
  Sliders
} from 'lucide-react';
import { RewardCategory } from '../../types';

interface RewardsCategoryFilterProps {
  activeCategory: RewardCategory;
  onSelectCategory: (category: RewardCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleFilterModal?: () => void;
}

export const RewardsCategoryFilter: React.FC<RewardsCategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onToggleFilterModal,
}) => {
  const categories: { id: RewardCategory; label: string; icon?: React.ElementType }[] = [
    { id: 'all', label: 'All' },
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'icons', label: 'Icons', icon: LayoutGrid },
    { id: 'badges', label: 'Badges', icon: Shield },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'animations', label: 'Animations', icon: Sparkles },
    { id: 'widgets', label: 'Widgets', icon: SlidersHorizontal },
    { id: 'premium', label: 'Premium', icon: Star },
  ];

  return (
    <div 
      id="rewards-category-filter"
      className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2"
    >
      {/* Scrollable category pills on mobile/desktop */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-white dark:bg-white/4 text-slate-600 dark:text-[#9AA3B5] hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 shadow-xs'
              }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-600 dark:text-[#818CF8]'}`} />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Search Input & Filter Button */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex-1 md:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#687185] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search rewards..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white dark:bg-[#121620] border border-slate-200 dark:border-white/8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#687185] focus:outline-none focus:border-[#6366F1] transition-all shadow-xs"
          />
        </div>

        <button
          onClick={onToggleFilterModal}
          className="h-9 px-3 rounded-xl bg-white dark:bg-white/4 border border-slate-200 dark:border-white/8 hover:bg-slate-100 dark:hover:bg-white/8 text-xs font-semibold text-slate-600 dark:text-[#9AA3B5] hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-[#818CF8]" />
          <span>Filter</span>
        </button>
      </div>
    </div>
  );
};
