import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Dumbbell, 
  BookOpen, 
  ChevronDown, 
  ArrowUpRight 
} from 'lucide-react';
import { Attribute, WeeklyData, FriendLeaderboardItem } from '../types';

interface MiddleAnalyticsRowProps {
  attributes: Attribute[];
  weeklyData: WeeklyData[];
  friends: FriendLeaderboardItem[];
}

export const MiddleAnalyticsRow: React.FC<MiddleAnalyticsRowProps> = ({
  attributes,
  weeklyData,
  friends,
}) => {
  const getAttributeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-[#7C6CFF]" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-[#F97316]" />;
      case 'BicepsFlexed':
        return <Dumbbell className="w-4 h-4 text-[#EA580C]" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-[#3B82F6]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#7C6CFF]" />;
    }
  };

  return (
    <div id="middle-analytics-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      
      {/* 1. Your Attributes Card */}
      <div 
        id="attributes-card"
        className="bg-white dark:bg-[#111113] border border-[#E7EAF0] dark:border-[#27272A] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-[#111827] dark:text-[#FAFAFA]">
            Your Attributes
          </h3>
          <button className="text-xs font-semibold text-[#7C6CFF] hover:text-[#6355E6] flex items-center gap-1 transition-colors">
            <span>See Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          {attributes.map((attr) => (
            <div key={attr.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" 
                    style={{ backgroundColor: attr.bgLight }}
                  >
                    {getAttributeIcon(attr.iconName)}
                  </div>
                  <span className="font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                    {attr.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                    Lv. {attr.level}
                  </span>
                  <span className="text-xs font-bold text-[#111827] dark:text-[#FAFAFA] min-w-[32px] text-right">
                    {attr.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#F1F2F6] dark:bg-[#202025] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out" 
                  style={{ 
                    width: `${attr.percentage}%`,
                    backgroundColor: attr.color 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Weekly Progress Card */}
      <div 
        id="weekly-progress-card"
        className="bg-white dark:bg-[#111113] border border-[#E7EAF0] dark:border-[#27272A] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base text-[#111827] dark:text-[#FAFAFA]">
            Weekly Progress
          </h3>
          <button className="flex items-center gap-1 text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] bg-[#F7F8FA] dark:bg-[#1C1C20] border border-[#E5E7EB] dark:border-[#27272A] px-2.5 py-1 rounded-lg">
            <span>This Week</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Weekly Bar Chart */}
        <div className="relative pt-6 pb-2">
          <div className="flex items-end justify-between gap-2 h-32 px-2">
            {weeklyData.map((item) => (
              <div key={item.dayShort} className="flex-1 flex flex-col items-center gap-2 group">
                {/* Tooltip on active bar (Thursday) */}
                {item.isToday && (
                  <div className="absolute -top-1 bg-[#111827] dark:bg-[#FAFAFA] text-white dark:text-[#111827] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs animate-bounce">
                    {item.xp} XP
                  </div>
                )}

                {/* Vertical Bar */}
                <div className="w-full max-w-[28px] h-28 bg-[#F3F4F6] dark:bg-[#1F1F24] rounded-lg flex items-end overflow-hidden">
                  <div 
                    className={`w-full rounded-lg transition-all duration-500 ${
                      item.isToday 
                        ? 'bg-[#6366F1] shadow-xs shadow-indigo-300 dark:shadow-none' 
                        : 'bg-[#C7D2FE] dark:bg-[#312E81] hover:bg-[#818CF8]'
                    }`}
                    style={{ height: `${item.heightPercent}%` }}
                  />
                </div>

                <span className={`text-[11px] font-medium ${
                  item.isToday 
                    ? 'font-bold text-[#111827] dark:text-[#FAFAFA]' 
                    : 'text-[#9CA3AF]'
                }`}>
                  {item.dayShort}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Metric Summary */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F1F2F6] dark:border-[#27272A] text-center">
          <div>
            <p className="font-display font-bold text-sm sm:text-base text-[#111827] dark:text-[#FAFAFA]">
              7h 30m
            </p>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
              Time Spent
            </p>
          </div>
          <div>
            <p className="font-display font-bold text-sm sm:text-base text-[#111827] dark:text-[#FAFAFA]">
              24
            </p>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
              Quests Completed
            </p>
          </div>
          <div>
            <p className="font-display font-bold text-sm sm:text-base text-[#6366F1]">
              +420 XP
            </p>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
              This Week
            </p>
          </div>
        </div>
      </div>

      {/* 3. Friends Leaderboard Card */}
      <div 
        id="leaderboard-card"
        className="bg-white dark:bg-[#111113] border border-[#E7EAF0] dark:border-[#27272A] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base text-[#111827] dark:text-[#FAFAFA]">
            Friends Leaderboard
          </h3>
          <button className="text-xs font-semibold text-[#7C6CFF] hover:text-[#6355E6] flex items-center gap-1 transition-colors">
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Friends List */}
        <div className="flex flex-col gap-2">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                friend.isCurrentUser
                  ? 'bg-[#EEECFF] dark:bg-[#201F3D] border border-[#DDD6FE] dark:border-[#353366]'
                  : 'hover:bg-[#F9FAFB] dark:hover:bg-[#18181B]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Rank Badge */}
                <div className="w-5 flex items-center justify-center font-bold text-xs">
                  {friend.rank === 1 ? (
                    <span className="w-5 h-5 rounded-full bg-[#FEF08A] text-[#854D0E] flex items-center justify-center text-[10px] font-bold">1</span>
                  ) : friend.rank === 2 ? (
                    <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#374151] flex items-center justify-center text-[10px] font-bold">2</span>
                  ) : friend.rank === 3 ? (
                    <span className="w-5 h-5 rounded-full bg-[#FFEDD5] text-[#9A3412] flex items-center justify-center text-[10px] font-bold">3</span>
                  ) : (
                    <span className="text-[#9CA3AF] text-xs font-semibold">{friend.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <img
                  src={friend.avatarUrl}
                  alt={friend.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-black/5"
                />

                {/* Name */}
                <span className={`text-xs font-semibold ${
                  friend.isCurrentUser 
                    ? 'text-[#4338CA] dark:text-[#C7D2FE]' 
                    : 'text-[#1F2937] dark:text-[#E5E7EB]'
                }`}>
                  {friend.name}
                </span>
              </div>

              {/* Level & XP */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                  Lv. {friend.level}
                </span>
                <span className={`text-xs font-bold ${
                  friend.isCurrentUser 
                    ? 'text-[#4338CA] dark:text-[#A5B4FC]' 
                    : 'text-[#111827] dark:text-[#FAFAFA]'
                }`}>
                  {friend.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
