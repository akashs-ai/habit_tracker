import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, 
  Search, 
  Flame, 
  Users, 
  Trophy, 
  Compass, 
  Bell, 
  Moon, 
  Sun, 
  Menu,
  ChevronDown,
  Plus,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Award,
  RefreshCw
} from 'lucide-react';
import { 
  FriendUser, 
  FriendRequest, 
  SuggestedFriend, 
  FriendActivity, 
  UpcomingTogetherItem,
  SocialGroup,
  SocialChallenge,
  FriendTabType
} from '../../types';
import { 
  initialFriendsList, 
  initialFriendRequests, 
  initialSuggestedFriends, 
  initialRecentActivity, 
  initialUpcomingTogether,
  initialSocialGroups,
  initialSocialChallenges
} from '../../data/friendsMockData';
import { api } from '../../services/api';
import { FriendsSummaryCards } from './FriendsSummaryCards';
import { LeaderboardCard } from './LeaderboardCard';
import { XPComparisonCard } from './XPComparisonCard';
import { ConsistencyStreaksCard } from './ConsistencyStreaksCard';
import { FriendRequestsCard } from './FriendRequestsCard';
import { OnlineNowCard } from './OnlineNowCard';
import { SuggestedFriendsCard } from './SuggestedFriendsCard';
import { RecentActivityCard } from './RecentActivityCard';
import { UpcomingTogetherCard } from './UpcomingTogetherCard';
import { InspirationalCard } from './InspirationalCard';

// Modals
import { FriendProfileModal } from './FriendProfileModal';
import { CompareFriendsModal } from './CompareFriendsModal';
import { CreateGroupModal } from './CreateGroupModal';
import { CreateChallengeModal } from './CreateChallengeModal';
import { AddFriendModal } from './AddFriendModal';

interface FriendsPageProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onToggleMobileMenu: () => void;
}

