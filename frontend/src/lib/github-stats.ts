export type GitHubProfileStats = {
  login: string;
  name: string;
  avatarUrl: string;
  htmlUrl: string;
  bio: string | null;
  location: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  updatedAt: string;
};

export type GitHubLatestPush = {
  repoName: string;
  repoUrl: string;
  branch: string;
  headSha: string;
  commitCount: number;
  pushedAt: string;
  commitMessage: string | null;
};

export type GitHubStatsSnapshot = {
  username: string;
  fetchedAt: string;
  source: "live" | "fallback";
  profile: GitHubProfileStats;
  latestPush: GitHubLatestPush | null;
};

export type GitHubStatsOptions = {
  username?: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
};

type GitHubUserResponse = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
};

type GitHubEventResponse = {
  type: string;
  created_at: string;
  repo?: {
    name: string;
    url: string;
  };
  payload?: {
    ref?: string | null;
    head?: string | null;
    commits?: Array<{
      message?: string | null;
    }>;
  };
};

const DEFAULT_USERNAME = "shubhams-git";
const DEFAULT_FETCH_LIMIT = 12;

function getFetchImplementation(fetchImpl?: typeof fetch) {
  if (fetchImpl) {
    return fetchImpl;
  }

  if (typeof fetch !== "undefined") {
    return fetch;
  }

  return null;
}

function normalizeText(value: string | null | undefined, fallback = "Unknown") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function normalizeNullableText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function createFallbackProfile(username: string): GitHubProfileStats {
  return {
    login: username,
    name: username,
    avatarUrl: `https://github.com/${username}.png`,
    htmlUrl: `https://github.com/${username}`,
    bio: null,
    location: null,
    publicRepos: 0,
    followers: 0,
    following: 0,
    createdAt: "",
    updatedAt: "",
  };
}

export function createFallbackGitHubStats(username = DEFAULT_USERNAME): GitHubStatsSnapshot {
  return {
    username,
    fetchedAt: new Date().toISOString(),
    source: "fallback",
    profile: createFallbackProfile(username),
    latestPush: null,
  };
}

async function fetchJson<T>(fetchImpl: typeof fetch, url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetchImpl(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

function normalizeProfile(username: string, payload: GitHubUserResponse): GitHubProfileStats {
  return {
    login: normalizeText(payload.login, username),
    name: normalizeText(payload.name, username),
    avatarUrl: payload.avatar_url,
    htmlUrl: payload.html_url,
    bio: normalizeNullableText(payload.bio),
    location: normalizeNullableText(payload.location),
    publicRepos: payload.public_repos,
    followers: payload.followers,
    following: payload.following,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
}

function isPushEvent(event: GitHubEventResponse): event is GitHubEventResponse & {
  type: "PushEvent";
  repo: NonNullable<GitHubEventResponse["repo"]>;
  payload: NonNullable<GitHubEventResponse["payload"]>;
} {
  return event.type === "PushEvent" && Boolean(event.repo) && Boolean(event.payload);
}

function normalizeLatestPush(event: GitHubEventResponse): GitHubLatestPush | null {
  if (!isPushEvent(event)) {
    return null;
  }

  const commitCount = event.payload.commits?.length ?? 0;
  const commitMessage = event.payload.commits?.[commitCount - 1]?.message ?? null;

  return {
    repoName: event.repo.name,
    repoUrl: event.repo.url.replace("api.github.com/repos", "github.com"),
    branch: normalizeText(event.payload.ref?.replace(/^refs\/heads\//, ""), "default"),
    headSha: normalizeText(event.payload.head, ""),
    commitCount,
    pushedAt: event.created_at,
    commitMessage: normalizeNullableText(commitMessage),
  };
}

export async function fetchGitHubStats(options: GitHubStatsOptions = {}): Promise<GitHubStatsSnapshot> {
  const username = options.username?.trim() || DEFAULT_USERNAME;
  const fetchImpl = getFetchImplementation(options.fetchImpl);

  if (!fetchImpl) {
    return createFallbackGitHubStats(username);
  }

  try {
    const [profilePayload, eventsPayload] = await Promise.all([
      fetchJson<GitHubUserResponse>(fetchImpl, `https://api.github.com/users/${username}`, options.signal),
      fetchJson<GitHubEventResponse[]>(
        fetchImpl,
        `https://api.github.com/users/${username}/events/public?per_page=${DEFAULT_FETCH_LIMIT}`,
        options.signal,
      ),
    ]);

    const latestPush = eventsPayload.find(isPushEvent) ?? null;

    return {
      username,
      fetchedAt: new Date().toISOString(),
      source: "live",
      profile: normalizeProfile(username, profilePayload),
      latestPush: latestPush ? normalizeLatestPush(latestPush) : null,
    };
  } catch {
    return createFallbackGitHubStats(username);
  }
}
