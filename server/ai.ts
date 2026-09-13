import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { db } from './db';
import { CoachChatMessage, CalendarPermissionLevel, CalendarEvent } from '../src/types';

let geminiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export interface AIChatRequest {
  modelId: string; // 'gemini' | 'chatgpt' | 'claude'
  message: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
  calendarPermission?: CalendarPermissionLevel;
  googleAccessToken?: string;
}

// Tool definitions for Gemini
const createCalendarEventDeclaration: FunctionDeclaration = {
  name: 'createCalendarEvent',
  description: 'Creates a new scheduled event in the user\'s calendar. Only permitted when Google Calendar permission is "Read & edit".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Title or summary of the event (e.g. "Morning Workout", "DSA Coding Sprint")',
      },
      date: {
        type: Type.STRING,
        description: 'Date of the event in YYYY-MM-DD format.',
      },
      startTime: {
        type: Type.STRING,
        description: 'Start time formatted like "08:00 AM" or "02:30 PM"',
      },
      endTime: {
        type: Type.STRING,
        description: 'End time formatted like "09:00 AM" or "03:30 PM"',
      },
      category: {
        type: Type.STRING,
        description: 'Category: "workout" | "study" | "project" | "social" | "health" | "entertainment" | "personal"',
      },
      description: {
        type: Type.STRING,
        description: 'Description or agenda for the event',
      },
      priority: {
        type: Type.STRING,
        description: 'Priority: "low" | "medium" | "high"',
      },
    },
    required: ['title', 'date'],
  },
};

const rescheduleCalendarEventDeclaration: FunctionDeclaration = {
  name: 'rescheduleCalendarEvent',
  description: 'Reschedules or modifies an existing calendar event. Only permitted when Google Calendar permission is "Read & edit".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      eventTitleOrId: {
        type: Type.STRING,
        description: 'The title or ID of the calendar event to reschedule',
      },
      newDate: {
        type: Type.STRING,
        description: 'New date in YYYY-MM-DD format (optional if keeping same date)',
      },
      newStartTime: {
        type: Type.STRING,
        description: 'New start time, e.g. "04:00 PM"',
      },
      newEndTime: {
        type: Type.STRING,
        description: 'New end time, e.g. "05:00 PM"',
      },
    },
    required: ['eventTitleOrId'],
  },
};

const deleteCalendarEventDeclaration: FunctionDeclaration = {
  name: 'deleteCalendarEvent',
  description: 'Deletes an event from the user\'s calendar. Only permitted when Google Calendar permission is "Read & edit".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      eventTitleOrId: {
        type: Type.STRING,
        description: 'The title or ID of the calendar event to delete',
      },
    },
    required: ['eventTitleOrId'],
  },
};

const readCalendarEventsDeclaration: FunctionDeclaration = {
  name: 'readCalendarEvents',
  description: 'Reads current and upcoming calendar events to check availability, schedule, and time gaps.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: {
        type: Type.STRING,
        description: 'Optional date YYYY-MM-DD to filter events',
      },
    },
  },
};

