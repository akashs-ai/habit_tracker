import {
  AnalyticsKpiData,
  ConsistencyTrendPoint,
  HabitBreakdownCategory,
  ConsistentHabitItem,
  HeatmapDay,
  TimeDistributionItem,
  AnalyticsGoalItem,
  AnalyticsInsight,
  AnalyticsAchievement,
  AnalyticsTimeRange,
  TaskItem,
  Quest,
  UserProfile
} from '../types';

export const initialAnalyticsKpi: AnalyticsKpiData = {
  overallConsistency: 82,
  consistencyChange: 12,
  currentStreakDays: 6,
  streakChangeDays: 2,
  tasksCompleted: 28,
  tasksTotal: 34,
  tasksChangePct: 18,
  momentumPoints: 4320,
  momentumPointsWeeklyGain: 540,
};

export const initialTrendPoints: ConsistencyTrendPoint[] = [
  { date: '2025-09-05', dayLabel: 'Sep 5', completionRate: 60, tasksCompleted: 6, totalTasks: 10 },
  { date: '2025-09-06', dayLabel: 'Sep 6', completionRate: 72, tasksCompleted: 7, totalTasks: 10 },
  { date: '2025-09-07', dayLabel: 'Sep 7', completionRate: 85, tasksCompleted: 8, totalTasks: 10 },
  { date: '2025-09-08', dayLabel: 'Sep 8', completionRate: 76, tasksCompleted: 7, totalTasks: 9 },
  { date: '2025-09-09', dayLabel: 'Sep 9', completionRate: 86, tasksCompleted: 9, totalTasks: 10 },
  { date: '2025-09-10', dayLabel: 'Sep 10', completionRate: 80, tasksCompleted: 8, totalTasks: 10 },
  { date: '2025-09-11', dayLabel: 'Sep 11', completionRate: 92, tasksCompleted: 9, totalTasks: 10 },
];

export const initialHabitBreakdown: HabitBreakdownCategory[] = [
  { name: 'Study', percentage: 32, count: 11, color: '#38BDF8' },
  { name: 'Health', percentage: 24, count: 8, color: '#34D399' },
  { name: 'Productivity', percentage: 18, count: 6, color: '#06B6D4' },
  { name: 'Personal', percentage: 15, count: 5, color: '#FB7185' },
  { name: 'Other', percentage: 11, count: 4, color: '#818CF8' },
];

export const initialConsistentHabits: ConsistentHabitItem[] = [
  { id: 'hab-1', name: 'Morning Reading', percentage: 93, icon: 'reading', color: '#38BDF8' },
  { id: 'hab-2', name: 'Workout', percentage: 87, icon: 'workout', color: '#EC4899' },
  { id: 'hab-3', name: 'Sleep (Before 12 AM)', percentage: 86, icon: 'sleep', color: '#818CF8' },
  { id: 'hab-4', name: 'Coding Practice', percentage: 82, icon: 'coding', color: '#06B6D4' },
  { id: 'hab-5', name: 'Meditation', percentage: 78, icon: 'meditation', color: '#F59E0B' },
];

export const generateHeatmapData = (): HeatmapDay[] => {
  const days: HeatmapDay[] = [];
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Mon - Sun
  const weeksCount = 14;

  // Preset level pattern for visual fidelity matching the screenshot
  const patternGrid: number[][] = [
    // Mon:
    [1, 2, 3, 2, 4, 3, 3, 4, 2, 3, 4, 3, 4, 2],
    // Tue:
    [0, 1, 2, 3, 3, 4, 4, 3, 4, 4, 3, 2, 3, 1],
    // Wed:
    [2, 3, 3, 4, 4, 3, 4, 4, 3, 4, 4, 4, 3, 3],
    // Thu:
    [1, 2, 2, 3, 4, 4, 3, 4, 4, 3, 4, 4, 3, 2],
    // Fri:
    [2, 3, 4, 4, 3, 4, 4, 3, 4, 4, 4, 3, 4, 3],
    // Sat:
    [1, 1, 2, 2, 3, 3, 4, 3, 3, 4, 3, 2, 2, 1],
    // Sun:
    [0, 1, 2, 2, 2, 3, 3, 4, 3, 3, 2, 2, 1, 0],
  ];

  for (let w = 0; w < weeksCount; w++) {
    for (let d = 0; d < 7; d++) {
      const level = (patternGrid[d] && patternGrid[d][w] !== undefined ? patternGrid[d][w] : 2) as 0 | 1 | 2 | 3 | 4;
      const count = level === 0 ? 0 : level === 1 ? 2 : level === 2 ? 4 : level === 3 ? 6 : 8;
      const consistencyRate = level === 0 ? 0 : level === 1 ? 40 : level === 2 ? 65 : level === 3 ? 85 : 98;
      
      const dayOffset = (w * 7) + d;
      const dateObj = new Date(2025, 5, 8); // Start mid June through Sep 2025
      dateObj.setDate(dateObj.getDate() + dayOffset);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      days.push({
        date: dateStr,
        dayOfWeek: d,
        weekIndex: w,
        count,
        consistencyRate,
        level,
      });
    }
  }

  return days;
};

