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
import { safeResponseJson } from './api';
import { generateUUID, isUUID } from '../utils/uuid';

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

export interface GoogleCalendarUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export class UnauthorizedDomainError extends Error {
  domain: string;
  code: string;

  constructor(domain: string, message?: string) {
    super(
      message ||
        `Domain "${domain}" is not authorized for Firebase OAuth operations. Add it in Firebase Console -> Authentication -> Settings -> Authorized domains, or use Demo Calendar mode.`
    );
    this.name = 'UnauthorizedDomainError';
    this.code = 'auth/unauthorized-domain';
    this.domain = domain;
  }
}

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
let cachedUser: GoogleCalendarUser | User | null = null;
let cachedPermission: CalendarPermissionLevel = 'read_edit';

type AuthListener = (user: GoogleCalendarUser | User | null, token: string | null) => void;
const authListeners: AuthListener[] = [];

export const notifyAuthListeners = (user: GoogleCalendarUser | User | null, token: string | null) => {
  authListeners.forEach((fn) => {
    try {
      fn(user, token);
    } catch (e) {
      console.warn('Auth listener error:', e);
    }
  });
};

export const initAuth = (
  onAuthSuccess?: (user: GoogleCalendarUser | User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const listener: AuthListener = (u, t) => {
    if (u && t) {
      if (onAuthSuccess) onAuthSuccess(u, t);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  };
  authListeners.push(listener);

  // Also hook into Firebase onAuthStateChanged if Firebase user is logged in
  const unsubFirebase = onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      cachedUser = user;
      notifyAuthListeners(user, cachedAccessToken);
    } else if (!cachedUser && !cachedAccessToken) {
      if (!isSigningIn) {
        notifyAuthListeners(null, null);
      }
    }
  });

  return () => {
    unsubFirebase();
    const idx = authListeners.indexOf(listener);
    if (idx !== -1) authListeners.splice(idx, 1);
  };
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentGoogleUser = (): GoogleCalendarUser | User | null => {
  return cachedUser || auth.currentUser;
};

export const getCurrentPermissionLevel = (): CalendarPermissionLevel => {
  return cachedPermission;
};

/**
 * Dynamically ensures the Google Identity Services client script is loaded
 */
export async function loadGsiClient(): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    return;
  }
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve();
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      if ((window as any).google?.accounts?.oauth2) {
        resolve();
      } else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(e));
      }
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

/**
 * Sign in directly via Google Identity Services Token Client.
 * Bypasses Firebase Auth authorized domain restrictions.
 */
export const signInWithGoogleIdentityServices = async (
  permission: CalendarPermissionLevel = 'read_edit'
): Promise<{ user: GoogleCalendarUser; accessToken: string; permission: CalendarPermissionLevel } | null> => {
  await loadGsiClient();

  const google = typeof window !== 'undefined' ? (window as any).google : null;
  if (!google?.accounts?.oauth2) {
    throw new Error('Google Identity Services library is not loaded');
  }

  const clientId = firebaseConfig.oAuthClientId;
  if (!clientId) {
    throw new Error('OAuth Client ID is not configured');
  }

  const scopes = [
    permission === 'read_edit' ? CALENDAR_EVENTS_SCOPE : CALENDAR_READONLY_SCOPE,
    CALENDAR_READONLY_SCOPE,
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' ');

  return new Promise((resolve, reject) => {
    let completed = false;
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scopes,
        callback: async (response: any) => {
          if (completed) return;
          completed = true;

          if (response?.error) {
            if (response.error === 'access_denied' || response.error === 'user_cancelled') {
              resolve(null);
              return;
            }
            reject(new Error(`Google OAuth error: ${response.error_description || response.error}`));
            return;
          }

          if (!response?.access_token) {
            reject(new Error('No access token returned from Google sign-in'));
            return;
          }

          const accessToken = response.access_token;
          cachedAccessToken = accessToken;
          cachedPermission = permission;

          let userInfo: GoogleCalendarUser = {
            uid: `gcal-${Date.now()}`,
            displayName: 'Google Account',
            email: 'user@google.com',
            photoURL: null,
          };

          try {
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (profileRes.ok) {
              const p = await profileRes.json();
              userInfo = {
                uid: p.sub || `gcal-${Date.now()}`,
                displayName: p.name || p.given_name || p.email?.split('@')[0] || 'Google User',
                email: p.email || null,
                photoURL: p.picture || null,
              };
            }
          } catch {
            // Profile details optional
          }

          cachedUser = userInfo;
          notifyAuthListeners(userInfo, accessToken);
          resolve({ user: userInfo, accessToken, permission });
        },
        error_callback: (err: any) => {
          if (completed) return;
          completed = true;
          reject(err);
        },
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      if (!completed) {
        completed = true;
        reject(err);
      }
    }
  });
};

