async function fetchGraphQL(query, variables, token) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'discord-github-profile-widget',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub GraphQL API request failed with status ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GitHub GraphQL API returned errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

export async function fetchUserData(username, token) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        name
        avatarUrl
        createdAt
        followers {
          totalCount
        }
        pullRequests {
          totalCount
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
        repositories(first: 100, privacy: PUBLIC, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
          nodes {
            name
            stargazerCount
            forkCount
            isFork
            pushedAt
            primaryLanguage {
              name
            }
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                }
              }
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    nodes {
                      message
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  return await fetchGraphQL(query, { username }, token);
}

export async function fetchMoreRepositories(username, cursor, token) {
  const query = `
    query($username: String!, $cursor: String!) {
      user(login: $username) {
        repositories(first: 100, after: $cursor, privacy: PUBLIC, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            name
            stargazerCount
            forkCount
            isFork
            pushedAt
            primaryLanguage {
              name
            }
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                }
              }
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    nodes {
                      message
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  return await fetchGraphQL(query, { username, cursor }, token);
}