export const initialHeatmapDays: HeatmapDay[] = generateHeatmapData();

export const initialTimeDistributionHabits: TimeDistributionItem[] = [
  { category: 'Study', hours: 4.2, percentage: 34, color: '#38BDF8' },
  { category: 'Workout', hours: 2.1, percentage: 17, color: '#34D399' },
  { category: 'Coding', hours: 1.8, percentage: 15, color: '#06B6D4' },
  { category: 'Personal', hours: 1.6, percentage: 13, color: '#FB7185' },
  { category: 'Other', hours: 2.7, percentage: 21, color: '#818CF8' },
];

export const initialTimeDistributionTasks: TimeDistributionItem[] = [
  { category: 'Project Dev', hours: 5.4, percentage: 42, color: '#6366F1' },
  { category: 'Bug Fixes', hours: 2.8, percentage: 22, color: '#06B6D4' },
  { category: 'Design Review', hours: 2.2, percentage: 17, color: '#A855F7' },
  { category: 'Admin & Email', hours: 1.4, percentage: 11, color: '#F59E0B' },
  { category: 'Planning', hours: 1.0, percentage: 8, color: '#64748B' },
];

export const initialAnalyticsGoals: AnalyticsGoalItem[] = [
  { id: 'goal-1', title: 'DSA Mastery', percentage: 78, category: 'Career', icon: 'dsa', color: '#6366F1' },
  { id: 'goal-2', title: 'Build Portfolio', percentage: 42, category: 'Design', icon: 'portfolio', color: '#C084FC' },
  { id: 'goal-3', title: 'Get in Shape', percentage: 66, category: 'Health', icon: 'shape', color: '#34D399' },
  { id: 'goal-4', title: 'Read 24 Books', percentage: 25, category: 'Mindset', icon: 'books', color: '#38BDF8' },
];

export const initialAnalyticsInsights: AnalyticsInsight[] = [
  {
    id: 'ins-1',
    headline: "You're 18% more consistent this week.",
    subtext: "Keep going! You're building solid momentum.",
    type: 'consistency',
    icon: 'trending-up',
    color: '#34D399',
  },
  {
    id: 'ins-2',
    headline: "You're most productive between 7 PM – 10 PM.",
    subtext: "Consider scheduling your deep work focus during this block.",
    type: 'productivity',
    icon: 'clock',
    color: '#818CF8',
  },
  {
    id: 'ins-3',
    headline: "Your workout consistency has improved.",
    subtext: "You've completed 6 out of 7 planned sessions this week.",
    type: 'workout',
    icon: 'heart',
    color: '#F43F5E',
  },
];

export const initialAnalyticsAchievements: AnalyticsAchievement[] = [
  {
    id: 'ach-1',
    title: '7-Day Streak',
    description: 'Maintained unbroken consistency for 7 days in a row.',
    icon: 'streak',
    color: '#F59E0B',
    earnedDate: 'Sep 10, 2025',
    isUnlocked: true,
  },
  {
    id: 'ach-2',
    title: 'Early Riser',
    description: 'Completed morning tasks before 8:00 AM on 5 days.',
    icon: 'riser',
    color: '#FBBF24',
    earnedDate: 'Sep 8, 2025',
    isUnlocked: true,
  },
  {
    id: 'ach-3',
    title: 'Focus Master',
    description: 'Completed 15 hours of distraction-free study sessions.',
    icon: 'focus',
    color: '#38BDF8',
    earnedDate: 'Sep 6, 2025',
    isUnlocked: true,
  },
  {
    id: 'ach-4',
    title: 'Consistency Pro',
    description: 'Maintained 80%+ consistency over the entire month.',
    icon: 'consistency',
    color: '#34D399',
    earnedDate: 'Sep 1, 2025',
    isUnlocked: true,
  },
  {
    id: 'ach-5',
    title: 'Goal Crusher',
    description: 'Hit all primary weekly milestone targets on time.',
    icon: 'crusher',
    color: '#A855F7',
    isUnlocked: false,
  },
];

