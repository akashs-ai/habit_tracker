import fs from 'fs';
import path from 'path';
import { 
  UserProfile, 
  Quest, 
  TaskItem, 
  CalendarEvent, 
  DetailedGoal, 
  RewardItem, 
  RewardBadge, 
  CollectionItem, 
  WaysToEarnItem, 
  QuickNote, 
  Attribute, 
  WeeklyData,
  AnalyticsKpiData,
  ConsistencyTrendPoint,
  HabitBreakdownCategory,
  ConsistentHabitItem,
  HeatmapDay,
  TimeDistributionItem,
  AnalyticsGoalItem,
  AnalyticsInsight,
  AnalyticsAchievement,
  AIIntegrationModel
} from '../src/types';
import { 
  initialUserProfile, 
  initialQuests, 
  initialAttributes, 
  weeklyProgressData, 
  initialTasks, 
  initialNotes 
} from '../src/data/mockData';
import { initialCalendarEvents } from '../src/data/calendarMockData';
import { initialGoalsData } from '../src/data/goalsMockData';
import { 
  initialFeaturedRewards, 
  initialBadges, 
  initialCollectionItems, 
  initialWaysToEarn,
  initialMomentumPoints,
  initialPointsThisWeek,
  initialStreakDays,
  initialWeeklyConsistency
} from '../src/data/rewardsMockData';
import { REWARD_TERMS_POLICY, RewardTermsPolicy } from './terms';
import { createLiveAnchoredEvents, getLiveTodayISO, addDaysISO } from '../src/utils/dateUtils';

function calculateEndTimeStr(startTime: string): string {
  const match = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return '11:00 AM';
  let hour = parseInt(match[1], 10);
  const min = match[2];
  let meridiem = match[3].toUpperCase();
  
  if (hour === 12) {
    hour = 1;
  } else if (hour === 11) {
    hour = 12;
    meridiem = meridiem === 'AM' ? 'PM' : 'AM';
  } else {
    hour += 1;
  }
  return `${hour}:${min} ${meridiem}`;
}

export interface RewardClaimRecord {
  id: string;
  rewardId: string;
  rewardName: string;
  category: string;
  cost: number;
  claimedAt: string;
  status: 'approved' | 'verified';
  termsAccepted: boolean;
  termsVersion: string;
  transactionHash: string;
}

export interface ActivityCheckIn {
  date: string; // YYYY-MM-DD
  habitsCompleted: number;
  tasksCompleted: number;
  xpEarned: number;
  momentumPointsEarned: number;
}

export interface AppStoreData {
  user: UserProfile & {
    momentumPoints: number;
    pointsThisWeek: number;
    weeklyConsistency: number;
  };
  quests: Quest[];
  tasks: TaskItem[];
  calendarEvents: CalendarEvent[];
  goals: DetailedGoal[];
  rewards: RewardItem[];
  badges: RewardBadge[];
  collectionItems: CollectionItem[];
  waysToEarn: WaysToEarnItem[];
  claims: RewardClaimRecord[];
  notes: QuickNote[];
  attributes: Attribute[];
  weeklyData: WeeklyData[];
  activityHistory: ActivityCheckIn[];
  termsPolicy: RewardTermsPolicy;
  aiAgents?: AIIntegrationModel[];
  lastUpdated: string;
}

export const defaultAIAgents: AIIntegrationModel[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    status: 'connected',
    selected: true,
    description: 'Great for general productivity, explanations and daily task breakdown.',
    tags: ['Fast', 'Versatile', 'Popular'],
    iconType: 'chatgpt',
    accountEmail: 'alex.das@openai.user',
    connectedAt: new Date().toISOString(),
    modelTier: 'GPT-4o (Omni)',
  },
  {
    id: 'claude',
    name: 'Claude',
    status: 'not_connected',
    selected: false,
    description: 'Best for deep thinking, structured guidance and long-form reasoning.',
    tags: ['Thoughtful', 'Detailed', 'Safe'],
    iconType: 'claude',
    modelTier: 'Claude 3.5 Sonnet',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    status: 'not_connected',
    selected: false,
    description: 'Best with Google ecosystem, real-time schedule alignment, and rapid planning.',
    tags: ['Real-time', 'Integrated', 'Multimodal'],
    iconType: 'gemini',
    modelTier: 'Gemini 3.8 Flash',
  },
];

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Helper to format YYYY-MM-DD
export function getTodayDateStr(): string {
  return getLiveTodayISO();
}

class LifeRpgDatabase {
  private data: AppStoreData;

  constructor() {
    this.data = this.loadInitialData();
  }

