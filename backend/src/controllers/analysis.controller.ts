import type { Response } from 'express';
import { submitGameSchema, historyQuerySchema } from '../validation/analysis.validation.js';
import {
  submitGameAnalysis,
  getGameHistory,
  getAnalysisStats
} from '../services/analysis.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../config/logger.js';

export async function submitGameController(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const parsedResult = submitGameSchema.safeParse(req.body);

  if (!parsedResult.success) {
    res.status(400).json({
      message: 'Validation failed',
      errors: parsedResult.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message
      }))
    });
    return;
  }

  const parsed = parsedResult.data;

  try {
    const result = await submitGameAnalysis({
      userId,
      ...parsed
    });

    logger.info('Game analyzed', { userId, gameUuid: parsed.gameUuid });

    res.status(201).json({
      success: true,
      rewards: result.rewards,
      analysis: result.analysis
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Game already analyzed') {
      res.status(409).json({ message: error.message });
      return;
    }
    if (error instanceof Error && error.message === 'Invalid PGN format') {
      res.status(400).json({ message: error.message });
      return;
    }
    logger.error('Game analysis failed', { error, userId });
    res.status(500).json({ message: 'Unable to analyze game' });
  }
}

export async function getHistoryController(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const parsedResult = historyQuerySchema.safeParse(req.query);

  if (!parsedResult.success) {
    res.status(400).json({
      message: 'Validation failed',
      errors: parsedResult.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message
      }))
    });
    return;
  }

  const parsed = parsedResult.data;
  const limitValue = parsed.limit ? Number(parsed.limit) : undefined;
  const offsetValue = parsed.offset ? Number(parsed.offset) : undefined;
  const limit = typeof limitValue === 'number' && Number.isFinite(limitValue) ? limitValue : undefined;
  const offset = typeof offsetValue === 'number' && Number.isFinite(offsetValue) ? offsetValue : undefined;

  const history = await getGameHistory(userId, {
    limit,
    offset,
    opening: parsed.opening
  });

  res.status(200).json(history);
}

export async function getStatsController(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const stats = await getAnalysisStats(userId);
  res.status(200).json(stats);
}
