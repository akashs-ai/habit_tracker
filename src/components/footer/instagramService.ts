/**
 * Client-side Instagram Avatar Synchronization Service for Team Expo
 * 
 * Interacts with the secure backend endpoint /api/team/instagram-profile.
 * NEVER makes direct calls to SerpApi and NEVER touches SERPAPI_API_KEY.
 * Implements client-side in-memory + sessionStorage caching and request deduplication.
 */

import { TeamMember } from './teamData';

export interface InstagramAvatarData {
  username: string;
  avatarUrl: string;
  fullName?: string;
  fetchedAt: number;
}

// Extract Instagram username from an Instagram profile URL string or handle
export function extractInstagramUsername(urlOrUsername: string): string {
  if (!urlOrUsername || typeof urlOrUsername !== 'string') return '';
  try {
    const trimmed = urlOrUsername.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const segments = url.pathname.split('/').filter(Boolean);
      return segments[0] || '';
    }
    const clean = trimmed.replace(/^@/, '').replace(/\/+$/, '');
    return clean.split('/')[0] || '';
  } catch {
    return '';
  }
}

// Client-side in-memory cache: username -> { avatarUrl, fetchedAt }
const clientAvatarCache = new Map<string, InstagramAvatarData>();
const CLIENT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// In-flight request deduplication map
const pendingRequests = new Map<string, Promise<string | null>>();

/**
 * Fetches the Instagram avatar for a given profile URL or username via the backend proxy.
 * Safely falls back to null if the backend or SerpApi cannot provide an image.
 */
export async function fetchInstagramAvatar(urlOrUsername: string): Promise<string | null> {
  const username = extractInstagramUsername(urlOrUsername).toLowerCase();
  if (!username) {
    return null;
  }

  // 1. Check in-memory cache
  const memoryHit = clientAvatarCache.get(username);
  if (memoryHit && Date.now() - memoryHit.fetchedAt < CLIENT_CACHE_TTL_MS) {
    return memoryHit.avatarUrl;
  }

  // 2. Check sessionStorage
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const storageKey = `team_expo_ig_${username}`;
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as InstagramAvatarData;
        if (parsed && parsed.avatarUrl && Date.now() - parsed.fetchedAt < CLIENT_CACHE_TTL_MS) {
          clientAvatarCache.set(username, parsed);
          return parsed.avatarUrl;
        }
      }
    } catch {
      // Ignore sessionStorage read errors
    }
  }

  // 3. Request deduplication: if request for this username is already pending, join it
  const existingPending = pendingRequests.get(username);
  if (existingPending) {
    return existingPending;
  }

  // 4. Dispatch request to backend
  const requestPromise = (async (): Promise<string | null> => {
    try {
      const response = await fetch(`/api/team/instagram-profile?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data && data.success && data.avatarUrl) {
        const avatarData: InstagramAvatarData = {
          username,
          avatarUrl: data.avatarUrl,
          fullName: data.fullName,
          fetchedAt: Date.now(),
        };

        clientAvatarCache.set(username, avatarData);

        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            sessionStorage.setItem(`team_expo_ig_${username}`, JSON.stringify(avatarData));
          } catch {
            // Ignore quota errors
          }
        }

        return data.avatarUrl;
      }

      return null;
    } catch {
      // Network failure or backend unavailable — return null to trigger seamless fallback
      return null;
    } finally {
      pendingRequests.delete(username);
    }
  })();

  pendingRequests.set(username, requestPromise);
  return requestPromise;
}

/**
 * Helper to pre-fetch Instagram avatars for all Team Expo members in parallel (non-blocking).
 */
export async function syncTeamInstagramAvatars(
  members: TeamMember[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  await Promise.all(
    members.map(async (member) => {
      if (!member.instagram) return;
      try {
        const avatar = await fetchInstagramAvatar(member.instagram);
        if (avatar) {
          results[member.id] = avatar;
        }
      } catch {
        // Continue silently
      }
    })
  );

  return results;
}
