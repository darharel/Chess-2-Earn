import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { GameResult, Rewards } from '../utils/rewards.js';

export type ProgressTransaction = Prisma.TransactionClient;

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

export async function updateProgressAfterGame(
  tx: ProgressTransaction,
  userId: string,
  result: GameResult,
  rewards: Rewards
) {
  const progress = await tx.userProgress.findUnique({
    where: { userId }
  });

  if (!progress) {
    throw new Error('User progress not initialized');
  }

  const isWin = result === 'win';
  const isDraw = result === 'draw';
  const nextStreak = isWin ? progress.currentStreak + 1 : 0;
  const longestStreak = Math.max(progress.longestStreak ?? 0, nextStreak);

  const data: Prisma.UserProgressUpdateInput = {
    gemsBalance: { increment: rewards.gems },
    knowledgePoints: { increment: rewards.knowledgePoints },
    totalGemsEarned: { increment: rewards.gems },
    totalKnowledgeEarned: { increment: rewards.knowledgePoints },
    gamesAnalyzedCount: { increment: 1 },
    totalGamesPlayed: { increment: 1 },
    currentStreak: nextStreak,
    longestStreak,
    lastAnalyzedAt: new Date()
  };

  if (isWin) {
    data.winCount = { increment: 1 };
  } else if (isDraw) {
    data.drawCount = { increment: 1 };
  } else {
    data.lossCount = { increment: 1 };
  }

  return tx.userProgress.update({
    where: { userId },
    data
  });
}