// Helper to calculate time range changes dynamically
export const getTimeRangeKpi = (range: AnalyticsTimeRange): AnalyticsKpiData => {
  switch (range) {
    case '7d':
      return initialAnalyticsKpi;
    case '30d':
      return {
        overallConsistency: 86,
        consistencyChange: 15,
        currentStreakDays: 21,
        streakChangeDays: 7,
        tasksCompleted: 118,
        tasksTotal: 135,
        tasksChangePct: 22,
        momentumPoints: 4320,
        momentumPointsWeeklyGain: 1940,
      };
    case '3m':
      return {
        overallConsistency: 84,
        consistencyChange: 9,
        currentStreakDays: 45,
        streakChangeDays: 14,
        tasksCompleted: 342,
        tasksTotal: 398,
        tasksChangePct: 14,
        momentumPoints: 4320,
        momentumPointsWeeklyGain: 5200,
      };
    case '1y':
      return {
        overallConsistency: 79,
        consistencyChange: 18,
        currentStreakDays: 62,
        streakChangeDays: 28,
        tasksCompleted: 1240,
        tasksTotal: 1510,
        tasksChangePct: 26,
        momentumPoints: 4320,
        momentumPointsWeeklyGain: 18400,
      };
    case 'all':
      return {
        overallConsistency: 81,
        consistencyChange: 24,
        currentStreakDays: 62,
        streakChangeDays: 32,
        tasksCompleted: 1680,
        tasksTotal: 2040,
        tasksChangePct: 30,
        momentumPoints: 4320,
        momentumPointsWeeklyGain: 24600,
      };
  }
};

// ==========================================
// DYNAMIC REAL-TIME SYNCHRONIZED ANALYTICS
// ==========================================

export const generateDynamicTrendPoints = (tasks: TaskItem[] = [], quests: Quest[] = []): ConsistencyTrendPoint[] => {
  const points: ConsistencyTrendPoint[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const isoDate = d.toISOString().split('T')[0];
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const dayLabel = `${monthName} ${dayNum}`;

    // Filter tasks scheduled or completed for this day
    const dayTasks = tasks.filter((t) => t.dueDate === isoDate || t.clientDate === isoDate);
    const isToday = i === 0;

    let tasksCompleted = dayTasks.filter((t) => t.completed).length;
    let totalTasks = dayTasks.length;

    // Today also incorporates daily quests
    if (isToday && quests.length > 0) {
      tasksCompleted += quests.filter((q) => q.completed).length;
      totalTasks += quests.length;
    }

    const completionRate = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

    points.push({
      date: isoDate,
      dayLabel,
      completionRate,
      tasksCompleted,
      totalTasks,
    });
  }

  return points;
};

