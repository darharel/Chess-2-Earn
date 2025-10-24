import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth.js';
import {
  submitGameController,
  getHistoryController,
  getStatsController
} from '../controllers/analysis.controller.js';

const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as any).user?.id ?? req.ip
});

export const analysisRouter = Router();

analysisRouter.use(authenticateToken);
analysisRouter.post('/submit-game', analysisLimiter, submitGameController);
analysisRouter.get('/history', getHistoryController);
analysisRouter.get('/stats', getStatsController);
