import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { analysisRouter } from './analysis.routes.js';
import { healthRouter } from './health.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/analysis', analysisRouter);
apiRouter.use('/', healthRouter);
