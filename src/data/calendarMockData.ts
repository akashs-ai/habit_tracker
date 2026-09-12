import { CalendarEvent } from '../types';
import { createLiveAnchoredEvents } from '../utils/dateUtils';

/**
 * Initial calendar events anchored dynamically to the user's current local date.
 * Replaces hardcoded static dates with timezone-normalized local events.
 */
export const initialCalendarEvents: CalendarEvent[] = createLiveAnchoredEvents();
