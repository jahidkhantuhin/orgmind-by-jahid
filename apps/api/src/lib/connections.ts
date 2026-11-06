import { MongoClient } from 'mongodb';
import { createClient } from 'redis';
import { env } from '../config/env.js';

export const mongoClient = new MongoClient(env.MONGODB_URI, { serverSelectionTimeoutMS: 1500 });
export const redisClient = createClient({
  url: env.REDIS_URL,
  socket: { connectTimeout: 1500, reconnectStrategy: false },
});
redisClient.on('error', () => undefined);

export async function checkMongo(): Promise<boolean> {
  try {
    await mongoClient.db(env.MONGODB_DATABASE).command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function checkRedis(): Promise<boolean> {
  try {
    if (!redisClient.isOpen) await redisClient.connect();
    await redisClient.ping();
    return true;
  } catch {
    if (redisClient.isOpen) await redisClient.quit().catch(() => undefined);
    return false;
  }
}

export async function closeConnections(): Promise<void> {
  await Promise.allSettled([
    mongoClient.close(),
    redisClient.isOpen ? redisClient.quit() : Promise.resolve(),
  ]);
}
