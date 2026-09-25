import { UserProfile, Quest, Attribute, WeeklyData, FriendLeaderboardItem, Goal, QuickNote, TaskItem } from '../types';

export const initialUserProfile: UserProfile = {
  name: 'Alex',
  level: 12,
  currentXp: 780,
  nextLevelXp: 1200,
  streakDays: 12,
  totalPoints: 842,
  questsDoneThisWeek: 5,
};

export const freshUserProfile: UserProfile = {
  name: 'Adventurer',
  level: 1,
  currentXp: 0,
  nextLevelXp: 500,
  streakDays: 0,
  streak: 0,
  totalPoints: 0,
  momentumPoints: 0,
  questsDoneThisWeek: 0,
  pointsThisWeek: 0,
  weeklyConsistency: 0,
};

export const initialQuests: Quest[] = [
  {
    id: 'quest-1',
    title: 'Solve 2 DSA problems',
    subtitle: 'Sharpen your problem solving skills.',
    category: 'focus',
    durationMinutes: 30,
    xpReward: 80,
    attribute: 'Intellect',
    completed: false,
    isStarted: true,
  },
  {
    id: 'quest-2',
    title: 'Go for a short walk',
    subtitle: 'Clear your mind, boost your energy.',
    category: 'health',
    durationMinutes: 20,
    xpReward: 30,
    attribute: 'Strength',
    completed: false,
    isStarted: false,
  },
  {
    id: 'quest-3',
    title: 'Read 20 pages',
    subtitle: 'A wiser you, one page at a time.',
    category: 'learning',
    durationMinutes: 15,
    xpReward: 40,
    attribute: 'Knowledge',
    completed: false,
    isStarted: false,
  },
  {
    id: 'quest-4',
    title: 'Meditate to relax',
    subtitle: 'A calmer mind leads to a better you.',
    category: 'personal',
    durationMinutes: 10,
    xpReward: 20,
    attribute: 'Discipline',
    completed: false,
    isStarted: false,
  },
];

export const initialAttributes: Attribute[] = [
  {
    id: 'attr-1',
    name: 'Intellect',
    level: 8,
    percentage: 72,
    color: '#7C6CFF',
    bgLight: '#EEECFF',
    iconName: 'Sparkles',
  },
  {
    id: 'attr-2',
    name: 'Discipline',
    level: 12,
    percentage: 88,
    color: '#F97316',
    bgLight: '#FFF7ED',
    iconName: 'Flame',
  },
  {
    id: 'attr-3',
    name: 'Strength',
    level: 6,
    percentage: 40,
    color: '#EA580C',
    bgLight: '#FFEDD5',
    iconName: 'BicepsFlexed',
  },
  {
    id: 'attr-4',
    name: 'Knowledge',
    level: 10,
    percentage: 66,
    color: '#3B82F6',
    bgLight: '#EFF6FF',
    iconName: 'BookOpen',
  },
];

export const freshAttributes: Attribute[] = [
  {
    id: 'attr-1',
    name: 'Intellect',
    level: 1,
    percentage: 0,
    color: '#7C6CFF',
    bgLight: '#EEECFF',
    iconName: 'Sparkles',
  },
  {
    id: 'attr-2',
    name: 'Discipline',
    level: 1,
    percentage: 0,
    color: '#F97316',
    bgLight: '#FFF7ED',
    iconName: 'Flame',
  },
  {
    id: 'attr-3',
    name: 'Strength',
    level: 1,
    percentage: 0,
    color: '#EA580C',
    bgLight: '#FFEDD5',
    iconName: 'BicepsFlexed',
  },
  {
    id: 'attr-4',
    name: 'Knowledge',
    level: 1,
    percentage: 0,
    color: '#3B82F6',
    bgLight: '#EFF6FF',
    iconName: 'BookOpen',
  },
];

