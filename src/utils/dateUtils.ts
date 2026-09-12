import { CalendarEvent } from '../types';

/**
 * Temporal status of a date relative to reference date (today by default).
 */
export type TemporalStatus = 'today' | 'past' | 'future';

export interface CalendarMonthDay {
  day: number;
  isCurrentMonth: boolean;
  date: string; // YYYY-MM-DD
  isToday: boolean;
  temporalStatus: TemporalStatus;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
}

export interface CalendarWeekDay {
  name: string; // 'Sun', 'Mon', etc.
  fullName: string; // 'Sunday', 'Monday', etc.
  day: number; // day of month e.g. 12
  date: string; // YYYY-MM-DD
  isToday: boolean;
  temporalStatus: TemporalStatus;
}

export interface CurrentTimeInfo {
  now: Date;
  hour24: number; // 0 - 23
  minute: number; // 0 - 59
  formattedTime12: string; // e.g. "1:50 PM"
  formattedTime24: string; // e.g. "13:50"
  period: 'AM' | 'PM';
  greeting: 'Good morning' | 'Good afternoon' | 'Good evening';
  minuteProgressPercent: number; // progress within the current hour (0 - 100)
}

/**
 * Returns user's local IANA timezone name.
 */
export function getLocalTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Returns formatted timezone label e.g. "GMT-7" or "UTC+1".
 */
