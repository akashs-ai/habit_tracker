export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

export interface GitHubDeveloperStats {
  username: string;
  avatarUrl: string;
  name: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  topLanguages: string[];
  topRepositories: GitHubRepo[];
  profileUrl: string;
  fetchedAt: string;
}

// Extract GitHub username from a github profile URL string
export function extractGitHubUsername(githubUrl: string): string {
  try {
    const cleanUrl = githubUrl.trim().replace(/\/+$/, '');
    const segments = cleanUrl.split('/');
    return segments[segments.length - 1] || '';
  } catch {
    return '';
  }
}

// In-memory & session cache to prevent hitting GitHub rate limits (60 req/hr for unauthenticated IP)
const githubStatsCache = new Map<string, { stats: GitHubDeveloperStats; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetches public GitHub profile and repository stats using the standard GitHub REST API.
 * No personal access tokens or credentials needed.
 */
export async function fetchGitHubDeveloperStats(githubUrl: string): Promise<GitHubDeveloperStats> {
  const username = extractGitHubUsername(githubUrl);
  if (!username) {
    throw new Error('Invalid GitHub profile URL');
  }

  // Check memory cache
  const cached = githubStatsCache.get(username.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.stats;
  }

  // Also check sessionStorage
  try {
    const storageKey = `team_expo_gh_${username.toLowerCase()}`;
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        githubStatsCache.set(username.toLowerCase(), parsed);
        return parsed.stats;
      }
    }
  } catch {
    // ignore sessionStorage errors
  }

  // Fetch public user details
  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!userRes.ok) {
    if (userRes.status === 404) {
      throw new Error(`GitHub user "${username}" not found.`);
    }
    if (userRes.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes.');
    }
    throw new Error(`GitHub API returned status ${userRes.status}`);
  }

  const userData = await userRes.json();

  // Fetch top repositories sorted by updated date
  let topRepositories: GitHubRepo[] = [];
  let totalStars = 0;
  const languagesSet = new Set<string>();

  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=10&sort=updated`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (reposRes.ok) {
      const reposData = await reposRes.json();
      if (Array.isArray(reposData)) {
        // Compute total stars & collect languages
        reposData.forEach((repo: any) => {
          totalStars += repo.stargazers_count || 0;
          if (repo.language) {
            languagesSet.add(repo.language);
          }
        });

        // Top 3 repos sorted by stars, or fallback to most recently updated
        const sorted = [...reposData].sort((a: any, b: any) => {
          if ((b.stargazers_count || 0) !== (a.stargazers_count || 0)) {
            return (b.stargazers_count || 0) - (a.stargazers_count || 0);
          }
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });

        topRepositories = sorted.slice(0, 3).map((r: any) => ({
          name: r.name,
          description: r.description || null,
          html_url: r.html_url,
          stargazers_count: r.stargazers_count || 0,
          forks_count: r.forks_count || 0,
          language: r.language || null,
          updated_at: r.updated_at,
        }));
      }
    }
  } catch (err) {
    console.warn('Failed to fetch repositories for GitHub user:', username, err);
  }

  const stats: GitHubDeveloperStats = {
    username: userData.login,
    avatarUrl: userData.avatar_url || `https://github.com/${username}.png`,
    name: userData.name || userData.login,
    bio: userData.bio || null,
    publicRepos: userData.public_repos ?? 0,
    followers: userData.followers ?? 0,
    following: userData.following ?? 0,
    totalStars,
    topLanguages: Array.from(languagesSet).slice(0, 4),
    topRepositories,
    profileUrl: userData.html_url || `https://github.com/${username}`,
    fetchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // Cache stats
  githubStatsCache.set(username.toLowerCase(), { stats, timestamp: Date.now() });
  try {
    const storageKey = `team_expo_gh_${username.toLowerCase()}`;
    sessionStorage.setItem(storageKey, JSON.stringify({ stats, timestamp: Date.now() }));
  } catch {
    // ignore
  }

  return stats;
}