export const weeklyProgressData: WeeklyData[] = [
  { day: 'Monday', dayShort: 'Mon', xp: 180, heightPercent: 45 },
  { day: 'Tuesday', dayShort: 'Tue', xp: 260, heightPercent: 68 },
  { day: 'Wednesday', dayShort: 'Wed', xp: 210, heightPercent: 54 },
  { day: 'Thursday', dayShort: 'Thu', xp: 320, heightPercent: 92, isToday: true },
  { day: 'Friday', dayShort: 'Fri', xp: 190, heightPercent: 48 },
  { day: 'Saturday', dayShort: 'Sat', xp: 140, heightPercent: 35 },
  { day: 'Sunday', dayShort: 'Sun', xp: 220, heightPercent: 58 },
];

export const getFreshWeeklyData = (): WeeklyData[] => {
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Mon=0, Tue=1, ... Sun=6
  const baseDays = [
    { day: 'Monday', dayShort: 'Mon', xp: 0, heightPercent: 0 },
    { day: 'Tuesday', dayShort: 'Tue', xp: 0, heightPercent: 0 },
    { day: 'Wednesday', dayShort: 'Wed', xp: 0, heightPercent: 0 },
    { day: 'Thursday', dayShort: 'Thu', xp: 0, heightPercent: 0 },
    { day: 'Friday', dayShort: 'Fri', xp: 0, heightPercent: 0 },
    { day: 'Saturday', dayShort: 'Sat', xp: 0, heightPercent: 0 },
    { day: 'Sunday', dayShort: 'Sun', xp: 0, heightPercent: 0 },
  ];
  return baseDays.map((d, idx) => ({
    ...d,
    isToday: idx === currentDayIndex,
  }));
};

export const freshWeeklyData: WeeklyData[] = getFreshWeeklyData();

export const leaderboardFriends: FriendLeaderboardItem[] = [
  {
    id: 'friend-1',
    rank: 1,
    name: 'Priya',
    level: 18,
    xp: 1240,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'friend-2',
    rank: 2,
    name: 'Alex',
    level: 12,
    xp: 842,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    isCurrentUser: true,
  },
  {
    id: 'friend-3',
    rank: 3,
    name: 'Rohan',
    level: 11,
    xp: 730,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'friend-4',
    rank: 4,
    name: 'Sneha',
    level: 10,
    xp: 690,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'friend-5',
    rank: 5,
    name: 'Karan',
    level: 9,
    xp: 520,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
];

export const initialGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'Become a software engineer',
    progressPercent: 62,
    completedUnits: 4,
    totalUnits: 7,
    unitLabel: 'milestones',
    category: 'career',
    iconType: 'target',
    color: '#6366F1',
  },
  {
    id: 'goal-2',
    title: 'Get in better shape',
    progressPercent: 35,
    completedUnits: 2,
    totalUnits: 5,
    unitLabel: 'milestones',
    category: 'health',
    iconType: 'dumbbell',
    color: '#EF4444',
  },
  {
    id: 'goal-3',
    title: 'Read 24 books this year',
    progressPercent: 20,
    completedUnits: 5,
    totalUnits: 24,
    unitLabel: 'books',
    category: 'education',
    iconType: 'book',
    color: '#F59E0B',
  },
];

export const initialNotes: QuickNote[] = [
  {
    id: 'note-1',
    type: 'yellow',
    title: 'Keep going!',
    content: 'Consistency compounds. ✨',
  },
  {
    id: 'note-2',
    type: 'purple',
    title: 'Ideas',
    bullets: ['Build portfolio website', 'Learn system design'],
  },
  {
    id: 'note-3',
    type: 'pink',
    title: 'Reminder',
    content: 'Progress > Perfection',
  },
];

