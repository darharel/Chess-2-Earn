import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))
    });
    return;
  }

  if (error instanceof Error && error.message === 'Not allowed by CORS') {
    res.status(403).json({ message: 'Origin not allowed' });
    return;
  }

  logger.error('Unhandled error', { error });

  res.status(500).json({
    message: 'Internal server error'
  });
}
