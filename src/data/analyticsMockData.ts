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
  AnalyticsTimeRange
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