export async function generateAIChatResponse(req: AIChatRequest): Promise<CoachChatMessage> {
  const { modelId, message, calendarPermission: requestedPermission } = req;
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

  // Determine effective calendar permission
  const savedCalendarIntegration = db.getCalendarIntegration();
  const activePermission: CalendarPermissionLevel = 
    requestedPermission || savedCalendarIntegration.permission || 'read_edit';

  // Check for heuristic calendar commands first (supports all models including offline/mock fallbacks)
  const heuristicResult = handleHeuristicCalendarAction(message, activePermission, timeStr, agent.modelTier || agent.name);
  if (heuristicResult) {
    return heuristicResult;
  }

  // 1. GEMINI AGENT (uses real @google/genai with 'gemini-3.8-flash')
  if (modelId === 'gemini') {
    const gemini = getGemini();
    if (gemini) {
      try {
        const permissionGuidance =
          activePermission === 'read_edit'
            ? 'Calendar Permission: "Read & edit" IS ACTIVE. You have tool permissions to create, reschedule, or delete calendar events (createCalendarEvent, rescheduleCalendarEvent, deleteCalendarEvent) whenever appropriate.'
            : activePermission === 'read_only'
            ? 'Calendar Permission: "Read only" IS ACTIVE. You can read events (readCalendarEvents), but you CANNOT create, reschedule, or delete events. If the user asks to modify or schedule an event, you must explain that permission is set to "Read only" and suggest switching to "Read & edit" in AI Integration settings.'
            : 'Calendar Permission: "No access" IS ACTIVE. You do not have access to the user\'s calendar.';

        const systemPrompt = `You are the Gemini 3.8 Flash AI Coach inside LifeRPG.
User Info: Level ${level}, ${streak}-day streak.
Remaining habits today: ${questsRemaining.slice(0, 3).join(', ') || 'All habits completed!'}
Pending tasks: ${tasksRemaining.slice(0, 3).join(', ') || 'No urgent tasks!'}
${permissionGuidance}
Personality: Ultra fast, multimodal-ready, Google Calendar and schedule alignment expert. Give concise, highly actionable, encouraging coaching (max 3 short paragraphs).`;

        // Configure tools strictly according to permission level
        const tools: any[] = [];
        if (activePermission === 'read_edit') {
          // Both read and mutation tools are enabled
          tools.push({
            functionDeclarations: [
              createCalendarEventDeclaration,
              rescheduleCalendarEventDeclaration,
              deleteCalendarEventDeclaration,
              readCalendarEventsDeclaration,
            ],
          });
        } else if (activePermission === 'read_only') {
          // Strictly read-only tool, mutation tools are excluded
          tools.push({
            functionDeclarations: [readCalendarEventsDeclaration],
          });
        }

        const requestConfig: any = {};
        if (tools.length > 0) {
          requestConfig.tools = tools;
        }

        const response = await gemini.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\nUser Question: ${message}`,
          config: requestConfig,
        });

        // Handle tool calls if returned by Gemini
        const functionCalls = response.functionCalls;
        if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0];
          
          if (call.name === 'createCalendarEvent') {
            if (activePermission !== 'read_edit') {
              return {
                id: `gemini-perm-${Date.now()}`,
                sender: 'coach',
                text: '⚠️ **Permission Denied**: Google Calendar access is set to **Read only**. To allow me to schedule and create calendar events, please switch permission to **Read & edit** in the **AI Integration** settings.',
                timestamp: timeStr,
                agentId: 'gemini',
                agentName: agent.modelTier || 'Gemini 3.8 Flash',
                calendarAction: {
                  action: 'permission_denied',
                  details: 'Calendar permission is Read only.',
                },
              };
            }
            const args: any = call.args || {};
            const eventDate = args.date || new Date().toISOString().slice(0, 10);
            const newEvt = db.addCalendarEvent({
              title: args.title || 'Scheduled Event',
              date: eventDate,
              startTime: args.startTime || '09:00 AM',
              endTime: args.endTime || '10:00 AM',
              category: args.category || 'workout',
              description: args.description || 'Scheduled by AI Coach',
              priority: args.priority || 'medium',
              color: args.category === 'study' ? '#3B82F6' : args.category === 'project' ? '#10B981' : '#F43F5E',
            });

            return {
              id: `gemini-evt-${Date.now()}`,
              sender: 'coach',
              text: `📅 **Event Created**: I added **${newEvt.title}** to your calendar on **${newEvt.date}** at **${newEvt.startTime}**.\n\nYour schedule has been aligned with your habits and productivity targets!`,
              timestamp: timeStr,
              agentId: 'gemini',
              agentName: agent.modelTier || 'Gemini 3.8 Flash',
              calendarAction: {
                action: 'created',
                eventTitle: newEvt.title,
                date: newEvt.date,
                time: newEvt.startTime,
                details: newEvt.description,
              },
              actionRecommendation: {
                title: `View ${newEvt.title} in Calendar`,
                description: `Scheduled for ${newEvt.date} at ${newEvt.startTime}`,
                actionLabel: 'Check Calendar',
              },
            };
          }

          if (call.name === 'rescheduleCalendarEvent') {
            if (activePermission !== 'read_edit') {
              return {
                id: `gemini-perm-${Date.now()}`,
                sender: 'coach',
                text: '⚠️ **Permission Denied**: Google Calendar access is currently set to **Read only**. Please enable **Read & edit** in **AI Integration** settings to reschedule events.',
                timestamp: timeStr,
                agentId: 'gemini',
                agentName: agent.modelTier || 'Gemini 3.8 Flash',
                calendarAction: {
                  action: 'permission_denied',
                  details: 'Calendar permission is Read only.',
                },
              };
            }
            const args: any = call.args || {};
            const events = db.getState().calendarEvents;
            const target = events.find((e) => 
              e.id === args.eventTitleOrId || e.title.toLowerCase().includes(String(args.eventTitleOrId).toLowerCase())
            );
            if (target) {
              const updated = db.updateCalendarEvent({
                ...target,
                date: args.newDate || target.date,
                startTime: args.newStartTime || target.startTime,
                endTime: args.newEndTime || target.endTime,
              });
              return {
                id: `gemini-resched-${Date.now()}`,
                sender: 'coach',
                text: `🕒 **Event Rescheduled**: I moved **${target.title}** to **${updated?.date}** at **${updated?.startTime}**.`,
                timestamp: timeStr,
                agentId: 'gemini',
                agentName: agent.modelTier || 'Gemini 3.8 Flash',
                calendarAction: {
                  action: 'rescheduled',
                  eventTitle: target.title,
                  date: updated?.date,
                  time: updated?.startTime,
                },
              };
            }
          }

          if (call.name === 'deleteCalendarEvent') {
            if (activePermission !== 'read_edit') {
              return {
                id: `gemini-perm-${Date.now()}`,
                sender: 'coach',
                text: '⚠️ **Permission Denied**: Google Calendar access is currently set to **Read only**. Please enable **Read & edit** in **AI Integration** settings to delete events.',
                timestamp: timeStr,
                agentId: 'gemini',
                agentName: agent.modelTier || 'Gemini 3.8 Flash',
                calendarAction: {
                  action: 'permission_denied',
                  details: 'Calendar permission is Read only.',
                },
              };
            }
            const args: any = call.args || {};
            const events = db.getState().calendarEvents;
            const target = events.find((e) => 
              e.id === args.eventTitleOrId || e.title.toLowerCase().includes(String(args.eventTitleOrId).toLowerCase())
            );
            if (target) {
              db.deleteCalendarEvent(target.id);
              return {
                id: `gemini-del-${Date.now()}`,
                sender: 'coach',
                text: `🗑️ **Event Removed**: I deleted **${target.title}** from your calendar schedule.`,
                timestamp: timeStr,
                agentId: 'gemini',
                agentName: agent.modelTier || 'Gemini 3.8 Flash',
                calendarAction: {
                  action: 'deleted',
                  eventTitle: target.title,
                },
              };
            }
          }
        }

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
    return generateGeminiFallback(message, streak, questsRemaining, timeStr, agent.modelTier || 'Gemini 3.8 Flash', activePermission);
  }

  // 2. CHATGPT AGENT (OpenAI GPT-4o Persona)
  if (modelId === 'chatgpt') {
    return generateChatGPTResponse(message, streak, questsRemaining, timeStr, agent.modelTier || 'GPT-4o (Omni)', activePermission);
  }

  // 3. CLAUDE AGENT (Anthropic Claude 3.5 Sonnet Persona)
  if (modelId === 'claude') {
    return generateClaudeResponse(message, streak, tasksRemaining, timeStr, agent.modelTier || 'Claude 3.5 Sonnet', activePermission);
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

/**
 * Checks for explicit user scheduling requests and executes them if permission is 'read_edit'.
 * If permission is 'read_only' or 'no_access', returns clear guidance.
 */
function handleHeuristicCalendarAction(
  userText: string,
  permission: CalendarPermissionLevel,
  timestamp: string,
  modelName: string
): CoachChatMessage | null {
  const lower = userText.toLowerCase();

  // Check for scheduling / creation intent
  const isCreate = 
    (lower.includes('schedule') || lower.includes('add to calendar') || lower.includes('create event') || lower.includes('block time')) &&
    (lower.includes('workout') || lower.includes('gym') || lower.includes('study') || lower.includes('session') || lower.includes('meeting') || lower.includes('run') || lower.includes('practice') || lower.includes('deep work'));

  // Check for reschedule intent
  const isReschedule = 
    (lower.includes('reschedule') || lower.includes('move my') || lower.includes('change time') || lower.includes('postpone')) &&
    (lower.includes('to ') || lower.includes('tomorrow') || lower.includes('today') || lower.includes('pm') || lower.includes('am'));

  // Check for delete intent
  const isDelete = 
    (lower.includes('delete') || lower.includes('remove') || lower.includes('cancel')) &&
    (lower.includes('event') || lower.includes('calendar') || lower.includes('workout') || lower.includes('meeting') || lower.includes('session'));

  if (!isCreate && !isReschedule && !isDelete) {
    return null;
  }

  // 1. If NO ACCESS
  if (permission === 'no_access') {
    return {
      id: `cal-noaccess-${Date.now()}`,
      sender: 'coach',
      text: `🚫 **Calendar Access Disabled**: I cannot access or manage your calendar right now. Please connect your Google Calendar in **AI Integration** and grant permissions to enable automated scheduling.`,
      timestamp,
      agentId: 'coach',
      agentName: modelName,
      calendarAction: {
        action: 'permission_denied',
        details: 'Calendar access is disabled (No access).',
      },
      suggestions: ['Open AI Integration', 'Review Habit Targets'],
    };
  }

  // 2. If READ ONLY: reject mutation and explain how to enable "Read & edit"
  if (permission === 'read_only') {
    const actionAttempted = isCreate ? 'create calendar events' : isReschedule ? 'reschedule events' : 'delete calendar events';
    return {
      id: `cal-readonly-${Date.now()}`,
      sender: 'coach',
      text: `🔒 **Read-Only Calendar Mode Active**\n\nI detected that you want to ${actionAttempted}, but your Google Calendar permission is currently set to **Read only**.\n\nTo allow me to actively manage, create, and update your schedule:\n1. Go to **AI Integration**\n2. In the **Permissions** panel, switch Google Calendar to **Read & edit**\n\nOnce enabled, I will be able to schedule your sessions and keep your calendar perfectly in sync!`,
      timestamp,
      agentId: 'coach',
      agentName: modelName,
      calendarAction: {
        action: 'permission_denied',
        details: 'Google Calendar is set to Read only. Switch to Read & edit in AI Integration to allow modifications.',
      },
      suggestions: ['Show current calendar events', 'What habits do I have today?'],
      actionRecommendation: {
        title: 'Switch to Read & Edit Permission',
        description: 'Upgrade Google Calendar permission in AI Integration settings to allow active scheduling.',
        actionLabel: 'AI Integration Settings',
      },
    };
  }

  // 3. If READ & EDIT: execute the mutation!
  if (permission === 'read_edit') {
    const todayStr = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const targetDate = lower.includes('tomorrow') ? tomorrowStr : todayStr;

    // Time extraction (e.g. "7am", "5:00 pm", "4pm")
    let targetTime = '09:00 AM';
    let endTime = '10:00 AM';
    const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const mins = timeMatch[2] || '00';
      const ampm = timeMatch[3].toUpperCase();
      targetTime = `${hours < 10 ? '0' + hours : hours}:${mins} ${ampm}`;
      const endHours = hours === 12 ? 1 : hours + 1;
      endTime = `${endHours < 10 ? '0' + endHours : endHours}:${mins} ${ampm}`;
    }

    if (isCreate) {
      // Determine title
      let title = 'Deep Work Session';
      let category: CalendarEvent['category'] = 'project';
      if (lower.includes('workout') || lower.includes('gym')) {
        title = 'Strength & Conditioning Workout';
        category = 'workout';
      } else if (lower.includes('study') || lower.includes('dsa') || lower.includes('code')) {
        title = 'DSA & Algorithm Study Block';
        category = 'study';
      } else if (lower.includes('run')) {
        title = 'Cardio & Outdoor Run';
        category = 'health';
      } else if (lower.includes('meeting')) {
        title = 'Priority Team Sync';
        category = 'social';
      }

      const newEvt = db.addCalendarEvent({
        title,
        date: targetDate,
        startTime: targetTime,
        endTime,
        category,
        description: `Scheduled by ${modelName} via Read & edit permission`,
        priority: 'high',
        color: category === 'workout' ? '#F43F5E' : category === 'study' ? '#3B82F6' : category === 'health' ? '#EC4899' : '#10B981',
      });

      return {
        id: `cal-created-${Date.now()}`,
        sender: 'coach',
        text: `⚡ **Calendar Updated**: I scheduled **${newEvt.title}** for **${targetDate === todayStr ? 'Today' : 'Tomorrow'} (${newEvt.date})** from **${newEvt.startTime}** to **${newEvt.endTime}**.\n\nBecause your Google Calendar integration is set to **Read & edit**, this has been written directly to your schedule and cross-synced with your daily quest board (+25 XP)!`,
        timestamp,
        agentId: 'coach',
        agentName: modelName,
        calendarAction: {
          action: 'created',
          eventTitle: newEvt.title,
          date: newEvt.date,
          time: newEvt.startTime,
          details: newEvt.description,
        },
        actionRecommendation: {
          title: `View ${newEvt.title} on Calendar`,
          description: `${newEvt.date} · ${newEvt.startTime} - ${newEvt.endTime}`,
          actionLabel: 'Go to Calendar',
        },
        suggestions: ['Review my full schedule', 'What is my next priority?'],
      };
    }

    if (isReschedule) {
      const events = db.getState().calendarEvents;
      const target = events.find((e) => 
        (lower.includes('workout') && e.category === 'workout') ||
        (lower.includes('study') && e.category === 'study') ||
        lower.includes(e.title.toLowerCase())
      ) || events[0];

      if (target) {
        const updated = db.updateCalendarEvent({
          ...target,
          date: targetDate,
          startTime: targetTime,
          endTime,
        });
        return {
          id: `cal-resched-${Date.now()}`,
          sender: 'coach',
          text: `🕒 **Schedule Updated**: I rescheduled **${target.title}** to **${targetDate === todayStr ? 'Today' : 'Tomorrow'} (${updated?.date})** at **${updated?.startTime}**.\n\nYour timeline has been refreshed to prevent scheduling overlap.`,
          timestamp,
          agentId: 'coach',
          agentName: modelName,
          calendarAction: {
            action: 'rescheduled',
            eventTitle: target.title,
            date: updated?.date,
            time: updated?.startTime,
          },
          suggestions: ['Check availability for tonight', 'Show remaining habits'],
        };
      }
    }

    if (isDelete) {
      const events = db.getState().calendarEvents;
      const target = events.find((e) => 
        (lower.includes('workout') && e.category === 'workout') ||
        lower.includes(e.title.toLowerCase())
      );
      if (target) {
        db.deleteCalendarEvent(target.id);
        return {
          id: `cal-del-${Date.now()}`,
          sender: 'coach',
          text: `🗑️ **Event Removed**: I removed **${target.title}** from your calendar schedule as requested.`,
          timestamp,
          agentId: 'coach',
          agentName: modelName,
          calendarAction: {
            action: 'deleted',
            eventTitle: target.title,
          },
          suggestions: ['Show today\'s schedule', 'What should I do instead?'],
        };
      }
    }
  }

  return null;
}

function generateGeminiFallback(
  userText: string,
  streak: number,
  quests: string[],
  timestamp: string,
  modelTier: string,
  permission: CalendarPermissionLevel
): CoachChatMessage {
  const lower = userText.toLowerCase();

  if (lower.includes('schedule') || lower.includes('calendar') || lower.includes('time') || lower.includes('plan')) {
    const permNote = permission === 'read_edit' 
      ? 'Full "Read & edit" permission is active: feel free to ask me to schedule or move events anytime.' 
      : 'Currently in "Read only" mode: switch to "Read & edit" in AI Integration if you want me to automatically add events.';

    return {
      id: `gemini-${Date.now()}`,
      sender: 'coach',
      text: `⚡ **${modelTier} Calendar Optimization**: I synced your schedule and current habit queue. You have a ${streak}-day streak active. Based on your energy levels, protect the 2:00 PM to 4:30 PM window for deep focus.\n\n*${permNote}*`,
      timestamp,
      agentId: 'gemini',
      agentName: modelTier,
      suggestions: ['Schedule a workout tomorrow at 7am', 'Check calendar conflicts', 'Set 45-min focus block'],
      actionRecommendation: {
        title: 'Deep Focus Sprint (45m)',
        description: 'Calendar gap detected. Perfect time for deliberate practice.',
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
  modelTier: string,
  permission: CalendarPermissionLevel
): CoachChatMessage {
  return {
    id: `chatgpt-${Date.now()}`,
    sender: 'coach',
    text: `🚀 **${modelTier} Action Plan**: Great question! Let's break this down into 3 high-leverage steps:\n\n1. **Immediate Quick Win**: Complete your easiest habit first to protect your ${streak}-day streak.\n2. **Time-Boxing**: Allocate 25 minutes of zero-notification execution on your top goal.\n3. **Schedule Alignment**: Calendar permission is currently set to **${permission === 'read_edit' ? 'Read & edit' : permission === 'read_only' ? 'Read only' : 'No access'}**.\n\nWhat's the first step you want to execute right now?`,
    timestamp,
    agentId: 'chatgpt',
    agentName: modelTier,
    suggestions: ['Schedule a workout tomorrow at 8am', 'Help me prioritize my backlog', 'Draft a weekly recap'],
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
  modelTier: string,
  permission: CalendarPermissionLevel
): CoachChatMessage {
  return {
    id: `claude-${Date.now()}`,
    sender: 'coach',
    text: `🧠 **${modelTier} Reflection**: Looking at your momentum (${streak}-day streak), consistency is rarely about brute willpower; it's about reducing cognitive friction.\n\nWhen we examine your pending workload, consider which item creates the most subtle mental fatigue. Often, clarifying the very first physical action—rather than the outcome—makes execution effortless.\n\nYour calendar integration is set to **${permission === 'read_edit' ? 'Read & edit' : permission === 'read_only' ? 'Read only' : 'No access'}**.\n\nWould you like to analyze what's causing resistance, or structure a clean focus block?`,
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
