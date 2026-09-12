import React, { useState } from 'react';
import { UserPlus, Check } from 'lucide-react';
import { SuggestedFriend } from '../../types';

interface SuggestedFriendsCardProps {
  suggestions: SuggestedFriend[];
  onAddFriend: (friend: SuggestedFriend) => void;
  onSeeAll?: () => void;
}

export const SuggestedFriendsCard: React.FC<SuggestedFriendsCardProps> = ({
  suggestions,
  onAddFriend,
  onSeeAll,
}) => {
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAdd = (item: SuggestedFriend) => {
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    onAddFriend(item);
  };

  return (
    <div 
      id="friends-suggested-card"
      className="bg-[#11161D] border border-white/6 rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-base font-bold text-white tracking-tight">Suggested Friends</h3>
        {onSeeAll && (
          <button 
            onClick={onSeeAll}
            className="text-xs font-semibold text-[#6366F1] hover:text-[#818CF8] transition-colors"
          >
            See All
          </button>
        )}
      </div>

      {/* Suggested List */}
      <div className="space-y-3 mt-3">
        {suggestions.slice(0, 3).map((item) => {
          const isAdded = addedIds[item.id];

          return (
            <div 
              key={item.id}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/4 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={item.avatarUrl} 
                  alt={item.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white leading-tight truncate">{item.name}</p>
                  <p className="text-[11px] text-[#9AA3B5] truncate mt-0.5">{item.sharedInterest}</p>
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={() => handleAdd(item)}
                disabled={isAdded}
                title={isAdded ? 'Added' : 'Add Friend'}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ml-2 ${
                  isAdded
                    ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 cursor-default'
                    : 'bg-indigo-500/15 border border-indigo-500/30 text-[#6366F1] hover:bg-indigo-500 hover:text-white'
                }`}
              >
                {isAdded ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
