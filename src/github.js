import { fetchUserData, fetchMoreRepositories } from './graphql.js';
import { calculateStreak, formatStreak } from './streak.js';
import { determineTopLanguage } from './language.js';

// Repos to ignore when picking the "latest" repo. Anything that gets
// automated pushes (this widget, a profile README repo, etc.) belongs here.
const EXCLUDED_REPOS = new Set(
  ['discord-github-profile-widget'].map(n => n.toLowerCase())
);

// Commit messages from your own automation, skipped when picking the latest commit.
const BOT_COMMIT_PATTERN = /update.*stats/i;

const truncate = (str, max = 100) =>
  str.length > max ? str.slice(0, max - 3) + '...' : str;

export async function getGitHubStats(username, token) {
  if (!username) {
    throw new Error('GitHub username is required');
  }
  if (!token) {
    throw new Error('GitHub token is required');
  }

  console.log(`Fetching GitHub user data for: ${username}...`);
  const initialData = await fetchUserData(username, token);

  if (!initialData.user) {
    throw new Error(`GitHub user "${username}" not found or API returned empty user object.`);
  }

  const user = initialData.user;
  const contributionCalendar = user.contributionsCollection?.contributionCalendar;

  let contributionsInt = contributionCalendar?.totalContributions || 0;
  const contributions = contributionsInt.toString();
  const followers = user.followers?.totalCount || 0;
  const prs = user.pullRequests?.totalCount || 0;

  const streakDays = calculateStreak(contributionCalendar);
  const streak = formatStreak(streakDays);

  const allRepos = [];
  if (user.repositories) {
    allRepos.push(...(user.repositories.nodes || []));
    let hasNextPage = user.repositories.pageInfo?.hasNextPage;
    let endCursor = user.repositories.pageInfo?.endCursor;

    while (hasNextPage && endCursor) {
      console.log(`Fetching next page of repositories starting at cursor: ${endCursor}...`);
      const pageData = await fetchMoreRepositories(username, endCursor, token);

      const pageRepos = pageData.user?.repositories?.nodes || [];
      allRepos.push(...pageRepos);

      hasNextPage = pageData.user?.repositories?.pageInfo?.hasNextPage;
      endCursor = pageData.user?.repositories?.pageInfo?.endCursor;
    }
  }

  let totalStarsInt = 0;
  let totalForksInt = 0;

  for (const repo of allRepos) {
    if (repo) {
      totalStarsInt += repo.stargazerCount || 0;
      totalForksInt += repo.forkCount || 0;
    }
  }

  let totalStars = totalStarsInt.toString();
  let totalForks = totalForksInt.toString();

  // Pick the most recently pushed repo, ignoring excluded ones
  // (and your profile repo, which is named after your username).
  const excluded = new Set([...EXCLUDED_REPOS, username.toLowerCase()]);

  const sortedRepos = allRepos
    .filter(r => r && r.name && !excluded.has(r.name.toLowerCase()))
    .sort((a, b) => {
      if (!a.pushedAt && !b.pushedAt) return 0;
      if (!a.pushedAt) return 1;
      if (!b.pushedAt) return -1;
      return new Date(b.pushedAt) - new Date(a.pushedAt);
    });

  let lastRepo = '—';
  let lastCommit = '—';

  const latest = sortedRepos[0];
  if (latest) {
    lastRepo = truncate(latest.name);

    // Skip bot commits so automation doesn't become the "latest commit".
    // This works best if your GraphQL query uses history(first: 10).
    const commits = latest.defaultBranchRef?.target?.history?.nodes || [];
    const commitNode = commits.find(
      c => c?.message && !BOT_COMMIT_PATTERN.test(c.message)
    );

    if (commitNode) {
      lastCommit = truncate(commitNode.message.split('\n')[0]);
    }
  }

  const topLanguage = determineTopLanguage(allRepos);
  const joined = formatJoinedDate(user.createdAt);

  const defaultAvatarUrl = 'https://github.com/identicons/guest.png';
  const avatar = user.avatarUrl || defaultAvatarUrl;

  let reposNum = allRepos.length.toString();

  return {
    username,
    displayName: user.name || '',
    joined,
    avatar,
    followers,
    prs,
    last_repo: lastRepo,
    last_commit: lastCommit,
    stars: totalStars,
    forks: totalForks,
    repos: reposNum,
    streak,
    contributions,
    top_language: topLanguage
  };
}

function formatJoinedDate(createdAtString) {
  if (!createdAtString) {
    return 'Joined —';
  }

  try {
    const date = new Date(createdAtString);
    if (isNaN(date.getTime())) {
      return 'Joined —';
    }

    const options = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formattedDate = formatter.format(date);
    return `Joined ${formattedDate}`;
  } catch (error) {
    console.error('Error formatting joined date:', error);
    return 'Joined —';
  }
}
