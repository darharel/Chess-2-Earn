import { prisma } from '../lib/prisma.js';

export async function ensureUserProgress(userId: string) {
  const existing = await prisma.userProgress.findUnique({ where: { userId } });
  if (existing) {
    return existing;
  }
  return prisma.userProgress.create({
    data: {
      userId
    }
  });
}
