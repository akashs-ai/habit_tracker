import React, { useState } from 'react';
import { ChevronDown, ArrowRight, Flame } from 'lucide-react';
import { FriendUser } from '../../types';

interface LeaderboardCardProps {
  friends: FriendUser[];
  onSelectUser: (user: FriendUser) => void;
  onViewAll?: () => void;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  friends,
  onSelectUser,
  onViewAll,
}) => {
  const [period, setPeriod] = useState('This Month');
  const [metric, setMetric] = useState<'XP' | 'Consistency' | 'Completion %'>('XP');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isMetricOpen, setIsMetricOpen] = useState(false);

  const periods = ['This Week', 'This Month', 'Last Month', 'This Year', 'All Time'];
  const metrics: ('XP' | 'Consistency' | 'Completion %')[] = ['XP', 'Consistency', 'Completion %'];

  // Sort friends based on selected metric
  const sortedFriends = [...friends].sort((a, b) => {
    if (metric === 'Consistency') {
      return b.consistencyDays - a.consistencyDays;
    }
    return b.xp - a.xp;
  }).slice(0, 5);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-bold ring-1 ring-amber-400/40">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-5 h-5 rounded-full bg-slate-300/20 text-slate-200 flex items-center justify-center text-xs font-bold ring-1 ring-slate-300/40">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-5 h-5 rounded-full bg-amber-700/20 text-amber-500 flex items-center justify-center text-xs font-bold ring-1 ring-amber-700/40">
          🥉
        </span>
      );
    }
    return (
      <span className="w-5 h-5 flex items-center justify-center text-xs font-semibold text-[#687185]">
        {rank}
      </span>
    );
  };

  return (
    <div 
      id="friends-leaderboard-card"
      className="bg-[#11161D] border border-white/6 rounded-2xl p-4 lg:p-5 flex flex-col justify-between"
    >
      {/* Header with Title, Dropdowns, and View All */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-white/5">
        <h3 className="text-base font-bold text-white tracking-tight">Leaderboard</h3>

        <div className="flex items-center gap-2">
          {/* Period Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsPeriodOpen(!isPeriodOpen);
                setIsMetricOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/8 text-xs font-medium text-[#9AA3B5] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>{period}</span>
              <ChevronDown className="w-3 h-3 text-[#687185]" />
            </button>
            {isPeriodOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-[#151A22] border border-white/10 rounded-xl py-1 shadow-xl z-20 text-xs">
                {periods.map((p) => (
                  <button 
                    key={p}
                    onClick={() => {
                      setPeriod(p);
                      setIsPeriodOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 ${
                      period === p ? 'text-[#6366F1] font-semibold bg-white/5' : 'text-[#9AA3B5] hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Metric Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsMetricOpen(!isMetricOpen);
                setIsPeriodOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/8 text-xs font-medium text-[#9AA3B5] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>{metric}</span>
              <ChevronDown className="w-3 h-3 text-[#687185]" />
            </button>
            {isMetricOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-[#151A22] border border-white/10 rounded-xl py-1 shadow-xl z-20 text-xs">
                {metrics.map((m) => (
                  <button 
                    key={m}
                    onClick={() => {
                      setMetric(m);
                      setIsMetricOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 ${
                      metric === m ? 'text-[#6366F1] font-semibold bg-white/5' : 'text-[#9AA3B5] hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View All link */}
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-xs font-semibold text-[#6366F1] hover:text-[#818CF8] flex items-center gap-1 transition-colors ml-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Table Head */}
      <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-[#687185] uppercase tracking-wider py-2.5 px-2">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5 sm:col-span-5">User</div>
        <div className="col-span-2 text-center">Level</div>
        <div className="col-span-2 text-right">XP</div>
        <div className="col-span-2 text-right">Consistency</div>
      </div>

      {/* Table Body */}
      <div className="space-y-1.5">
        {sortedFriends.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#687185]">
            No adventurers on the leaderboard yet. Add friends to compete!
          </div>
        ) : (
          sortedFriends.map((friend, idx) => {
          const rank = idx + 1;
          const isCurrentUser = friend.isCurrentUser;

          return (
            <div
              key={friend.id}
              onClick={() => onSelectUser(friend)}
              className={`grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-xl text-xs transition-all cursor-pointer ${
                isCurrentUser
                  ? 'bg-indigo-500/10 border-l-2 border-l-[#6366F1] border-y border-r border-indigo-500/20'
                  : 'hover:bg-white/4 border border-transparent'
              }`}
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center justify-center">
                {getRankBadge(rank)}
              </div>

              {/* User Avatar + Name */}
              <div className="col-span-5 sm:col-span-5 flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img 
                    src={friend.avatarUrl} 
                    alt={friend.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  {friend.status === 'online' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22C55E] border border-[#11161D]" />
                  )}
                </div>
                <span className={`truncate font-semibold ${isCurrentUser ? 'text-white' : 'text-[#E2E8F0]'}`}>
                  {friend.name}
                </span>
              </div>

              {/* Level */}
              <div className="col-span-2 text-center font-medium text-[#9AA3B5]">
                Lv. {friend.level}
              </div>

              {/* XP */}
              <div className="col-span-2 text-right font-bold text-white tabular-nums">
                {friend.xp.toLocaleString()}
              </div>

              {/* Consistency */}
              <div className="col-span-2 flex items-center justify-end gap-1 text-right font-semibold text-[#FB923C] tabular-nums">
                <Flame className="w-3 h-3 text-[#FB923C] shrink-0" />
                <span>{friend.consistencyDays}d</span>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};
