import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { CalendarEvent, EventCategory } from '../types';

export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
CALENDAR_SCOPES.forEach((scope) => provider.addScope(scope));

// Flags & in-memory cached token (NEVER stored in localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No access token returned from Google sign-in');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      return null;
    }
    console.error('Google Sign-in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

function parseGCalTime(isoDateTime?: string): string | undefined {
  if (!isoDateTime) return undefined;
  try {
    const d = new Date(isoDateTime);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 -> 12
    const minStr = minutes < 10 ? '0' + minutes : minutes.toString();
    return `${hours}:${minStr} ${ampm}`;
  } catch {
    return undefined;
  }
}

function parseGCalDate(dateObj: { date?: string; dateTime?: string }): string {
  if (dateObj.date) {
    return dateObj.date; // YYYY-MM-DD
  }
  if (dateObj.dateTime) {
    return dateObj.dateTime.substring(0, 10); // YYYY-MM-DD
  }
  return new Date().toISOString().substring(0, 10);
}

function detectCategory(title: string, desc?: string): EventCategory {
  const text = `${title} ${desc || ''}`.toLowerCase();
  if (text.includes('gym') || text.includes('workout') || text.includes('run') || text.includes('fitness')) return 'workout';
  if (text.includes('study') || text.includes('read') || text.includes('exam') || text.includes('learn')) return 'study';
  if (text.includes('sprint') || text.includes('code') || text.includes('dev') || text.includes('architecture') || text.includes('review')) return 'project';
  if (text.includes('dinner') || text.includes('lunch') || text.includes('party') || text.includes('meet') || text.includes('coffee')) return 'social';
  if (text.includes('doctor') || text.includes('dentist') || text.includes('health') || text.includes('meditat')) return 'health';
  if (text.includes('movie') || text.includes('game') || text.includes('show') || text.includes('concert')) return 'entertainment';
  return 'personal';
}

function categoryColor(category: EventCategory): string {
  switch (category) {
    case 'workout': return '#22C55E';
    case 'study': return '#7C5CFF';
    case 'project': return '#6366F1';
    case 'social': return '#F59E0B';
    case 'health': return '#10B981';
    case 'entertainment': return '#EC4899';
    default: return '#3B82F6';
  }
}

/**
 * Fetch events from Google Calendar Primary calendar
 */
export async function fetchGoogleCalendarEvents(token: string): Promise<CalendarEvent[]> {
  // Fetch around current timeframe (e.g. 60 days in past to 120 days in future)
  const now = new Date();
  const past = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const future = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(past.toISOString())}&timeMax=${encodeURIComponent(future.toISOString())}&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Calendar API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const items = data.items || [];

  return items.map((item: any): CalendarEvent => {
    const isAllDay = !item.start?.dateTime && !!item.start?.date;
    const dateStr = parseGCalDate(item.start || {});
    const startTime = isAllDay ? undefined : parseGCalTime(item.start?.dateTime);
    const endTime = isAllDay ? undefined : parseGCalTime(item.end?.dateTime);
    const cat = detectCategory(item.summary || '', item.description);

    return {
      id: `gcal-${item.id}`,
      title: item.summary || '(Untitled Event)',
      date: dateStr,
      startTime: startTime || (isAllDay ? undefined : '09:00 AM'),
      endTime: endTime || (isAllDay ? undefined : '10:00 AM'),
      allDay: isAllDay,
      category: cat,
      color: categoryColor(cat),
      location: item.location,
      description: item.description || 'Imported from Google Calendar',
      priority: 'medium',
    };
  });
}