export const generateDynamicHabitBreakdown = (tasks: TaskItem[] = [], quests: Quest[] = []): HabitBreakdownCategory[] => {
  const categoryCounts: Record<string, number> = {};

  // Count from tasks
  tasks.forEach((t) => {
    const cat = t.labels && t.labels.length > 0 ? t.labels[0] : (t.priority === 'high' ? 'Priority' : 'General');
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Count from quests
  quests.forEach((q) => {
    const cat = q.category ? q.category.charAt(0).toUpperCase() + q.category.slice(1) : 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const total = Object.values(categoryCounts).reduce((acc, c) => acc + c, 0);
  if (total === 0) return [];

  const colorPalette = ['#38BDF8', '#34D399', '#06B6D4', '#FB7185', '#F59E0B', '#818CF8', '#A855F7'];

  return Object.entries(categoryCounts).map(([name, count], idx) => ({
    name,
    count,
    percentage: Math.round((count / total) * 100),
    color: colorPalette[idx % colorPalette.length],
  }));
};

export const generateDynamicConsistentHabits = (quests: Quest[] = [], tasks: TaskItem[] = []): ConsistentHabitItem[] => {
  const items: ConsistentHabitItem[] = [];

  quests.forEach((q, idx) => {
    const colors = ['#38BDF8', '#EC4899', '#818CF8', '#06B6D4', '#F59E0B'];
    let iconType: ConsistentHabitItem['icon'] = 'reading';
    const lower = (q.title + ' ' + (q.subtitle || '')).toLowerCase();
    if (lower.includes('workout') || lower.includes('walk') || lower.includes('gym')) iconType = 'workout';
    else if (lower.includes('sleep') || lower.includes('bed')) iconType = 'sleep';
    else if (lower.includes('code') || lower.includes('dsa')) iconType = 'coding';
    else if (lower.includes('meditat') || lower.includes('breathe')) iconType = 'meditation';

    items.push({
      id: `hab-dyn-${q.id || idx}`,
      name: q.title,
      percentage: q.completed ? 100 : 0,
      icon: iconType,
      color: colors[idx % colors.length],
    });
  });

  // Also include recurring or priority tasks
  tasks.slice(0, 5 - items.length).forEach((t, idx) => {
    if (items.some((i) => i.name === t.title)) return;
    items.push({
      id: `hab-task-${t.id || idx}`,
      name: t.title,
      percentage: t.completed ? 100 : 0,
      icon: t.priority === 'high' ? 'workout' : 'coding',
      color: t.priority === 'high' ? '#EF4444' : '#6366F1',
    });
  });

  return items;
};

export const generateDynamicHeatmapData = (tasks: TaskItem[] = [], quests: Quest[] = []): HeatmapDay[] => {
  const days: HeatmapDay[] = [];
  const now = new Date();
  
  // Find date 14 weeks ago aligned to Monday
  const currentDayOfWeek = (now.getDay() + 6) % 7; // Mon=0, Sun=6
  const totalDays = 14 * 7;
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - currentDayOfWeek - (13 * 7));

  // Count completions per date
  const completionsPerDate: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.completed && (t.dueDate || t.clientDate)) {
      const dStr = t.dueDate || t.clientDate!;
      completionsPerDate[dStr] = (completionsPerDate[dStr] || 0) + 1;
    }
  });

  // If quests completed today, add them to today's count
  const todayStr = now.toISOString().split('T')[0];
  const questsDone = quests.filter((q) => q.completed).length;
  if (questsDone > 0) {
    completionsPerDate[todayStr] = (completionsPerDate[todayStr] || 0) + questsDone;
  }

  for (let i = 0; i < totalDays; i++) {
    const cur = new Date(startDate);
    cur.setDate(startDate.getDate() + i);
    const dateStr = cur.toISOString().split('T')[0];
    const dayOfWeek = (cur.getDay() + 6) % 7;
    const weekIndex = Math.floor(i / 7);

    const count = completionsPerDate[dateStr] || 0;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 4) level = 4;
    else if (count === 3) level = 3;
    else if (count === 2) level = 2;
    else if (count === 1) level = 1;

    days.push({
      date: dateStr,
      dayOfWeek,
      weekIndex,
      count,
      consistencyRate: count > 0 ? Math.min(100, count * 25) : 0,
      level,
    });
  }

  return days;
};

