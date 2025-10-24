import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

export const prisma = new PrismaClient({
  log: ['error', 'warn']
});

prisma.$on('error', (event) => {
  logger.error('Prisma error', { target: event.target, message: event.message });
});

export async function verifyDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error });
    return false;
  }
}
