import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { registerSchema, loginSchema } from '../validation/auth.validation.js';
import { ensureUserProgress } from '../services/progress.service.js';

export async function registerController(req: Request, res: Response): Promise<void> {
  const parsedResult = registerSchema.safeParse(req.body);

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

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username: parsed.username }, { email: parsed.email }]
    }
  });

  if (existingUser) {
    res.status(409).json({ message: 'Username or email already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.password, 10);

  const user = await prisma.user.create({
    data: {
      username: parsed.username,
      email: parsed.email,
      passwordHash,
      chessComUsername: parsed.chessComUsername
    }
  });

  await ensureUserProgress(user.id);

  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      email: user.email
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiry }
  );

  logger.info('User registered', { userId: user.id, username: user.username });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      chessComUsername: user.chessComUsername
    }
  });
}

export async function loginController(req: Request, res: Response): Promise<void> {
  const parsedResult = loginSchema.safeParse(req.body);

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

  const user = await prisma.user.findUnique({
    where: { username: parsed.username }
  });

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const isValidPassword = await bcrypt.compare(parsed.password, user.passwordHash);

  if (!isValidPassword) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  await ensureUserProgress(user.id);

  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      email: user.email
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiry }
  );

  logger.info('User logged in', { userId: user.id, username: user.username });

  res.status(200).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      chessComUsername: user.chessComUsername
    }
  });
}

export async function verifyController(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { sub: string; username: string; email: string };
    res.status(200).json({
      valid: true,
      user: {
        id: decoded.sub,
        username: decoded.username,
        email: decoded.email
      }
    });
  } catch (error) {
    logger.warn('JWT verification failed', { error });
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
