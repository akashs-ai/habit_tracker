/**
 * Server-side Instagram Profile Service using SerpApi
 * 
 * Securely retrieves Instagram profile picture data for Team Expo members
 * without exposing SERPAPI_API_KEY to the browser/client.
 */

interface InstagramCacheEntry {
  avatarUrl: string;
  fullName?: string;
  timestamp: number;
}

export interface InstagramProfileResult {
  success: boolean;
  username: string;
  avatarUrl?: string;
  fullName?: string;
  cached?: boolean;
  error?: string;
  configured?: boolean;
}

// In-memory cache with 2-hour TTL for successful lookups
const memoryCache = new Map<string, InstagramCacheEntry>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// Stale cache fallback store to survive temporary API outages or rate limits
const staleFallbackCache = new Map<string, InstagramCacheEntry>();

// In-flight request deduplication map to prevent redundant concurrent SerpApi calls
const inFlightRequests = new Map<string, Promise<InstagramProfileResult>>();

/**
 * Validates an Instagram username to prevent SSRF, path traversal, or injection.
 * Standard Instagram usernames: 1-30 chars, alphanumeric plus dots and underscores.
 */
export function isValidInstagramUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  const trimmed = username.trim();
  if (trimmed.length < 1 || trimmed.length > 30) return false;
  // Strict pattern: only letters, digits, underscores, periods
  return /^[a-zA-Z0-9._]{1,30}$/.test(trimmed);
}

/**
 * Retrieves Instagram profile avatar via SerpApi with server-side caching and deduplication.
 * NEVER exposes the API key or internal secrets to callers.
 */
export async function fetchInstagramProfile(rawUsername: string): Promise<InstagramProfileResult> {
  const username = (rawUsername || '').trim().toLowerCase();

  if (!isValidInstagramUsername(username)) {
    return {
      success: false,
      username: rawUsername,
      error: 'Invalid Instagram username format',
    };
  }

  // 1. Check active memory cache
  const cached = memoryCache.get(username);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      success: true,
      username,
      avatarUrl: cached.avatarUrl,
      fullName: cached.fullName,
      cached: true,
    };
  }

  // 2. Request deduplication: if a request for this username is already in flight, await it
  const existingPromise = inFlightRequests.get(username);
  if (existingPromise) {
    return existingPromise;
  }

  // 3. Initiate request with in-flight lock
  const fetchPromise = (async (): Promise<InstagramProfileResult> => {
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      // API key not configured in environment
      // Check if we have stale cache fallback from previous sessions
      const stale = staleFallbackCache.get(username);
      if (stale) {
        return {
          success: true,
          username,
          avatarUrl: stale.avatarUrl,
          fullName: stale.fullName,
          cached: true,
        };
      }

      return {
        success: false,
        username,
        configured: false,
        error: 'SerpApi API key not configured',
      };
    }

    try {
      // Build safe URL
      const searchUrl = new URL('https://serpapi.com/search.json');
      searchUrl.searchParams.set('engine', 'instagram_profile');
      searchUrl.searchParams.set('profile_id', username);
      searchUrl.searchParams.set('api_key', apiKey);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(searchUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LifeRPG-TeamExpo-ProfileSync/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle rate limits or temporary errors
        console.warn(`[InstagramSync] SerpApi returned status ${response.status} for profile ${username}`);

        // Fallback to stale cache if available
        const stale = staleFallbackCache.get(username);
        if (stale) {
          return {
            success: true,
            username,
            avatarUrl: stale.avatarUrl,
            fullName: stale.fullName,
            cached: true,
          };
        }

        return {
          success: false,
          username,
          error: response.status === 429 
            ? 'SerpApi rate limit reached' 
            : `SerpApi error: HTTP ${response.status}`,
        };
      }

      const data = await response.json();

      if (data.error) {
        console.warn(`[InstagramSync] SerpApi reported error for ${username}: ${data.error}`);
        const stale = staleFallbackCache.get(username);
        if (stale) {
          return {
            success: true,
            username,
            avatarUrl: stale.avatarUrl,
            fullName: stale.fullName,
            cached: true,
          };
        }
        return {
          success: false,
          username,
          error: data.error,
        };
      }

      // Extract image URL from SerpApi response structure
      // Note: SerpApi instagram_profile engine puts main user data in data.profile_results
      // Prefer SerpApi cached / proxied URLs first as they bypass Instagram CDN referrer/token expiration,
      // then high-definition URLs, then standard URLs.
      const profile = data.profile_results || data.profile || data.user || data.instagram_profile || data;

      const avatarUrl: string | undefined = 
        profile.serpapi_profile_pic_url_hd ||
        profile.serpapi_profile_pic_url ||
        profile.profile_pic_url_hd ||
        profile.profile_pic_url ||
        data.serpapi_profile_pic_url_hd ||
        data.serpapi_profile_pic_url ||
        data.profile_pic_url_hd ||
        data.profile_pic_url;

      const fullName: string | undefined = profile.full_name || profile.name || data.name;

      if (!avatarUrl) {
        console.warn(`[InstagramSync] No avatar URL found in SerpApi response for ${username}`);
        const stale = staleFallbackCache.get(username);
        if (stale) {
          return {
            success: true,
            username,
            avatarUrl: stale.avatarUrl,
            fullName: stale.fullName,
            cached: true,
          };
        }
        return {
          success: false,
          username,
          error: 'No profile picture found for this user',
        };
      }

      // Cache successful result
      const entry: InstagramCacheEntry = {
        avatarUrl,
        fullName,
        timestamp: Date.now(),
      };

      memoryCache.set(username, entry);
      staleFallbackCache.set(username, entry);

      return {
        success: true,
        username,
        avatarUrl,
        fullName,
        cached: false,
      };

    } catch (err: any) {
      console.warn(`[InstagramSync] Failed to fetch profile for ${username}:`, err.message || err);

      // Check stale fallback
      const stale = staleFallbackCache.get(username);
      if (stale) {
        return {
          success: true,
          username,
          avatarUrl: stale.avatarUrl,
          fullName: stale.fullName,
          cached: true,
        };
      }

      return {
        success: false,
        username,
        error: err.name === 'AbortError' ? 'SerpApi request timed out' : 'Failed to connect to SerpApi',
      };
    } finally {
      inFlightRequests.delete(username);
    }
  })();

  inFlightRequests.set(username, fetchPromise);
  return fetchPromise;
}
