import { AIIntegrationModel, CalendarIntegrationState } from '../types';

export const initialAIModels: AIIntegrationModel[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    status: 'connected',
    selected: true,
    description: 'Great for general productivity, explanations and ideation.',
    tags: ['Fast', 'Versatile', 'Popular'],
    iconType: 'chatgpt',
  },
  {
    id: 'claude',
    name: 'Claude',
    status: 'not_connected',
    selected: false,
    description: 'Best for deep thinking, structured guidance and long-form reasoning.',
    tags: ['Thoughtful', 'Detailed', 'Safe'],
    iconType: 'claude',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    status: 'not_connected',
    selected: false,
    description: 'Best with Google ecosystem and real-time information.',
    tags: ['Real-time', 'Integrated', 'Multimodal'],
    iconType: 'gemini',
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