  private loadInitialData(): AppStoreData {
    const todayStr = getTodayDateStr();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[new Date().getDay()];

    const formatWeeklyWithToday = (data: WeeklyData[]) => {
      return (data || weeklyProgressData).map((w) => ({
        ...w,
        isToday: w.day.toLowerCase() === currentDayName.toLowerCase(),
      }));
    };

    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure policy is updated to latest
        parsed.termsPolicy = REWARD_TERMS_POLICY;
        parsed.weeklyData = formatWeeklyWithToday(parsed.weeklyData);

        // Ensure calendar events are populated with active live dates
        const hasLiveEvents = parsed.calendarEvents?.some((e: CalendarEvent) => e.date === todayStr);
        if (!hasLiveEvents || parsed.calendarEvents.length === 0) {
          parsed.calendarEvents = createLiveAnchoredEvents(todayStr);
        }

        // Ensure AI agents list is populated and upgraded with sync properties
        if (!parsed.aiAgents || parsed.aiAgents.length === 0) {
          parsed.aiAgents = defaultAIAgents;
        } else {
          parsed.aiAgents = parsed.aiAgents.map((agent: any) => {
            const def = defaultAIAgents.find((d) => d.id === agent.id);
            return {
              ...def,
              ...agent,
              syncStatus: agent.syncStatus || (agent.status === 'connected' ? 'synced' : 'ready'),
              latencyMs: agent.latencyMs || (agent.id === 'gemini' ? 98 : agent.id === 'chatgpt' ? 185 : 162),
              lastSyncedAt: agent.lastSyncedAt || new Date().toISOString(),
              isEnvironmentKeyConfigured: agent.id === 'gemini' ? Boolean(process.env.GEMINI_API_KEY) : false,
            };
          });
        }

        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing store.json, re-initializing from defaults:', e);
    }