export const FriendsPage: React.FC<FriendsPageProps> = ({
  isDark,
  setIsDark,
  onToggleMobileMenu,
}) => {
  // Navigation & Tabs State
  const [activeTab, setActiveTab] = useState<FriendTabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [friends, setFriends] = useState<FriendUser[]>(initialFriendsList);
  const [requests, setRequests] = useState<FriendRequest[]>(initialFriendRequests);
  const [suggestions, setSuggestions] = useState<SuggestedFriend[]>(initialSuggestedFriends);
  const [activities, setActivities] = useState<FriendActivity[]>(initialRecentActivity);
  const [upcomingTogether, setUpcomingTogether] = useState<UpcomingTogetherItem[]>(initialUpcomingTogether);
  const [groups, setGroups] = useState<SocialGroup[]>(initialSocialGroups);
  const [challenges, setChallenges] = useState<SocialChallenge[]>(initialSocialChallenges);
  const [friendsProgress, setFriendsProgress] = useState<{
    leaderboard?: any[];
    xpComparison?: any[];
    consistencyStreaks?: any[];
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [selectedFriendForProfile, setSelectedFriendForProfile] = useState<FriendUser | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isCreateChallengeModalOpen, setIsCreateChallengeModalOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);

  // Feedback Toast
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setActionToast(message);
    setTimeout(() => setActionToast(null), 3000);
  };

  // Load friends and progress data from backend API
  const loadFriendsData = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    try {
      const [friendsRes, requestsRes, suggestionsRes] = await Promise.allSettled([
        api.getFriendsData(),
        api.getFriendRequests(),
        api.getSuggestedFriends(),
      ]);

      if (friendsRes.status === 'fulfilled' && friendsRes.value) {
        const data = friendsRes.value;
        if (data.friends && Array.isArray(data.friends)) {
          setFriends(data.friends);
        }
        setFriendsProgress({
          leaderboard: data.leaderboard,
          xpComparison: data.xpComparison,
          consistencyStreaks: data.consistencyStreaks,
        });
      }

      if (requestsRes.status === 'fulfilled' && Array.isArray(requestsRes.value)) {
        setRequests(requestsRes.value);
      }

      if (suggestionsRes.status === 'fulfilled' && Array.isArray(suggestionsRes.value)) {
        setSuggestions(suggestionsRes.value);
      }
    } catch (err) {
      console.warn('Using local state fallback for friends data', err);
    } finally {
      if (showIndicator) setIsRefreshing(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    loadFriendsData();
  }, [loadFriendsData]);

  // Handlers connected to real backend endpoints
  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      await api.acceptFriendRequest(request.id);
      showToast(`Accepted friend request from ${request.name}!`);
      await loadFriendsData();
    } catch (err: any) {
      // Fallback optimistic update
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      const newFriend: FriendUser = {
        id: request.id.startsWith('req-') ? request.id.replace('req-', 'f-') : `f-${Date.now()}`,
        name: request.name,
        username: request.username,
        avatarUrl: request.avatarUrl,
        level: 8,
        xp: 1800,
        consistencyDays: 12,
        status: 'online',
        activityStatus: 'Online',
        isFriend: true,
        tags: ['Accountability', 'Consistency'],
      };
      setFriends((prev) => [newFriend, ...prev]);
      showToast(`Accepted friend request from ${request.name}!`);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await api.declineFriendRequest(requestId);
      showToast('Declined friend request');
      await loadFriendsData();
    } catch (err: any) {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast('Declined friend request');
    }
  };

  const handleAddSuggested = async (suggested: SuggestedFriend) => {
    try {
      await api.sendFriendRequest({
        recipientId: suggested.id,
        username: suggested.username,
        name: suggested.name,
        reason: suggested.sharedInterest,
      });
      showToast(`Sent friend request to ${suggested.name}!`);
      setSuggestions((prev) => prev.filter((s) => s.id !== suggested.id));
      await loadFriendsData();
    } catch (err: any) {
      setSuggestions((prev) => prev.filter((s) => s.id !== suggested.id));
      showToast(err?.message || `Sent friend request to ${suggested.name}!`);
    }
  };

  const handleAddFriendFromModal = async (user: Partial<FriendUser> & { id?: string; reason?: string }) => {
    try {
      await api.sendFriendRequest({
        recipientId: user.id,
        username: user.username,
        name: user.name,
        reason: user.reason || 'Accountability partner',
      });
      showToast(`Friend request sent to ${user.name || user.username}!`);
      await loadFriendsData();
    } catch (err: any) {
      // Optimistic fallback
      const newFriend: FriendUser = {
        id: user.id || `f-${Date.now()}`,
        name: user.name || 'Friend',
        username: user.username || 'user',
        avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        level: user.level || 10,
        xp: user.xp || 2400,
        consistencyDays: user.consistencyDays || 15,
        status: user.status || 'online',
        activityStatus: 'Online',
        isFriend: true,
        tags: ['Accountability'],
      };
      setFriends((prev) => [newFriend, ...prev]);
      showToast(`Connected with ${newFriend.name}!`);
    }
  };

  const handleCreateGroup = (groupData: Omit<SocialGroup, 'id' | 'membersCount'>) => {
    const newGroup: SocialGroup = {
      id: `grp-${Date.now()}`,
      ...groupData,
      membersCount: 1,
    };
    setGroups((prev) => [newGroup, ...prev]);
    showToast(`Group "${newGroup.name}" created!`);
  };

  const handleCreateChallenge = (challengeData: Omit<SocialChallenge, 'id' | 'participantsCount'>) => {
    const newChallenge: SocialChallenge = {
      id: `ch-${Date.now()}`,
      ...challengeData,
      participantsCount: 1,
    };
    setChallenges((prev) => [newChallenge, ...prev]);
    showToast(`Challenge "${newChallenge.title}" launched!`);
  };

  const onlineFriends = friends.filter((f) => f.status === 'online');

  return (
    <div id="friends-page-container" className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12 bg-slate-50 dark:bg-[#090B0F] text-slate-900 dark:text-[#F7F8FC] transition-colors duration-200">
      {/* 1. TOP BAR */}
      <header 
        id="friends-top-bar"
        className="h-[72px] bg-white dark:bg-[#0D1015] border-b border-slate-200 dark:border-white/6 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors"
      >
        {/* Mobile Hamburger & Logo (visible on < lg) */}
        <div className="flex items-center gap-3 lg:hidden">
          <button 
            onClick={onToggleMobileMenu}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-[#9AA3B5] hover:text-slate-900 dark:hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              L
            </div>
            <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">LifeRPG</span>
          </div>
        </div>

        {/* Global Search Bar (450-500px on desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-[480px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#687185] absolute left-3.5 top-3" />
            <input 
              id="friends-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends, groups, or username..."
              className="w-full h-10 pl-10 pr-12 rounded-xl bg-slate-100 dark:bg-[#12161E] border border-slate-200 dark:border-white/8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#687185] focus:outline-none focus:border-[#6366F1] transition-all"
            />
            <kbd className="absolute right-3 top-2.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[10px] text-slate-500 dark:text-[#687185] font-mono">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Right Controls: Theme Toggle, Notifications, Avatar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => loadFriendsData(true)}
            title="Refresh friends data"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 flex items-center justify-center text-slate-600 dark:text-[#9AA3B5] hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => setIsDark(!isDark)}
            title="Toggle theme"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 flex items-center justify-center text-slate-600 dark:text-[#9AA3B5] hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button 
            title="Notifications"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 flex items-center justify-center text-slate-600 dark:text-[#9AA3B5] hover:text-slate-900 dark:hover:text-white transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {requests.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0D1015]" />
            )}
          </button>

          {/* User Avatar Alex */}
          <div 
            onClick={() => {
              const alex = friends.find((f) => f.isCurrentUser) || friends[0];
              setSelectedFriendForProfile(alex);
            }}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#818CF8] p-[1.5px] cursor-pointer ring-2 ring-indigo-500/20 hover:ring-indigo-500/50 transition-all"
          >
            <div className="w-full h-full rounded-full bg-slate-100 dark:bg-[#11161D] flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Action Toast Feedback */}
      {actionToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#6366F1] text-white text-xs font-semibold shadow-xl shadow-indigo-600/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1240px] w-full mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div id="friends-header-section" className="flex flex-col sm:row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Friends
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9AA3B5] mt-1">
              Surround yourself with people who build you up. Real-time accountability and mutual leveling.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Motivational Quote */}
            <p className="hidden xl:block text-xs italic text-slate-500 dark:text-[#9AA3B5] max-w-[260px] text-right font-serif">
              &ldquo;A little progress together goes a long way.&rdquo;
            </p>

            {/* + Add Friend Button */}
            <button 
              id="add-friend-primary-btn"
              onClick={() => setIsAddFriendModalOpen(true)}
              className="h-10 px-4 rounded-xl bg-[#6366F1] hover:bg-[#7C7FF5] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/25 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Friend</span>
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-white/6 pt-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'my-friends', label: `My Friends`, count: friends.length },
            { id: 'requests', label: 'Requests', count: requests.length, isDangerBadge: requests.length > 0 },
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'groups', label: 'Groups' },
            { id: 'discover', label: 'Discover' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FriendTabType)}
                className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#6366F1] text-white shadow-sm shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-[#9AA3B5] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    tab.isDangerBadge 
                      ? 'bg-red-500/20 text-red-500 dark:text-red-400' 
                      : isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-[#9AA3B5]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. SUMMARY CARDS */}
        <FriendsSummaryCards
          friendsCount={friends.length}
          requestsCount={requests.length}
          onlineCount={onlineFriends.length}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* 4. TAB CONTENTS */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Row 1: Leaderboard + XP Comparison + Consistency Streaks */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
              <LeaderboardCard
                friends={friends}
                onSelectUser={(user) => setSelectedFriendForProfile(user)}
                onViewAll={() => setActiveTab('leaderboard')}
              />

              <XPComparisonCard 
                data={friendsProgress?.xpComparison}
              />

              <ConsistencyStreaksCard
                streaks={friendsProgress?.consistencyStreaks}
                onViewAll={() => setActiveTab('leaderboard')}
              />
            </div>

            {/* Row 2: Friend Requests + Online Now + Suggested Friends */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
              <FriendRequestsCard
                requests={requests}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
                onSeeAll={() => setActiveTab('requests')}
              />

              <OnlineNowCard
                onlineFriends={onlineFriends}
                onSelectUser={(user) => setSelectedFriendForProfile(user)}
                onSeeAll={() => setActiveTab('my-friends')}
              />

              <SuggestedFriendsCard
                suggestions={suggestions}
                onAddFriend={handleAddSuggested}
                onSeeAll={() => setActiveTab('discover')}
              />
            </div>

            {/* Row 3: Recent Activity + Upcoming Together + Inspirational Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
              <RecentActivityCard
                activities={activities}
                onViewAll={() => setActiveTab('my-friends')}
              />

              <UpcomingTogetherCard
                items={upcomingTogether}
                onViewAll={() => setActiveTab('groups')}
              />

              <InspirationalCard />
            </div>
          </div>
        )}

        {/* TAB: MY FRIENDS */}
        {activeTab === 'my-friends' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">All Friends ({friends.length})</h2>
              <button 
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Compare Progress</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {friends.map((friend) => (
                <div 
                  key={friend.id}
                  onClick={() => setSelectedFriendForProfile(friend)}
                  className="p-4 rounded-2xl bg-[#11161D] border border-white/6 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img 
                          src={friend.avatarUrl} 
                          alt={friend.name}
                          className="w-11 h-11 rounded-full object-cover border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        {friend.status === 'online' && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#11161D]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {friend.name}
                        </h4>
                        <p className="text-xs text-[#687185]">@{friend.username}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-bold text-[#9AA3B5]">
                      Lv. {friend.level}
                    </span>
                  </div>

                  <p className="text-xs text-[#9AA3B5] mt-3 line-clamp-2 leading-relaxed">
                    {friend.bio || 'Building consistency every day.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs">
                    <span className="text-[#687185] flex items-center gap-1 font-semibold text-[#FB923C]">
                      <Flame className="w-3.5 h-3.5" />
                      {friend.consistencyDays}d streak
                    </span>
                    <span className="font-bold text-white tabular-nums">
                      {friend.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-base font-bold text-white">Pending Requests ({requests.length})</h2>
            {requests.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#11161D] border border-white/6 text-xs text-[#687185]">
                No pending requests. You're all caught up!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {requests.map((req) => (
                  <div 
                    key={req.id}
                    className="p-4 rounded-2xl bg-[#11161D] border border-white/6 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img 
                        src={req.avatarUrl} 
                        alt={req.name}
                        className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{req.name}</h4>
                        <p className="text-xs text-[#9AA3B5] mt-0.5 truncate">{req.reason}</p>
                        <p className="text-[11px] text-[#687185] mt-1">{req.timeAgo}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAcceptRequest(req)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#7C7FF5] text-white text-xs font-semibold transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-[#9AA3B5] hover:text-red-400 text-xs font-semibold transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Full Leaderboard</h2>
                <p className="text-xs text-[#9AA3B5] mt-0.5">Ranked by consistency and completed progress</p>
              </div>
              <button 
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#6366F1] text-white text-xs font-semibold shadow-md shadow-indigo-600/20 hover:bg-[#7C7FF5] transition-colors"
              >
                Compare Progress
              </button>
            </div>

            <div className="bg-[#11161D] border border-white/6 rounded-2xl p-4 lg:p-5">
              <LeaderboardCard
                friends={friends}
                onSelectUser={(user) => setSelectedFriendForProfile(user)}
              />
            </div>
          </div>
        )}

        {/* TAB: GROUPS */}
        {activeTab === 'groups' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Accountability Groups</h2>
                <p className="text-xs text-[#9AA3B5] mt-0.5">Collaborate, build streaks, and stay focused together</p>
              </div>
              <button 
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#6366F1] text-white text-xs font-semibold shadow-md shadow-indigo-600/20 hover:bg-[#7C7FF5] flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Group</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {groups.map((grp) => (
                <div 
                  key={grp.id}
                  className="p-5 rounded-2xl bg-[#11161D] border border-white/6 hover:border-white/12 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-[#818CF8] text-[11px] font-semibold">
                        {grp.category}
                      </span>
                      <span className="text-[11px] text-[#687185]">
                        {grp.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{grp.name}</h3>
                    <p className="text-xs text-[#9AA3B5] mt-2 leading-relaxed">
                      {grp.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                    <span className="text-xs text-[#9AA3B5] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#6366F1]" />
                      {grp.membersCount} members
                    </span>
                    <button 
                      onClick={() => showToast(`Joined ${grp.name}!`)}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-[#6366F1] text-white text-xs font-semibold transition-colors"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: DISCOVER */}
        {activeTab === 'discover' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Suggested Friends */}
            <div>
              <h2 className="text-base font-bold text-white mb-3">People with Similar Goals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {suggestions.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#11161D] border border-white/6 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={item.avatarUrl} 
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-[#9AA3B5] truncate mt-0.5">{item.sharedInterest}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddSuggested(item)}
                      className="px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#7C7FF5] text-white text-xs font-semibold transition-colors shrink-0"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Challenges */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white">Community Challenges</h2>
                <button 
                  onClick={() => setIsCreateChallengeModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#6366F1] text-white text-xs font-semibold shadow-md shadow-indigo-600/20 hover:bg-[#7C7FF5] flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Challenge</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {challenges.map((ch) => (
                  <div 
                    key={ch.id}
                    className="p-5 rounded-2xl bg-[#11161D] border border-white/6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {ch.duration}
                        </span>
                        <span className="text-xs text-[#9AA3B5] font-medium">
                          {ch.participantsCount} participants
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{ch.title}</h4>
                      <p className="text-xs text-[#9AA3B5] mt-1 leading-relaxed">
                        {ch.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-[#34D399] font-medium">Active Now</span>
                      <button 
                        onClick={() => showToast(`Joined challenge: ${ch.title}!`)}
                        className="px-4 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#7C7FF5] text-white text-xs font-semibold transition-colors"
                      >
                        Participate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Action Toast Feedback */}
      {actionToast && (
        <div 
          id="friends-action-toast"
          className="fixed bottom-20 lg:bottom-8 right-6 z-50 bg-[#151A22] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="w-5 h-5 rounded-full bg-[#34D399]/20 text-[#34D399] flex items-center justify-center">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{actionToast}</span>
        </div>
      )}

      {/* MODALS */}
      <FriendProfileModal
        friend={selectedFriendForProfile}
        isOpen={!!selectedFriendForProfile}
        onClose={() => setSelectedFriendForProfile(null)}
        onCompareWithUser={() => {
          setSelectedFriendForProfile(null);
          setIsCompareModalOpen(true);
        }}
      />

      <CompareFriendsModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      <CreateChallengeModal
        isOpen={isCreateChallengeModalOpen}
        onClose={() => setIsCreateChallengeModalOpen(false)}
        onCreateChallenge={handleCreateChallenge}
      />

      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        onAddFriend={handleAddFriendFromModal}
      />
    </div>
  );
};
