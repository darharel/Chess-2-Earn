import { Router } from 'express';
import { verifyDatabaseConnection } from '../lib/prisma.js';
import { verifyRedisConnection } from '../lib/redis.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  const [dbHealthy, redisHealthy] = await Promise.all([
    verifyDatabaseConnection(),
    verifyRedisConnection()
  ]);

  const healthy = dbHealthy && redisHealthy;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    checks: {
      database: dbHealthy ? 'ok' : 'failed',
      redis: redisHealthy ? 'ok' : 'failed'
    }
  });
});
