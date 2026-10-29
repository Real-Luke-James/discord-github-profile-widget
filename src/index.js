import { runSync } from './sync.js';

export default {
  async scheduled(event, env, ctx) {
    await runSync(env);
  },

  async fetch(request, env, ctx) {
    const authHeader = request.headers.get('Authorization');
    const expected = `Bearer ${env.MANUAL_TRIGGER_TOKEN}`;

    if (!env.MANUAL_TRIGGER_TOKEN || authHeader !== expected) {
      return new Response('Unauthorized', { status: 401 });
    }

    try {
      await runSync(env);
      return new Response('Sync completed successfully!', { status: 200 });
    } catch (error) {
      return new Response(`Sync failed: ${error.message}`, { status: 500 });
    }
  }
};

if (typeof process !== 'undefined' && process.argv && process.argv[1]) {
  const dotenv = (await import('dotenv')).default;
  dotenv.config();

  try {
    await runSync(process.env);
  } catch (error) {
    console.error('Sync failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}
