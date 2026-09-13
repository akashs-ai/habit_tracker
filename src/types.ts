export type QuestCategory = 'all' | 'focus' | 'health' | 'learning' | 'personal';

export interface Quest {
  id: string;
  title: string;
  subtitle: string;
  category: 'focus' | 'health' | 'learning' | 'personal';
  durationMinutes: number;
  xpReward: number;
  attribute: 'Intellect' | 'Strength' | 'Knowledge' | 'Discipline';
  completed: boolean;
  isStarted?: boolean;
}

export interface Attribute {
  id: string;
  name: string;
  level: number;
  percentage: number;
  color: string;
  bgLight: string;
  iconName: string;
}

export interface WeeklyData {
  day: string;
  dayShort: string;
  xp: number;
  heightPercent: number;
  isToday?: boolean;
}

export interface FriendLeaderboardItem {
  id: string;
  rank: number;
  name: string;
  level: number;
  xp: number;
  avatarUrl: string;
  isCurrentUser?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  progressPercent: number;
  completedUnits: number;
  totalUnits: number;
  unitLabel: string;
  category: 'career' | 'health' | 'education';
  iconType: 'target' | 'dumbbell' | 'book';
  color: string;
}

export interface QuickNote {
  id: string;
  type: 'yellow' | 'purple' | 'pink';
  title: string;
  content?: string;
  bullets?: string[];
}

export interface UserProfile {
  name: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  totalPoints: number;
  questsDoneThisWeek: number;
}

export type TaskView = 'today' | 'upcoming' | 'overdue' | 'someday' | 'all' | 'inbox' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'image';
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  viewCategory: 'today' | 'upcoming' | 'overdue' | 'someday';
  dueText: string;
  dueDate?: string; // YYYY-MM-DD
  clientDate?: string; // Client's today ISO
  dueTime?: string;
  labels: string[];
  priority: TaskPriority;
  xpReward?: number;
  subtasks?: Subtask[];
  notes?: string;
  attachments?: TaskAttachment[];
}

export type EventCategory =
  | 'study'
  | 'project'
  | 'workout'
  | 'social'
  | 'personal'
  | 'health'
  | 'entertainment'
  | 'other';

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

export type FriendTabType = 'overview' | 'my-friends' | 'requests' | 'leaderboard' | 'groups' | 'discover';

export interface FriendUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  level: number;
  xp: number;
  consistencyDays: number;
  status: 'online' | 'offline' | 'away';
  activityStatus?: string; // e.g. "Working", "Studying", "At Gym", "Online", "Reading"
  bio?: string;
  tags?: string[];
  isCurrentUser?: boolean;
  isFriend?: boolean;
}

export interface FriendRequest {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  reason: string;
  mutualCount?: number;
  timeAgo: string;
}

export interface SuggestedFriend {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  sharedInterest: string;
}

export interface FriendActivity {
  id: string;
  userName: string;
  avatarUrl: string;
  action: string;
  timeAgo: string;
  xpReward: number;
}

export interface UpcomingTogetherItem {
  id: string;
  title: string;
  schedule: string;
  participantsCount: number;
  type: 'study' | 'workout' | 'coding' | 'reading';
  isJoined?: boolean;
  isInterested?: boolean;
}

export interface SocialGroup {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  isPrivate: boolean;
  category: string;
}

export interface SocialChallenge {
  id: string;
  title: string;
  description: string;
  duration: string;
  participantsCount: number;
  progressPercent?: number;
}

export type GoalCategory = 'Career' | 'Health' | 'Learning' | 'Personal' | 'Projects' | 'Custom';
export type GoalStatus = 'active' | 'completed' | 'archived';
export type GoalSortOption = 'priority' | 'progress' | 'dueDate' | 'recentlyUpdated' | 'alphabetical';

export interface GoalMilestone {
  id: string;
  title: string;
  targetDate: string;
  notes?: string;
  completed?: boolean;
}