export const initialTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Solve 2 DSA problems',
    description: 'Solve medium level DSA problems on arrays and hashmaps.',
    completed: false,
    viewCategory: 'today',
    dueText: 'Today, 10:00 AM',
    labels: ['Study', 'DSA'],
    priority: 'high',
    xpReward: 20,
    subtasks: [
      { id: 'st-1', title: 'Problem 1', completed: true },
      { id: 'st-2', title: 'Problem 2', completed: false },
      { id: 'st-3', title: 'Revise solution', completed: false }
    ],
    notes: 'Remember to check edge cases and analyze space complexity.',
    attachments: [
      { name: 'DSA_Notes.pdf', size: '2.4 MB', type: 'pdf' },
      { name: 'Array_Questions.pdf', size: '1.2 MB', type: 'pdf' }
    ]
  },
  {
    id: 'task-2',
    title: 'Go for a short walk',
    description: 'Take a 20-minute break outside to get fresh air.',
    completed: false,
    viewCategory: 'today',
    dueText: 'Today, 6:00 PM',
    labels: ['Health'],
    priority: 'low',
    xpReward: 10
  },
  {
    id: 'task-3',
    title: 'Read 20 pages',
    description: 'Continue reading Atomic Habits.',
    completed: false,
    viewCategory: 'today',
    dueText: 'Today, 9:00 PM',
    labels: ['Study', 'Reading'],
    priority: 'medium',
    xpReward: 15
  },
  {
    id: 'task-4',
    title: 'Meditate for 10 minutes',
    description: 'Mindful breathing session.',
    completed: false,
    viewCategory: 'today',
    dueText: 'Today',
    labels: ['Health'],
    priority: 'low',
    xpReward: 10
  },
  {
    id: 'task-5',
    title: 'Design portfolio website',
    description: 'Create responsive high-fidelity mocks in Figma.',
    completed: false,
    viewCategory: 'upcoming',
    dueText: 'Tomorrow',
    labels: ['Projects'],
    priority: 'low',
    xpReward: 25
  },
  {
    id: 'task-6',
    title: 'Plan next week',
    description: 'Review sprints, schedule timeblocks.',
    completed: false,
    viewCategory: 'upcoming',
    dueText: 'Tomorrow',
    labels: ['Personal'],
    priority: 'low',
    xpReward: 15
  },
  {
    id: 'task-7',
    title: 'Grocery shopping',
    description: 'Almond milk, eggs, bananas, oats.',
    completed: false,
    viewCategory: 'today',
    dueText: 'Today',
    labels: ['Personal'],
    priority: 'low',
    xpReward: 10
  },
  {
    id: 'task-8',
    title: 'Call home',
    description: 'Catch up with parents in the evening.',
    completed: false,
    viewCategory: 'upcoming',
    dueText: 'Tomorrow',
    labels: ['Personal'],
    priority: 'low',
    xpReward: 10
  },
  {
    id: 'task-9',
    title: 'Submit quarterly expense report',
    description: 'Attach receipts for software subscriptions.',
    completed: false,
    viewCategory: 'overdue',
    dueText: 'Yesterday, 5:00 PM',
    labels: ['Projects'],
    priority: 'high',
    xpReward: 15
  },
  {
    id: 'task-10',
    title: 'Dentist follow-up appointment',
    description: 'Confirm routine cleaning appointment.',
    completed: false,
    viewCategory: 'overdue',
    dueText: '2 days ago',
    labels: ['Health'],
    priority: 'medium',
    xpReward: 10
  },
  {
    id: 'task-11',
    title: 'Organize desk setup and cable management',
    completed: false,
    viewCategory: 'someday',
    dueText: 'Someday',
    labels: ['Personal'],
    priority: 'low',
    xpReward: 10
  },
  {
    id: 'task-12',
    title: 'Explore Rust async programming basics',
    completed: false,
    viewCategory: 'someday',
    dueText: 'Someday',
    labels: ['Study'],
    priority: 'low',
    xpReward: 20
  },
  {
    id: 'task-13',
    title: 'Backup external drive to cold storage',
    completed: false,
    viewCategory: 'someday',
    dueText: 'Someday',
    labels: ['Personal'],
    priority: 'low',
    xpReward: 15
  },
  {
    id: 'task-14',
    title: 'Research mechanical keyboard switches',
    completed: false,
    viewCategory: 'someday',
    dueText: 'Someday',
    labels: ['Projects'],
    priority: 'low',
    xpReward: 5
  },
  {
    id: 'task-15',
    title: 'Review pull request for auth refactor',
    completed: false,
    viewCategory: 'upcoming',
    dueText: 'Friday, 3:00 PM',
    labels: ['Projects'],
    priority: 'medium',
    xpReward: 20
  },
  {
    id: 'task-16',
    title: 'Full body strength workout',
    completed: false,
    viewCategory: 'upcoming',
    dueText: 'Saturday, 9:00 AM',
    labels: ['Workout', 'Health'],
    priority: 'medium',
    xpReward: 25
  },
  {
    id: 'task-17',
    title: 'Refactor state management in dashboard',
    completed: false,
    viewCategory: 'upcoming',
    dueText: 'Monday',
    labels: ['Projects'],
    priority: 'medium',
    xpReward: 25
  },
  {
    id: 'task-18',
    title: 'Schedule car oil change',
    completed: false,
    viewCategory: 'upcoming',
    dueText: 'Next week',
    labels: ['Personal'],
    priority: 'low',
    xpReward: 10
  },
  {
    id: 'task-19',
    title: 'Clean kitchen pantry and organize spices',
    completed: false,
    viewCategory: 'someday',
    dueText: 'Someday',
    labels: ['Personal'],
    priority: 'low',
    xpReward: 10
  },
  {
    id: 'task-20',
    title: 'Draft blog post on design tokens',
    completed: false,
    viewCategory: 'someday',
    dueText: 'Someday',
    labels: ['Study', 'Projects'],
    priority: 'low',
    xpReward: 20
  },
  {
    id: 'task-21',
    title: 'Setup GitHub Actions CI for unit tests',
    completed: false,
    viewCategory: 'upcoming',
    dueText: 'Next Wednesday',
    labels: ['Projects'],
    priority: 'medium',
    xpReward: 20
  },
  {
    id: 'task-22',
    title: 'Update LinkedIn bio and credentials',
    completed: false,
    viewCategory: 'upcoming',
    dueText: 'Next Friday',
    labels: ['Personal'],
    priority: 'low',
    xpReward: 10
  },
  {
    id: 'task-23',
    title: 'Plan vacation itinerary for summer',
    completed: false,
    viewCategory: 'upcoming',
    dueText: 'End of month',
    labels: ['Personal'],
    priority: 'low',
    xpReward: 15
  },
  {
    id: 'task-24',
    title: 'Morning stretch and mobility routine',
    completed: true,
    viewCategory: 'today',
    dueText: 'Today, 7:30 AM',
    labels: ['Workout', 'Health'],
    priority: 'low',
    xpReward: 10
  },
  {
    id: 'task-25',
    title: 'Review emails and clear inbox',
    completed: true,
    viewCategory: 'today',
    dueText: 'Today, 8:30 AM',
    labels: ['Projects'],
    priority: 'low',
    xpReward: 10
  },
  {
    id: 'task-26',
    title: 'Hydrate 1L water before noon',
    completed: true,
    viewCategory: 'today',
    dueText: 'Today, 11:30 AM',
    labels: ['Health'],
    priority: 'low',
    xpReward: 10
  }
];

