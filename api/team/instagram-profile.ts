import type { IncomingMessage, ServerResponse } from 'http';

// Known verified Instagram profile avatars retrieved via SerpApi
const VERIFIED_AVATARS: Record<string, { avatarUrl: string; fullName?: string }> = {
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

export default async function handler(req: any, res: any) {
  // Set CORS headers so it works on any deployment domain
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    const rawUsername = (req.query?.username || req.query?.profile_id || '') as string;
    const username = rawUsername.trim().toLowerCase();

    if (!username) {
      res.statusCode = 400;
      res.end(JSON.stringify({ success: false, error: 'Missing required query parameter "username"' }));
      return;
    }

    const apiKey = process.env.SERPAPI_API_KEY;

    if (apiKey) {
      try {
        const searchUrl = new URL('https://serpapi.com/search.json');
        searchUrl.searchParams.set('engine', 'instagram_profile');
        searchUrl.searchParams.set('profile_id', username);
        searchUrl.searchParams.set('api_key', apiKey);

        const response = await fetch(searchUrl.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'LifeRPG-TeamExpo-Vercel/1.0',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const profile = data.profile_results || data.profile || data.user || data.instagram_profile || data;
          const avatarUrl: string | undefined =
            profile.serpapi_profile_pic_url_hd ||
            profile.serpapi_profile_pic_url ||
            profile.profile_pic_url_hd ||
            profile.profile_pic_url ||
            data.serpapi_profile_pic_url_hd ||
            data.serpapi_profile_pic_url;

          const fullName: string | undefined = profile.full_name || profile.name || data.name;

          if (avatarUrl) {
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              username,
              avatarUrl,
              fullName,
              cached: false,
            }));
            return;
          }
        }
      } catch (e) {
        console.warn('SerpApi lookup failed in Vercel function, using fallback:', e);
      }
    }

    // Fallback to verified synced avatars
    const fallback = VERIFIED_AVATARS[username];
    if (fallback) {
      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        username,
        avatarUrl: fallback.avatarUrl,
        fullName: fallback.fullName,
        cached: true,
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({
      success: false,
      username,
      error: 'Profile avatar not found',
    }));
  } catch (error: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({
      success: false,
      error: error?.message || 'Internal server error',
    }));
  }
}
