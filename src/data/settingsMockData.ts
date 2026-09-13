import {
  UserSettingsProfile,
  AppearanceSettings,
  NotificationSettings,
  PreferenceSettings,
  SecuritySettings,
} from '../types';

export const initialUserProfile: UserSettingsProfile = {
  displayName: 'Alex',
  username: 'alexdas',
  email: 'alex.das@gmail.com',
  bio: 'Discipline today, a stronger you tomorrow.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  memberSince: 'Today',
  level: 12,
  mp: 4320,
};

export const initialAppearanceSettings: AppearanceSettings = {
  theme: 'dark',
  accentColor: '#6C63FF',
  interfaceDensity: 'comfortable',
  motionEnabled: true,
  reducedMotion: false,
};

export const initialNotificationSettings: NotificationSettings = {
  pushNotifications: true,
  emailNotifications: true,
  taskReminders: true,
  goalUpdates: true,
  friendActivity: false,
  productUpdates: true,
};

export const initialPreferenceSettings: PreferenceSettings = {
  language: 'English (US)',
  timezone: '(GMT+5:30) India Standard Time',
  weekStartsOn: 'Monday',
  defaultLandingPage: 'Home',
  weeklySummary: true,
  confirmBeforeDelete: true,
};

export const initialSecuritySettings: SecuritySettings = {
  twoFactorAuth: false,
  loginAlerts: true,
  lastPasswordChange: 'Last changed 3 months ago',
};

export const accentColors = [
  { id: 'purple', name: 'Purple', hex: '#6C63FF' },
  { id: 'blue', name: 'Blue', hex: '#3B82F6' },
  { id: 'cyan', name: 'Cyan', hex: '#06B6D4' },
  { id: 'green', name: 'Green', hex: '#10B981' },
  { id: 'orange', name: 'Orange', hex: '#F97316' },
  { id: 'pink', name: 'Pink', hex: '#EC4899' },
];

export const mockSessions = [
  {
    id: 's1',
    device: 'MacBook Pro 16" (Sonoma 14.3)',
    location: 'San Francisco, USA',
    ip: '192.0.2.1',
    current: true,
    lastActive: 'Active now',
  },
  {
    id: 's2',
    device: 'iPhone 15 Pro (iOS 17.4)',
    location: 'San Francisco, USA',
    ip: '192.0.2.45',
    current: false,
    lastActive: '2 hours ago',
  },
  {
    id: 's3',
    device: 'Chrome on Windows 11',
    location: 'Austin, USA',
    ip: '198.51.100.12',
    current: false,
    lastActive: 'Yesterday',
  },
];
