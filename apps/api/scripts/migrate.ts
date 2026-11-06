import { closeConnections } from '../src/lib/connections.js';
import { logger } from '../src/lib/logger.js';
import { runMigrations } from '../src/db/migrations/runner.js';

try {
  await runMigrations();
  logger.info('Database migrations and indexes are current.');
} catch (error) {
  logger.error({ err: error }, 'Database migration failed.');
  process.exitCode = 1;
} finally {
  await closeConnections();
}
