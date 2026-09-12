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
  AIIntegrationModel,
  CoachChatMessage
} from '../types';

export interface FullAppState {
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
  claims: Array<{
    id: string;
    rewardId: string;
    rewardName: string;
    cost: number;
    claimedAt: string;
    status: string;
    termsAccepted: boolean;
    transactionHash: string;
  }>;
  notes: QuickNote[];
  attributes: Attribute[];
  weeklyData: WeeklyData[];
  aiAgents?: AIIntegrationModel[];
}

export type BackendState = FullAppState & {
  detailedGoals?: DetailedGoal[];
  collection?: CollectionItem[];
};

export interface RewardTermsPolicy {
  version: string;
  lastUpdated: string;
  title: string;
  summary: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    bullets?: string[];
  }>;
}

export const api = {
  // 1. Full State
  async getState(): Promise<FullAppState> {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('Failed to load application state from server');
    const json = await res.json();
    return json.data;
  },

  // 2. Quests
  async toggleQuest(questId: string): Promise<{ quest: Quest; state: FullAppState }> {
    const res = await fetch('/api/quests/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle quest');
    return { quest: json.data, state: json.state };
  },

  async addQuest(questData: Omit<Quest, 'id' | 'completed'>): Promise<{ quest: Quest; state: FullAppState }> {
    const res = await fetch('/api/quests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add quest');
    return { quest: json.data, state: json.state };
  },

  // 3. Tasks
  async toggleTask(taskId: string): Promise<{ task: TaskItem; state: FullAppState }> {
    const res = await fetch(`/api/tasks/${taskId}/toggle`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle task');
    return { task: json.data, state: json.state };
  },

  async addTask(taskData: Omit<TaskItem, 'id'>): Promise<{ task: TaskItem; state: FullAppState }> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add task');
    return { task: json.data, state: json.state };
  },

  async updateTask(taskData: TaskItem): Promise<{ task: TaskItem; state: FullAppState }> {
    const res = await fetch(`/api/tasks/${taskData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update task');
    return { task: json.data, state: json.state };
  },

  async deleteTask(taskId: string): Promise<{ state: FullAppState }> {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete task');
    return { state: json.state };
  },

  // 4. Calendar Events
  async addCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<{ event: CalendarEvent; state: FullAppState }> {
    const res = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add calendar event');
    return { event: json.data, state: json.state };
  },

  async updateCalendarEvent(eventData: CalendarEvent): Promise<{ event: CalendarEvent; state: FullAppState }> {
    const res = await fetch(`/api/calendar/events/${eventData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update calendar event');
    return { event: json.data, state: json.state };
  },

  async deleteCalendarEvent(eventId: string): Promise<{ state: FullAppState }> {
    const res = await fetch(`/api/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete calendar event');
    return { state: json.state };
  },

  async toggleCalendarEvent(eventId: string): Promise<{ event: CalendarEvent; state: FullAppState }> {
    const res = await fetch(`/api/calendar/events/${eventId}/toggle`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle calendar event');
    return { event: json.data, state: json.state };
  },

  // 5. Goals
  async addGoal(goalData: Omit<DetailedGoal, 'id'>): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add goal');
    return { goal: json.data, state: json.state };
  },

  async updateGoal(goalData: DetailedGoal): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await fetch(`/api/goals/${goalData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update goal');
    return { goal: json.data, state: json.state };
  },

  async deleteGoal(goalId: string): Promise<{ state: FullAppState }> {
    const res = await fetch(`/api/goals/${goalId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete goal');
    return { state: json.state };
  },

  async toggleGoalSubtask(goalId: string, subtaskId: string): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await fetch(`/api/goals/${goalId}/subtask-toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtaskId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle goal subtask');
    return { goal: json.data, state: json.state };
  },

  async toggleGoalMilestone(goalId: string, milestoneId: string): Promise<{ goal: DetailedGoal; state: FullAppState }> {
    const res = await fetch(`/api/goals/${goalId}/milestone-toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to toggle goal milestone');
    return { goal: json.data, state: json.state };
  },

  // 6. Rewards & Verified Claim Engine
  async getRewardsTerms(): Promise<RewardTermsPolicy> {
    const res = await fetch('/api/rewards/terms');
    if (!res.ok) throw new Error('Failed to fetch reward terms');
    const json = await res.json();
    return json.data;
  },

  async claimReward(rewardId: string, termsAccepted: boolean): Promise<{ reward: RewardItem; claim: any; state: FullAppState }> {
    const res = await fetch('/api/rewards/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rewardId,
        termsAccepted,
        clientFingerprint: `usr-${navigator.userAgent.slice(0, 15)}`,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to claim reward');
    }
    return { reward: json.data.reward, claim: json.data.claim, state: json.state };
  },

  async activateReward(rewardId: string): Promise<{ reward: RewardItem; state: FullAppState }> {
    const res = await fetch('/api/rewards/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to activate reward');
    return { reward: json.data, state: json.state };
  },

  // 7. Analytics
  async getAnalytics(timeRange: string = '7d'): Promise<any> {
    const res = await fetch(`/api/analytics?timeRange=${timeRange}`);
    if (!res.ok) throw new Error('Failed to load analytics');
    const json = await res.json();
    return json.data;
  },

  // 8. Notes
  async addNote(noteData: QuickNote): Promise<{ note: QuickNote; state: FullAppState }> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add note');
    return { note: json.data, state: json.state };
  },

  async deleteNote(noteId: string): Promise<{ state: FullAppState }> {
    const res = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete note');
    return { state: json.state };
  },

  // 9. AI Agents & Chatting
  async getAIAgents(): Promise<AIIntegrationModel[]> {
    const res = await fetch('/api/ai/agents');
    if (!res.ok) throw new Error('Failed to fetch AI agents');
    const json = await res.json();
    return json.data;
  },

  async connectAIAgent(
    agentId: string,
    details?: { accountEmail?: string; apiKey?: string; modelTier?: string; loginMethod?: string }
  ): Promise<{ agent: AIIntegrationModel; agents: AIIntegrationModel[] }> {
    const res = await fetch('/api/ai/agents/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, ...details }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to connect AI agent');
    return { agent: json.data, agents: json.agents };
  },

  async disconnectAIAgent(agentId: string): Promise<{ agent: AIIntegrationModel; agents: AIIntegrationModel[] }> {
    const res = await fetch('/api/ai/agents/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to disconnect AI agent');
    return { agent: json.data, agents: json.agents };
  },

  async selectAIAgent(agentId: string): Promise<AIIntegrationModel[]> {
    const res = await fetch('/api/ai/agents/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to select AI agent');
    return json.data;
  },

  async syncAIAgents(): Promise<{
    agents: AIIntegrationModel[];
    syncedAt: string;
    totalConnected: number;
    activeModel: AIIntegrationModel | null;
    message: string;
  }> {
    const res = await fetch('/api/ai/agents/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to sync AI models');
    return {
      agents: json.agents,
      syncedAt: json.syncedAt,
      totalConnected: json.totalConnected,
      activeModel: json.activeModel,
      message: json.message,
    };
  },

  async sendAIChat(params: {
    modelId: string;
    message: string;
    history?: any[];
  }): Promise<CoachChatMessage> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send message to AI agent');
    return json.data;
  }
};
