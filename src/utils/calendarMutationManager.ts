import { CalendarEvent } from '../types';

/**
 * Calendar Mutation & Concurrency Manager
 * 
 * Guarantees:
 * 1. Strict FIFO serialization of mutations on the exact same event ID (CREATE -> EDIT -> DELETE).
 * 2. Independent, non-blocking execution across different event IDs.
 * 3. Tracking of locally deleted events to prevent late responses, full-refetches,
 *    or realtime events from resurrecting deleted events.
 * 4. Protection of optimistic local edits from being overwritten by stale server snapshots.
 */

// Tracks event IDs deleted in the current session so late responses, 
// full-refetches, or realtime events cannot resurrect them.
const deletedEventIds = new Set<string>();

// Per-event promise chains to serialize mutations on the exact same event.
const eventMutationQueues = new Map<string, Promise<any>>();

// Set of event IDs that currently have an in-flight mutation.
const pendingMutationEventIds = new Set<string>();

export function markCalendarEventDeleted(eventId: string): void {
  deletedEventIds.add(eventId);
}

export function isCalendarEventDeleted(eventId: string): boolean {
  return deletedEventIds.has(eventId);
}

export function clearDeletedCalendarEventTracking(eventId?: string): void {
  if (eventId) {
    deletedEventIds.delete(eventId);
  } else {
    deletedEventIds.clear();
  }
}

export function hasPendingCalendarMutation(eventId: string): boolean {
  return pendingMutationEventIds.has(eventId);
}

/**
 * Enqueues a mutation function for a specific event ID.
 * Mutations for the same event ID are strictly serialized in FIFO order.
 * Mutations for different event IDs run concurrently.
 */
export async function enqueueCalendarMutation<T>(
  eventId: string,
  mutationFn: () => Promise<T>
): Promise<T> {
  pendingMutationEventIds.add(eventId);

  const prevPromise = eventMutationQueues.get(eventId) || Promise.resolve();

  const nextPromise = prevPromise
    .catch(() => {}) // Don't let previous failures break subsequent operations
    .then(async () => {
      return await mutationFn();
    })
    .finally(() => {
      if (eventMutationQueues.get(eventId) === nextPromise) {
        eventMutationQueues.delete(eventId);
        pendingMutationEventIds.delete(eventId);
      }
    });

  eventMutationQueues.set(eventId, nextPromise);
  return nextPromise;
}

/**
 * Reconciles local optimistic state with incoming backend/realtime events.
 * 1. Never resurrects deleted events.
 * 2. Never overwrites local optimistic edits with stale backend state while mutation is pending.
 * 3. Incorporates new and updated events from other sessions/tabs safely.
 */
export function reconcileCalendarEvents(
  currentEvents: CalendarEvent[],
  incomingEvents: CalendarEvent[]
): CalendarEvent[] {
  if (!incomingEvents) return currentEvents;

  // 1. Filter out deleted events from incoming
  const validIncoming = incomingEvents.filter((inc) => !deletedEventIds.has(inc.id));
  const incomingMap = new Map(validIncoming.map((e) => [e.id, e]));

  // 2. Start with current events that aren't deleted
  const reconciled: CalendarEvent[] = [];
  const processedIds = new Set<string>();

  for (const current of currentEvents) {
    if (deletedEventIds.has(current.id)) {
      continue;
    }
    processedIds.add(current.id);

    // If local has in-flight mutation, keep local version
    if (pendingMutationEventIds.has(current.id)) {
      reconciled.push(current);
      continue;
    }

    // If incoming has an update for this event, take incoming
    if (incomingMap.has(current.id)) {
      reconciled.push(incomingMap.get(current.id)!);
    } else {
      // Not in incoming yet (e.g. newly added locally), keep local
      reconciled.push(current);
    }
  }

  // 3. Add any incoming events that weren't in current
  for (const inc of validIncoming) {
    if (!processedIds.has(inc.id)) {
      reconciled.push(inc);
    }
  }

  return reconciled;
}
