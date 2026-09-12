import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FriendActivity } from '../../types';

interface RecentActivityCardProps {
  activities: FriendActivity[];
  onViewAll?: () => void;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  activities,
  onViewAll,
}) => {
  return (
    <div 
      id="friends-recent-activity-card"
      className="bg-[#11161D] border border-white/6 rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-base font-bold text-white tracking-tight">Recent Activity</h3>
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

      {/* Activity Rows */}
      <div className="space-y-3 mt-3">
        {activities.slice(0, 3).map((act) => (
          <div 
            key={act.id}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/4 transition-colors text-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src={act.avatarUrl} 
                alt={act.userName}
                className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-white text-xs leading-tight truncate">
                  <span className="font-bold">{act.userName}</span>{' '}
                  <span className="text-[#9AA3B5]">{act.action}</span>
                </p>
                <p className="text-[11px] text-[#687185] mt-0.5">{act.timeAgo}</p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-md bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] font-bold text-[11px] shrink-0 ml-2">
              +{act.xpReward} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
