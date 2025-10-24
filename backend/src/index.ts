import { createServer } from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';

async function bootstrap() {
  try {
    await prisma.$connect();
    await redis.ping();
  } catch (error) {
    logger.error('Failed to initialize dependencies', { error });
    process.exit(1);
  }

  const app = createApp();
  const server = createServer(app);

  server.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port}`);
  });
}

void bootstrap();
