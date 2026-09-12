import React from 'react';
import {
  GraduationCap,
  Dumbbell,
  Target,
  Calendar,
  Brain,
  MessageSquare,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { CoachPromptOption } from '../../types';

interface TryAskingGridProps {
  prompts: CoachPromptOption[];
  onSelectPrompt: (prompt: CoachPromptOption) => void;
  onSeeAll?: () => void;
}

export const TryAskingGrid: React.FC<TryAskingGridProps> = ({
  prompts,
  onSelectPrompt,
  onSeeAll,
}) => {
  const getIcon = (iconType: CoachPromptOption['icon']) => {
    switch (iconType) {
      case 'study':
        return <GraduationCap className="w-4 h-4 text-[#38BDF8]" />;
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-[#C084FC]" />;
      case 'target':
        return <Target className="w-4 h-4 text-[#FB7185]" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-[#F97316]" />;
      case 'brain':
        return <Brain className="w-4 h-4 text-[#EC4899]" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-[#60A5FA]" />;
    }
  };

  const getIconBg = (iconType: CoachPromptOption['icon']) => {
    switch (iconType) {
      case 'study':
        return 'bg-[#38BDF8]/12 border-[#38BDF8]/25';
      case 'workout':
        return 'bg-[#C084FC]/12 border-[#C084FC]/25';
      case 'target':
        return 'bg-[#FB7185]/12 border-[#FB7185]/25';
      case 'calendar':
        return 'bg-[#F97316]/12 border-[#F97316]/25';
      case 'brain':
        return 'bg-[#EC4899]/12 border-[#EC4899]/25';
      case 'chat':
        return 'bg-[#60A5FA]/12 border-[#60A5FA]/25';
    }
  };

  return (
    <div id="ai-coach-try-asking" className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Try asking
          </h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Here are some things you can ask me:
          </p>
        </div>

        <button
          onClick={onSeeAll}
          className="text-xs font-semibold text-[#818CF8] hover:text-[#A5B4FC] flex items-center gap-1 transition-colors cursor-pointer group"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid of 6 Cards: 3 columns on desktop, 1 or 2 columns on tablet/mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {prompts.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectPrompt(item)}
            className="p-3.5 sm:p-4 rounded-xl bg-[#0F1723] hover:bg-[#141E2F] border border-white/7 hover:border-white/14 transition-all duration-200 cursor-pointer group flex flex-col justify-between gap-2.5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${getIconBg(
                    item.icon
                  )}`}
                >
                  {getIcon(item.icon)}
                </div>
                <h4 className="text-xs sm:text-[13px] font-bold text-white group-hover:text-[#A5B4FC] transition-colors truncate">
                  {item.title}
                </h4>
              </div>

              <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </div>

            <p className="text-[11px] sm:text-xs text-[#94A3B8] line-clamp-2 leading-relaxed pl-0.5">
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
