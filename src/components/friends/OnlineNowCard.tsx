import React from 'react';
import { FriendUser } from '../../types';

interface OnlineNowCardProps {
  onlineFriends: FriendUser[];
  onSelectUser: (user: FriendUser) => void;
  onSeeAll?: () => void;
}

export const OnlineNowCard: React.FC<OnlineNowCardProps> = ({
  onlineFriends,
  onSelectUser,
  onSeeAll,
}) => {
  return (
    <div 
      id="friends-online-now-card"
      className="bg-[#11161D] border border-white/6 rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-base font-bold text-white tracking-tight">
          Online Now ({onlineFriends.length})
        </h3>
        {onSeeAll && (
          <button 
            onClick={onSeeAll}
            className="text-xs font-semibold text-[#6366F1] hover:text-[#818CF8] transition-colors"
          >
            See All
          </button>
        )}
      </div>

      {/* Avatars Carousel / Row */}
      {onlineFriends.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#687185]">
          No friends online right now.
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          {onlineFriends.slice(0, 5).map((user) => (
            <div 
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="flex flex-col items-center min-w-[56px] cursor-pointer group"
            >
              <div className="relative">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white/10 group-hover:border-[#6366F1] transition-all"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#11161D]" />
              </div>
              <span className="text-[11px] font-semibold text-white mt-1.5 truncate max-w-[60px] text-center">
                {user.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-[#687185] truncate max-w-[64px] text-center">
                {user.activityStatus || 'Online'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