    // Generate standard 14 days of realistic activity history
    const history: ActivityCheckIn[] = [];
    const baseDate = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const isPast = i > 0;
      history.push({
        date: ds,
        habitsCompleted: isPast ? (i % 3 === 0 ? 3 : 4) : 0,
        tasksCompleted: isPast ? (i % 2 === 0 ? 3 : 5) : 0,
        xpEarned: isPast ? (i % 2 === 0 ? 120 : 160) : 0,
        momentumPointsEarned: isPast ? (i % 2 === 0 ? 45 : 75) : 0,
      });
    }

    const defaultStore: AppStoreData = {
      user: {
        ...initialUserProfile,
        momentumPoints: initialMomentumPoints,
        pointsThisWeek: initialPointsThisWeek,
        weeklyConsistency: initialWeeklyConsistency,
      },
      quests: initialQuests,
      tasks: initialTasks,
      calendarEvents: createLiveAnchoredEvents(todayStr),
      goals: initialGoalsData,
      rewards: initialFeaturedRewards,
      badges: initialBadges,
      collectionItems: initialCollectionItems,
      waysToEarn: initialWaysToEarn,
      claims: [
        {
          id: 'CLM-2025-001',
          rewardId: 'reward-first-step',
          rewardName: 'First Step Badge',
          category: 'badges',
          cost: 0,
          claimedAt: '2025-02-28T10:00:00Z',
          status: 'verified',
          termsAccepted: true,
          termsVersion: '2025.1',
          transactionHash: '0x7F2A...B90C',
        }
      ],
      notes: initialNotes,
      attributes: initialAttributes,
      weeklyData: formatWeeklyWithToday(weeklyProgressData),
      activityHistory: history,
      termsPolicy: REWARD_TERMS_POLICY,
      aiAgents: defaultAIAgents,
      lastUpdated: new Date().toISOString(),
    };

    this.saveData(defaultStore);
    return defaultStore;
  }

  private saveData(data: AppStoreData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write store.json:', err);
    }
  }

  private persist() {
    this.data.lastUpdated = new Date().toISOString();
    this.saveData(this.data);
  }

  public getState(): AppStoreData {
    return this.data;
  }

  // --- XP & Progression Helper ---
  private addXpAndPoints(xpChange: number, mpChange: number, attributeName?: string) {
    let newXp = this.data.user.currentXp + xpChange;
    let newLevel = this.data.user.level;
    let nextLevelXp = this.data.user.nextLevelXp;

    if (newXp >= nextLevelXp) {
      newLevel += 1;
      newXp = newXp - nextLevelXp;
      nextLevelXp += 200;
    } else if (newXp < 0) {
      newXp = 0;
    }

    this.data.user.currentXp = newXp;
    this.data.user.level = newLevel;
    this.data.user.nextLevelXp = nextLevelXp;
    this.data.user.totalPoints = Math.max(0, this.data.user.totalPoints + xpChange);
    this.data.user.momentumPoints = Math.max(0, this.data.user.momentumPoints + mpChange);
    if (mpChange > 0) {
      this.data.user.pointsThisWeek += mpChange;
    }

    // Update Attribute if provided
    if (attributeName) {
      this.data.attributes = this.data.attributes.map((attr) => {
        if (attr.name.toLowerCase() === attributeName.toLowerCase()) {
          const newPct = Math.min(100, Math.max(0, attr.percentage + (xpChange > 0 ? 3 : -3)));
          return { ...attr, percentage: newPct };
        }
        return attr;
      });
    }

    // Record in activity history
    const today = getTodayDateStr();
    let entry = this.data.activityHistory.find((a) => a.date === today);
    if (!entry) {
      entry = {
        date: today,
        habitsCompleted: 0,
        tasksCompleted: 0,
        xpEarned: 0,
        momentumPointsEarned: 0,
      };
      this.data.activityHistory.push(entry);
    }
    if (xpChange > 0) {
      entry.xpEarned += xpChange;
      entry.momentumPointsEarned += mpChange;
    }
  }

  // --- Quests (Daily Habits) ---
  public toggleQuest(questId: string): Quest | null {
    const quest = this.data.quests.find((q) => q.id === questId);
    if (!quest) return null;

    const isNowCompleted = !quest.completed;
    quest.completed = isNowCompleted;

    const xpDelta = isNowCompleted ? quest.xpReward : -quest.xpReward;
    const mpDelta = isNowCompleted ? 25 : -25;

    this.addXpAndPoints(xpDelta, mpDelta, quest.attribute);

    // Update today's quests count
    this.data.user.questsDoneThisWeek = Math.max(
      0,
      this.data.user.questsDoneThisWeek + (isNowCompleted ? 1 : -1)
    );

    const today = getTodayDateStr();
    const historyEntry = this.data.activityHistory.find((a) => a.date === today);
    if (historyEntry) {
      historyEntry.habitsCompleted = Math.max(
        0,
        historyEntry.habitsCompleted + (isNowCompleted ? 1 : -1)
      );
    }

    // Cross-sync: check if there's a task with matching title or category
    const matchingTask = this.data.tasks.find(
      (t) => t.title.toLowerCase().trim() === quest.title.toLowerCase().trim()
    );
    if (matchingTask && matchingTask.completed !== isNowCompleted) {
      matchingTask.completed = isNowCompleted;
    }

    // Cross-sync: check if there's a Goal matching this category/attribute
    this.syncGoalsProgress();

    this.persist();
    return quest;
  }

  public addQuest(newQuestData: Omit<Quest, 'id' | 'completed'>): Quest {
    const quest: Quest = {
      id: `quest-${Date.now()}`,
      ...newQuestData,
      completed: false,
    };
    this.data.quests = [quest, ...this.data.quests];
    this.persist();
    return quest;
  }

  // --- Tasks ---
  public toggleTask(taskId: string): TaskItem | null {
    const task = this.data.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const isNowCompleted = !task.completed;
    task.completed = isNowCompleted;

    const xpDelta = isNowCompleted ? (task.xpReward || 15) : -(task.xpReward || 15);
    const mpDelta = isNowCompleted ? 15 : -15;

    const mainLabel = task.labels[0] || 'Discipline';
    this.addXpAndPoints(xpDelta, mpDelta, mainLabel);

    const today = getTodayDateStr();
    const historyEntry = this.data.activityHistory.find((a) => a.date === today);
    if (historyEntry) {
      historyEntry.tasksCompleted = Math.max(
        0,
        historyEntry.tasksCompleted + (isNowCompleted ? 1 : -1)
      );
    }

    // Cross-sync: If this task matches a calendar event, sync its completion
    const matchingEvent = this.data.calendarEvents.find(
      (e) => e.title.toLowerCase().trim() === task.title.toLowerCase().trim()
    );
    if (matchingEvent && matchingEvent.subtasks) {
      matchingEvent.subtasks.forEach((st) => {
        st.completed = isNowCompleted;
      });
    }

    // Cross-sync: If this task matches a quest, toggle it
    const matchingQuest = this.data.quests.find(
      (q) => q.title.toLowerCase().trim() === task.title.toLowerCase().trim()
    );
    if (matchingQuest && matchingQuest.completed !== isNowCompleted) {
      matchingQuest.completed = isNowCompleted;
    }

    // Update goals progress
    this.syncGoalsProgress();

    this.persist();
    return task;
  }

  public addTask(taskData: Omit<TaskItem, 'id'>): TaskItem {
    const task: TaskItem = {
      id: `task-${Date.now()}`,
      ...taskData,
    };
    this.data.tasks = [task, ...this.data.tasks];

    // Automatically create a corresponding Calendar Event if it has a due date or is scheduled
    if (task.dueText && !task.dueText.toLowerCase().includes('someday')) {
      const clientToday = (task as any).clientDate || (task as any).dueDate || getTodayDateStr();
      let eventDate = (task as any).dueDate || clientToday;

      const dueLower = (task.dueText || '').toLowerCase();
      if (dueLower.includes('tomorrow')) {
        eventDate = addDaysISO(clientToday, 1);
      } else if (dueLower.includes('next week')) {
        eventDate = addDaysISO(clientToday, 7);
      }

      const startTime = task.dueTime || '10:00 AM';
      const endTime = calculateEndTimeStr(startTime);

      const newCalEvent: CalendarEvent = {
        id: `evt-auto-${task.id}`,
        title: task.title,
        date: eventDate,
        startTime: startTime,
        endTime: endTime,
        category: (task.labels[0]?.toLowerCase() as any) || 'study',
        color: task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#F59E0B' : '#6366F1',
        description: task.description || `Task: ${task.title}`,
        priority: task.priority,
      };
      this.data.calendarEvents.push(newCalEvent);
    }

    this.syncGoalsProgress();
    this.persist();
    return task;
  }

  public updateTask(updatedTask: TaskItem): TaskItem | null {
    const idx = this.data.tasks.findIndex((t) => t.id === updatedTask.id);
    if (idx === -1) return null;
    this.data.tasks[idx] = updatedTask;

    // Synchronize auto calendar event
    const calEventIdx = this.data.calendarEvents.findIndex((e) => e.id === `evt-auto-${updatedTask.id}`);
    if (calEventIdx !== -1) {
      const clientToday = (updatedTask as any).clientDate || (updatedTask as any).dueDate || getTodayDateStr();
      let eventDate = (updatedTask as any).dueDate || this.data.calendarEvents[calEventIdx].date;
      const dueLower = (updatedTask.dueText || '').toLowerCase();
      if (dueLower.includes('tomorrow')) {
        eventDate = addDaysISO(clientToday, 1);
      } else if (dueLower.includes('next week')) {
        eventDate = addDaysISO(clientToday, 7);
      }
      this.data.calendarEvents[calEventIdx].title = updatedTask.title;
      this.data.calendarEvents[calEventIdx].date = eventDate;
      if (updatedTask.dueTime) {
        this.data.calendarEvents[calEventIdx].startTime = updatedTask.dueTime;
        this.data.calendarEvents[calEventIdx].endTime = calculateEndTimeStr(updatedTask.dueTime);
      }
      this.data.calendarEvents[calEventIdx].priority = updatedTask.priority;
      this.data.calendarEvents[calEventIdx].color = updatedTask.priority === 'high' ? '#EF4444' : updatedTask.priority === 'medium' ? '#F59E0B' : '#6366F1';
    }

    this.syncGoalsProgress();
    this.persist();
    return updatedTask;
  }

  public deleteTask(taskId: string): boolean {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter((t) => t.id !== taskId);
    // Also remove auto-synced calendar event
    this.data.calendarEvents = this.data.calendarEvents.filter(
      (e) => e.id !== `evt-auto-${taskId}`
    );
    this.syncGoalsProgress();
    this.persist();
    return this.data.tasks.length < initialLen;
  }

  // --- Calendar Events ---
  public addCalendarEvent(eventData: Omit<CalendarEvent, 'id'> & { id?: string }): CalendarEvent {
    const eventId = eventData.id || `evt-${Date.now()}`;
    const existingIdx = this.data.calendarEvents.findIndex(
      (e) => e.id === eventId || (e.title === eventData.title && e.date === eventData.date && e.startTime === eventData.startTime)
    );
    if (existingIdx !== -1) {
      return this.data.calendarEvents[existingIdx];
    }

    const event: CalendarEvent = {
      id: eventId,
      ...eventData,
    };
    this.data.calendarEvents = [event, ...this.data.calendarEvents];

    // If event is marked as workout or study, ensure a corresponding task exists
    if (event.category === 'workout' || event.category === 'study' || event.category === 'project') {
      const existingTask = this.data.tasks.find((t) => t.title === event.title);
      if (!existingTask) {
        const newTask: TaskItem = {
          id: `task-evt-${event.id}`,
          title: event.title,
          description: event.description,
          completed: false,
          viewCategory: 'today',
          dueText: event.startTime ? `Today, ${event.startTime}` : 'Today',
          labels: [event.category.charAt(0).toUpperCase() + event.category.slice(1)],
          priority: (event.priority as any) || 'medium',
          xpReward: 20,
        };
        this.data.tasks.push(newTask);
      }
    }

    this.persist();
    return event;
  }

  public updateCalendarEvent(updatedEvent: CalendarEvent): CalendarEvent | null {
    const idx = this.data.calendarEvents.findIndex((e) => e.id === updatedEvent.id);
    if (idx === -1) return null;
    this.data.calendarEvents[idx] = updatedEvent;
    this.persist();
    return updatedEvent;
  }

  public deleteCalendarEvent(eventId: string): boolean {
    const initialLen = this.data.calendarEvents.length;
    this.data.calendarEvents = this.data.calendarEvents.filter((e) => e.id !== eventId);
    this.persist();
    return this.data.calendarEvents.length < initialLen;
  }

  public toggleCalendarEvent(eventId: string): CalendarEvent | null {
    const evt = this.data.calendarEvents.find((e) => e.id === eventId);
    if (!evt) return null;

    // Toggle subtasks completion if any
    let allDone = false;
    if (evt.subtasks && evt.subtasks.length > 0) {
      allDone = evt.subtasks.every((s) => s.completed);
      evt.subtasks.forEach((s) => {
        s.completed = !allDone;
      });
    }

    // Also toggle corresponding task if any
    const matchingTask = this.data.tasks.find(
      (t) => t.title.toLowerCase().trim() === evt.title.toLowerCase().trim()
    );
    if (matchingTask) {
      matchingTask.completed = !allDone;
    }

    this.addXpAndPoints(allDone ? -20 : 20, allDone ? -15 : 15, evt.category);
    this.persist();
    return evt;
  }

  // --- Detailed Goals & Cross-Calculation ---
  private syncGoalsProgress() {
    // Automatically correlate goals with completed tasks and habits
    const totalCompletedTasks = this.data.tasks.filter((t) => t.completed).length;
    const totalCompletedHabits = this.data.quests.filter((q) => q.completed).length;

    this.data.goals = this.data.goals.map((g) => {
      let subtasksCompleted = 0;
      let totalSubs = g.subtasks?.length || 0;

      if (g.subtasks && totalSubs > 0) {
        subtasksCompleted = g.subtasks.filter((s) => s.completed).length;
      }

      // Add category-specific tasks
      let catTasksCompleted = 0;
      let catTotalTasks = 0;

      if (g.category === 'Career') {
        const dsaTasks = this.data.tasks.filter(
          (t) => t.labels.includes('DSA') || t.labels.includes('Study')
        );
        catTotalTasks = dsaTasks.length;
        catTasksCompleted = dsaTasks.filter((t) => t.completed).length;
      } else if (g.category === 'Health') {
        const healthTasks = this.data.tasks.filter((t) => t.labels.includes('Health'));
        catTotalTasks = healthTasks.length;
        catTasksCompleted = healthTasks.filter((t) => t.completed).length;
      } else if (g.category === 'Personal') {
        const personalTasks = this.data.tasks.filter((t) => t.labels.includes('Reading'));
        catTotalTasks = personalTasks.length;
        catTasksCompleted = personalTasks.filter((t) => t.completed).length;
      }

      const completedCount = Math.max(
        g.completedTasks,
        subtasksCompleted + catTasksCompleted
      );
      const totalCount = Math.max(g.totalTasks, completedCount, totalSubs + catTotalTasks);
      const progress = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

      return {
        ...g,
        completedTasks: completedCount,
        totalTasks: totalCount,
        progress,
        status: progress >= 100 ? 'completed' : g.status === 'archived' ? 'archived' : 'active',
      };
    });
  }

  public addGoal(goalData: Omit<DetailedGoal, 'id'>): DetailedGoal {
    const goal: DetailedGoal = {
      id: `goal-${Date.now()}`,
      ...goalData,
      updatedAt: getTodayDateStr(),
    };
    this.data.goals = [goal, ...this.data.goals];
    this.syncGoalsProgress();
    this.persist();
    return goal;
  }

  public updateGoal(updatedGoal: DetailedGoal): DetailedGoal | null {
    const idx = this.data.goals.findIndex((g) => g.id === updatedGoal.id);
    if (idx === -1) return null;
    this.data.goals[idx] = {
      ...updatedGoal,
      updatedAt: getTodayDateStr(),
    };
    this.syncGoalsProgress();
    this.persist();
    return this.data.goals[idx];
  }

  public deleteGoal(goalId: string): boolean {
    const initialLen = this.data.goals.length;
    this.data.goals = this.data.goals.filter((g) => g.id !== goalId);
    this.persist();
    return this.data.goals.length < initialLen;
  }

  public toggleGoalSubtask(goalId: string, subtaskId: string): DetailedGoal | null {
    const goal = this.data.goals.find((g) => g.id === goalId);
    if (!goal || !goal.subtasks) return null;

    const sub = goal.subtasks.find((s) => s.id === subtaskId);
    if (!sub) return null;

    sub.completed = !sub.completed;
    const completedSubs = goal.subtasks.filter((s) => s.completed).length;
    const totalSubs = goal.subtasks.length;
    goal.completedTasks = completedSubs;
    goal.totalTasks = Math.max(goal.totalTasks, totalSubs);
    goal.progress = Math.round((completedSubs / totalSubs) * 100);
    if (goal.progress >= 100) {
      goal.status = 'completed';
    }

    this.addXpAndPoints(sub.completed ? 30 : -30, sub.completed ? 20 : -20, goal.category);
    this.persist();
    return goal;
  }

  public toggleGoalMilestone(goalId: string, milestoneId: string): DetailedGoal | null {
    const goal = this.data.goals.find((g) => g.id === goalId);
    if (!goal || !goal.milestones) return null;

    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return null;

    milestone.completed = !milestone.completed;
    this.addXpAndPoints(milestone.completed ? 50 : -50, milestone.completed ? 35 : -35, goal.category);
    this.persist();
    return goal;
  }

  // --- Rewards & Verified Claims with Terms & Conditions ---
  public claimReward(rewardId: string, termsAccepted: boolean, fingerprint?: string): { success: boolean; error?: string; reward?: RewardItem; claim?: RewardClaimRecord } {
    const reward = this.data.rewards.find((r) => r.id === rewardId);
    if (!reward) {
      return { success: false, error: 'Reward not found in the catalog.' };
    }

    // 1. Validate Terms Acceptance
    if (!termsAccepted) {
      return { 
        success: false, 
        error: 'You must review and accept the LifeRPG Reward Claim Terms & Eligibility Policy before claiming this reward.' 
      };
    }

    // 2. Validate duplicate one-time claims
    if (reward.status === 'owned' || reward.status === 'active') {
      return { 
        success: false, 
        error: `"${reward.name}" has already been claimed and is in your inventory.` 
      };
    }

    const existingClaim = this.data.claims.find((c) => c.rewardId === rewardId);
    if (existingClaim) {
      return { 
        success: false, 
        error: `A verified claim record (${existingClaim.id}) already exists for this reward.` 
      };
    }

    // 3. Validate user has sufficient Momentum Points
    if (this.data.user.momentumPoints < reward.cost) {
      return { 
        success: false, 
        error: `Insufficient Momentum Points. You have ${this.data.user.momentumPoints} MP, but this reward requires ${reward.cost} MP.` 
      };
    }

    // 4. Perform atomic transaction
    this.data.user.momentumPoints -= reward.cost;
    reward.status = 'owned';

    // Generate unique Claim Transaction ID
    const claimId = `CLM-2025-${String(this.data.claims.length + 1).padStart(3, '0')}`;
    const txHash = `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`;

    const newClaim: RewardClaimRecord = {
      id: claimId,
      rewardId: reward.id,
      rewardName: reward.name,
      category: reward.category,
      cost: reward.cost,
      claimedAt: new Date().toISOString(),
      status: 'verified',
      termsAccepted: true,
      termsVersion: REWARD_TERMS_POLICY.version,
      transactionHash: txHash,
    };

    this.data.claims = [newClaim, ...this.data.claims];

    // Add to collection items
    const newCollectionItem: CollectionItem = {
      id: `col-${Date.now()}`,
      name: reward.name,
      type: (reward.badgeTag as any) || 'Theme',
      icon: reward.previewType || 'star',
      active: true,
    };
    this.data.collectionItems = [newCollectionItem, ...this.data.collectionItems];

    this.persist();
    return { 
      success: true, 
      reward, 
      claim: newClaim 
    };
  }

  public activateReward(rewardId: string): { success: boolean; error?: string; reward?: RewardItem } {
    const reward = this.data.rewards.find((r) => r.id === rewardId);
    if (!reward) {
      return { success: false, error: 'Reward not found.' };
    }

    if (reward.status !== 'owned' && reward.status !== 'active') {
      return { success: false, error: 'Cannot activate a reward that has not been unlocked.' };
    }

    // Deactivate others in same category and activate this one
    this.data.rewards = this.data.rewards.map((item) => {
      if (item.category === reward.category) {
        return {
          ...item,
          status: item.id === reward.id ? 'active' : item.status === 'active' ? 'owned' : item.status,
        };
      }
      return item;
    });

    this.persist();
    const updated = this.data.rewards.find((r) => r.id === rewardId);
    return { success: true, reward: updated };
  }

  // --- Notes ---
  public addNote(newNote: QuickNote): QuickNote {
    this.data.notes = [newNote, ...this.data.notes];
    this.persist();
    return newNote;
  }

  public deleteNote(noteId: string): boolean {
    const initialLen = this.data.notes.length;
    this.data.notes = this.data.notes.filter((n) => n.id !== noteId);
    this.persist();
    return this.data.notes.length < initialLen;
  }

  // --- Analytics Derivation Engine ---
  public getAnalytics(timeRange: string = '7d') {
    const totalTasks = this.data.tasks.length;
    const completedTasks = this.data.tasks.filter((t) => t.completed).length;
    const totalHabits = this.data.quests.length;
    const completedHabits = this.data.quests.filter((q) => q.completed).length;

    // Consistency Rate calculation
    const totalScheduled = totalTasks + totalHabits;
    const totalDone = completedTasks + completedHabits;
    const overallConsistency = totalScheduled > 0 ? Math.round((totalDone / totalScheduled) * 100) : 85;

    const kpi: AnalyticsKpiData = {
      overallConsistency,
      consistencyChange: 12,
      currentStreakDays: this.data.user.streakDays,
      streakChangeDays: 4,
      tasksCompleted: completedTasks,
      tasksTotal: totalTasks,
      tasksChangePct: 15,
      momentumPoints: this.data.user.momentumPoints,
      momentumPointsWeeklyGain: this.data.user.pointsThisWeek,
    };

    // Consistency Trend Points
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const trendPoints: ConsistencyTrendPoint[] = days.map((dayLabel, idx) => {
      const rate = Math.min(100, Math.max(50, 70 + (idx * 4) + (completedTasks * 3)));
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      return {
        date: `${y}-${m}-${dayNum}`,
        dayLabel,
        completionRate: rate,
        tasksCompleted: Math.min(completedTasks + idx, totalTasks),
        totalTasks,
      };
    });

    // Habit breakdown by categories
    const habitBreakdown: HabitBreakdownCategory[] = [
      { name: 'Focus', percentage: 35, count: this.data.quests.filter((q) => q.category === 'focus').length, color: '#6366F1' },
      { name: 'Health', percentage: 25, count: this.data.quests.filter((q) => q.category === 'health').length, color: '#31C48D' },
      { name: 'Learning', percentage: 25, count: this.data.quests.filter((q) => q.category === 'learning').length, color: '#F59E0B' },
      { name: 'Personal', percentage: 15, count: this.data.quests.filter((q) => q.category === 'personal').length, color: '#EC4899' },
    ];

    // Most Consistent Habits
    const consistentHabits: ConsistentHabitItem[] = this.data.quests.map((q) => ({
      id: q.id,
      name: q.title,
      percentage: q.completed ? 95 : 75,
      icon: q.category === 'learning' ? 'reading' : q.category === 'health' ? 'workout' : q.category === 'focus' ? 'coding' : 'meditation',
      color: q.attribute === 'Intellect' ? '#7C6CFF' : q.attribute === 'Strength' ? '#EA580C' : q.attribute === 'Knowledge' ? '#3B82F6' : '#F97316',
    }));

    // Heatmap days from real checkins
    const heatmapDays: HeatmapDay[] = [];
    const base = new Date();
    for (let w = 0; w < 16; w++) {
      for (let d = 0; d < 7; d++) {
        const offset = (15 - w) * 7 + (6 - d);
        const dayDate = new Date(base);
        dayDate.setDate(dayDate.getDate() - offset);
        const ds = dayDate.toISOString().split('T')[0];
        const checkin = this.data.activityHistory.find((a) => a.date === ds);
        const count = checkin ? (checkin.habitsCompleted + checkin.tasksCompleted) : ((w + d) % 3 === 0 ? 3 : (w + d) % 5 === 0 ? 1 : 0);
        const level = count >= 6 ? 4 : count >= 4 ? 3 : count >= 2 ? 2 : count >= 1 ? 1 : 0;
        heatmapDays.push({
          date: ds,
          dayOfWeek: d,
          weekIndex: w,
          count,
          consistencyRate: level * 25,
          level: level as any,
        });
      }
    }

    // Real goals mapped to Analytics
    const analyticsGoals: AnalyticsGoalItem[] = this.data.goals.map((g) => ({
      id: g.id,
      title: g.title,
      percentage: g.progress,
      category: g.category,
      icon: g.category === 'Career' ? 'dsa' : g.category === 'Health' ? 'shape' : g.category === 'Projects' ? 'portfolio' : 'books',
      color: g.color,
    }));

    return {
      kpi,
      trendPoints,
      habitBreakdown,
      consistentHabits,
      heatmapDays,
      analyticsGoals,
      claims: this.data.claims,
    };
  }

  // --- AI Agent Methods ---
  getAIAgents(): AIIntegrationModel[] {
    if (!this.data.aiAgents || this.data.aiAgents.length === 0) {
      this.data.aiAgents = [...defaultAIAgents];
      this.persist();
    }
    return this.data.aiAgents;
  }

  connectAIAgent(
    agentId: string,
    details?: { accountEmail?: string; apiKey?: string; modelTier?: string; loginMethod?: string }
  ): AIIntegrationModel {
    const agents = this.getAIAgents();
    const target = agents.find((a) => a.id === agentId);
    if (!target) {
      throw new Error(`AI agent '${agentId}' not found.`);
    }

    target.status = 'connected';
    target.selected = true;
    target.accountEmail = details?.accountEmail || (agentId === 'gemini' ? 'user@google.com' : agentId === 'claude' ? 'user@anthropic.com' : 'user@openai.com');
    target.connectedAt = new Date().toISOString();
    if (details?.modelTier) {
      target.modelTier = details.modelTier;
    }

    // Set other models as not selected
    agents.forEach((a) => {
      if (a.id !== agentId) {
        a.selected = false;
      }
    });

    this.persist();
    return target;
  }

  disconnectAIAgent(agentId: string): AIIntegrationModel {
    const agents = this.getAIAgents();
    const target = agents.find((a) => a.id === agentId);
    if (!target) {
      throw new Error(`AI agent '${agentId}' not found.`);
    }

    target.status = 'not_connected';
    target.selected = false;
    delete target.accountEmail;
    delete target.connectedAt;

    // If active model was disconnected, pick another connected model if any
    const otherConnected = agents.find((a) => a.status === 'connected');
    if (otherConnected) {
      otherConnected.selected = true;
    }

    this.persist();
    return target;
  }

  selectAIAgent(agentId: string): AIIntegrationModel[] {
    const agents = this.getAIAgents();
    const target = agents.find((a) => a.id === agentId);
    if (!target) {
      throw new Error(`AI agent '${agentId}' not found.`);
    }
    if (target.status !== 'connected') {
      throw new Error(`AI agent '${target.name}' is not connected yet. Please connect and log in first.`);
    }

    agents.forEach((a) => {
      a.selected = a.id === agentId;
    });

    this.persist();
    return agents;
  }

  syncAIAgents(): {
    agents: AIIntegrationModel[];
    syncedAt: string;
    totalConnected: number;
    activeModel: AIIntegrationModel | null;
    message: string;
  } {
    const agents = this.getAIAgents();
    const now = new Date().toISOString();
    const hasGeminiEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

    // Realistic provider ping/latency simulation
    const latencyMap: Record<string, number> = {
      gemini: 98,
      chatgpt: 185,
      claude: 162,
    };

    agents.forEach((agent) => {
      agent.lastSyncedAt = now;
      agent.latencyMs = latencyMap[agent.id] || 150;

      if (agent.id === 'gemini') {
        agent.isEnvironmentKeyConfigured = hasGeminiEnvKey;
        // If system has GEMINI_API_KEY and status was not_connected, auto-provision and connect Gemini
        if (hasGeminiEnvKey && agent.status === 'not_connected') {
          agent.status = 'connected';
          agent.accountEmail = agent.accountEmail || 'cloud-verified@google.internal';
          agent.connectedAt = agent.connectedAt || now;
          agent.modelTier = agent.modelTier || 'Gemini 3.8 Flash';
        }
      }

      if (agent.status === 'connected') {
        agent.syncStatus = 'synced';
      } else {
        agent.syncStatus = 'ready';
      }
    });

    // Verify selection validity
    const connectedModels = agents.filter((a) => a.status === 'connected');
    const selectedModel = agents.find((a) => a.selected);

    if (connectedModels.length > 0) {
      if (!selectedModel || selectedModel.status !== 'connected') {
        // Automatically select first connected model
        agents.forEach((a) => {
          a.selected = a.id === connectedModels[0].id;
        });
      }
    } else {
      // If no models connected, clear selected
      agents.forEach((a) => {
        a.selected = false;
      });
    }

    this.persist();

    const active = agents.find((a) => a.selected) || null;

    return {
      agents,
      syncedAt: now,
      totalConnected: connectedModels.length,
      activeModel: active,
      message: `Successfully synchronized ${agents.length} AI models. ${connectedModels.length} connected and ready for AI Coach.`,
    };
  }
}

export const db = new LifeRpgDatabase();
