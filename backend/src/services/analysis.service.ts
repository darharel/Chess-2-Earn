import { prisma } from '../lib/prisma.js';
import { calculateRewards, type GameResult } from '../utils/rewards.js';
import { detectOpeningFromPgn } from '../utils/opening-detector.js';
import { ensureUserProgress, updateProgressAfterGame } from './progress.service.js';
import { CHESS_OPENINGS } from '../utils/openings.js';

export interface SubmitGameInput {
  userId: string;
  gameUuid: string;
  pgn: string;
  result: GameResult;
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

  const progress = await ensureUserProgress(userId);

  const detectedOpening = input.openingId ?? detectOpeningFromPgn(pgn);
  const rewards = calculateRewards(result, progress.currentStreak);

  const analysisData = {
    result,
    detectedOpening,
    chessComUsername: input.chessComUsername
  };

  const { analysis } = await prisma.$transaction(async (tx) => {

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

    await updateProgressAfterGame(tx, userId, result, rewards);

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

    return { analysis: createdAnalysis };
  });

  const stats = await getAnalysisStats(userId);

  return {
    analysis,
    rewards,
    stats
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
  const progress = await prisma.userProgress.findUnique({ where: { userId } });

  if (!progress) {
    return {
      gamesAnalyzed: 0,
      winRate: 0,
      streak: { current: 0, longest: 0 },
      favoriteOpening: null,
      totalRewards: { gems: 0, knowledgePoints: 0 },
      lastAnalyzedAt: null
    };
  }

  const totalGames = progress.totalGamesPlayed || progress.gamesAnalyzedCount || 0;
  const winRate = totalGames ? Math.round((progress.winCount / totalGames) * 100) : 0;

  const favoriteOpeningProgress = await prisma.openingProgress.findFirst({
    where: { userId },
    orderBy: { timesPlayed: 'desc' }
  });

  const favoriteOpening = favoriteOpeningProgress?.openingId
    ? {
        id: favoriteOpeningProgress.openingId,
        name:
          CHESS_OPENINGS.find((opening) => opening.id === favoriteOpeningProgress.openingId)?.name ??
          favoriteOpeningProgress.openingId
      }
    : null;

  return {
    gamesAnalyzed: progress.gamesAnalyzedCount,
    winRate,
    streak: {
      current: progress.currentStreak,
      longest: progress.longestStreak
    },
    favoriteOpening,
    totalRewards: {
      gems: progress.totalGemsEarned,
      knowledgePoints: progress.totalKnowledgeEarned
    },
    lastAnalyzedAt: progress.lastAnalyzedAt
  };
}
