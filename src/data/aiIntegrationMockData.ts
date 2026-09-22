import { AIIntegrationModel, CalendarIntegrationState, GeminiModelOption, CoachRoleOption } from '../types';

export const geminiModelOptions: GeminiModelOption[] = [
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    tagline: 'General Tasks • Recommended Default',
    taskType: 'general',
    speedBadge: 'Fast & Balanced',
    recommendedFor: 'Everyday habit guidance, daily task prioritization, and schedule coordination.',
    isDefault: true,
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    tagline: 'Fast Tasks • Ultra Low Latency',
    taskType: 'fast',
    speedBadge: 'Ultra Fast (<0.8s)',
    recommendedFor: 'Instant check-ins, snappy habit logging, quick XP queries, and rapid questions.',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    tagline: 'Complex Tasks • Deep Reasoning',
    taskType: 'complex',
    speedBadge: 'Deep Analytical',
    recommendedFor: 'Long-term goal architectures, multi-month habit strategy, and complex problem solving.',
  },
];

export const coachRoleOptions: CoachRoleOption[] = [
  {
    id: 'general_coach',
    name: 'General Productivity Coach',
    tagline: 'Balanced & Actionable',
    emoji: '🎯',
    description: 'Encouraging, structured guidance focused on daily progress, habit completion, and XP progression.',
  },
  {
    id: 'strict_drill_sergeant',
    name: 'Accountability Drill Sergeant',
    tagline: 'Zero Excuses • High Energy',
    emoji: '⚡',
    description: 'Direct, candid accountability that cuts through procrastination and demands decisive execution.',
  },
  {
    id: 'calendar_strategist',
    name: 'Schedule & Calendar Strategist',
    tagline: 'Time-Blocking & Gaps',
    emoji: '📅',
    description: 'Expert time optimization, Google Calendar alignment, and gap elimination to safeguard focus hours.',
  },
  {
    id: 'habit_architect',
    name: 'Habit & Streak Architect',
    tagline: 'Atomic Routines & Streaks',
    emoji: '🧠',
    description: 'Behavioral habit stacking and identity-based streak preservation to build lasting momentum.',
  },
];

export const initialAIModels: AIIntegrationModel[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    status: 'connected',
    selected: true,
    verified: true,
    accountEmail: 'user@google.ai',
    modelTier: 'Gemini 3.5 Flash (Default)',
    selectedGeminiModel: 'gemini-3.5-flash',
    selectedRole: 'general_coach',
    description: 'Official Google Gemini Chatbot with multi-turn memory, model toggling, and calendar sync.',
    tags: ['Default Coach', 'Multi-turn Chat', 'Model Toggling', 'Google Sync'],
    iconType: 'gemini',
    latencyMs: 135,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    status: 'connected',
    selected: false,
    verified: true,
    accountEmail: 'alex.das@openai.user',
    modelTier: 'GPT-4o (Omni)',
    description: 'Great for general productivity, explanations and ideation.',
    tags: ['Fast', 'Versatile', 'Popular'],
    iconType: 'chatgpt',
    latencyMs: 210,
  },
  {
    id: 'claude',
    name: 'Claude',
    status: 'not_connected',
    selected: false,
    description: 'Best for deep thinking, structured guidance and long-form reasoning.',
    tags: ['Thoughtful', 'Detailed', 'Safe'],
    iconType: 'claude',
    latencyMs: 290,
  },
];

export const initialCalendarIntegration: CalendarIntegrationState = {
  provider: 'Google Calendar',
  status: 'connected',
  account: 'alex.das@gmail.com',
  permission: 'read_only',
  useInCoach: true,
};

export const modelComparisons = [
  {
    feature: 'Primary Strengths',
    chatgpt: 'Everyday productivity, conversational variety, rapid problem solving',
    claude: 'Deep nuance, code refactoring, complex analytical writing',
    gemini: 'Google ecosystem, multi-modal context, up-to-date search grounding',
  },
  {
    feature: 'Response Speed',
    chatgpt: 'Ultra fast (< 1.2s)',
    claude: 'Balanced (~ 1.8s)',
    gemini: 'Ultra fast (< 1.1s)',
  },
  {
    feature: 'Context Window',
    chatgpt: '128k tokens',
    claude: '200k tokens',
    gemini: '1M+ tokens',
  },
  {
    feature: 'Best For In LifeRPG',
    chatgpt: 'Daily task planning, quick habit checks & accountability',
    claude: 'Long-term goal roadmaps, deep introspection & focus review',
    gemini: 'Real-time schedule synchronization & calendar conflict resolution',
  },
];
