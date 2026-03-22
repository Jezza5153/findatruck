/**
 * GitHub REST API client — lightweight wrapper using native fetch.
 * No Octokit dependency to keep the bundle small.
 */

const GITHUB_API = 'https://api.github.com';

interface GitHubRateLimitInfo {
  remaining: number;
  reset: number; // unix timestamp
  limit: number;
}

let rateLimitInfo: GitHubRateLimitInfo = { remaining: 5000, reset: 0, limit: 5000 };

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'OpenClaw-Scout/1.0',
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function updateRateLimit(response: Response) {
  const remaining = response.headers.get('x-ratelimit-remaining');
  const reset = response.headers.get('x-ratelimit-reset');
  const limit = response.headers.get('x-ratelimit-limit');

  if (remaining) rateLimitInfo.remaining = parseInt(remaining, 10);
  if (reset) rateLimitInfo.reset = parseInt(reset, 10);
  if (limit) rateLimitInfo.limit = parseInt(limit, 10);
}

async function waitForRateLimit() {
  if (rateLimitInfo.remaining <= 5) {
    const now = Math.floor(Date.now() / 1000);
    const waitSeconds = Math.max(0, rateLimitInfo.reset - now) + 1;
    if (waitSeconds > 0 && waitSeconds < 3600) {
      console.log(`[github] Rate limit near zero, waiting ${waitSeconds}s`);
      await new Promise((r) => setTimeout(r, waitSeconds * 1000));
    }
  }
}

async function githubFetch<T>(path: string, retries = 2): Promise<T | null> {
  await waitForRateLimit();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${GITHUB_API}${path}`, {
        headers: getHeaders(),
      });

      updateRateLimit(response);

      if (response.status === 404) return null;
      if (response.status === 403 && rateLimitInfo.remaining === 0) {
        // Rate limited — wait and retry
        const waitMs = Math.max(1000, (rateLimitInfo.reset - Math.floor(Date.now() / 1000)) * 1000);
        console.warn(`[github] Rate limited, waiting ${Math.round(waitMs / 1000)}s`);
        await new Promise((r) => setTimeout(r, Math.min(waitMs, 60000)));
        continue;
      }

      if (!response.ok) {
        console.error(`[github] ${path} returned ${response.status}`);
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        return null;
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error(`[github] fetch error for ${path}:`, error);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }

  return null;
}

// =====================
// Public API
// =====================

export interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  language: string | null;
  topics: string[];
  license: { spdx_id: string; name: string } | null;
  archived: boolean;
  default_branch: string;
  owner: { login: string; avatar_url: string };
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  html_url: string;
  published_at: string;
  created_at: string;
  draft: boolean;
  prerelease: boolean;
  author: { login: string };
}

export interface GitHubSearchResult<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

export interface GitHubCodeResult {
  name: string;
  path: string;
  sha: string;
  html_url: string;
  repository: {
    id: number;
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
  };
}

/**
 * Get repository metadata
 */
export async function getRepo(owner: string, repo: string): Promise<GitHubRepo | null> {
  return githubFetch<GitHubRepo>(`/repos/${owner}/${repo}`);
}

/**
 * Get latest release for a repository
 */
export async function getLatestRelease(owner: string, repo: string): Promise<GitHubRelease | null> {
  return githubFetch<GitHubRelease>(`/repos/${owner}/${repo}/releases/latest`);
}

/**
 * List recent releases for a repository
 */
export async function listReleases(
  owner: string,
  repo: string,
  perPage = 5
): Promise<GitHubRelease[]> {
  const result = await githubFetch<GitHubRelease[]>(
    `/repos/${owner}/${repo}/releases?per_page=${perPage}`
  );
  return result ?? [];
}

/**
 * Search repositories by query
 */
export async function searchRepos(
  query: string,
  perPage = 10,
  sort: 'stars' | 'updated' | 'best-match' = 'stars'
): Promise<GitHubSearchResult<GitHubRepo>> {
  const sortParam = sort === 'best-match' ? '' : `&sort=${sort}`;
  const result = await githubFetch<GitHubSearchResult<GitHubRepo>>(
    `/search/repositories?q=${encodeURIComponent(query)}&per_page=${perPage}${sortParam}`
  );
  return result ?? { total_count: 0, incomplete_results: false, items: [] };
}

/**
 * Search code by query
 */
export async function searchCode(
  query: string,
  perPage = 10
): Promise<GitHubSearchResult<GitHubCodeResult>> {
  const result = await githubFetch<GitHubSearchResult<GitHubCodeResult>>(
    `/search/code?q=${encodeURIComponent(query)}&per_page=${perPage}`
  );
  return result ?? { total_count: 0, incomplete_results: false, items: [] };
}

/**
 * Get current rate limit status
 */
export function getRateLimitInfo(): GitHubRateLimitInfo {
  return { ...rateLimitInfo };
}
