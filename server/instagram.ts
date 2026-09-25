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

// Stale cache fallback store to survive temporary API outages, missing API keys, or rate limits
const staleFallbackCache = new Map<string, InstagramCacheEntry>([
  ['shubhankar.d_5', {
    avatarUrl: 'https://serpapi.com/images/url/FzlAAXichVDLjpswAJR66ZeUG4ltMIZKVsVm8yCbR_MAIi4IGwIhwdDYmwCf2q9pxH5ADyONZkYjzfz99r1QqpE_x2PJa6EyoXRZckOHI56Ki5Aqye9JNeJ1NX6MFYYjGxGb6NAZW9iCBGGCYkiclwpMDIFDbOgYsWXYNoEIGTZxADaBaZNYjMom_yVVQ1Op9BePJcSgfSFWytJiwWOeKAoh0DhnlOh40OQlpWfCOcdads5p1i1RFOKSof3tZOyLqPMsT7x1DEUNmwdnPr-VK5EaaWe26_f8ubque0-AH8b70FYXnLbLoEVu4kbpbkeum8dzNpvX3uHL59RNm3618K6Tz0AUHku2x0QtNh_tJWVNxnZVM-NHq5IbfvJNyw9Q8_BQGXbZh5Os0YbsS3e-vWO_O8Xh7nAqvH65kOE2mgz9vaLIHFih6P8eH3L5a38_6Svzeljyeruun2BqHX2XuV_3SEqYZTtaXVAAYne33JKD79mLheHVnYDg9idg3X7emfsoYY0f_r6feXDAWTW9ulqdUct9I1Nn4v4DgUOpkw',
    fullName: 'Shubhankar Das',
    timestamp: Date.now(),
  }],
  ['soumya_jit.exe', {
    avatarUrl: 'https://serpapi.com/images/url/cmMirHichVDLjqMwAJP2sl-y3GiTAElYKVrRmbZDKTN90scFhdACLQ2oydApn7pfs4j5gD1YsmzLkv33x89c61r9Hg6VqKQ-SW1yXVomHIhUFlJpnt35bSCq27AZagcOKCKUmNAdUkiQi10MYkgBcCGCdidQSiGOLUpAF8MUIAJtC7gYxXJwqbM_StcsVdrseKygA746xFpjI5YiFlwzCFxDiIQR0-k1VaTsTIQQjnE6Z-z0nKHjzrkkaFXurVV-fPrYl6Nngo51Mo3OYlpe5jK10qf9Fb5mj_k1bH0JflmvfVuVC5a_BZMMTt6bw3ZJru_NYwzuLW--fcG89N5exu0L2tHGbdZR0t4TL0Bm5m5DnT0WdVljf3atM9vCOdnhzWc0ni_sjV_y1aYMXkYXr7gdxstxSOT8HASY77fpvjz1_a1myO5Zrtn_Hu9zWbffmqYtfwtMp4HrMC_ahaoOZPl9j2Ik4VQYVc4AiL3l7GA3eXKrP1y-jNRVfvDZurE9pWb1-gjdvPDt2I6ueFSYnlGdGPZGZIJGzj8Wi6j8',
    fullName: 'Er. Soumya',
    timestamp: Date.now(),
  }],
  ['shubham_12.s', {
    avatarUrl: 'https://serpapi.com/images/url/nUbml3icdVHbrqJAEMx-zPqGXIcZNplsUFdFhRVylJWXCcxw8-jAgRHBT90_2bdDOM_70El1dXclVf33279CiLr9IcstrbhIuZhTxkveijhv4vucVne5kwVQ50iDCEqqJSMVGCbSLYuoSDGhqiNoWhAaQAPEVBBQgYWssTXHCwUYhM-vdf6zFTVmrZBGTFoVKP1YRAhzRjglNBZYVdQZpQmGEpi4tmQ4g5RSMEuzHKfDTotCcE204PZHD4pocEyHL4ZEi-pkc87o5nY9cKazwejdVf48vLsvhyvf9dWkVhUU9_fT8Ovtqdwcw4fvXvdc57vklH3NKbZZdSw_jg69d9cFe148exN9OHoLaZys9j4oozjuSjssHpd6KVwYpI3rFVl-DDnyb2sFaSlcJ027bxgL6yXg3qkyl8Z20n8JrBkTKgT-b9TTQj4a71UJLTMJ-TsIYfC72xJeRfZXLi2GiYmsWVVgRSG2v79kDYxIxuPHpdiScLM_M8sqz00uHV6e-zB2i5Hss0AL8lmVYtNeoPEvxicJaqX-',
    fullName: 'Shubham Si',
    timestamp: Date.now(),
  }],
  ['wzz.ashuu_', {
    avatarUrl: 'https://serpapi.com/images/url/6xe1s3ichZDvbpswFMW1hxnfCLYB251kTaQslCykoV1YyxcENv8TTINbQh51j7EnGKIPsA_36Ojeq590zp8vfyul-uGbYQxcdirvlJ6qk6nDFRdd3Q0qLS_pecXl2fgwlA1XFBFKdHhnEIIwhACiBFJgEoAgvaN0VggSm2IILItCbBMbIWRSmnSrpi-_D6pnYlD67JMB2uA6T6IU1pKOJzxVbEZqnGeM6PayG2rBCsI5t7W8KFk-bVH8224y9HR6MZ-qePKx362nDMV95kUF907NrhOmmKxr4Jbjrg1ufge-mu5CkxVnDXmv9k7Z9rtjSNr9x_ij4Q9O_XnnzBGypOHl_hK94AhjV8UNT38-Oq3DH_jbuagPr3RqKTqKg7l1p3UdepuoTfXgOXimezmG63BB3RRD1uIqxf5X7vJXzlHzSFy3vMrDC0lFfLm50S9ZOZ9NDIxkKeWarBgAiRPuNsCDFibT0ZfiFd_e_CLz3uPQG7NA9qNOsXvYmLj06DnUZM6ws6Zwc0__ASjRosQ',
    fullName: 'ashuu<3',
    timestamp: Date.now(),
  }],
]);

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