/**
 * Connects demo Google Calendar for sandbox / preview testing when domain is restricted
 */
export const connectDemoCalendar = (): {
  user: GoogleCalendarUser;
  accessToken: string;
  permission: CalendarPermissionLevel;
} => {
  const demoUser: GoogleCalendarUser = {
    uid: 'demo-google-user',
    displayName: 'Alex (Demo Calendar)',
    email: 'alex.rivera@gmail.com',
    photoURL: null,
  };
  const token = 'demo-google-calendar-token';
  cachedAccessToken = token;
  cachedUser = demoUser;
  cachedPermission = 'read_edit';
  notifyAuthListeners(demoUser, token);
  return { user: demoUser, accessToken: token, permission: 'read_edit' };
};

export const googleSignIn = async (
  permission: CalendarPermissionLevel = 'read_edit'
): Promise<{ user: GoogleCalendarUser | User; accessToken: string; permission: CalendarPermissionLevel } | null> => {
  try {
    isSigningIn = true;
    cachedPermission = permission;

    // 1. Attempt Firebase Auth popup first (works on authorized domains & localhost)
    try {
      const provider = createGoogleProvider(permission);
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (!credential?.accessToken) {
        throw new Error('No access token returned from Google sign-in. Please ensure third-party cookies/popups are allowed.');
      }

      cachedAccessToken = credential.accessToken;
      cachedUser = result.user;
      notifyAuthListeners(result.user, cachedAccessToken);
      return { user: result.user, accessToken: cachedAccessToken, permission };
    } catch (firebaseErr: any) {
      const code = firebaseErr?.code || '';
      const message = firebaseErr?.message || '';

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

      // If unauthorized-domain, seamlessly try Google Identity Services
      if (code === 'auth/unauthorized-domain' || message.includes('auth/unauthorized-domain')) {
        console.warn('Firebase unauthorized-domain detected; falling back to Google Identity Services...');
        try {
          const gsiResult = await signInWithGoogleIdentityServices(permission);
          if (gsiResult) return gsiResult;
        } catch (gsiErr: any) {
          console.warn('Google Identity Services also failed:', gsiErr);
          const hostname = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
          throw new UnauthorizedDomainError(hostname);
        }
        return null;
      }

      // Other Firebase errors
      throw firebaseErr;
    }
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch {}
  cachedAccessToken = null;
  cachedUser = null;
  notifyAuthListeners(null, null);
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
  if (token.startsWith('demo-')) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tmY = tomorrow.getFullYear();
    const tmM = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tmD = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${tmY}-${tmM}-${tmD}`;

    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 2);
    const ndY = nextDay.getFullYear();
    const ndM = String(nextDay.getMonth() + 1).padStart(2, '0');
    const ndD = String(nextDay.getDate()).padStart(2, '0');
    const nextDayStr = `${ndY}-${ndM}-${ndD}`;

    return [
      {
        id: generateUUID(),
        googleEventId: 'gcal-demo-1',
        title: 'Team Sprint Planning',
        date: todayStr,
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        allDay: false,
        category: 'project',
        color: categoryColor('project'),
        location: 'Google Meet',
        description: 'Sprint planning and feature roadmap sync with the engineering team.',
        priority: 'high',
      },
      {
        id: generateUUID(),
        googleEventId: 'gcal-demo-2',
        title: 'Deep Work: Core Architecture',
        date: todayStr,
        startTime: '02:00 PM',
        endTime: '04:00 PM',
        allDay: false,
        category: 'study',
        color: categoryColor('study'),
        description: 'Focus block for core refactoring and tests.',
        priority: 'high',
      },
      {
        id: generateUUID(),
        googleEventId: 'gcal-demo-3',
        title: 'Gym & Cardio Session',
        date: tomorrowStr,
        startTime: '07:30 AM',
        endTime: '08:45 AM',
        allDay: false,
        category: 'workout',
        color: categoryColor('workout'),
        location: 'Fitness Center',
        description: 'Strength workout + 20 min HIIT.',
        priority: 'medium',
      },
      {
        id: generateUUID(),
        googleEventId: 'gcal-demo-4',
        title: 'Product Strategy Review',
        date: nextDayStr,
        startTime: '01:30 PM',
        endTime: '02:30 PM',
        allDay: false,
        category: 'project',
        color: categoryColor('project'),
        location: 'Board Room A',
        description: 'Monthly Q3 OKR and metric review.',
        priority: 'medium',
      },
    ];
  }

  // Fetch around current timeframe (e.g. 60 days in past to 120 days in future)
  const now = new Date();
  const past = new Date(now.getTime() - 60 * 24 * 60 * 1000);
  const future = new Date(now.getTime() + 120 * 24 * 60 * 1000);

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(past.toISOString())}&timeMax=${encodeURIComponent(future.toISOString())}&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const data = await safeResponseJson(res, 'Google Calendar API error');
  const items = data.items || [];

  return items.map((item: any): CalendarEvent => {
    const isAllDay = !item.start?.dateTime && !!item.start?.date;
    const dateStr = parseGCalDate(item.start || {});
    const startTime = isAllDay ? undefined : parseGCalTime(item.start?.dateTime);
    const endTime = isAllDay ? undefined : parseGCalTime(item.end?.dateTime);
    const cat = detectCategory(item.summary || '', item.description);

    return {
      id: generateUUID(),
      googleEventId: item.id,
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
  const cat = event.category || detectCategory(event.title || '', event.description);

  if (token.startsWith('demo-')) {
    return {
      id: generateUUID(),
      googleEventId: `gcal-demo-${Date.now()}`,
      title: event.title,
      date: event.date,
      startTime: event.startTime || '09:00 AM',
      endTime: event.endTime || '10:00 AM',
      allDay: !!event.allDay,
      category: cat,
      color: categoryColor(cat),
      description: event.description,
      location: event.location,
      priority: 'medium',
    };
  }

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

  const item = await safeResponseJson(res, 'Google Calendar create error');
  const resolvedCat = event.category || detectCategory(item.summary || '', item.description);
  return {
    id: generateUUID(),
    googleEventId: item.id,
    title: item.summary || event.title,
    date: event.date,
    startTime: event.startTime || '09:00 AM',
    endTime: event.endTime || '10:00 AM',
    allDay: !!event.allDay,
    category: resolvedCat,
    color: categoryColor(resolvedCat),
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
  const cat = updates.category || 'project';

  if (token.startsWith('demo-')) {
    return {
      id: eventId,
      title: updates.title || 'Event',
      date: updates.date || new Date().toISOString().substring(0, 10),
      startTime: updates.startTime,
      endTime: updates.endTime,
      allDay: updates.allDay,
      category: cat,
      color: categoryColor(cat),
      description: updates.description,
      location: updates.location,
      priority: updates.priority || 'medium',
    };
  }

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

  const item = await safeResponseJson(res, 'Google Calendar update error');
  const resolvedCat = updates.category || detectCategory(item.summary || '', item.description);
  return {
    id: isUUID(eventId) ? eventId : generateUUID(),
    googleEventId: item.id,
    title: item.summary || updates.title || 'Event',
    date: updates.date || parseGCalDate(item.start || {}),
    startTime: updates.startTime,
    endTime: updates.endTime,
    allDay: updates.allDay,
    category: resolvedCat,
    color: categoryColor(resolvedCat),
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
  if (token.startsWith('demo-')) {
    return true;
  }

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
    await safeResponseJson(res, 'Google Calendar delete error');
  }

  return true;
}
