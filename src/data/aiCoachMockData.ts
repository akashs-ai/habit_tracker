import {
  CoachPromptOption,
  CoachChatMessage,
  CoachPack,
  SuggestedTask,
  CoachInsightItem
} from '../types';

export const initialCoachPrompts: CoachPromptOption[] = [
  {
    id: 'prompt-study',
    title: 'Create a study plan',
    subtitle: 'Get a personalized plan based on your course and goals.',
    icon: 'study',
    color: '#38BDF8',
    prompt: 'Help me create a structured study plan for this semester focusing on DSA and system design.',
  },
  {
    id: 'prompt-workout',
    title: 'Suggest a workout routine',
    subtitle: 'Get a routine that fits your schedule and level.',
    icon: 'workout',
    color: '#C084FC',
    prompt: 'Suggest a 4-day workout routine that balances strength training with busy study days.',
  },
  {
    id: 'prompt-consistency',
    title: 'Help me stay consistent',
    subtitle: 'Tips, frameworks and accountability strategies.',
    icon: 'target',
    color: '#FB7185',
    prompt: 'How can I stay consistent when my motivation drops mid-week?',
  },
  {
    id: 'prompt-plan-day',
    title: 'Plan my day',
    subtitle: 'Turn your goals into a realistic daily plan.',
    icon: 'calendar',
    color: '#F97316',
    prompt: 'Help me structure today with realistic time blocks and high-impact priorities.',
  },
  {
    id: 'prompt-focus',
    title: 'Improve my focus',
    subtitle: 'Get techniques to reduce distractions and stay in flow.',
    icon: 'brain',
    color: '#EC4899',
    prompt: 'Give me proven techniques to eliminate distractions during 90-minute study blocks.',
  },
  {
    id: 'prompt-answer',
    title: 'Answer anything',
    subtitle: 'Ask doubts, get explanations or explore ideas.',
    icon: 'chat',
    color: '#60A5FA',
    prompt: 'Explain the core principles of habit stacking with real examples.',
  },
];

export const initialChatMessages: CoachChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'coach',
    text: "I'm here to help. What would you like to work on today?",
    timestamp: '10:24 AM',
    suggestions: [
      'Help me make a study plan for this semester',
      'How can I be consistent with gym?',
      'Give me a productive daily routine',
      'Explain this concept (DSA)',
    ],
  },
];

export const initialCoachPacks: CoachPack[] = [
  {
    id: 'cse_student',
    name: 'CSE Student',
    icon: '💻',
    description: 'Designed for computer science and software engineering students prioritizing technical skills and interview prep.',
    focusAreas: [
      'DSA / Problem Solving',
      'Projects & Architecture',
      'Study consistency',
      'Topic Revision',
    ],
  },
  {
    id: 'fitness',
    name: 'Fitness & Health',
    icon: '🏋️',
    description: 'Focuses on sustainable physical wellness, strength cadence, and recovery protocols.',
    focusAreas: [
      'Strength training',
      'Daily 8,000+ steps',
      'Sleep & recovery',
      'Hydration tracking',
    ],
  },
  {
    id: 'productivity',
    name: 'General Productivity',
    icon: '⚡',
    description: 'Built for high performance across demanding work, self-directed goals, and daily life.',
    focusAreas: [
      'Time-blocking',
      'Deep work sessions',
      'Task prioritization',
      'Weekly reviews',
    ],
  },
  {
    id: 'exam_prep',
    name: 'Exam Preparation',
    icon: '📚',
    description: 'Targeted revision strategies, past papers, and memory retention techniques.',
    focusAreas: [
      'Spaced repetition',
      'Practice question drills',
      'Weak subject focus',
      'Pre-exam sleep cadence',
    ],
  },
  {
    id: 'creator',
    name: 'Creator / Freelancer',
    icon: '🎨',
    description: 'Creative output generation, project milestones, and client communication cadence.',
    focusAreas: [
      'Deep creative flow',
      'Content milestones',
      'Client delivery deadlines',
      'Energy management',
    ],
  },
];

export const initialSuggestedTasks: SuggestedTask[] = [
  {
    id: 'st-1',
    time: '09:00',
    title: 'Solve 2 DSA problems (Arrays & Two Pointers)',
    category: 'Study',
    durationMinutes: 45,
    isAdded: false,
  },
  {
    id: 'st-2',
    time: '11:30',
    title: '20 min upper body kettlebell workout',
    category: 'Health',
    durationMinutes: 20,
    isAdded: false,
  },
  {
    id: 'st-3',
    time: '14:00',
    title: 'Build portfolio project auth module',
    category: 'Projects',
    durationMinutes: 60,
    isAdded: false,
  },
  {
    id: 'st-4',
    time: '18:00',
    title: "Review today's algorithmic notes & reflections",
    category: 'Study',
    durationMinutes: 25,
    isAdded: false,
  },
];

