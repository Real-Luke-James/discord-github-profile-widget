export async function updateDiscordWidget(config, stats) {
  const { applicationId, userId, identityId, botToken } = config;
  
  if (!applicationId || !userId || !identityId || !botToken) {
    throw new Error('Missing required Discord credentials');
  }

  const url = `https://discord.com/api/v9/applications/${applicationId}/users/${userId}/identities/${identityId}/profile`;
  
  const payload = {
    username: stats.username,
    data: {
      dynamic: [
        {
          type: 1, // Number
          name: 'stars',
          value: stats.stars
        },
        {
          type: 1, // Number
          name: 'forks',
          value: stats.forks
        },
        {
          type: 2, // Number
          name: 'repos',
          value: stats.repos
        },
        {
          type: 1, // Text
          name: 'streak',
          value: stats.streak
        },
        {
          type: 2, // Number
          name: 'contributions',
          value: stats.contributions
        },
        {
          type: 1, // Text
          name: 'top_language',
          value: stats.top_language
        },
        {
          type: 1, // Text
          name: 'joined',
          value: stats.joined
        },
        {
          type: 3, // Image
          name: 'avatar',
          value: {
            url: stats.avatar
          }
        },
        {
          type: 2, // Number
          name: 'followers',
          value: stats.followers
        },
        {
          type: 2, // Number
          name: 'prs',
          value: stats.prs
        },
        {
          type: 1, // Text
          name: 'last_repo',
          value: stats.last_repo
        },
        {
          type: 1, // Text
          name: 'last_commit',
          value: stats.last_commit
        },
        {
          type: 1, // Text
          name: 'username',
          value: stats.username
        },
        {
          type: 1, // Text
          name: 'display_name',
          value: stats.displayName || stats.username
        }
      ]
    }
  };

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    console.log(`Sending PATCH request to Discord (attempt ${attempt}/${maxRetries})...`);
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'discord-github-profile-widget'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Successfully updated Discord Profile Widget!');
        return;
      }

      if (response.status === 429) {
        let retryAfterMs = 5000;
        
        const retryAfterHeader = response.headers.get('retry-after');
        if (retryAfterHeader) {
          const seconds = parseFloat(retryAfterHeader);
          if (!isNaN(seconds)) {
            retryAfterMs = seconds * 1000;
          }
        } else {
          try {
            const body = await response.json();
            if (body && typeof body.retry_after === 'number') {
              retryAfterMs = body.retry_after * 1000;
            }
          } catch (e) {
          }
        }

        console.warn(`Discord API rate limited (429). Retrying in ${retryAfterMs / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfterMs));
        continue;
      }

      const errorText = await response.text();
      throw new Error(`Discord API returned status ${response.status}: ${errorText}`);

    } catch (error) {
      if (attempt >= maxRetries) {
        throw error;
      }
      console.error(`Error communicating with Discord API: ${error.message}. Retrying in 3 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}
