import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const redis = new Redis(env.redisUrl);

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (error) => logger.error('Redis connection error', { error }));

export async function verifyRedisConnection(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    logger.error('Redis ping failed', { error });
    return false;
  }
}
