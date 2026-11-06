import { ensureChunkSearchIndexes } from '../src/db/search-indexes.js';
import { closeConnections } from '../src/lib/connections.js';
import { logger } from '../src/lib/logger.js';

try {
  await ensureChunkSearchIndexes();
  logger.info('Chunk vector and text search indexes are READY.');
} catch (error) {
  logger.error({ err: error }, 'Failed to create or wait for chunk search indexes.');
  process.exitCode = 1;
} finally {
  await closeConnections();
}