export const initialCoachInsights: CoachInsightItem[] = [
  {
    id: 'ci-1',
    title: 'Your strongest day',
    stat: 'Thursday',
    description: 'You completed 92% of planned habits. Your momentum peaks mid-week.',
  },
  {
    id: 'ci-2',
    title: 'Focus pattern',
    stat: '9:00 – 11:00 AM',
    description: 'Your longest distraction-free study blocks consistently happen during this morning window.',
  },
  {
    id: 'ci-3',
    title: 'Consistency velocity',
    stat: '+12%',
    description: 'Your completion rate improved compared with last month across all tracked priorities.',
  },
];

export const getCoachResponse = (userQuery: string): CoachChatMessage => {
  const queryLower = userQuery.toLowerCase();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (queryLower.includes('study') || queryLower.includes('dsa') || queryLower.includes('semester')) {
    return {
      id: `coach-msg-${Date.now()}`,
      sender: 'coach',
      text: "Here is your recommended study strategy: Allocate a 60-minute deep work block each morning strictly for DSA problem solving. Dedicate afternoons to practical project development, followed by a quick 20-minute concept review before wrapping up.",
      timestamp: timeStr,
      suggestions: [
        'How many problems per week should I aim for?',
        'Add DSA block to my calendar for 9:00 AM',
        'Recommend top graph algorithms to practice',
      ],
      actionRecommendation: {
        title: 'Morning DSA Problem Session',
        description: 'Scheduled for 09:00 AM · High priority study block',
        actionLabel: 'Add to Today',
      },
    };
  }

  if (queryLower.includes('gym') || queryLower.includes('workout') || queryLower.includes('fitness')) {
    return {
      id: `coach-msg-${Date.now()}`,
      sender: 'coach',
      text: "Consistency with fitness is about reducing friction. Start by locking in a 3-day split (Push, Pull, Legs) and preparing your gym gear the evening before. Treat the workout as an immovable calendar appointment.",
      timestamp: timeStr,
      suggestions: [
        'Suggest a 30-minute routine for busy days',
        'How should I manage rest days?',
        'Add workout reminder at 5:30 PM',
      ],
      actionRecommendation: {
        title: '30-Minute Upper Body Routine',
        description: 'Scheduled for 05:30 PM · Quick intensity block',
        actionLabel: 'Add to Today',
      },
    };
  }

  if (queryLower.includes('routine') || queryLower.includes('day') || queryLower.includes('schedule')) {
    return {
      id: `coach-msg-${Date.now()}`,
      sender: 'coach',
      text: "Based on your focus data, you are most alert between 9:00 AM and 11:30 AM. I recommend placing your hardest cognitive challenge in this block, leaving administrative tasks and messaging for post-lunch.",
      timestamp: timeStr,
      suggestions: [
        'Generate full hourly breakdown for today',
        'Schedule a 20-minute afternoon reboot',
      ],
      actionRecommendation: {
        title: 'Apply Optimized Morning Schedule',
        description: 'Prioritizes hard tasks before 11:30 AM',
        actionLabel: 'Add to Today',
      },
    };
  }

  if (queryLower.includes('focus') || queryLower.includes('distraction')) {
    return {
      id: `coach-msg-${Date.now()}`,
      sender: 'coach',
      text: "To eliminate distractions, use the 50/10 cadence: 50 minutes of single-task immersion with notifications silenced, followed by a mandatory 10-minute physical break away from screens.",
      timestamp: timeStr,
      suggestions: [
        'Start 50-minute focus timer now',
        'Suggest website blockers for study',
      ],
      actionRecommendation: {
        title: 'Start 50-Minute Focus Session',
        description: 'Focus timer · Single-tasking lock',
        actionLabel: 'Start Focus',
      },
    };
  }

  return {
    id: `coach-msg-${Date.now()}`,
    sender: 'coach',
    text: `I've analyzed your habits and recent progress. To make the fastest gains toward your goals, focus on completing your top priority before noon and maintaining your 6-day consistency streak.`,
    timestamp: timeStr,
    suggestions: [
      'Show my primary daily priorities',
      'What habit is slipping this week?',
      'Help me plan tomorrow morning',
    ],
    actionRecommendation: {
      title: 'Maintain Active 6-Day Streak',
      description: '1 habit check-in remaining today',
      actionLabel: 'Add to Today',
    },
  };
};