export const generateDynamicTimeDistribution = (
  tasks: TaskItem[] = [],
  quests: Quest[] = []
): { habitItems: TimeDistributionItem[]; taskItems: TimeDistributionItem[] } => {
  const habitMap: Record<string, number> = {};
  const taskMap: Record<string, number> = {};

  quests.forEach((q) => {
    const cat = q.category ? q.category.charAt(0).toUpperCase() + q.category.slice(1) : 'Habits';
    const hours = (q.durationMinutes || 15) / 60;
    habitMap[cat] = (habitMap[cat] || 0) + hours;
  });

  tasks.forEach((t) => {
    const cat = t.labels && t.labels.length > 0 ? t.labels[0] : 'Tasks';
    taskMap[cat] = (taskMap[cat] || 0) + 0.5; // default 30m per task
  });

  const colors = ['#38BDF8', '#34D399', '#818CF8', '#FB7185', '#F59E0B'];

  const habitTotal = Object.values(habitMap).reduce((a, b) => a + b, 0);
  const taskTotal = Object.values(taskMap).reduce((a, b) => a + b, 0);

  const habitItems: TimeDistributionItem[] = Object.entries(habitMap).map(([category, hours], idx) => ({
    category,
    hours: parseFloat(hours.toFixed(1)),
    percentage: habitTotal > 0 ? Math.round((hours / habitTotal) * 100) : 0,
    color: colors[idx % colors.length],
  }));

  const taskItems: TimeDistributionItem[] = Object.entries(taskMap).map(([category, hours], idx) => ({
    category,
    hours: parseFloat(hours.toFixed(1)),
    percentage: taskTotal > 0 ? Math.round((hours / taskTotal) * 100) : 0,
    color: colors[(idx + 2) % colors.length],
  }));

  return { habitItems, taskItems };
};

export const generateDynamicInsights = (
  tasks: TaskItem[] = [],
  quests: Quest[] = [],
  user?: UserProfile
): AnalyticsInsight[] => {
  const completedTasks = tasks.filter((t) => t.completed).length;
  const streak = user?.streakDays ?? user?.streak ?? 0;
  const consistency = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const insights: AnalyticsInsight[] = [];

  if (completedTasks > 0) {
    insights.push({
      id: 'ins-1',
      headline: 'Active Task Momentum',
      subtext: `You have completed ${completedTasks} of ${tasks.length} task${tasks.length === 1 ? '' : 's'} with a ${consistency}% completion rate.`,
      icon: 'trending-up',
      type: 'productivity',
      color: '#34D399',
    });
  } else {
    insights.push({
      id: 'ins-1',
      headline: 'Begin Your Streak',
      subtext: 'Check off your first task or complete a quest today to kickstart your momentum and habit tracking analytics.',
      icon: 'clock',
      type: 'consistency',
      color: '#6366F1',
    });
  }

  if (streak > 0) {
    insights.push({
      id: 'ins-2',
      headline: `${streak}-Day Streak Active`,
      subtext: 'Keep showing up daily to protect your consistency streak and earn bonus momentum points.',
      icon: 'trending-up',
      type: 'consistency',
      color: '#F59E0B',
    });
  } else {
    insights.push({
      id: 'ins-2',
      headline: 'Daily Consistency',
      subtext: 'Completing at least one task or quest daily establishes your habit streak score.',
      icon: 'clock',
      type: 'productivity',
      color: '#818CF8',
    });
  }

  return insights;
};

export const generateDynamicAchievements = (
  tasks: TaskItem[] = [],
  user?: UserProfile
): AnalyticsAchievement[] => {
  const completedTasks = tasks.filter((t) => t.completed).length;
  const level = user?.level ?? 1;
  const streak = user?.streakDays ?? user?.streak ?? 0;

  return [
    {
      id: 'ach-1',
      title: 'First Step',
      description: 'Complete your first habit or task in LifeRPG.',
      icon: 'streak',
      color: '#F59E0B',
      isUnlocked: completedTasks >= 1,
      earnedDate: completedTasks >= 1 ? 'Recent' : undefined,
    },
    {
      id: 'ach-2',
      title: 'Level 2 Explorer',
      description: 'Gain sufficient XP to advance to Level 2.',
      icon: 'crusher',
      color: '#6366F1',
      isUnlocked: level >= 2,
      earnedDate: level >= 2 ? 'Recent' : undefined,
    },
    {
      id: 'ach-3',
      title: 'Streak Novice',
      description: 'Maintain a 3-day consecutive consistency streak.',
      icon: 'consistency',
      color: '#34D399',
      isUnlocked: streak >= 3,
      earnedDate: streak >= 3 ? 'Recent' : undefined,
    },
    {
      id: 'ach-4',
      title: 'Task Finisher',
      description: 'Complete 5 tasks or daily quests.',
      icon: 'crusher',
      color: '#A855F7',
      isUnlocked: completedTasks >= 5,
      earnedDate: completedTasks >= 5 ? 'Recent' : undefined,
    },
  ];
};

