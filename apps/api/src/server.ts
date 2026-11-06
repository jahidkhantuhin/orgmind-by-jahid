import { app } from './app.js';
import { env } from './config/env.js';
import { closeConnections } from './lib/connections.js';
import { logger } from './lib/logger.js';

const server = app.listen(env.API_PORT, () =>
  logger.info({ port: env.API_PORT }, 'OrgMind API listening'),
);
let closing = false;
async function shutdown(signal: string): Promise<void> {
  if (closing) return;
  closing = true;
  logger.info({ signal }, 'Shutting down');
  server.close(async (error) => {
    if (error) logger.error({ err: error }, 'HTTP server close failed');
    await closeConnections();
    process.exit(error ? 1 : 0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
