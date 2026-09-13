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
import { CalendarEvent, EventCategory, CalendarPermissionLevel } from '../types';

export const CALENDAR_READONLY_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
export const CALENDAR_EVENTS_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
export const CALENDAR_FULL_SCOPE = 'https://www.googleapis.com/auth/calendar';

export const CALENDAR_READ_SCOPES = [
  CALENDAR_READONLY_SCOPE,
];

export const CALENDAR_READ_EDIT_SCOPES = [
  CALENDAR_EVENTS_SCOPE,
  CALENDAR_READONLY_SCOPE,
];

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const createGoogleProvider = (
  permission: CalendarPermissionLevel = 'read_edit'
): GoogleAuthProvider => {
  const provider = new GoogleAuthProvider();
  if (permission === 'read_edit') {
    // Write-enabled scopes for creating, updating, and deleting events
    CALENDAR_READ_EDIT_SCOPES.forEach((scope) => provider.addScope(scope));
  } else if (permission === 'read_only') {
    // Read-only scope
    CALENDAR_READ_SCOPES.forEach((scope) => provider.addScope(scope));
  }
  provider.setCustomParameters({
    prompt: 'select_account',
  });
  return provider;
};

// In-memory token cache (never persisted into localStorage/sessionStorage for security)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;
let cachedPermission: CalendarPermissionLevel = 'read_edit';

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      cachedUser = user;
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        cachedUser = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentGoogleUser = (): User | null => {
  return cachedUser || auth.currentUser;
};

export const getCurrentPermissionLevel = (): CalendarPermissionLevel => {
  return cachedPermission;
};

export const googleSignIn = async (
  permission: CalendarPermissionLevel = 'read_edit'
): Promise<{ user: User; accessToken: string; permission: CalendarPermissionLevel } | null> => {
  try {
    isSigningIn = true;
    cachedPermission = permission;
    const provider = createGoogleProvider(permission);
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('No access token returned from Google sign-in. Please ensure third-party cookies/popups are allowed.');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken, permission };
  } catch (error: any) {
    const code = error?.code || '';
    const message = error?.message || '';

    // Handle user cancellations or refusal gracefully without noisy error toasts
    if (
      code === 'auth/popup-closed-by-user' || 
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/user-cancelled' ||
      message.includes('user-cancelled') ||
      message.includes('closed by user') ||
      message.includes('user closed the popup') ||
      message.includes('cancelled-popup-request')
    ) {
      return null;
    }
    
    console.warn('Google Calendar OAuth sign-in issue:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
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

function formatTimeToIso(dateStr: string, timeStr?: string): string {
  if (!timeStr) return `${dateStr}T09:00:00`;
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = match[3]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      const hStr = hours < 10 ? '0' + hours : hours.toString();
      return `${dateStr}T${hStr}:${minutes}:00`;
    }
  } catch {}
  return `${dateStr}T09:00:00`;
}

/**
 * Create an event in Google Calendar (Write Scope Required)
 */
export async function createGoogleCalendarEvent(
  token: string,
  event: {
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
    description?: string;
    location?: string;
    category?: EventCategory;
  }
): Promise<CalendarEvent> {
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  const startIso = formatTimeToIso(event.date, event.startTime);
  const endIso = formatTimeToIso(event.date, event.endTime || (event.startTime ? undefined : '10:00 AM'));
  
  const body: any = {
    summary: event.title,
    description: event.description || 'Scheduled via LifeRPG AI Coach',
    location: event.location,
  };

  if (event.allDay) {
    body.start = { date: event.date };
    body.end = { date: event.date };
  } else {
    body.start = { dateTime: new Date(startIso).toISOString() };
    body.end = { dateTime: new Date(endIso).toISOString() };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Calendar create error (${res.status}): ${errText}`);
  }

  const item = await res.json();
  const cat = event.category || detectCategory(item.summary || '', item.description);
  return {
    id: `gcal-${item.id}`,
    title: item.summary || event.title,
    date: event.date,
    startTime: event.startTime || '09:00 AM',
    endTime: event.endTime || '10:00 AM',
    allDay: !!event.allDay,
    category: cat,
    color: categoryColor(cat),
    description: item.description,
    location: item.location,
    priority: 'medium',
  };
}

/**
 * Update/reschedule an event in Google Calendar (Write Scope Required)
 */
export async function updateGoogleCalendarEvent(
  token: string,
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<CalendarEvent> {
  const cleanId = eventId.replace(/^gcal-/, '');
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${cleanId}`;

  const body: any = {};
  if (updates.title) body.summary = updates.title;
  if (updates.description) body.description = updates.description;
  if (updates.location) body.location = updates.location;

  if (updates.date) {
    if (updates.allDay) {
      body.start = { date: updates.date };
      body.end = { date: updates.date };
    } else {
      const startIso = formatTimeToIso(updates.date, updates.startTime);
      const endIso = formatTimeToIso(updates.date, updates.endTime || '10:00 AM');
      body.start = { dateTime: new Date(startIso).toISOString() };
      body.end = { dateTime: new Date(endIso).toISOString() };
    }
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Calendar update error (${res.status}): ${errText}`);
  }

  const item = await res.json();
  const cat = updates.category || detectCategory(item.summary || '', item.description);
  return {
    id: `gcal-${item.id}`,
    title: item.summary || updates.title || 'Event',
    date: updates.date || parseGCalDate(item.start || {}),
    startTime: updates.startTime,
    endTime: updates.endTime,
    allDay: updates.allDay,
    category: cat,
    color: categoryColor(cat),
    description: item.description,
    location: item.location,
    priority: updates.priority || 'medium',
  };
}

/**
 * Delete an event from Google Calendar (Write Scope Required)
 */
export async function deleteGoogleCalendarEvent(
  token: string,
  eventId: string
): Promise<boolean> {
  const cleanId = eventId.replace(/^gcal-/, '');
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${cleanId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok && res.status !== 404) {
    const errText = await res.text();
    throw new Error(`Google Calendar delete error (${res.status}): ${errText}`);
  }

  return true;
}
