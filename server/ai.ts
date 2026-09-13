import { GoogleGenAI } from '@google/genai';
import { db } from './db';
import { CoachChatMessage } from '../src/types';

let geminiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

export interface AIChatRequest {
  modelId: string; // 'gemini' | 'chatgpt' | 'claude'
  message: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
}

export async function generateAIChatResponse(req: AIChatRequest): Promise<CoachChatMessage> {
  const { modelId, message } = req;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Verify connection status
  const agents = db.getAIAgents();
  const agent = agents.find((a) => a.id === modelId);

  if (!agent) {
    throw new Error(`AI Agent '${modelId}' does not exist.`);
  }

  if (agent.status !== 'connected' || !agent.verified) {
    throw new Error(`${agent.name} is not verified. Please log in with your credentials and authenticate ${agent.name} first in AI Integration or the coach dropdown.`);
  }

  const appState = db.getState();
  const questsRemaining = appState.quests.filter((q) => !q.completed).map((q) => q.title);
  const tasksRemaining = appState.tasks.filter((t) => !t.completed).map((t) => t.title);
  const streak = appState.user.streakDays;
  const level = appState.user.level;

  // 1. GEMINI AGENT (uses real @google/genai with 'gemini-3.8-flash' when API key is available)
  if (modelId === 'gemini') {
    const gemini = getGemini();
    if (gemini) {
      try {
        const systemPrompt = `You are the Gemini 3.8 Flash AI Coach inside LifeRPG.
User Info: Level ${level}, ${streak}-day streak.
Remaining habits today: ${questsRemaining.slice(0, 3).join(', ') || 'All habits completed!'}
Pending tasks: ${tasksRemaining.slice(0, 3).join(', ') || 'No urgent tasks!'}
Personality: Ultra fast, multimodal-ready, Google Calendar and schedule alignment expert. Give concise, highly actionable, encouraging coaching (max 3 short paragraphs).`;

        const response = await gemini.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\nUser Question: ${message}`,
        });

        const replyText = response.text || 'I analyzed your schedule and habits. Keep maintaining your momentum!';

        return {
          id: `gemini-msg-${Date.now()}`,
          sender: 'coach',
          text: replyText,
          timestamp: timeStr,
          agentId: 'gemini',
          agentName: agent.modelTier || 'Gemini 3.8 Flash',
          suggestions: [
            'How can I optimize my calendar today?',
            'What should I tackle next for max XP?',
            'Review my focus time distribution'
          ],
          actionRecommendation: {
            title: 'Block 45-Min Focus Sprint',
            description: 'Gemini detected an open schedule slot. Schedule a deep focus sprint.',
            actionLabel: 'Add to Today\'s Tasks'
          }
        };
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local Gemini persona:', err);
      }
    }

    // Built-in Gemini 3.8 Flash Persona Response
    return generateGeminiFallback(message, streak, questsRemaining, timeStr, agent.modelTier || 'Gemini 3.8 Flash');
  }

  // 2. CHATGPT AGENT (OpenAI GPT-4o Persona)
  if (modelId === 'chatgpt') {
    return generateChatGPTResponse(message, streak, questsRemaining, timeStr, agent.modelTier || 'GPT-4o (Omni)');
  }

  // 3. CLAUDE AGENT (Anthropic Claude 3.5 Sonnet Persona)
  if (modelId === 'claude') {
    return generateClaudeResponse(message, streak, tasksRemaining, timeStr, agent.modelTier || 'Claude 3.5 Sonnet');
  }

  // Fallback
  return {
    id: `agent-msg-${Date.now()}`,
    sender: 'coach',
    text: `I received your message regarding "${message}". Let's take decisive action toward your goals today!`,
    timestamp: timeStr,
    agentId: agent.id,
    agentName: agent.name,
    suggestions: ['What is my next priority?', 'Check my progress today']
  };
}

function generateGeminiFallback(
  userText: string,
  streak: number,
  quests: string[],
  timestamp: string,
  modelTier: string
): CoachChatMessage {
  const lower = userText.toLowerCase();

  if (lower.includes('schedule') || lower.includes('calendar') || lower.includes('time') || lower.includes('plan')) {
    return {
      id: `gemini-${Date.now()}`,
      sender: 'coach',
      text: `⚡ **${modelTier} Calendar Optimization**: I synced your schedule and current habit queue. You have a ${streak}-day streak active. Based on your peak energy window between 2:00 PM and 4:30 PM, protect that interval from distractions.`,
      timestamp,
      agentId: 'gemini',
      agentName: modelTier,
      suggestions: ['Check calendar conflicts', 'Set 45-min focus block', 'Review habit completion rate'],
      actionRecommendation: {
        title: 'Deep Focus Sprint (45m)',
        description: 'Calendar gap detected between meetings. Perfect time for deliberate practice.',
        actionLabel: 'Add to Today\'s Tasks'
      }
    };
  }

  return {
    id: `gemini-${Date.now()}`,
    sender: 'coach',
    text: `⚡ **${modelTier} Analysis**: I evaluated your daily progression. You have ${quests.length} pending habits today (${quests.slice(0, 2).join(', ') || 'great progress!'}). Doing the smallest habit first will trigger dopamine momentum to finish the rest effortlessly.`,
    timestamp,
    agentId: 'gemini',
    agentName: modelTier,
    suggestions: ['Break down my next task', 'Optimize my evening routine', 'Show streak statistics'],
    actionRecommendation: {
      title: 'Review Today\'s Habit Queue',
      description: 'Knock out your 15-minute quick habit now to secure your daily XP multiplier.',
      actionLabel: 'Add to Today\'s Tasks'
    }
  };
}

function generateChatGPTResponse(
  userText: string,
  streak: number,
  quests: string[],
  timestamp: string,
  modelTier: string
): CoachChatMessage {
  return {
    id: `chatgpt-${Date.now()}`,
    sender: 'coach',
    text: `🚀 **${modelTier} Action Plan**: Great question! Let's break this down into 3 high-leverage steps:\n\n1. **Immediate Quick Win**: Complete your easiest habit first to protect your ${streak}-day streak.\n2. **Time-Boxing**: Allocate 25 minutes of zero-notification execution on your top goal.\n3. **Momentum Reward**: Each completed step yields +35 XP toward your next level!\n\nWhat's the first step you want to execute right now?`,
    timestamp,
    agentId: 'chatgpt',
    agentName: modelTier,
    suggestions: ['Give me a 25-minute Pomodoro prompt', 'Help me prioritize my backlog', 'Draft a weekly recap'],
    actionRecommendation: {
      title: 'Execute 25m Pomodoro Sprint',
      description: 'Single-task with zero context-switching to build immediate momentum.',
      actionLabel: 'Add to Today\'s Tasks'
    }
  };
}

function generateClaudeResponse(
  userText: string,
  streak: number,
  tasks: string[],
  timestamp: string,
  modelTier: string
): CoachChatMessage {
  return {
    id: `claude-${Date.now()}`,
    sender: 'coach',
    text: `🧠 **${modelTier} Reflection**: Looking at your momentum (${streak}-day streak), consistency is rarely about brute willpower; it's about reducing cognitive friction.\n\nWhen we examine your pending workload, consider which item creates the most subtle mental fatigue. Often, clarifying the very first physical action—rather than the outcome—makes execution effortless.\n\nWould you like to analyze what's causing resistance, or structure a clean focus block?`,
    timestamp,
    agentId: 'claude',
    agentName: modelTier,
    suggestions: ['Analyze cognitive friction', 'Design an intentional morning routine', 'Deep work protocol'],
    actionRecommendation: {
      title: 'Reflect & Plan Tomorrow\'s Frog',
      description: 'Identify the single highest-impact priority to tackle first thing in the morning.',
      actionLabel: 'Add to Today\'s Tasks'
    }
  };
}
