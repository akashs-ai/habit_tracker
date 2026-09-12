import { RewardItem, RewardBadge, CollectionItem, WaysToEarnItem } from '../types';

export const initialMomentumPoints = 4320;
export const initialPointsThisWeek = 240;
export const initialStreakDays = 21;
export const initialWeeklyConsistency = 92;
export const initialLevel = 12;
export const initialXP = 2180;
export const initialMaxXP = 5000;

export const initialFeaturedRewards: RewardItem[] = [
  {
    id: 'reward-aurora-theme',
    name: 'Aurora Theme',
    category: 'themes',
    badgeTag: 'Theme',
    description: 'A clean and modern aesthetic to keep you focused.',
    cost: 800,
    status: 'available',
    previewType: 'aurora-theme',
    accentColor: '#38BDF8',
    includes: [
      'Calm dark interface with aurora atmospheric glow',
      'Refined midnight typography and crisp borders',
      'Seamless support across all productivity dashboards'
    ]
  },
  {
    id: 'reward-focus-icons',
    name: 'Focus Icon Pack',
    category: 'icons',
    badgeTag: 'Icons',
    description: 'Minimal icons for your habits, goals and tasks.',
    cost: 500,
    status: 'available',
    previewType: 'focus-icons',
    accentColor: '#818CF8',
    includes: [
      '30+ handcrafted minimal SVG icons',
      'Dual line weight and solid fill states',
      'Custom category markers for tasks & habits'
    ]
  },
  {
    id: 'reward-30d-consistency',
    name: '30-Day Consistency',
    category: 'badges',
    badgeTag: 'Badge',
    description: 'A special badge to celebrate your dedication.',
    cost: 1200,
    status: 'available',
    previewType: 'flame-badge',
    accentColor: '#F59E0B',
    includes: [
      'Polished hexagonal flame profile badge',
      'Special streak glow displayed on leaderboards',
      'Permanent profile showcase recognition'
    ]
  },
  {
    id: 'reward-glass-frame',
    name: 'Glass Profile Frame',
    category: 'profile',
    badgeTag: 'Profile',
    description: 'A minimal glass frame for your profile.',
    cost: 700,
    status: 'available',
    previewType: 'glass-frame',
    accentColor: '#38BDF8',
    includes: [
      'Frosted cyan-to-violet circular frame',
      'Subtle ambient shimmer on profile avatar',
      'Visible in friends lists, groups, and rankings'
    ]
  },
  {
    id: 'reward-completion-effect',
    name: 'Completion Effect',
    category: 'animations',
    badgeTag: 'Animation',
    description: 'Smooth and satisfying completion animation.',
    cost: 600,
    status: 'available',
    previewType: 'completion-effect',
    accentColor: '#6366F1',
    includes: [
      'Restrained, tactile checkmark ripple physics',
      'Audio-visual haptic resonance effect',
      'Fully respects reduced-motion preferences'
    ]
  }
];

export const initialBadges: RewardBadge[] = [
  {
    id: 'badge-first-step',
    name: 'First Step',
    description: 'Complete your first habit to begin the journey.',
    requirement: 'Complete 1 habit',
    status: 'owned',
    progress: 1,
    maxProgress: 1,
    iconType: 'first-step',
    color: '#34D399',
    earnedAt: 'Oct 12, 2025',
    isProfileBadge: false
  },
  {
    id: 'badge-7d-streak',
    name: '7-Day Streak',
    description: 'Maintained unbroken consistency for a full week.',
    requirement: 'Stay consistent for 7 days',
    status: 'owned',
    progress: 7,
    maxProgress: 7,
    iconType: '7-day',
    color: '#F59E0B',
    earnedAt: 'Nov 04, 2025',
    isProfileBadge: true
  },
  {
    id: 'badge-30d-streak',
    name: '30-Day Streak',
    description: 'Build an enduring habit foundation over 30 days.',
    requirement: 'Stay consistent for 30 days',
    cost: 1200,
    status: 'in_progress',
    progress: 21,
    maxProgress: 30,
    iconType: '30-day',
    color: '#818CF8'
  },
  {
    id: 'badge-early-riser',
    name: 'Early Riser',
    description: 'Conquer morning routines before the day unfolds.',
    requirement: 'Complete 30 morning tasks',
    cost: 800,
    status: 'locked',
    progress: 18,
    maxProgress: 30,
    iconType: 'early-riser',
    color: '#FBBF24'
  },
  {
    id: 'badge-deep-work',
    name: 'Deep Work',
    description: 'Dedicate undivided focus without distraction.',
    requirement: '100 focused study sessions',
    cost: 1500,
    status: 'locked',
    progress: 64,
    maxProgress: 100,
    iconType: 'deep-work',
    color: '#38BDF8'
  },
  {
    id: 'badge-goal-crusher',
    name: 'Goal Crusher',
    description: 'Cross the finish line on major life ambitions.',
    requirement: 'Complete 5 goals',
    cost: 2000,
    status: 'locked',
    progress: 3,
    maxProgress: 5,
    iconType: 'goal-crusher',
    color: '#A855F7'
  },
  {
    id: 'badge-liferpg',
    name: 'LifeRPG Master',
    description: 'A dedicated practitioner of deliberate self-growth.',
    requirement: 'Reach Level 20',
    cost: 3000,
    status: 'locked',
    progress: 12,
    maxProgress: 20,
    iconType: 'liferpg',
    color: '#E2E8F0'
  }
];

export const initialNextBadge = {
  id: 'badge-30d-streak',
  name: '30-Day Streak',
  currentDays: 21,
  totalDays: 30,
  daysRemaining: 9,
  progressPercentage: 70
};

export const initialCollectionItems: CollectionItem[] = [
  { id: 'c-1', name: 'Aurora Theme', type: 'Theme', icon: 'theme', active: true },
  { id: 'c-2', name: 'Focus Icons', type: 'Icon Pack', icon: 'icons', active: true },
  { id: 'c-3', name: 'First Step', type: 'Badge', icon: 'badge', active: false },
  { id: 'c-4', name: '7-Day Streak', type: 'Badge', icon: 'badge', active: true },
  { id: 'c-5', name: 'Default Frame', type: 'Profile', icon: 'profile', active: true },
  { id: 'c-6', name: 'Check Effect', type: 'Animation', icon: 'animation', active: true }
];

export const initialWaysToEarn: WaysToEarnItem[] = [
  { id: 'w-1', action: 'Complete a daily habit', points: 10, icon: 'habit' },
  { id: 'w-2', action: 'Complete all habits today', points: 25, icon: 'habits-all' },
  { id: 'w-3', action: 'Complete a task', points: 5, icon: 'task' },
  { id: 'w-4', action: 'Reach a goal milestone', points: 50, icon: 'goal' },
  { id: 'w-5', action: '7-day consistency', points: 100, icon: 'streak-7' },
  { id: 'w-6', action: '30-day consistency', points: 500, icon: 'streak-30' }
];
