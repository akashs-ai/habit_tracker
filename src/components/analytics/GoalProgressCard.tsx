import React from 'react';
import { Code, Palette, Heart, BookOpen, ArrowRight } from 'lucide-react';
import { AnalyticsGoalItem } from '../../types';

interface GoalProgressCardProps {
  goals: AnalyticsGoalItem[];
  onSeeAll?: () => void;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ goals, onSeeAll }) => {
  const getGoalIcon = (iconType: AnalyticsGoalItem['icon']) => {
    switch (iconType) {
      case 'dsa':
        return <Code className="w-3.5 h-3.5 text-[#818CF8]" />;
      case 'portfolio':
        return <Palette className="w-3.5 h-3.5 text-[#C084FC]" />;
      case 'shape':
        return <Heart className="w-3.5 h-3.5 text-[#34D399]" />;
      case 'books':
        return <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />;
    }
  };

  return (
    <div 
      id="analytics-goal-progress-card"
      className="p-4 sm:p-5 rounded-xl bg-[#0F1723] border border-white/7 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Goal Progress
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Track your goals and see how you&apos;re doing.
          </p>
        </div>

        <button
          onClick={onSeeAll}
          className="text-xs text-[#818CF8] hover:text-[#A5B4FC] font-medium flex items-center gap-1 transition-colors cursor-pointer group"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Goal rows */}
      <div className="flex flex-col gap-2.5 pt-3">
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Icon */}
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                {getGoalIcon(goal.icon)}
              </div>

              {/* Title & Bar */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-medium text-white/90 truncate group-hover:text-white transition-colors">
                    {goal.title}
                  </span>
                  <span className="text-xs font-semibold text-white tabular-nums">
                    {goal.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/7 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${goal.percentage}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
