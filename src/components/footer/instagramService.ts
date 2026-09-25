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

// Known verified Instagram profile avatars retrieved via SerpApi for Team Expo
export const VERIFIED_INSTAGRAM_AVATARS: Record<string, { avatarUrl: string; fullName?: string }> = {
  'shubhankar.d_5': {
    avatarUrl: 'https://serpapi.com/images/url/FzlAAXichVDLjpswAJR66ZeUG4ltMIZKVsVm8yCbR_MAIi4IGwIhwdDYmwCf2q9pxH5ADyONZkYjzfz99r1QqpE_x2PJa6EyoXRZckOHI56Ki5Aqye9JNeJ1NX6MFYYjGxGb6NAZW9iCBGGCYkiclwpMDIFDbOgYsWXYNoEIGTZxADaBaZNYjMom_yVVQ1Op9BePJcSgfSFWytJiwWOeKAoh0DhnlOh40OQlpWfCOcdads5p1i1RFOKSof3tZOyLqPMsT7x1DEUNmwdnPr-VK5EaaWe26_f8ubque0-AH8b70FYXnLbLoEVu4kbpbkeum8dzNpvX3uHL59RNm3618K6Tz0AUHku2x0QtNh_tJWVNxnZVM-NHq5IbfvJNyw9Q8_BQGXbZh5Os0YbsS3e-vWO_O8Xh7nAqvH65kOE2mgz9vaLIHFih6P8eH3L5a38_6Svzeljyeruun2BqHX2XuV_3SEqYZTtaXVAAYne33JKD79mLheHVnYDg9idg3X7emfsoYY0f_r6feXDAWTW9ulqdUct9I1Nn4v4DgUOpkw',
    fullName: 'Shubhankar Das',
  },
  'soumya_jit.exe': {
    avatarUrl: 'https://serpapi.com/images/url/cmMirHichVDLjqMwAJP2sl-y3GiTAElYKVrRmbZDKTN90scFhdACLQ2oydApn7pfs4j5gD1YsmzLkv33x89c61r9Hg6VqKQ-SW1yXVomHIhUFlJpnt35bSCq27AZagcOKCKUmNAdUkiQi10MYkgBcCGCdidQSiGOLUpAF8MUIAJtC7gYxXJwqbM_StcsVdrseKygA746xFpjI5YiFlwzCFxDiIQR0-k1VaTsTIQQjnE6Z-z0nKHjzrkkaFXurVV-fPrYl6Nngo51Mo3OYlpe5jK10qf9Fb5mj_k1bH0JflmvfVuVC5a_BZMMTt6bw3ZJru_NYwzuLW--fcG89N5exu0L2tHGbdZR0t4TL0Bm5m5DnT0WdVljf3atM9vCOdnhzWc0ni_sjV_y1aYMXkYXr7gdxstxSOT8HASY77fpvjz1_a1myO5Zrtn_Hu9zWbffmqYtfwtMp4HrMC_ahaoOZPl9j2Ik4VQYVc4AiL3l7GA3eXKrP1y-jNRVfvDZurE9pWb1-gjdvPDt2I6ueFSYnlGdGPZGZIJGzj8Wi6j8',
    fullName: 'Er. Soumya',
  },
  'shubham_12.s': {
    avatarUrl: 'https://serpapi.com/images/url/nUbml3icdVHbrqJAEMx-zPqGXIcZNplsUFdFhRVylJWXCcxw8-jAgRHBT90_2bdDOM_70El1dXclVf33279CiLr9IcstrbhIuZhTxkveijhv4vucVne5kwVQ50iDCEqqJSMVGCbSLYuoSDGhqiNoWhAaQAPEVBBQgYWssTXHCwUYhM-vdf6zFTVmrZBGTFoVKP1YRAhzRjglNBZYVdQZpQmGEpi4tmQ4g5RSMEuzHKfDTotCcE204PZHD4pocEyHL4ZEi-pkc87o5nY9cKazwejdVf48vLsvhyvf9dWkVhUU9_fT8Ovtqdwcw4fvXvdc57vklH3NKbZZdSw_jg69d9cFe148exN9OHoLaZys9j4oozjuSjssHpd6KVwYpI3rFVl-DDnyb2sFaSlcJ027bxgL6yXg3qkyl8Z20n8JrBkTKgT-b9TTQj4a71UJLTMJ-TsIYfC72xJeRfZXLi2GiYmsWVVgRSG2v79kDYxIxuPHpdiScLM_M8sqz00uHV6e-zB2i5Hss0AL8lmVYtNeoPEvxicJaqX-',
    fullName: 'Shubham Si',
  },
  'wzz.ashuu_': {
    avatarUrl: 'https://serpapi.com/images/url/6xe1s3ichZDvbpswFMW1hxnfCLYB251kTaQslCykoV1YyxcENv8TTINbQh51j7EnGKIPsA_36Ojeq590zp8vfyul-uGbYQxcdirvlJ6qk6nDFRdd3Q0qLS_pecXl2fgwlA1XFBFKdHhnEIIwhACiBFJgEoAgvaN0VggSm2IILItCbBMbIWRSmnSrpi-_D6pnYlD67JMB2uA6T6IU1pKOJzxVbEZqnGeM6PayG2rBCsI5t7W8KFk-bVH8224y9HR6MZ-qePKx362nDMV95kUF907NrhOmmKxr4Jbjrg1ufge-mu5CkxVnDXmv9k7Z9rtjSNr9x_ij4Q9O_XnnzBGypOHl_hK94AhjV8UNT38-Oq3DH_jbuagPr3RqKTqKg7l1p3UdepuoTfXgOXimezmG63BB3RRD1uIqxf5X7vJXzlHzSFy3vMrDC0lFfLm50S9ZOZ9NDIxkKeWarBgAiRPuNsCDFibT0ZfiFd_e_CLz3uPQG7NA9qNOsXvYmLj06DnUZM6ws6Zwc0__ASjRosQ',
    fullName: 'ashuu<3',
  },
};

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

  // 4. Dispatch request to backend or serverless function
  const requestPromise = (async (): Promise<string | null> => {
    try {
      const response = await fetch(`/api/team/instagram-profile?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type') || '';

      // Only attempt JSON parsing if the server actually returned JSON (prevents HTML rewrite errors on Vercel)
      if (response.ok && contentType.includes('application/json')) {
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
      }

      // If backend returned non-JSON (e.g. Vercel static rewrite) or empty/error:
      // Check verified synced avatar store
      const verified = VERIFIED_INSTAGRAM_AVATARS[username];
      if (verified?.avatarUrl) {
        const avatarData: InstagramAvatarData = {
          username,
          avatarUrl: verified.avatarUrl,
          fullName: verified.fullName,
          fetchedAt: Date.now(),
        };
        clientAvatarCache.set(username, avatarData);
        return verified.avatarUrl;
      }

      return null;
    } catch {
      // On network failure or offline, fall back to verified avatar if available
      const verified = VERIFIED_INSTAGRAM_AVATARS[username];
      if (verified?.avatarUrl) {
        return verified.avatarUrl;
      }
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
