import { prisma } from '../lib/prisma.js';
import { calculateRewards } from '../utils/rewards.js';
import { detectOpeningFromPgn } from '../utils/opening-detector.js';
import { ensureUserProgress } from './progress.service.js';
import { CHESS_OPENINGS } from '../utils/openings.js';

export interface SubmitGameInput {
  userId: string;
  gameUuid: string;
  pgn: string;
  result: 'win' | 'loss' | 'draw';
  openingId?: string;
  chessComUsername?: string;
}

export async function submitGameAnalysis(input: SubmitGameInput) {
  const { userId, gameUuid, pgn, result } = input;

  const existing = await prisma.gameAnalysis.findUnique({
    where: {
      userId_gameUuid: {
        userId,
        gameUuid
      }
    }
  });

  if (existing) {
    throw new Error('Game already analyzed');
  }

  if (!/\d+\./.test(pgn)) {
    throw new Error('Invalid PGN format');
  }

  const detectedOpening = input.openingId ?? detectOpeningFromPgn(pgn);
  const rewards = calculateRewards(result);

  const analysisData = {
    result,
    detectedOpening,
    chessComUsername: input.chessComUsername
  };

  await ensureUserProgress(userId);

  const analysis = await prisma.$transaction(async (tx) => {

    const createdAnalysis = await tx.gameAnalysis.create({
      data: {
        userId,
        gameUuid,
        pgn,
        result,
        openingId: detectedOpening,
        analysisData,
        rewards,
        gemsEarned: rewards.gems,
        kpEarned: rewards.knowledgePoints
      }
    });

    await tx.userProgress.update({
      where: { userId },
      data: {
        gemsBalance: { increment: rewards.gems },
        knowledgePoints: { increment: rewards.knowledgePoints },
        gamesAnalyzedCount: { increment: 1 },
        totalGamesPlayed: { increment: 1 }
      }
    });

    if (detectedOpening) {
      await tx.openingProgress.upsert({
        where: {
          userId_openingId: {
            userId,
            openingId: detectedOpening
          }
        },
        create: {
          userId,
          openingId: detectedOpening,
          timesPlayed: 1,
          discovered: true
        },
        update: {
          timesPlayed: { increment: 1 },
          discovered: true
        }
      });
    }

    return createdAnalysis;
  });

  return {
    analysis,
    rewards
  };
}

export async function getGameHistory(userId: string, params: { limit?: number; offset?: number; opening?: string }) {
  const { limit = 20, offset = 0, opening } = params;
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safeOffset = Math.max(offset, 0);

  const [games, total] = await Promise.all([
    prisma.gameAnalysis.findMany({
      where: {
        userId,
        openingId: opening ?? undefined
      },
      orderBy: { analyzedAt: 'desc' },
      skip: safeOffset,
      take: safeLimit
    }),
    prisma.gameAnalysis.count({
      where: {
        userId,
        openingId: opening ?? undefined
      }
    })
  ]);

  return {
    games,
    total,
    hasMore: safeOffset + games.length < total
  };
}

export async function getAnalysisStats(userId: string) {
  const [progress, analyses] = await Promise.all([
    prisma.userProgress.findUnique({ where: { userId } }),
    prisma.gameAnalysis.findMany({ where: { userId } })
  ]);

  const totalGames = analyses.length;
  const wins = analyses.filter((game) => game.result === 'win').length;
  const winRate = totalGames ? Math.round((wins / totalGames) * 100) : 0;

  const favoriteOpeningEntry = analyses.reduce<Record<string, number>>((acc, game) => {
    if (!game.openingId) return acc;
    acc[game.openingId] = (acc[game.openingId] ?? 0) + 1;
    return acc;
  }, {});

  const favoriteOpeningId = Object.entries(favoriteOpeningEntry).sort((a, b) => b[1] - a[1])[0]?.[0];
  const favoriteOpening = favoriteOpeningId
    ? {
        id: favoriteOpeningId,
        name: CHESS_OPENINGS.find((opening) => opening.id === favoriteOpeningId)?.name ?? favoriteOpeningId
      }
    : null;

  return {
    gamesAnalyzed: progress?.gamesAnalyzedCount ?? totalGames,
    winRate,
    favoriteOpening,
    totalRewards: {
      gems: analyses.reduce((sum, game) => sum + game.gemsEarned, 0),
      knowledgePoints: analyses.reduce((sum, game) => sum + game.kpEarned, 0)
    }
  };
}
