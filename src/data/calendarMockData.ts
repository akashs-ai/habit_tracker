import { CalendarEvent } from '../types';

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Gym',
    date: '2025-02-24',
    startTime: '7:00 AM',
    endTime: '8:00 AM',
    category: 'workout',
    color: '#22C55E',
    description: 'Upper body resistance training session.'
  },
  {
    id: 'evt-2',
    title: 'DSA Practice',
    date: '2025-02-25',
    startTime: '7:00 PM',
    endTime: '8:30 PM',
    category: 'study',
    color: '#7C5CFF',
    description: 'Binary search tree problems on LeetCode.'
  },
  {
    id: 'evt-3',
    title: 'Project Work',
    date: '2025-02-27',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    category: 'project',
    color: '#3B82F6',
    description: 'Sprint planning and API design review.'
  },
  {
    id: 'evt-4',
    title: 'Read Book',
    date: '2025-03-01',
    startTime: '9:00 AM',
    endTime: '10:00 AM',
    category: 'personal',
    color: '#F59E0B',
    description: 'Atomic Habits - Chapters 4 & 5.'
  },
  {
    id: 'evt-5',
    title: 'Plan Week',
    date: '2025-03-02',
    startTime: '5:00 PM',
    endTime: '6:00 PM',
    category: 'personal',
    color: '#F59E0B',
    description: 'Weekly review, schedule priorities and goals.'
  },
  {
    id: 'evt-6',
    title: 'College',
    date: '2025-03-05',
    startTime: '9:00 AM',
    endTime: '1:00 PM',
    category: 'study',
    color: '#7C5CFF',
    description: 'Computer Networks and Operating Systems lecture.'
  },
  {
    id: 'evt-7',
    title: 'Video Edit',
    date: '2025-03-07',
    startTime: '3:00 PM',
    endTime: '5:00 PM',
    category: 'entertainment',
    color: '#06B6D4',
    description: 'Cut final b-roll footage and export.'
  },
  {
    id: 'evt-8',
    title: 'Design UI',
    date: '2025-03-11',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    category: 'project',
    color: '#7C5CFF',
    location: 'Figma Workspace',
    description: 'Work on the new dashboard design in Figma. Focus on calendar page.',
    priority: 'high',
    subtasks: [
      { id: 'st-1', title: 'Finalize layout', completed: true },
      { id: 'st-2', title: 'Add interactions', completed: false },
      { id: 'st-3', title: 'Review with reference', completed: false }
    ],
    attachments: [
      { name: 'Figma_Design.fig', size: '12.4 MB' }
    ]
  },
  {
    id: 'evt-9',
    title: 'Lunch with Friends',
    date: '2025-03-11',
    startTime: '1:00 PM',
    endTime: '2:00 PM',
    category: 'social',
    color: '#F59E0B',
    location: 'Cafeteria / Bistro',
    description: 'Catch up over healthy lunch.'
  },
  {
    id: 'evt-10',
    title: 'Free Fire (Custom)',
    date: '2025-03-11',
    startTime: '10:00 PM',
    endTime: '12:00 AM',
    category: 'entertainment',
    color: '#EC4899',
    description: 'Custom guild tournament room with squad.'
  },
  {
    id: 'evt-11',
    title: 'Project Work',
    date: '2025-03-13',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    category: 'project',
    color: '#3B82F6',
    description: 'Implement responsive calendar components.'
  },
  {
    id: 'evt-12',
    title: 'Meditate',
    date: '2025-03-13',
    startTime: '7:00 AM',
    endTime: '7:30 AM',
    category: 'health',
    color: '#22C55E',
    description: 'Mindfulness breathing exercise.'
  },
  {
    id: 'evt-13',
    title: 'Gym',
    date: '2025-03-14',
    startTime: '7:00 AM',
    endTime: '8:00 AM',
    category: 'workout',
    color: '#22C55E',
    description: 'Leg day and mobility.'
  },
  {
    id: 'evt-14',
    title: 'Movie Night',
    date: '2025-03-14',
    startTime: '8:00 PM',
    endTime: '11:00 PM',
    category: 'entertainment',
    color: '#7C5CFF',
    description: 'Interstellar rewatch.'
  },
  {
    id: 'evt-15',
    title: 'Gym',
    date: '2025-03-17',
    startTime: '7:00 AM',
    endTime: '8:00 AM',
    category: 'workout',
    color: '#22C55E',
    description: 'Push day.'
  },
  {
    id: 'evt-16',
    title: 'DSA Contest',
    date: '2025-03-18',
    startTime: '8:00 PM',
    endTime: '10:00 PM',
    category: 'study',
    color: '#7C5CFF',
    description: 'Weekly rated contest.'
  },
  {
    id: 'evt-17',
    title: 'Project Deadline',
    date: '2025-03-21',
    startTime: '5:00 PM',
    endTime: '6:00 PM',
    allDay: false,
    category: 'health',
    color: '#EF4444',
    description: 'Final submission for Q1 milestones.'
  },
  {
    id: 'evt-18',
    title: 'Family Time',
    date: '2025-03-23',
    startTime: '5:00 PM',
    endTime: '7:00 PM',
    category: 'social',
    color: '#EC4899',
    description: 'Sunday dinner and conversation.'
  },
  {
    id: 'evt-19',
    title: 'Read Book',
    date: '2025-03-26',
    startTime: '9:00 PM',
    endTime: '10:00 PM',
    category: 'personal',
    color: '#3B82F6',
    description: 'Deep Work by Cal Newport.'
  },
  {
    id: 'evt-20',
    title: 'Plan Next Month',
    date: '2025-03-28',
    startTime: '6:00 PM',
    endTime: '7:00 PM',
    category: 'project',
    color: '#3B82F6',
    description: 'Goals for April and budget audit.'
  },
  {
    id: 'evt-21',
    title: 'Outing',
    date: '2025-03-29',
    startTime: '4:00 PM',
    endTime: '8:00 PM',
    category: 'social',
    color: '#7C5CFF',
    description: 'City walk and museum visit.'
  }
];
