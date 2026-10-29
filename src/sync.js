import { getGitHubStats } from './github.js';
import { updateDiscordWidget } from './discord.js';

export async function runSync(config) {
  const {
    GH_USERNAME,
    GH_PAT,
    DISCORD_APPLICATION_ID,
    DISCORD_USER_ID,
    DISCORD_BOT_TOKEN
  } = config;

  const missing = [];
  if (!GH_USERNAME) missing.push('GH_USERNAME');
  if (!GH_PAT) missing.push('GH_PAT');
  if (!DISCORD_APPLICATION_ID) missing.push('DISCORD_APPLICATION_ID');
  if (!DISCORD_USER_ID) missing.push('DISCORD_USER_ID');
  if (!DISCORD_BOT_TOKEN) missing.push('DISCORD_BOT_TOKEN');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const stats = await getGitHubStats(GH_USERNAME, GH_PAT);

  console.log('GitHub Stats Compiled:', JSON.stringify(stats, null, 2));

  const discordConfig = {
    applicationId: DISCORD_APPLICATION_ID,
    userId: DISCORD_USER_ID,
    identityId: DISCORD_USER_ID,
    botToken: DISCORD_BOT_TOKEN
  };

  await updateDiscordWidget(discordConfig, stats);
  console.log('Sync completed successfully!');
}
