import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Menu, 
  Check, 
  Sparkles,
  Flame,
  Award
} from 'lucide-react';
import { 
  RewardCategory, 
  RewardItem, 
  RewardBadge, 
  CollectionItem, 
  WaysToEarnItem 
} from '../../types';
import { 
  initialMomentumPoints,
  initialPointsThisWeek,
  initialStreakDays,
  initialWeeklyConsistency,
  initialLevel,
  initialXP,
  initialMaxXP,
  initialFeaturedRewards,
  initialBadges,
  initialNextBadge,
  initialCollectionItems,
  initialWaysToEarn
} from '../../data/rewardsMockData';
import { RewardsHeroBanner } from './RewardsHeroBanner';
import { RewardsCategoryFilter } from './RewardsCategoryFilter';
import { FeaturedRewardsSection } from './FeaturedRewardsSection';
import { BadgeProgressSection } from './BadgeProgressSection';
import { RewardsBottomRow } from './RewardsBottomRow';
import { RewardDetailModal } from './RewardDetailModal';
import { BadgeDetailModal } from './BadgeDetailModal';
import { RewardTermsModal } from './RewardTermsModal';
import { ShieldCheck, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { soundFx } from '../../utils/audioFx';
import { ParticleBurst, FloatingText } from '../effects/ParticleBurst';

interface RewardsPageProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onToggleMobileMenu: () => void;
  liveMomentumPoints?: number;
  livePointsThisWeek?: number;
  liveStreakDays?: number;
  liveWeeklyConsistency?: number;
  liveLevel?: number;
  liveCurrentXP?: number;
  liveMaxXP?: number;
  liveRewards?: RewardItem[];
  liveBadges?: RewardBadge[];
  liveCollection?: CollectionItem[];
  onClaimReward?: (rewardId: string, termsAccepted: boolean) => Promise<any>;
  onActivateReward?: (rewardId: string) => Promise<any>;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({
  isDark,
  setIsDark,
  onToggleMobileMenu,
  liveMomentumPoints,
  livePointsThisWeek,
  liveStreakDays,
  liveWeeklyConsistency,
  liveLevel,
  liveCurrentXP,
  liveMaxXP,
  liveRewards,
  liveBadges,
  liveCollection,
  onClaimReward,
  onActivateReward,
}) => {
  // Global search input in top bar
  const [globalSearch, setGlobalSearch] = useState('');

  // Rewards State (fallback to defaults if live not provided)
  const momentumPoints = liveMomentumPoints !== undefined ? liveMomentumPoints : initialMomentumPoints;
  const pointsThisWeek = livePointsThisWeek !== undefined ? livePointsThisWeek : initialPointsThisWeek;
  const streakDays = liveStreakDays !== undefined ? liveStreakDays : initialStreakDays;
  const weeklyConsistency = liveWeeklyConsistency !== undefined ? liveWeeklyConsistency : initialWeeklyConsistency;
  const level = liveLevel !== undefined ? liveLevel : initialLevel;
  const currentXP = liveCurrentXP !== undefined ? liveCurrentXP : initialXP;
  const maxXP = liveMaxXP !== undefined ? liveMaxXP : initialMaxXP;

  const [localRewardsList, setLocalRewardsList] = useState<RewardItem[]>(initialFeaturedRewards);
  const rewardsList = liveRewards && liveRewards.length > 0 ? liveRewards : localRewardsList;

  const [localBadgesList, setLocalBadgesList] = useState<RewardBadge[]>(initialBadges);
  const badgesList = liveBadges && liveBadges.length > 0 ? liveBadges : localBadgesList;

  const [nextBadge, setNextBadge] = useState(initialNextBadge);
  const [localCollection, setLocalCollection] = useState<CollectionItem[]>(initialCollectionItems);
  const collectionItems = liveCollection && liveCollection.length > 0 ? liveCollection : localCollection;

  const [waysToEarn, setWaysToEarn] = useState<WaysToEarnItem[]>(initialWaysToEarn);

  // Filter States
  const [activeCategory, setActiveCategory] = useState<RewardCategory>('all');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Modals
  const [selectedRewardForModal, setSelectedRewardForModal] = useState<RewardItem | null>(null);
  const [selectedBadgeForModal, setSelectedBadgeForModal] = useState<RewardBadge | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [rewardParticles, setRewardParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Toast Feedback State
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setActionToast(message);
    setTimeout(() => setActionToast(null), 3500);
  };

  // Filtered featured rewards based on category and search query
  const filteredRewards = useMemo(() => {
    return rewardsList.filter((r) => {
      const matchesCat = activeCategory === 'all' || r.category === activeCategory;
      const q = (categorySearchQuery || globalSearch).toLowerCase().trim();
      const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.badgeTag.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [rewardsList, activeCategory, categorySearchQuery, globalSearch]);

  // Handlers
  const handleUnlockReward = async (reward: RewardItem, termsAccepted: boolean = true) => {
    if (reward.status === 'owned' || reward.status === 'active') {
      soundFx.playCheckmark();
      handleActivateReward(reward);
      return;
    }

    if (!termsAccepted) {
      showToast('You must agree to the Reward Claim Terms & Conditions.');
      return;
    }

    if (momentumPoints < reward.cost) {
      showToast(`Not enough Gold / Momentum Points! Need ${reward.cost.toLocaleString()} MP.`);
      return;
    }

    try {
      soundFx.playCoin();
      setTimeout(() => soundFx.playRewardUnlocked(), 180);
      setRewardParticles((prev) => [
        ...prev,
        { id: Date.now(), x: window.innerWidth / 2, y: window.innerHeight / 2 },
      ]);

      if (onClaimReward) {
        await onClaimReward(reward.id, termsAccepted);
      } else {
        await api.claimReward(reward.id, termsAccepted);
      }
      showToast(`🎉 Claim verified! Unlocked "${reward.name}" (-${reward.cost} Gold)`);
      setSelectedRewardForModal(null);
    } catch (err: any) {
      showToast(`Claim rejected: ${err.message || 'Validation failed'}`);
      throw err;
    }
  };

  const handleActivateReward = async (reward: RewardItem) => {
    try {
      if (onActivateReward) {
        await onActivateReward(reward.id);
      } else {
        await api.activateReward(reward.id);
      }
      showToast(`${reward.name} is now active!`);
      setSelectedRewardForModal(null);
    } catch (err: any) {
      showToast(`Activation failed: ${err.message}`);
    }
  };

  const handleToggleProfileBadge = (badge: RewardBadge) => {
    setLocalBadgesList((prev) =>
      prev.map((b) => ({
        ...b,
        isProfileBadge: b.id === badge.id ? !b.isProfileBadge : false,
      }))
    );
    const willBeActive = !badge.isProfileBadge;
    showToast(willBeActive ? `Set "${badge.name}" as your profile badge!` : `Removed profile badge`);
  };

  const handleUnlockPremium = () => {
    if (momentumPoints < 5000) {
      showToast('Need 5,000 MP to unlock 30 Days of Premium!');
      return;
    }
    showToast('🎉 Unlocked 30 Days of Premium! All features enabled.');
  };

  const handleOpenNextBadgeDetails = () => {
    const matched = badgesList.find((b) => b.id === nextBadge.id) || badgesList[2];
    setSelectedBadgeForModal(matched);
  };

  return (
    <div id="rewards-page-container" className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12 bg-[#F8FAFC] dark:bg-[#090B0F] text-slate-900 dark:text-[#F7F8FC]">
      {/* 1. TOP BAR */}
      <header 
        id="rewards-top-bar"
        className="h-[72px] bg-white dark:bg-[#0D1015] border-b border-slate-200 dark:border-white/6 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs"
      >
        {/* Mobile Hamburger & Logo (visible on < lg) */}
        <div className="flex items-center gap-3 lg:hidden">
          <button 
            onClick={onToggleMobileMenu}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-[#9AA3B5] hover:text-slate-900 dark:hover:text-white cursor-pointer"
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

        {/* Global Search Bar on Desktop (matching image exact placeholder) */}
        <div className="hidden lg:flex items-center flex-1 max-w-[480px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#687185] absolute left-3.5 top-3" />
            <input 
              id="rewards-global-search-input"
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search rewards, themes, icons, badges..."
              className="w-full h-10 pl-10 pr-12 rounded-xl bg-slate-100 dark:bg-[#12161E] border border-slate-200 dark:border-white/8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#687185] focus:outline-none focus:border-[#6366F1] transition-all"
            />
            <kbd className="absolute right-3 top-2.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[10px] text-slate-500 dark:text-[#687185] font-mono">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Right Controls: Claim Policy, Theme Toggle, Notifications, Avatar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsTermsModalOpen(true)}
            className="h-9 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Reward Claim Policy & Terms"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-[#818CF8]" />
            <span className="hidden sm:inline">Claim Policy</span>
          </button>

          <button 
            onClick={() => setIsDark(!isDark)}
            title="Toggle theme"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 flex items-center justify-center text-slate-600 dark:text-[#9AA3B5] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button 
            title="Notifications"
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 flex items-center justify-center text-slate-600 dark:text-[#9AA3B5] hover:text-slate-900 dark:hover:text-white transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0D1015]" />
          </button>

          {/* User Avatar Alex */}
          <div 
            onClick={() => {
              const activeBadge = badgesList.find((b) => b.isProfileBadge) || badgesList[1];
              setSelectedBadgeForModal(activeBadge);
            }}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#818CF8] p-[1.5px] cursor-pointer ring-2 ring-indigo-500/20 hover:ring-indigo-500/50 transition-all"
            title="View Profile Badge"
          >
            <div className="w-full h-full rounded-full bg-slate-100 dark:bg-[#11161D] flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">
              A
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1240px] w-full mx-auto space-y-6">
        
        {/* HERO BANNER SECTION */}
        <RewardsHeroBanner
          momentumPoints={momentumPoints}
          pointsThisWeek={pointsThisWeek}
          streakDays={streakDays}
          weeklyConsistency={initialWeeklyConsistency}
          level={initialLevel}
          currentXP={initialXP}
          maxXP={initialMaxXP}
          onOpenPointsDetail={() => showToast(`Balance: ${momentumPoints.toLocaleString()} Momentum Points (+${pointsThisWeek} this week)`)}
        />

        {/* CATEGORY FILTER ROW */}
        <RewardsCategoryFilter
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={categorySearchQuery}
          onSearchChange={setCategorySearchQuery}
          onToggleFilterModal={() => {
            // cycle through categories or show quick alert
            const cats: RewardCategory[] = ['all', 'themes', 'icons', 'badges', 'profile', 'animations', 'widgets', 'premium'];
            const nextIdx = (cats.indexOf(activeCategory) + 1) % cats.length;
            setActiveCategory(cats[nextIdx]);
          }}
        />

        {/* FEATURED REWARDS SECTION */}
        <FeaturedRewardsSection
          rewards={filteredRewards}
          userPoints={momentumPoints}
          onSelectReward={(reward) => setSelectedRewardForModal(reward)}
          onUnlockReward={handleUnlockReward}
          onSeeAll={() => setActiveCategory('all')}
        />

        {/* BADGE PROGRESS + YOUR NEXT BADGE SECTION */}
        <BadgeProgressSection
          badges={badgesList}
          nextBadge={nextBadge}
          onSelectBadge={(badge) => setSelectedBadgeForModal(badge)}
          onViewNextBadgeDetails={handleOpenNextBadgeDetails}
          onSeeAllBadges={() => setActiveCategory('badges')}
        />

        {/* BOTTOM ROW: YOUR COLLECTION + WAYS TO EARN MP + GET PREMIUM FOR 30 DAYS */}
        <RewardsBottomRow
          collectionItems={collectionItems}
          waysToEarn={waysToEarn}
          userPoints={momentumPoints}
          onUnlockPremium={handleUnlockPremium}
          onSelectCollectionItem={(item) => showToast(`Viewing unlocked item: ${item.name}`)}
          onViewAllCollection={() => showToast('All unlocked cosmetics are active on your profile.')}
        />

      </main>

      {/* Action Toast Feedback */}
      {actionToast && (
        <div 
          id="rewards-action-toast"
          className="fixed bottom-20 lg:bottom-8 right-6 z-50 bg-white dark:bg-[#151A22] text-slate-900 dark:text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="w-5 h-5 rounded-full bg-[#6366F1]/20 text-[#6366F1] dark:text-[#818CF8] flex items-center justify-center">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{actionToast}</span>
        </div>
      )}

      {/* MODALS */}
      <RewardDetailModal
        reward={selectedRewardForModal}
        isOpen={!!selectedRewardForModal}
        onClose={() => setSelectedRewardForModal(null)}
        userPoints={momentumPoints}
        onUnlock={handleUnlockReward}
        onActivate={handleActivateReward}
        onOpenTerms={() => setIsTermsModalOpen(true)}
      />

      <RewardTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => {
          setIsTermsModalOpen(false);
          showToast('Terms accepted');
        }}
      />

      <BadgeDetailModal
        badge={selectedBadgeForModal}
        isOpen={!!selectedBadgeForModal}
        onClose={() => setSelectedBadgeForModal(null)}
        onToggleProfileBadge={handleToggleProfileBadge}
      />

      {/* Reward Claim Celebration Particles */}
      {rewardParticles.map((burst) => (
        <ParticleBurst
          key={burst.id}
          x={burst.x}
          y={burst.y}
          count={36}
          colors={['#F59E0B', '#FBBF24', '#FCD34D', '#6366F1', '#EC4899', '#10B981']}
          onComplete={() => {
            setRewardParticles((prev) => prev.filter((p) => p.id !== burst.id));
          }}
        />
      ))}
    </div>
  );
};