export interface GoalSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DetailedGoal {
  id: string;
  title: string;
  category: GoalCategory;
  description: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: GoalStatus;
  color: string;
  icon: 'code' | 'heart' | 'book' | 'globe' | 'target' | 'brain' | string;
  collaborator?: {
    name: string;
    avatarUrl?: string;
  };
  subtasks?: GoalSubtask[];
  milestones?: GoalMilestone[];
  notes?: string;
  updatedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD e.g. "2025-03-11"
  startTime?: string; // e.g. "10:00 AM"
  endTime?: string; // e.g. "12:00 PM"
  allDay?: boolean;
  category: EventCategory;
  location?: string;
  description?: string;
  repeat?: string;
  color: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
  attachments?: { name: string; size: string }[];
  priority?: 'high' | 'medium' | 'low';
}

// Rewards Types
export type RewardCategory = 'all' | 'themes' | 'icons' | 'badges' | 'profile' | 'animations' | 'widgets' | 'premium';
export type RewardStatus = 'locked' | 'available' | 'owned' | 'active';

export interface RewardItem {
  id: string;
  name: string;
  category: 'themes' | 'icons' | 'badges' | 'profile' | 'animations' | 'widgets' | 'premium';
  badgeTag: string; // e.g., 'Theme', 'Icons', 'Badge', 'Profile', 'Animation'
  description: string;
  cost: number;
  status: RewardStatus;
  previewType: 'aurora-theme' | 'focus-icons' | 'flame-badge' | 'glass-frame' | 'completion-effect' | 'custom';
  accentColor?: string;
  includes?: string[];
}

export interface RewardBadge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  cost?: number;
  status: 'owned' | 'locked' | 'in_progress';
  progress?: number;
  maxProgress?: number;
  iconType: 'first-step' | '7-day' | '30-day' | 'early-riser' | 'deep-work' | 'goal-crusher' | 'liferpg';
  color: string;
  earnedAt?: string;
  isProfileBadge?: boolean;
}

export interface CollectionItem {
  id: string;
  name: string;
  type: 'Theme' | 'Icon Pack' | 'Badge' | 'Profile' | 'Animation';
  icon: string;
  active?: boolean;
}

export interface WaysToEarnItem {
  id: string;
  action: string;
  points: number;
  icon: 'habit' | 'habits-all' | 'task' | 'goal' | 'streak-7' | 'streak-30';
}

// Analytics Types
export type AnalyticsTimeRange = '7d' | '30d' | '3m' | '1y' | 'all';

export interface AnalyticsKpiData {
  overallConsistency: number;
  consistencyChange: number;
  currentStreakDays: number;
  streakChangeDays: number;
  tasksCompleted: number;
  tasksTotal: number;
  tasksChangePct: number;
  momentumPoints: number;
  momentumPointsWeeklyGain: number;
}

export interface ConsistencyTrendPoint {
  date: string;
  dayLabel: string;
  completionRate: number;
  tasksCompleted?: number;
  totalTasks?: number;
}

export interface HabitBreakdownCategory {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface ConsistentHabitItem {
  id: string;
  name: string;
  percentage: number;
  icon: 'reading' | 'workout' | 'sleep' | 'coding' | 'meditation' | 'water';
  color: string;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Mon) to 6 (Sun)
  weekIndex: number;
  count: number; // 0 to 8+
  consistencyRate: number; // 0 to 100
  level: 0 | 1 | 2 | 3 | 4; // 0: empty, 1: low, 2: med, 3: high, 4: very high
}

export interface TimeDistributionItem {
  category: string;
  hours: number;
  percentage: number;
  color: string;
}

export interface AnalyticsGoalItem {
  id: string;
  title: string;
  percentage: number;
  category: string;
  icon: 'dsa' | 'portfolio' | 'shape' | 'books';
  color: string;
}

export interface AnalyticsInsight {
  id: string;
  headline: string;
  subtext: string;
  type: 'consistency' | 'productivity' | 'workout';
  icon: 'trending-up' | 'clock' | 'heart';
  color: string;
}

