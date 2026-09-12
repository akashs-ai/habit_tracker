import React, { useState } from 'react';
import { ArrowRight, BookOpen, Dumbbell, Code, Check } from 'lucide-react';
import { UpcomingTogetherItem } from '../../types';

interface UpcomingTogetherCardProps {
  items: UpcomingTogetherItem[];
  onViewAll?: () => void;
}

export const UpcomingTogetherCard: React.FC<UpcomingTogetherCardProps> = ({
  items,
  onViewAll,
}) => {
  const [sessionStates, setSessionStates] = useState<Record<string, 'joined' | 'interested' | null>>({});

  const handleToggle = (id: string, currentType: 'join' | 'interested') => {
    setSessionStates((prev) => {
      const current = prev[id];
      if (currentType === 'join') {
        return { ...prev, [id]: current === 'joined' ? null : 'joined' };
      } else {
        return { ...prev, [id]: current === 'interested' ? null : 'interested' };
      }
    });
  };

  const getIcon = (type: UpcomingTogetherItem['type']) => {
    if (type === 'workout') {
      return (
        <div className="w-8 h-8 rounded-xl bg-[#34D399]/15 border border-[#34D399]/25 text-[#34D399] flex items-center justify-center shrink-0">
          <Dumbbell className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'coding') {
      return (
        <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/25 text-[#F59E0B] flex items-center justify-center shrink-0">
          <Code className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-[#6366F1]/15 border border-[#6366F1]/25 text-[#6366F1] flex items-center justify-center shrink-0">
        <BookOpen className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div 
      id="friends-upcoming-together-card"
      className="bg-[#11161D] border border-white/6 rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-base font-bold text-white tracking-tight">Upcoming Together</h3>
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

      {/* Items list */}
      <div className="space-y-3 mt-3">
        {items.slice(0, 3).map((item, idx) => {
          const isThird = idx === 2;
          const status = sessionStates[item.id];
          const isJoined = status === 'joined';
          const isInterested = status === 'interested';

          return (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/4 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getIcon(item.type)}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white leading-tight truncate">{item.title}</p>
                  <p className="text-[11px] text-[#9AA3B5] truncate mt-0.5">{item.schedule}</p>
                </div>
              </div>

              {/* Action Button */}
              {isThird ? (
                <button
                  onClick={() => handleToggle(item.id, 'interested')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ml-2 ${
                    isInterested
                      ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
                      : 'bg-[#151A22] border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {isInterested ? 'Going' : 'Interested'}
                </button>
              ) : (
                <button
                  onClick={() => handleToggle(item.id, 'join')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ml-2 ${
                    isJoined
                      ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
                      : 'bg-[#6366F1] hover:bg-[#7C7FF5] text-white shadow-sm shadow-indigo-600/20'
                  }`}
                >
                  {isJoined ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Joined</span>
                    </span>
                  ) : (
                    'Join'
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
