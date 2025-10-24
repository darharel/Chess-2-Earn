import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { sub: string; username: string; email: string };
    req.user = {
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email
    };
    next();
  } catch (error) {
    logger.warn('JWT verification failed', { error });
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