export interface AnalyticsAchievement {
  id: string;
  title: string;
  description: string;
  icon: 'streak' | 'riser' | 'focus' | 'consistency' | 'crusher';
  color: string;
  earnedDate?: string;
  isUnlocked: boolean;
}

// AI Coach Types
export interface CoachPromptOption {
  id: string;
  title: string;
  subtitle: string;
  icon: 'study' | 'workout' | 'target' | 'calendar' | 'brain' | 'chat';
  color: string;
  prompt: string;
}

export interface CoachChatMessage {
  id: string;
  sender: 'coach' | 'user';
  text: string;
  timestamp: string;
  agentId?: 'chatgpt' | 'claude' | 'gemini' | string;
  agentName?: string;
  suggestions?: string[];
  actionRecommendation?: {
    title: string;
    description: string;
    actionLabel: string;
  };
}

export interface CoachPack {
  id: string;
  name: string;
  icon: string;
  description: string;
  focusAreas: string[];
}

export interface SuggestedTask {
  id: string;
  time: string;
  title: string;
  category: string;
  durationMinutes: number;
  isAdded: boolean;
}

export interface CoachInsightItem {
  id: string;
  title: string;
  stat: string;
  description: string;
}

// AI Integration Types
export interface AIIntegrationModel {
  id: string;
  name: string;
  status: 'connected' | 'not_connected';
  selected: boolean;
  description: string;
  tags: string[];
  iconType: 'chatgpt' | 'claude' | 'gemini';
  accountEmail?: string;
  connectedAt?: string;
  modelTier?: string;
  lastSyncedAt?: string;
  latencyMs?: number;
  syncStatus?: 'synced' | 'syncing' | 'error' | 'ready';
  isEnvironmentKeyConfigured?: boolean;
  verified?: boolean;
  verifiedAt?: string;
  authMethod?: 'google' | 'apple' | 'phone' | 'email' | 'apikey';
  authProviderName?: string;
  sessionToken?: string;
}

export interface AIAgentVerifyPayload {
  agentId: string;
  authMethod: 'google' | 'apple' | 'phone' | 'email' | 'apikey';
  accountEmail?: string;
  password?: string;
  phoneNumber?: string;
  verificationCode?: string;
  apiKey?: string;
  modelTier?: string;
}

export interface AIVerificationResult {
  success: boolean;
  agent: AIIntegrationModel;
  agents: AIIntegrationModel[];
  verificationReport?: {
    verified: boolean;
    provider: string;
    verifiedAccount: string;
    authMethod: string;
    timestamp: string;
    sessionToken: string;
  };
  error?: string;
}

export interface CalendarIntegrationState {
  provider: string;
  status: 'connected' | 'not_connected';
  account: string;
  permission: 'read_only' | 'no_access';
  useInCoach: boolean;
}

// Settings Types
export type SettingsTabId =
  | 'account'
  | 'appearance'
  | 'notifications'
  | 'privacy'
  | 'connected-apps'
  | 'preferences';

export interface UserSettingsProfile {
  displayName: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  memberSince: string;
  level: number;
  mp: number;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  interfaceDensity: 'comfortable' | 'compact';
  motionEnabled: boolean;
  reducedMotion: boolean;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  taskReminders: boolean;
  goalUpdates: boolean;
  friendActivity: boolean;
  productUpdates: boolean;
}

export interface PreferenceSettings {
  language: string;
  timezone: string;
  weekStartsOn: string;
  defaultLandingPage: string;
  weeklySummary: boolean;
  confirmBeforeDelete: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  lastPasswordChange: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  timezone?: string;
  locale?: string;
  isGuest: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastSeenAt?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export type AuthScreenType =
  | 'landing'
  | 'login'
  | 'signup'
  | 'forgot_password'
  | 'reset_password'
  | 'verify_email'
  | 'guest_prompt';

export type NotificationType = 'quest' | 'task' | 'level' | 'calendar' | 'friend' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  actionUrl?: string;
  actionLabel?: string;
  iconName?: 'Sparkles' | 'CheckCircle2' | 'Calendar' | 'Award' | 'UserPlus' | 'Bell';
}

