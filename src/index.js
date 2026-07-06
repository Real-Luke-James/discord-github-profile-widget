import dotenv from 'dotenv';
import { getGitHubStats } from './github.js';
import { updateDiscordWidget } from './discord.js';

dotenv.config();

async function main() {
  const {
    GH_USERNAME,
    GH_PAT,
    DISCORD_APPLICATION_ID,
    DISCORD_USER_ID,
    DISCORD_BOT_TOKEN
  } = process.env;

  const missing = [];
  if (!GH_USERNAME) missing.push('GH_USERNAME');
  if (!GH_PAT) missing.push('GH_PAT');
  if (!DISCORD_APPLICATION_ID) missing.push('DISCORD_APPLICATION_ID');
  if (!DISCORD_USER_ID) missing.push('DISCORD_USER_ID');
  if (!DISCORD_BOT_TOKEN) missing.push('DISCORD_BOT_TOKEN');

  if (missing.length > 0) {
    console.error(`Error: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  try {
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
  } catch (error) {
    console.error('Sync failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
