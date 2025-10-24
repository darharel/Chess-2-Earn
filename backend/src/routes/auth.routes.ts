import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerController,
  loginController,
  verifyController,
  logoutController
} from '../controllers/auth.controller.js';
import { env } from '../config/env.js';
import { authenticateToken } from '../middleware/auth.js';
import { registerController, loginController, verifyController } from '../controllers/auth.controller.js';
import { env } from '../config/env.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: Math.min(env.rateLimitMax, 20),
  standardHeaders: true,
  legacyHeaders: false
});

export const authRouter = Router();

authRouter.post('/register', registerLimiter, registerController);
authRouter.post('/login', loginLimiter, loginController);
authRouter.post('/verify', verifyController);
authRouter.post('/logout', authenticateToken, logoutController);
