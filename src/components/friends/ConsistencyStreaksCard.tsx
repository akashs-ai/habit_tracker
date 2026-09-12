import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { consistencyStreaksData } from '../../data/friendsMockData';

interface ConsistencyStreaksCardProps {
  onViewAll?: () => void;
}

export const ConsistencyStreaksCard: React.FC<ConsistencyStreaksCardProps> = ({
  onViewAll,
}) => {
  return (
    <div 
      id="friends-consistency-streaks-card"
      className="bg-[#11161D] border border-white/6 rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-base font-bold text-white tracking-tight">Consistency Streaks</h3>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-xs font-semibold text-[#6366F1] hover:text-[#818CF8] flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Rows */}
      <div className="space-y-2 mt-3">
        {consistencyStreaksData.map((item) => (
          <div
            key={item.name}
            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
              item.isCurrent
                ? 'bg-indigo-500/10 border-l-2 border-l-[#6366F1] border-y border-r border-indigo-500/20'
                : 'hover:bg-white/4 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={item.avatarUrl} 
                alt={item.name}
                className="w-7 h-7 rounded-full object-cover border border-white/10"
                referrerPolicy="no-referrer"
              />
              <span className={`font-semibold truncate ${item.isCurrent ? 'text-white' : 'text-[#E2E8F0]'}`}>
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-[#FB923C]">
              <Flame className="w-3.5 h-3.5 text-[#FB923C]" />
              <span className="tabular-nums">{item.days} days</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