export function getLocalTimezoneLabel(): string {
  try {
    const offsetMinutes = -new Date().getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(offsetMinutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    return mins > 0 ? `GMT${sign}${hours}:${String(mins).padStart(2, '0')}` : `GMT${sign}${hours}`;
  } catch {
    return 'Local Time';
  }
}

/**
 * Returns the current date in the local timezone formatted strictly as YYYY-MM-DD.
 */
export function getLiveTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Standardized function returning today's date in local timezone formatted strictly as YYYY-MM-DD.
 */
export const getTodayISO = getLiveTodayISO;

/**
 * Standardized function checking if a given date (ISO string or Date object) is today in local time.
 */
export function isDateToday(date: string | Date): boolean {
  if (!date) return false;
  const isoStr = typeof date === 'string' 
    ? (date.length === 10 ? date : formatDateISO(new Date(date))) 
    : formatDateISO(date);
  return isoStr === getTodayISO();
}

/**
 * Standardized function returning the Date of the start of the week containing the given date.
 * startDay: 0 = Sunday (default), 1 = Monday.
 */
export function getStartOfWeek(date: string | Date, startDay: 0 | 1 = 0): Date {
  const d = typeof date === 'string' ? parseDateISO(date) : new Date(date.getTime());
  const dayOfWeek = d.getDay(); // 0 is Sunday
  const diff = startDay === 0 ? dayOfWeek : (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
}

/**
 * Formats a date for UI display consistently with user's local timezone.
 */
export function formatDateForUI(
  date: string | Date,
  formatType: 'short' | 'full' | 'month-year' | 'relative' | 'range' = 'full'
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseDateISO(date) : date;
  const iso = typeof date === 'string' && date.length === 10 ? date : formatDateISO(d);

  switch (formatType) {
    case 'short':
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    case 'month-year':
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    case 'relative': {
      const rel = getRelativeDayLabel(iso);
      if (rel) return rel;
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    case 'range':
      return formatWeekRangeLabel(iso);
    case 'full':
    default:
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
}

/**
 * Returns a new local Date initialized to start of today (00:00:00.000).
 */
export function getTodayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Formats any Date object into local YYYY-MM-DD string.
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses a YYYY-MM-DD string into a local Date object.
 * Avoids UTC-midnight timezone shifting bugs common with new Date("YYYY-MM-DD").
 */
export function parseDateISO(str: string): Date {
  if (!str) return getTodayDate();
  const parts = str.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return getTodayDate();
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/**
 * Safely normalizes input (Date, ISO string, timestamp) into a local Date.
 */
export function toLocalDate(input: string | Date | number): Date {
  if (input instanceof Date) {
    return new Date(input.getFullYear(), input.getMonth(), input.getDate(), input.getHours(), input.getMinutes(), input.getSeconds());
  }
  if (typeof input === 'number') {
    return new Date(input);
  }
  if (typeof input === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
      return parseDateISO(input.trim());
    }
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return getTodayDate();
}

/**
 * Returns whether a given date is 'today', 'past', or 'future' relative to referenceDate (default today).
 */
export function getDateTemporalStatus(
  dateInput: string | Date,
  referenceInput?: string | Date
): TemporalStatus {
  const targetISO = typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
    ? dateInput
    : formatDateISO(toLocalDate(dateInput));
  
  const refISO = referenceInput
    ? (typeof referenceInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(referenceInput)
        ? referenceInput
        : formatDateISO(toLocalDate(referenceInput)))
    : getLiveTodayISO();

  if (targetISO === refISO) return 'today';
  return targetISO < refISO ? 'past' : 'future';
}

/**
 * Returns true if the date is today.
 */
export function isToday(dateInput: string | Date, referenceInput?: string | Date): boolean {
  return getDateTemporalStatus(dateInput, referenceInput) === 'today';
}

/**
 * Returns true if the date is strictly in the past.
 */
export function isPast(dateInput: string | Date, referenceInput?: string | Date): boolean {
  return getDateTemporalStatus(dateInput, referenceInput) === 'past';
}

/**
 * Returns true if the date is strictly in the future.
 */
export function isFuture(dateInput: string | Date, referenceInput?: string | Date): boolean {
  return getDateTemporalStatus(dateInput, referenceInput) === 'future';
}

/**
 * Calculates day difference (target - from).
 * Positive if target is in the future, negative if past, 0 if same day.
 */
export function getDaysDifference(targetDate: string | Date, fromDate?: string | Date): number {
  const t = parseDateISO(typeof targetDate === 'string' ? targetDate : formatDateISO(targetDate));
  const f = parseDateISO(
    fromDate 
      ? (typeof fromDate === 'string' ? fromDate : formatDateISO(fromDate)) 
      : getLiveTodayISO()
  );
  const diffTime = t.getTime() - f.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Human-friendly relative day badge ("Today", "Tomorrow", "Yesterday", "In 3 days", "3 days ago").
 */
export function getRelativeDayLabel(dateStr: string, referenceDateStr?: string): string {
  const diff = getDaysDifference(dateStr, referenceDateStr);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)} days ago`;
  if (diff > 7 && diff <= 14) return 'Next week';
  if (diff < -7 && diff >= -14) return 'Last week';
  return formatReadableDate(dateStr);
}

/**
 * Adds or subtracts days from a YYYY-MM-DD string, returning a new YYYY-MM-DD string.
 */
export function addDaysISO(dateStr: string, days: number): string {
  const d = parseDateISO(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateISO(d);
}

/**
 * Adds or subtracts days from a Date object, returning a new Date object.
 */
export function shiftDateDays(d: Date, days: number): Date {
  const result = new Date(d.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Shifts month by offset (+1 for next month, -1 for prev month) preserving day clamped to month length.
 */
export function shiftDateMonths(d: Date, monthOffset: number, preserveDay: boolean = true): Date {
  const year = d.getFullYear();
  const month = d.getMonth() + monthOffset;
  const targetDay = preserveDay ? d.getDate() : 1;
  const daysInTargetMonth = new Date(year, month + 1, 0).getDate();
  const clampedDay = Math.min(targetDay, daysInTargetMonth);
  return new Date(year, month, clampedDay);
}

/**
 * Computes calendar grid days for a given month and year (up to 42 cells for complete 6-row grid).
 */
export function getMonthGridDays(
  year: number,
  monthIndex: number,
  todayISO?: string
): CalendarMonthDay[] {
  const effectiveToday = todayISO || getLiveTodayISO();
  const firstDay = new Date(year, monthIndex, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthDaysCount = new Date(year, monthIndex, 0).getDate();

  const days: CalendarMonthDay[] = [];

  // Preceding month trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = prevMonthDaysCount - i;
    const dateObj = new Date(year, monthIndex - 1, dayNumber);
    const dateStr = formatDateISO(dateObj);
    days.push({
      day: dayNumber,
      isCurrentMonth: false,
      date: dateStr,
      isToday: dateStr === effectiveToday,
      temporalStatus: getDateTemporalStatus(dateStr, effectiveToday),
      dayOfWeek: dateObj.getDay(),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, monthIndex, day);
    const dateStr = formatDateISO(dateObj);
    days.push({
      day,
      isCurrentMonth: true,
      date: dateStr,
      isToday: dateStr === effectiveToday,
      temporalStatus: getDateTemporalStatus(dateStr, effectiveToday),
      dayOfWeek: dateObj.getDay(),
    });
  }

  // Next month leading days to complete 42 cells (6 rows x 7 cols)
  const remaining = 42 - days.length;
  for (let day = 1; day <= remaining; day++) {
    const dateObj = new Date(year, monthIndex + 1, day);
    const dateStr = formatDateISO(dateObj);
    days.push({
      day,
      isCurrentMonth: false,
      date: dateStr,
      isToday: dateStr === effectiveToday,
      temporalStatus: getDateTemporalStatus(dateStr, effectiveToday),
      dayOfWeek: dateObj.getDay(),
    });
  }

  return days;
}

/**
 * Computes the 7 days of the week containing centerDateStr (Sunday to Saturday).
 */
export function getWeekDaysForDate(centerDateStr: string, todayISO?: string): CalendarWeekDay[] {
  const effectiveToday = todayISO || getLiveTodayISO();
  const center = parseDateISO(centerDateStr);
  const dayOfWeek = center.getDay(); // 0 is Sunday

  const sunday = new Date(center.getFullYear(), center.getMonth(), center.getDate() - dayOfWeek);
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekDays: CalendarWeekDay[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i);
    const dateStr = formatDateISO(d);
    weekDays.push({
      name: names[i],
      fullName: fullNames[i],
      day: d.getDate(),
      date: dateStr,
      isToday: dateStr === effectiveToday,
      temporalStatus: getDateTemporalStatus(dateStr, effectiveToday),
    });
  }

  return weekDays;
}

/**
 * Returns formatted Month Year (e.g. "September 2026").
 */
export function getMonthYearLabel(year: number, monthIndex: number): string {
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Returns short readable date (e.g. "Sat, 12 Sep 2026").
 */
export function formatReadableDate(dateStr: string): string {
  const d = parseDateISO(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns full day header (e.g. "Saturday, September 12, 2026").
 */
export function formatFullDayHeader(dateStr: string): string {
  const d = parseDateISO(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns formatted week range string (e.g. "Sep 6 – Sep 12, 2026").
 */
export function formatWeekRangeLabel(centerDateStr: string): string {
  const week = getWeekDaysForDate(centerDateStr);
  const first = parseDateISO(week[0].date);
  const last = parseDateISO(week[6].date);

  if (first.getMonth() === last.getMonth()) {
    return `${first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${last.getDate()}, ${last.getFullYear()}`;
  }
  return `${first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

/**
 * Formats an upcoming event item's date line e.g. "Today • 10:00 AM" or "Tomorrow • 2:00 PM" or "Tue, 15 Sep".
 */
export function formatUpcomingDateLabel(dateStr: string, startTime?: string): string {
  const relative = getRelativeDayLabel(dateStr);
  const d = parseDateISO(dateStr);
  const dateFormatted = (relative === 'Today' || relative === 'Tomorrow' || relative === 'Yesterday')
    ? relative
    : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return startTime ? `${dateFormatted} • ${startTime}` : dateFormatted;
}

/**
 * Returns comprehensive current local time information (hour, minute, greeting, etc.).
 */
export function getCurrentTimeInfo(): CurrentTimeInfo {
  const now = new Date();
  const hour24 = now.getHours();
  const minute = now.getMinutes();

  const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const formattedTime12 = `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
  const formattedTime24 = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const greeting: CurrentTimeInfo['greeting'] =
    hour24 < 12 ? 'Good morning' : hour24 < 17 ? 'Good afternoon' : 'Good evening';

  const minuteProgressPercent = Math.min(100, Math.max(0, (minute / 60) * 100));

  return {
    now,
    hour24,
    minute,
    formattedTime12,
    formattedTime24,
    period,
    greeting,
    minuteProgressPercent,
  };
}

/**
 * Parses any time string like "7:00 AM", "10:30 PM", "1 PM", "12:00 AM" into 24-hour hour & minute.
 */
export function parseTimeSlotTo24H(timeStr: string): { hour: number; minute: number } {
  if (!timeStr) return { hour: 9, minute: 0 };
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');

  const match = clean.match(/(\d+)(?::(\d+))?/);
  if (!match) return { hour: 9, minute: 0 };

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;

  if (isPM && hour !== 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  return { hour, minute };
}

/**
 * Returns 24-hour number (0-23) for an hour label (e.g. "7:00 AM" -> 7, "2 PM" -> 14).
 */
export function parseHourTo24(hourLabel: string): number {
  return parseTimeSlotTo24H(hourLabel).hour;
}

/**
 * Robust check if an event matches an hour slot label in the week or day grid.
 * Handles slot labels like "7:00 AM", "7 AM", "1 PM", "13:00".
 */
export function isTimeSlotMatching(eventStartTime: string | undefined, slotLabel: string): boolean {
  if (!eventStartTime) {
    // Default slot is 9 AM
    return slotLabel.includes('9') && slotLabel.toUpperCase().includes('AM');
  }

  const evt = parseTimeSlotTo24H(eventStartTime);
  const slot = parseTimeSlotTo24H(slotLabel);

  return evt.hour === slot.hour;
}

/**
 * Filters and sorts calendar events based on temporal status (today, upcoming/future, past).
 */
export function filterEventsByTemporal(
  events: CalendarEvent[],
  mode: 'today' | 'upcoming' | 'past',
  referenceDateStr?: string
): CalendarEvent[] {
  const ref = referenceDateStr || getLiveTodayISO();

  if (mode === 'today') {
    return events.filter((e) => e.date === ref);
  }

  if (mode === 'upcoming') {
    return events
      .filter((e) => e.date >= ref)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  return events
    .filter((e) => e.date < ref)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Generates a rich set of calendar events dynamically anchored around the user's local date.
 * Guarantees that today, tomorrow, yesterday, and this week have realistic, context-aware events.
 */
export function createLiveAnchoredEvents(todayStr?: string): CalendarEvent[] {
  const baseToday = todayStr || getLiveTodayISO();

  const offset = (days: number): string => addDaysISO(baseToday, days);

  return [
    // Today's scheduled events
    {
      id: 'evt-live-1',
      title: 'Gym Workout & Mobility',
      date: baseToday,
      startTime: '7:00 AM',
      endTime: '8:00 AM',
      category: 'workout',
      color: '#22C55E',
      location: 'Iron Forge Fitness',
      description: 'Compound lifts, bench press, deadlift, and core mobility cool-down.',
      priority: 'high',
      subtasks: [
        { id: 'st-g1', title: '5 min dynamic warm up', completed: true },
        { id: 'st-g2', title: '3x5 Bench press', completed: true },
        { id: 'st-g3', title: 'Hydration & stretching', completed: false },
      ],
    },
    {
      id: 'evt-live-2',
      title: 'UI/UX Review & Frontend Architecture',
      date: baseToday,
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      category: 'project',
      color: '#7C5CFF',
      location: 'Studio Dashboard / Figma',
      description: 'Review unified date calculations, verify live timezone normalization, and test interactive calendar components.',
      priority: 'high',
      subtasks: [
        { id: 'st-u1', title: 'Verify date range calculations', completed: true },
        { id: 'st-u2', title: 'Review mobile calendar interactions', completed: false },
      ],
      attachments: [{ name: 'LifeRPG_Design_System.fig', size: '8.4 MB' }],
    },
    {
      id: 'evt-live-3',
      title: 'Healthy Lunch & Team Catchup',
      date: baseToday,
      startTime: '1:00 PM',
      endTime: '2:00 PM',
      category: 'social',
      color: '#F59E0B',
      location: 'Green Garden Bistro',
      description: 'High protein nutrition, relax, catch up on weekly wins.',
    },
    {
      id: 'evt-live-4',
      title: 'System Architecture & Backend Sync',
      date: baseToday,
      startTime: '3:30 PM',
      endTime: '5:00 PM',
      category: 'study',
      color: '#3B82F6',
      location: 'Dev Workstation',
      description: 'Review atomic persistence, database transactional handlers, and client-server sync performance.',
    },
    {
      id: 'evt-live-5',
      title: 'Free Fire / Guild Tournament',
      date: baseToday,
      startTime: '10:00 PM',
      endTime: '11:30 PM',
      category: 'entertainment',
      color: '#EC4899',
      location: 'Discord Voice #room-1',
      description: 'Custom tournament matches with squad to unwind and earn entertainment XP.',
    },

    // Yesterday
    {
      id: 'evt-live-6',
      title: 'DSA Practice & LeetCode Grind',
      date: offset(-1),
      startTime: '7:00 PM',
      endTime: '8:30 PM',
      category: 'study',
      color: '#7C5CFF',
      description: 'Graph algorithms, Dijkstra and BFS traversal optimizations.',
    },
    {
      id: 'evt-live-7',
      title: 'Sprint Planning & Backlog Grooming',
      date: offset(-1),
      startTime: '2:00 PM',
      endTime: '3:30 PM',
      category: 'project',
      color: '#3B82F6',
      description: 'Prioritized weekly milestones, reviewed analytics tracking goals.',
    },

    // Tomorrow
    {
      id: 'evt-live-8',
      title: 'Morning Cardio & Outdoor Trail Run',
      date: offset(1),
      startTime: '8:00 AM',
      endTime: '9:00 AM',
      category: 'workout',
      color: '#22C55E',
      location: 'Pine Hill Trail',
      description: '5km steady pace run in fresh air.',
    },
    {
      id: 'evt-live-9',
      title: 'Read Book: Atomic Habits',
      date: offset(1),
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      category: 'personal',
      color: '#F59E0B',
      description: 'Chapter 6 & 7: The Role of Family and Friends in Shaping Habits.',
    },
    {
      id: 'evt-live-10',
      title: 'Weekly Life Review & Strategy Plan',
      date: offset(1),
      startTime: '5:00 PM',
      endTime: '6:30 PM',
      category: 'personal',
      color: '#7C5CFF',
      description: 'Review KPI progress, set goals for next week, audit habit consistency.',
    },

    // Surrounding days in current month
    {
      id: 'evt-live-11',
      title: 'Strength Training: Push Day',
      date: offset(-3),
      startTime: '7:00 AM',
      endTime: '8:15 AM',
      category: 'workout',
      color: '#22C55E',
      description: 'Chest, shoulders, triceps hypertrophy session.',
    },
    {
      id: 'evt-live-12',
      title: 'Deep Work: Microservices Architecture',
      date: offset(-4),
      startTime: '10:00 AM',
      endTime: '1:00 PM',
      category: 'study',
      color: '#3B82F6',
      description: 'Event-driven message broker setup and Kafka concepts.',
    },
    {
      id: 'evt-live-13',
      title: 'Movie Night with Friends',
      date: offset(-2),
      startTime: '8:00 PM',
      endTime: '10:30 PM',
      category: 'entertainment',
      color: '#06B6D4',
      description: 'Sci-Fi blockbuster cinema screening.',
    },
    {
      id: 'evt-live-14',
      title: 'Leg Day & Heavy Squats',
      date: offset(3),
      startTime: '7:00 AM',
      endTime: '8:30 AM',
      category: 'workout',
      color: '#22C55E',
      description: 'Squats, Romanian deadlifts, walking lunges, calves.',
    },
    {
      id: 'evt-live-15',
      title: 'Cloud Architecture Certification Study',
      date: offset(4),
      startTime: '6:30 PM',
      endTime: '8:30 PM',
      category: 'study',
      color: '#7C5CFF',
      description: 'Review IAM roles, Cloud Run containers, and VPC networks.',
    },
    {
      id: 'evt-live-16',
      title: 'Quarterly Goal Alignment & Check-In',
      date: offset(6),
      startTime: '4:00 PM',
      endTime: '5:30 PM',
      category: 'personal',
      color: '#F59E0B',
      description: 'Re-evaluate long term milestones and adjust active habit goals.',
    },
    {
      id: 'evt-live-17',
      title: 'Full Body Mobility & Yoga Flow',
      date: offset(8),
      startTime: '8:30 AM',
      endTime: '9:30 AM',
      category: 'health',
      color: '#22C55E',
      description: 'Hip openers, thoracic spine mobility, and breathwork.',
    },
    {
      id: 'evt-live-18',
      title: 'Product Design Sprint Demo',
      date: offset(10),
      startTime: '3:00 PM',
      endTime: '4:30 PM',
      category: 'project',
      color: '#3B82F6',
      description: 'Presentation of the new sprint deliverables and user feedback.',
    },
  ];
}
