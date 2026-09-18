import React, { useState } from 'react';
import { X, ChevronDown, Check, Sparkles, Target, Activity, Award } from 'lucide-react';
import { FriendUser } from '../../types';

interface FriendProfileModalProps {
  friend: FriendUser | null;
  isOpen: boolean;
  onClose: () => void;
  onCompareWithUser?: (friend: FriendUser) => void;
  onRemoveFriend?: (friendId: string) => void;
  isAuth?: boolean;
}

export const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  friend,
  isOpen,
  onClose,
  onCompareWithUser,
  onRemoveFriend,
  isAuth = false,
}) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'goals' | 'stats'>('activity');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isOpen || !friend) return null;

  const dynamicActivities = isAuth ? [
    { id: '1', action: `Maintained ${friend.consistencyDays}-day consistency streak`, timeAgo: 'Current', xp: friend.xp },
    { id: '2', action: `Advanced to Level ${friend.level} Adventurer`, timeAgo: 'Active', xp: friend.xp },
  ] : [
    { id: '1', action: 'Completed 5 tasks', timeAgo: '2 hours ago', xp: 120 },
    { id: '2', action: 'Maintained 28-day consistency streak', timeAgo: 'Yesterday', xp: 150 },
    { id: '3', action: 'Finished Milestone: "Array Algorithms in C++"', timeAgo: '3 days ago', xp: 250 },
  ];

  const mockGoals = [
    { id: '1', title: 'Master DSA & Graph Theory', progress: 84, category: 'Learning' },
    { id: '2', title: 'Half-Marathon Preparation', progress: 65, category: 'Health' },
    { id: '3', title: 'Build Full-Stack Microservices', progress: 48, category: 'Career' },
  ];

  return (
    <div 
      id="friend-profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="friend-profile-modal-card"
        className="w-full max-w-[560px] bg-[#0E1217] border border-white/10 rounded-2xl p-6 shadow-2xl relative text-[#F7F8FC] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#9AA3B5]">Friend Profile (Modal)</span>
            <span className="text-xs">👋</span>
          </div>
          <button 
            id="close-profile-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#687185] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Info */}
        <div className="pt-5 flex items-start gap-4">
          <div className="relative">
            <img 
              src={friend.avatarUrl} 
              alt={friend.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/10 ring-2 ring-indigo-500/30"
              referrerPolicy="no-referrer"
            />
            {friend.status === 'online' && (
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#22C55E] border-2 border-[#0E1217]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {friend.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#9AA3B5]">
                  <span>@{friend.username}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#22C55E]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    {friend.status === 'online' ? 'Online' : 'Away'}
                  </span>
                </div>
              </div>

              {/* Friends dropdown status */}
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                >
                  <span>Friends</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9AA3B5]" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-36 bg-[#151A22] border border-white/10 rounded-xl py-1 shadow-xl z-20 text-xs">
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onCompareWithUser) onCompareWithUser(friend);
                      }}
                      className="w-full text-left px-3 py-2 text-[#9AA3B5] hover:text-white hover:bg-white/5"
                    >
                      Compare Progress
                    </button>
                    <button 
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-[#9AA3B5] hover:text-white hover:bg-white/5"
                    >
                      Send Message
                    </button>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onRemoveFriend && friend) {
                          onRemoveFriend(friend.id);
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5"
                    >
                      Unfriend
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs text-[#9AA3B5] mt-2 leading-relaxed">
              {friend.bio || 'Building a better me, one day at a time.'}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(friend.tags || ['DSA', 'Fitness', 'Productivity']).map((tag) => (
                <span 
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md bg-[#1B1E28] border border-white/5 text-[11px] font-medium text-[#9AA3B5]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Metric Stats */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="bg-[#12161E] border border-white/6 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white">{friend.level}</p>
            <p className="text-[11px] text-[#687185] font-medium mt-0.5">Level</p>
          </div>
          <div className="bg-[#12161E] border border-white/6 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white">{friend.xp.toLocaleString()}</p>
            <p className="text-[11px] text-[#687185] font-medium mt-0.5">Total XP</p>
          </div>
          <div className="bg-[#12161E] border border-white/6 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white flex items-center justify-center gap-1">
              <span>{friend.consistencyDays}</span>
            </p>
            <p className="text-[11px] text-[#687185] font-medium mt-0.5">Day Streak</p>
          </div>
        </div>

        {/* Tabs: Activity / Goals / Stats */}
        <div className="flex items-center gap-1 border-b border-white/8 pb-2">
          <button 
            onClick={() => setActiveTab('activity')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'activity'
                ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-500/20'
                : 'text-[#9AA3B5] hover:text-white hover:bg-white/5'
            }`}
          >
            Activity
          </button>
          <button 
            onClick={() => setActiveTab('goals')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'goals'
                ? 'bg-[#6366F1] text-white'
                : 'text-[#9AA3B5] hover:text-white hover:bg-white/5'
            }`}
          >
            Goals
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-[#6366F1] text-white'
                : 'text-[#9AA3B5] hover:text-white hover:bg-white/5'
            }`}
          >
            Stats
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-3.5 min-h-[120px]">
          {activeTab === 'activity' && (
            <div className="space-y-2">
              {dynamicActivities.map((act) => (
                <div 
                  key={act.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#12161E] border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/10 text-[#6366F1] flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{act.action}</p>
                      <p className="text-[10px] text-[#687185] mt-0.5">{act.timeAgo}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#34D399]/10 text-[#34D399] font-bold text-[11px]">
                    +{act.xp} XP
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-2">
              {isAuth ? (
                <div className="py-8 text-center text-xs text-[#9AA3B5] bg-[#12161E] border border-white/5 rounded-xl p-4">
                  <Target className="w-6 h-6 text-[#6366F1] mx-auto mb-2 opacity-60" />
                  <p className="font-medium text-white">Adventurer Goals</p>
                  <p className="text-[11px] text-[#687185] mt-1">This partner's detailed personal goals are private.</p>
                </div>
              ) : (
                mockGoals.map((g) => (
                  <div 
                    key={g.id}
                    className="p-3 rounded-xl bg-[#12161E] border border-white/5 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-white">{g.title}</span>
                      <span className="text-[#6366F1] font-semibold">{g.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#6366F1] rounded-full" 
                        style={{ width: `${g.progress}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="p-4 rounded-xl bg-[#12161E] border border-white/5 text-xs space-y-3">
              <div className="flex justify-between text-[#9AA3B5]">
                <span>Weekly Average Tasks Completed</span>
                <span className="text-white font-semibold">
                  {isAuth ? `${Math.max(5, friend.level * 3)} tasks / week` : '24 tasks / week'}
                </span>
              </div>
              <div className="flex justify-between text-[#9AA3B5]">
                <span>Accountability Score</span>
                <span className="text-[#34D399] font-semibold">
                  {isAuth ? `${Math.min(100, 75 + Math.min(25, friend.consistencyDays))}% Consistent` : '96% Very Consistent'}
                </span>
              </div>
              <div className="flex justify-between text-[#9AA3B5]">
                <span>Status</span>
                <span className="text-white font-semibold">
                  {isAuth ? 'Verified Partner' : 'October 2025'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