export const initialNotifications: import('../types').AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Google Calendar Connected',
    description: 'Calendar events successfully synchronized. 4 new events detected.',
    timeAgo: '10m ago',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: false,
    type: 'calendar',
    iconName: 'Calendar',
    actionLabel: 'View Calendar',
  },
  {
    id: 'notif-2',
    title: 'Level 12 Reached! 🎉',
    description: 'Congratulations! You unlocked the Master of Discipline title and +150 MP.',
    timeAgo: '1h ago',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
    type: 'level',
    iconName: 'Award',
  },
  {
    id: 'notif-3',
    title: 'Daily Quest Ready',
    description: 'Solve 2 DSA problems is waiting for you today. +80 XP on completion.',
    timeAgo: '3h ago',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    read: false,
    type: 'quest',
    iconName: 'Sparkles',
    actionLabel: 'Start Quest',
  },
  {
    id: 'notif-4',
    title: 'Friend Quest Challenge',
    description: 'Sarah Jenkins invited you to a 7-day deep focus study challenge.',
    timeAgo: '5h ago',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    read: true,
    type: 'friend',
    iconName: 'UserPlus',
  },
  {
    id: 'notif-5',
    title: 'Streak Milestone: 12 Days',
    description: 'Keep going! 2 more days to earn the 2-Week Unstoppable badge.',
    timeAgo: '1d ago',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    read: true,
    type: 'system',
    iconName: 'CheckCircle2',
  },
];
