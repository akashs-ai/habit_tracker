import React from 'react';
import { Users2, Shield, Flame, Sparkles } from 'lucide-react';

interface FriendsSummaryCardsProps {
  friendsCount: number;
  requestsCount: number;
  onlineCount: number;
  onSelectTab?: (tab: 'my-friends' | 'requests' | 'overview') => void;
}

export const FriendsSummaryCards: React.FC<FriendsSummaryCardsProps> = ({
  friendsCount,
  requestsCount,
  onlineCount,
  onSelectTab,
}) => {
  return (
    <div 
      id="friends-summary-cards"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
    >
      {/* 1. Friends Count */}
      <div 
        onClick={() => onSelectTab?.('my-friends')}
        className="bg-[#11161D] border border-white/6 hover:border-white/12 rounded-xl p-4 flex flex-col justify-center transition-all cursor-pointer group"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight group-hover:text-[#818CF8] transition-colors">
            {friendsCount}
          </span>
        </div>
        <span className="text-xs font-medium text-[#9AA3B5] mt-1">Friends</span>
      </div>

      {/* 2. Pending Requests */}
      <div 
        onClick={() => onSelectTab?.('requests')}
        className="bg-[#11161D] border border-white/6 hover:border-white/12 rounded-xl p-4 flex flex-col justify-center transition-all cursor-pointer group"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight group-hover:text-[#F87171] transition-colors">
            {requestsCount}
          </span>
        </div>
        <span className="text-xs font-medium text-[#9AA3B5] mt-1">Pending Requests</span>
      </div>

      {/* 3. Online Now */}
      <div className="bg-[#11161D] border border-white/6 rounded-xl p-4 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {onlineCount}
          </span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]" />
          </span>
        </div>
        <span className="text-xs font-medium text-[#9AA3B5] mt-1 flex items-center gap-1.5">
          <span>Online Now</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
        </span>
      </div>

      {/* 4. Stronger Together Banner Card */}
      <div className="bg-[#11161D] border border-white/6 rounded-xl p-4 flex items-center gap-3.5 relative overflow-hidden group">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[#6366F1] flex items-center justify-center shrink-0">
          <Users2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white tracking-tight">Stronger Together</p>
          <p className="text-[11px] text-[#9AA3B5] mt-0.5 truncate">Collaborate. Compete. Grow.</p>
        </div>
        {/* Subtle accent line on hover */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#6366F1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};
