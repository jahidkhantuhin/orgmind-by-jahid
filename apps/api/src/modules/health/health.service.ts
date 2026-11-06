import type { HealthResponse } from '@orgmind/shared';
import { checkMongo, checkRedis } from '../../lib/connections.js';

export async function getHealth(): Promise<{ status: number; body: HealthResponse }> {
  const [mongodb, redis] = await Promise.all([checkMongo(), checkRedis()]);
  const connected = mongodb && redis;
  return {
    status: connected ? 200 : 503,
    body: {
      status: connected ? 'ok' : 'degraded',
      services: {
        api: 'ok',
        mongodb: mongodb ? 'connected' : 'disconnected',
        redis: redis ? 'connected' : 'disconnected',
      },
      timestamp: new Date().toISOString(),
    },
  };
}
